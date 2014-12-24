var express = require('express');
var router = express.Router();
var mongoskin = require('mongoskin');
var utils = require('../helpers/Utils');
var lookups = require('../helpers/lookups');

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

router.delete("/stations/:id", function(req, res, next){
    var coll = req.db.collection("stations");
    var id = mongoskin.helper.toObjectID(req.params.id);
    coll.remove({_id: id}, function(e, result){
        if (e) {
            return next(e);
        }
        lookups.refreshStationCache();
        res.send((result === 1) ? { msg: 'success'} : {msg: 'error'});
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
