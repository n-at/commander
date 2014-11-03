var runner = require('../lib/unit/runner');

var script = '#!/bin/bash\n' +
    'uname -a\n' +
    'ls /tmp\n';

runner.executeScript(script, function(err, result) {
    if(err) throw err;
    console.log(result);
});
