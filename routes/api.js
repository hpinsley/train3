var express = require('express');
var router = express.Router();
var mongoskin = require('mongoskin');
var utils = require('../helpers/Utils');

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
  coll.find({}).toArray(function(e,results){
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
        res.send((result === 1) ? { msg: 'success'} : {msg: 'error'});
    });
});

router.get('/trains', function(req, res, next) {
    var coll = req.db.collection("trains");
    coll.find({}).toArray(function(e,results){
        if (e) {
            return next(e);
        }
        res.send(results);
    });
});

//Add a stop
//router.post("/trains/:number/stops", function(req, res, next){
//    var coll = req.db.collection("trains");
//    var number = req.params.number;
//    var stopTime = req.body.stopTime;
//    var station = req.body.station;
//    coll.update({number: number}, {$push: {"stops": {time: stopTime, station: station}}}, function(e,updateResult){
//        if (e) {
//            return next(e);
//        }
//        res.send("stop added");
//    });
//});
router.post("/trains/:number/stops", function(req, res, next){
    var coll = req.db.collection("trains");
    var number = req.params.number;
    var newStop = { time: req.body.stopTime, station: req.body.station};

    coll.findOne({number:number}, {stops:1, _id:0}, function(e, result) {
        if (e) {
            return next(e);
        }
        var stops = result.stops;
        stops.push(newStop);
        stops = stops.sort(utils.stopCompare);
        coll.update({number: number}, {$set: {"stops": stops}}, function(e,updateResult){
            if (e) {
                return next(e);
            }
            res.send("stop added");
        });
    });
});

//Delete a stop
router.delete("/trains/:number/stops", function(req, res, next){
    var coll = req.db.collection("trains");
    var number = req.params.number;
    var stop = req.body.stop;
    coll.update({number: number}, {$pull: {"stops": stop}}, function(e,updateResult){
        if (e) {
            return next(e);
        }
        res.send("stop removed");
    });
});

router.get("/trains/:number", function(req, res, next){
    var coll = req.db.collection("trains");
    var number = req.params.number;
    coll.findOne({number: number}, function(e, train){
        if (e) {
            return next(e);
        }
        res.send(train);
    });
});

router.post('/trains', function(req, res, next){
    var coll = req.db.collection("trains");
    coll.insert(req.body, {}, function(e, results){
        if (e) {
            return next(e);
        }
        res.send(results);
    });
});

module.exports = router;
