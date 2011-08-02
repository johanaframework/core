
/**
 * The directory in which your application specific resources are located.
 * The application directory must contain the bootstrap.js file.
 */
APPPATH = require('fs').realpathSync('./application') + '/';

/**
 * The directory in which your modules are located.
 */
MODPATH = require('fs').realpathSync('./modules') + '/';

/**
 * The directory in which the Johana resources are located.
 */
SYSPATH = require('fs').realpathSync('./system') + '/';

DOCROOT = require('fs').realpathSync('.') + '/';

/**
 * Load the core Johana class
 */
require(SYSPATH + 'prototypes/johana/core');

if (require('path').existsSync(APPPATH + 'prototypes/johana.js'))
{
	// Application extends the core
	require(APPPATH + 'prototypes/johana');
}
else
{
	// Load empty core extension
	require(SYSPATH + 'prototypes/johana');
}

require(SYSPATH + 'prototypes/johana/autoload');

// Bootstrap the application
require(APPPATH + 'bootstrap');

Johana.conf.attach(new JohanaConfigFile());

//console.log(new ConfigFile());
console.log(Johana.config('vova'));



//console.log(new ConfigFile());
//console.log(Johana.config('vova'));
function parent()
{
//	this.name = 'parent';
//	this.log = function()
//	{
//		console.log('parent log');
//	};
};
parent.prototype.parentProp = 'parent prop';
parent.prototype.log = function()
{
	console.log('parent log');
};

function child()
{
	console.log(this);
//	this.log = function()
//	{
//		this.super_.log();
//
//		console.log('child log');
//	};
//	this.name = 'child';
};
require('util').inherits(child, parent);


child.prototype.log = function()
{
	console.log('child log', child.super_.log());
};



console.log(parent, child.super_);
new parent().log();
new child().log();


