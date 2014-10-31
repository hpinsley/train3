var express = require('express');
var cons = require('consolidate')
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

var routes = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api');


// view engine setup
//var viewPath = path.join(__dirname, 'views');
//app.set('view engine', 'handlebars')
//app.set('views', viewPath);
//app.set('view options', { layout: false});
//app.engine('.html', cons.handlebars);
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));

app.use(function(req, res, next){
    console.log("I'm injected!")
    next();
});


app.use(express.static(path.join(__dirname, 'public')));


app.use('/', routes);
app.use('/users', users);
app.use('/api', api);


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error.html', {
        message: err.message,
        error: err
    });
});

module.exports = app;
