var express = require('express');
var router = express.Router();

var unitsRoutes = require('./units');
var tasksRoutes = require('./tasks');
var runRoutes = require('./runs');
var loginRoutes = require('./login');
var dashboardRoutes = require('./dashboard');

/////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/', function(req, res) {
    var session = req.session;
    if(session && session.auth) {
        res.redirect('/dashboard');
    } else {
        var commanderPackage = require('../../../package');
        res.render('auth.twig', {
            error: req.param('error') !== undefined,
            version: commanderPackage.version,
            repository: commanderPackage.repository.url
        });
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////

router.post('/login', loginRoutes.login);

router.get('/logout', loginRoutes.logout);

/////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/dashboard', dashboardRoutes.info);

/////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/units/:action?/:id?', unitsRoutes.action);

router.post('/unit-save', unitsRoutes.save);

router.get('/unit-list', unitsRoutes.list);

/////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/tasks/:action?/:id?', tasksRoutes.action);

router.post('/task-save', tasksRoutes.save);

router.get('/task-units/:id', tasksRoutes.units);

router.get('/task-steps/:id', tasksRoutes.steps);

router.get('/task-run', tasksRoutes.remoteRun);

/////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/run/:id', runRoutes.run);

router.get('/run-result', runRoutes.runResult);

/////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = router;
