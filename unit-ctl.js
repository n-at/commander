var daemon = require('daemonize2').setup({
    main: 'unit.js',
    pidfile: 'unit.pid',
    name: 'Remote Unit server'
});
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
            console.log('Remote Unit server is running with pid:%s', pid);
        } else {
            console.log('Remote Unit is not running');
        }
        break;
    case 'version':
        console.log('Remote Commander ' + require('./package').version);
        break;
    default:
        console.log('Usage: [start|stop|restart|status|version]');
}