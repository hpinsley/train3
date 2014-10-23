var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index.html', { title: 'Express with Handlebars' });
});

module.exports = router;
