var qs = require('qs');
var uuid = require('node-uuid');
var config = require('../conf');
var request = require('./test_request');

var options = {
    host: config.get('unit:host'),
    port: config.get('unit:port'),
    method: 'POST',
    path: '/'
};

var data = qs.stringify({
    api_key: config.get('unit:api_key'),
    task_id: uuid.v4(),
    run_id: uuid.v4(),
    task: [{
        type: 'preset',
        action: 'uname.sh',
        breakOnError: 0
    }]
});

//control
request(options, data);

//incorrect preset name
data = qs.stringify({
    api_key: config.get('unit:api_key'),
    task_id: uuid.v4(),
    run_id: uuid.v4(),
    task: [{
        type: 'preset',
        action: 'bugbugbug',
        breakOnError: 0
    }]
});
request(options, data);

//without preset name
data = qs.stringify({
    api_key: config.get('unit:api_key'),
    task_id: uuid.v4(),
    run_id: uuid.v4(),
    task: [{
        type: 'preset',
        breakOnError: 0
    }]
});
request(options, data);

//empty task
data = qs.stringify({
    api_key: config.get('unit:api_key'),
    task_id: uuid.v4(),
    run_id: uuid.v4(),
    task: [{}]
});
request(options, data);

//access violation
data = qs.stringify({
    api_key: config.get('unit:api_key'),
    task_id: uuid.v4(),
    run_id: uuid.v4(),
    task: [{
        type: 'preset',
        action: '../../../hello',
        breakOnError: 0
    }]
});
request(options, data);
