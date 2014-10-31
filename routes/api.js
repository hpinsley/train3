var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/stations', function(req, res) {
  var stations = [
      { station: 'Katonah', abbr: 'kat' },
      { station: 'Mount Kisco', abbr: 'mtk'}
  ];
  res.send(stations);
});

module.exports = router;
