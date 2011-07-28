
APPPATH = require('fs').realpathSync('./application') + '/';
SYSPATH = require('fs').realpathSync('./system') + '/';
MODPATH = require('fs').realpathSync('./mods') + '/';

require(SYSPATH + 'prototypes/joanna/core');
require(SYSPATH + 'prototypes/joanna');
require(SYSPATH + 'prototypes/joanna/autoload');

Joanna.modules({
	cache: MODPATH + 'cache'
});

Joanna.init({});

