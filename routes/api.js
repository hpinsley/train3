var express = require('express');
var router = express.Router();
var mongoskin = require('mongoskin');
var utils = require('../helpers/Utils');
var lookups = require('../helpers/lookups');
var _ = require('lodash');
var moment = require('moment');
var fs = require('fs');

router.get('/lines/maps', function(req,res, next){
    var folder = "../public/data";
    fs.readdir(folder, function(err, filenames){
        if (err) {
            return next(err);
        }
        res.send(filenames);
    });
});

router.post("/lines/:lineName/stations/:stationAbbr/move", function(req, res, next){
    var coll = req.db.collection("lines");

    var lineName = req.params.lineName;
    var stationAbbr = req.params.stationAbbr;
    var direction = req.query.direction;
    var move = (direction == "down") ? 1 : -1;

    coll.findOne({name:lineName}, function(e, line) {
        if (e) {
            return next(e);
        }
        var foundIndex = _.findIndex(line.stations, function(station){
            return station == stationAbbr;
        });
        if (foundIndex >= 0) {
            var newIndex = foundIndex + move;
            if (newIndex >=0 && newIndex < line.stations.length) {
                line.stations.splice(foundIndex, 1);
                line.stations.splice(newIndex, 0, stationAbbr);

                coll.save(line, function(e, saveResult){
                    if (e) {
                        return next(e);
                    }
                });
            }
        }
        res.send(line);
    });
});

//Delete a station from a line
router.delete("/lines/:lineName/stations/:stationAbbr", function(req, res, next){
    var coll = req.db.collection("lines");

    var lineName = req.params.lineName;
    var stationAbbr = req.params.stationAbbr;

    coll.findOne({name:lineName}, function(e, line) {
        if (e) {
            return next(e);
        }
        var foundIndex = _.findIndex(line.stations, function(station){
            return station == stationAbbr;
        });
        if (foundIndex >= 0) {
            line.stations.splice(foundIndex, 1);

            coll.save(line, function(e, saveResult){
                if (e) {
                    return next(e);
                }
            });
        }
        res.send(line);
    });
});

//update a line
router.put('/lines/:name', function(req, res, next){
    var coll = req.db.collection("lines");
    var name = req.params.name;
    req.body._id = mongoskin.helper.toObjectID(req.body._id);

    coll.update({name: name}, req.body, function(e,updateResult){
        if (e) {
            return next(e);
        }
        res.send({updateResult: updateResult});
    });
});

//Add a station to a line
router.post("/lines/:lineName/stations", function(req, res, next){
    var coll = req.db.collection("lines");
    var lineName = req.params.lineName;
    var stationAbbr = req.body.stationAbbr;

    if (!stationAbbr) {
        return next(new Error("Station is required."));
    }

    coll.findOne({name:lineName}, function(e, line) {
        if (e) {
            return next(e);
        }
        var stations = line.stations || [];
        if (!_.find(stations, function(station){
            return station === stationAbbr;
        })) {
            stations.unshift(stationAbbr);
            //stations.push(stationAbbr);
            line.stations = stations;
            coll.save(line, function(e, saveResult){
                if (e) {
                    return next(e);
                }
            });
        }
        res.send(line);
    });
});

router.get('/lines/:lineName', function(req,res, next){
    var coll = req.db.collection("lines");
    var lineName = req.params.lineName;
    coll.findOne({name: lineName}, function(e, line){
        if (e) {
            return next(e);
        }
        if (!line) {
            var err = new Error('Not Found');
            err.status = 404;
            return next(err);
        }
        res.send(line);
    });

});

router.get('/lines', function(req, res, next){
    var coll = req.db.collection("lines");
    coll.find({}).sort({name:1}).toArray(function(e,results){
        if (e) {
            return next(e);
        }
        res.send(results);
    });
});

router.get('/stations/:stationAbbr/trains', function(req,res, next) {
    var coll = req.db.collection("trains");
    var stationAbbr = req.params.stationAbbr;
    coll.find({stops:{$elemMatch:{station:stationAbbr}}}).sort({number: 1}).toArray(function (e, results) {
        if (e) {
            return next(e);
        }
        res.send(results);
    });
});

router.get('/stations/:abbr', function(req,res, next){
    var coll = req.db.collection("stations");
    var abbr = req.params.abbr;
    coll.findOne({abbr: abbr}, function(e, station){
        if (e) {
            return next(e);
        }
        if (!station) {
            var err = new Error('Not Found');
            err.status = 404;
            return next(err);
        }
        res.send(station);
    });

});
router.get('/stations', function(req, res, next) {
  var coll = req.db.collection("stations");
  coll.find({}).sort({name:1}).toArray(function(e,results){
    if (e) {
        return next(e);
    }
    res.send(results);
  });
});

router.post('/poi', function(req, res, next){
    var coll = req.db.collection("poi");
    coll.find({}, {_id: 0, number: 1}).sort({number: -1}).toArray(function (e, poiNumbers) {
        if (e) {
            return next(e);
        }
        var lastNumber = (poiNumbers.length === 0) ? 0 : poiNumbers[0].number;
        var nextNumber = lastNumber + 10;
        var poi = req.body;
        poi.number = nextNumber;
        coll.insert(poi, {}, function(e, results){
            if (e) {
                return next(e);
            }
            res.send(results);
        });
    })
});

