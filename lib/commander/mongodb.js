var mongoose = require('mongoose');

var config = require('../../conf');
var log = require('../logger')(module);

var dsn = 'mongodb://' +
    config.get('commander:mongodb:username') + ':' + config.get('commander:mongodb:password') +
    '@' + config.get('commander:mongodb:host') +
    ':' + config.get('commander:mongodb:port') +
    '/' + config.get('commander:mongodb:dbname');

mongoose.connect(dsn);

var db = mongoose.connection;

db.on('error', function(err) {
    log.error('MongoDB connection failure: %s', err.message);
});

db.once('open', function() {
    log.info('Connected to MongoDB');
});

exports.mongoose = mongoose;
