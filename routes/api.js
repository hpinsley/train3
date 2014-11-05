var express = require('express');
var router = express.Router();

router.get('/stations', function(req, res) {
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

module.exports = router;
