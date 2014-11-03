var runner = require('../lib/unit/runner');

//running existing script
runner.executePreset('uname.sh', function(err, result) {
    console.log('Existing preset script');
    if(err) {
        console.log('Error: %s', err.message);
    } else {
        console.log(result);
    }
});

//running not existing script
runner.executePreset('error', function(err, result) {
    console.log('Not existing preset script');
    if(err) {
        console.log('Error: %s', err.message);
    } else {
        console.log(result);
    }
});

//test security violation
runner.executePreset('../unit.js', function(err, result) {
    console.log('Security violation test');
    if(err) {
        console.log('Error: %s', err.message);
    } else {
        console.log(result);
    }
});
