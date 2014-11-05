var daemonize = require('daemonize2');

module.exports = function(options) {
    var daemon = daemonize.setup(options);

    switch(process.argv[2]) {
        case 'start':
            daemon.start();
            break;
        case 'stop':
            daemon.stop();
            break;
        case 'restart':
            daemon.stop(function() {
                daemon.start();
            });
            break;
        case 'status':
            var pid = daemon.status();
            if(pid) {
                console.log(options.name + ' is running with pid:%s', pid);
            } else {
                console.log(options.name + ' is not running');
            }
            break;
        case 'version':
            console.log('commander ' + require('../package').version);
            break;
        default:
            console.log('Usage: [start|stop|restart|status|version]');
    }
};
