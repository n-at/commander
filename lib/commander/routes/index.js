var express = require('express');
var router = express.Router();

var config = require('../../../conf');
var logger = require('../../logger')(module);

var unitsRoutes = require('./units');
var tasksRoutes = require('./tasks');
var runRoutes = require('./runs');
var loginRoutes = require('./login');

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

router.post('/login', loginRoutes.login);

router.get('/logout', loginRoutes.logout);

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
