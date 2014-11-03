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
  /*
  var stations = [
      { station: 'Katonah', abbr: 'kat', name: req.name },
      { station: 'Mount Kisco', abbr: 'mtk', name: req.name }
  ];
  res.send(stations);
  */
});

module.exports = router;
