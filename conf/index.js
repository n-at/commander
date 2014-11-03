var nconf = require('nconf');
var path = require('path');
var mkdirp = require('mkdirp');

//load config
nconf.file(path.join(__dirname, 'config.json'));

//set dir names in config
var root = path.join(__dirname, '..');
nconf.set('root_path', root);
nconf.set('log_path', path.join(root, 'log'));
nconf.set('tmp_path', path.join(root, 'tmp'));
nconf.set('preset_path', path.join(root, 'preset'));

//create directories
mkdirp.sync(nconf.get('log_path'));
mkdirp.sync(nconf.get('tmp_path'));

module.exports = nconf;
