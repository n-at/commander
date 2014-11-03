var express = require('express');
var router = express.Router();

var config = require('../../../conf');
var logger = require('../../logger')(module);

/////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/', function(req, res, next) {
    var session = req.session;
    if(session && session.auth) {
        res.render('dashboard.twig');
    } else {
        res.render('auth.twig', {
            error: req.param('error') !== undefined
        });
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////

router.post('/login', function(req, res) {
    var password = req.param('password');
    if(password && password === config.get('commander:password')) {
        req.session.auth = true;
        res.redirect('/');
    } else {
        res.redirect('/?error');
    }
});

router.get('/logout', function(req, res) {
    req.session.auth = false;
    res.redirect('/');
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = router;
