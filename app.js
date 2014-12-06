var express = require('express');
var cons = require('consolidate')
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoskin = require('mongoskin');
var lookups = require('./helpers/lookups');
var app = express();
var routes = require('./routes/index');
var api = require('./routes/api');

app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));



var db = mongoskin.db('mongodb://@localhost:27017/trains', {safe:true})
lookups.init(db);

//Inject the db into the request object
app.use(function(req, res, next){
    req.db = db;
    next();
});


app.use('/', routes);
app.use('/api', api);


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send("Error: " + err.message + " " + err);
});

module.exports = app;
