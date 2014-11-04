var log = require('../../logger')(module);
var config = require('../../../conf');

/*
    /login
 */
exports.login = function(req, res) {
    log.debug('Logging in...');

    var password = req.param('password');
    if(password === config.get('commander:password')) {
        req.session.auth = true;
        res.redirect('/');
    } else {
        res.redirect('/?error');
    }
};

/*
    /logout
 */
exports.logout = function(req, res) {
    log.debug('Logging out...');

    req.session.auth = false;
    res.redirect('/');
};