router.post('/stations', function(req, res, next){
    var coll = req.db.collection("stations");
    coll.insert(req.body, {}, function(e, results){
        if (e) {
            return next(e);
        }
        lookups.refreshStationCache();
        res.send(results);
    });
});

router.put('/stations/:abbr', function(req, res, next){
    var coll = req.db.collection("stations");
    var abbr = req.params.abbr;
    req.body._id = mongoskin.helper.toObjectID(req.body._id);
    coll.update({abbr: abbr}, req.body, function(e,updateResult){
        if (e) {
            return next(e);
        }
        res.send({updateResult: updateResult});
    });
});

router.delete("/stations/:abbr", function(req, res, next){
    var stationAbbr = mongoskin.helper.toObjectID(req.params.abbr);
    var trains = req.db.collection("trains");
    var findResult = trains.find({stops: {$elemMatch: {station: stationAbbr}}});
    findResult.toArray(function(e, results){
            if (e) {
                return next(e);
            }
            if (results.length > 0) {
                return next("Station cannot be deleted while it is a stop on a train.  Train " + results[0].number + " stops at this station.");
            }

            var coll = req.db.collection("stations");
            coll.remove({abbr: stationAbbr}, function(e, result){
                if (e) {
                    return next(e);
                }
                lookups.refreshStationCache();
                res.send((result === 1) ? { msg: 'success'} : {msg: 'error'});
            });
        });
});

router.get('/trains', function(req, res, next) {
    var coll = req.db.collection("trains");
    coll.find({}).sort({number:1}).toArray(function(e,results){
        if (e) {
            return next(e);
        }
        res.send(results);
    });
});

//Duplicate a train

router.post("/trains/duplicate", function(req, res, next){
    var trainNumber = req.body.trainNumber;
    var numTimes = req.body.numTimes;
    var offsetMinutes = req.body.offsetMinutes;

    console.log("Duplicating train " + trainNumber + " " + numTimes + " time(s) offset by " + offsetMinutes + ".");
    var coll = req.db.collection("trains");
    coll.findOne({number: trainNumber}, function(e, train) {
        if (e) {
            return next(e);
        }

        //res.send(train);

        //We need to get the next number to use
        coll.find({}, {_id: 0, number: 1}).sort({number: -1}).toArray(function (e, trainNumbers) {
            if (e) {
                return next(e);
            }
            var nextNumber = trainNumbers[0].number;

            for (var i = 1; i <= numTimes; ++i) {
                nextNumber += 10;
                var newTrain = {};
                newTrain.number = nextNumber;
                newTrain.description = "Train " + newTrain.number;
                newTrain.stops = [];
                _.each(train.stops, function(stop){
                    var m = moment(stop.time);
                    m.add(offsetMinutes * i, "minutes");
                    var strTime = m._d.toJSON();
                    newTrain.stops.push({station: stop.station, time: strTime});
                });
                newTrain.originStation = train.originStation;
                newTrain.terminalStation = train.terminalStation;
                utils.adjustTrainSummary(newTrain);

                coll.insert(newTrain, {}, function(e, results){
                    if (e) {
                        return next(e);
                    }
                });
            }
        });
    });
});

//Add a stop
router.post("/trains/:number/stops", function(req, res, next){
    var coll = req.db.collection("trains");
    var number = parseInt(req.params.number);
    var newStop = { time: req.body.stopTime, station: req.body.station};

    coll.findOne({number:number}, function(e, train) {
        if (e) {
            return next(e);
        }
        var stops = train.stops || [];
        stops.push(newStop);
        train.stops = stops.sort(utils.stopCompare);
        utils.adjustTrainSummary(train);
        coll.save(train, function(e, saveResult){
            res.send("stop added");
        });
    });
});

//Delete a stop
router.delete("/trains/:number/stops", function(req, res, next){
    var coll = req.db.collection("trains");
    var number = parseInt(req.params.number);
    var stop = req.body.stop;
    coll.update({number: number}, {$pull: {"stops": stop}}, function(e,updateResult){
        if (e) {
            return next(e);
        }
        coll.findOne({number: number}, function(e, train){
            if (e) {
                return next(e);
            }
            utils.adjustTrainSummary(train);
            coll.save(train, function(e, saveResult){
                res.send("stop removed");
            });

        });
    });
});

router.delete("/trains/:number", function(req, res, next){
    var coll = req.db.collection("trains");
    var number = parseInt(req.params.number);

    coll.remove({number:{$eq: number}}, function(e, removed){
        if (e) {
            return next(e);
        }
        res.send({removed: removed});
    });
});

router.get("/trains/:number", function(req, res, next){
    var coll = req.db.collection("trains");
    var number = parseInt(req.params.number);
    coll.findOne({number: number}, function(e, train){
        if (e) {
            return next(e);
        }
        res.send(train);
    });
});

router.post('/trains', function(req, res, next){
    var coll = req.db.collection("trains");

    coll.find({},{_id:0, number:1}).sort({number:-1}).toArray(function(e, trainNumbers){
        if (e) {
            return next(e);
        }
        var train = {};
        train.number = trainNumbers.length == 0 ? 100 : trainNumbers[0].number + 10;
        train.description = "Train " + train.number;
        train.stops = [];
        train.originStation = "GCT";
        train.terminalStation = "GCT"
        coll.insert(train, {}, function(e, results){
            if (e) {
                return next(e);
            }
            res.send(results);
        });

    });
});

module.exports = router;
