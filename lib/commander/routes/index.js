var express = require('express');
var router = express.Router();

var config = require('../../../conf');
var logger = require('../../logger')(module);

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

router.get('/units', function(req, res) {
    logger.debug('Loading units...');

    var session = req.session;
    if(!session || !session.auth) {
        res.redirect('/');
        return;
    }

    res.render('units.twig');
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/tasks', function(req, res) {
    logger.debug('Loading tasks...');

    var session = req.session;
    if(!session || !session.auth) {
        res.redirect('/');
        return;
    }

    res.render('tasks.twig');
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = router;