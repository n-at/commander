var http = require('http');
var qs = require('qs');
var uuid = require('node-uuid');
var config = require('../conf');

module.exports = function(options, data) {
    //create request
    var req = http.request(options, function(res) {
        var body = '';

        res.on('data', function(data) {
            body += data;
        });

        res.on('end', function() {
            console.log(qs.parse(body));
        });
    });

    req.end(data);
};
