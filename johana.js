
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

/**
 * Set the full path to the docroot
 */
DOCROOT = require('fs').realpathSync('.') + '/';

/**
 * Load the Johana core
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

// Load prototypes
require(SYSPATH + 'prototypes/autoload');

// Bootstrap the application
require(APPPATH + 'bootstrap');

console.log(Url.title('My Blog Post'));