var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var config = require('../../conf/index');
var logger = require('../logger')(module);

var routes = require('./routes');

var app = express();

//templates
app.set('views', path.join(__dirname, 'views'));
app.set('twig options', {
    strict_variables: false
});

//body parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//cookies
app.use(cookieParser());

//session
app.use(session({
    secret: config.get('commander:session_secret'),
    resave: true,
    saveUninitialized: true
}));

//static files
app.use(express.static(path.join(config.get('root_path'), 'public')));

//routes
app.use('/', routes);

//404
app.use(function(req, res, next) {
    var err = new Error('Not found');
    err.status = 404;
    next(err);
});

//custom error handler
app.use(function(err, req, res, next) {
    logger.error("Error occurred while processing request: %s", err.message);

    res.statusCode = err.status ? err.status : 500;

    res.render('error.twig', {
        error: err,
        code: res.statusCode
    });
});

//start server
var host = config.get('commander:host');
var port = config.get('commander:port');

app.listen(port, host, function(err) {
    if(err) {
        logger.error('Error occurred while starting commander server: %s', err.message);
        process.exit(1);
    }
    logger.info('commander started at %s:%s', host, port);
});
