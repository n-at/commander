var express = require('express');
var router = express.Router();

var config = require('../../../conf');
var logger = require('../../logger')(module);

var unitsRoutes = require('./units');
var tasksRoutes = require('./tasks');
var runRoutes = require('./runs');

/////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/', function(req, res) {
    var session = req.session;
    if(session && session.auth) {
        res.redirect('/dashboard');
    } else {
        res.render('auth.twig', {
            error: req.param('error') !== undefined
        });
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////

//TODO move login/logout and dashboard to separate modules

router.post('/login', function(req, res) {
    logger.debug('Logging in...');

    var password = req.param('password');
    if(password === config.get('commander:password')) {
        logger.debug('Logged in successfully');
        req.session.auth = true;
        res.redirect('/');
    } else {
        logger.debug('Incorrect password');
        res.redirect('/?error');
    }
});

router.get('/logout', function(req, res) {
    logger.debug('Logging out...');

    req.session.auth = false;
    res.redirect('/');
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/dashboard', function(req, res) {
    logger.debug('Loading dashboard...');

    var session = req.session;
    if(!session || !session.auth) {
        res.redirect('/');
        return;
    }

    res.render('dashboard.twig');
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/units/:action?/:id?', unitsRoutes.action);

router.post('/unit-save', unitsRoutes.save);

router.get('/unit-list', unitsRoutes.list);

/////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/tasks/:action?/:id?', tasksRoutes.action);

router.post('/task-save', tasksRoutes.save);

router.get('/task-units/:id', tasksRoutes.units);

router.get('/task-steps/:id', tasksRoutes.steps);

/////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/run/:id', runRoutes.run);

/////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = router;
