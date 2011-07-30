/**
 * Contains the most low-level helpers methods in Johana:
 *
 * - Environment initialization
 * - Locating files within the cascading filesystem
 * - Auto-loading and transparent extension of objects
 * - Variable and path debugging
 *
 * @package    Johana
 * @category   Base
 * @author     Johana Team
 * @copyright  (c) 2011 Johana Team
 * @license    http://johanaframework.org/license
 */
JohanaCore = {};

// Release version and codename
JohanaCore.VERSION  = '0.0.1.1';
JohanaCore.CODENAME = 'dubhe';

// Common environment type constants for consistency and convenience
JohanaCore.PRODUCTION  = 1;
JohanaCore.STAGING     = 2;
JohanaCore.TESTING     = 3;
JohanaCore.DEVELOPMENT = 4;

/**
 * @var  String  Current environment name
 */
JohanaCore.environment = JohanaCore.DEVELOPMENT;

/**
 * @var  Boolean  True if Johana is running on windows
 */
JohanaCore.isWindows = false;

/**
 * @var  Boolean  Should errors and exceptions be logged
 */
JohanaCore.logErrors = false;

/**
 * @var  String
 */
JohanaCore.contentType = 'text/html';

/**
 * @var  String  character set of input and output
 */
JohanaCore.charset = 'utf-8';

/**
 * @var  String  the name of the server Johana is hosted upon
 */
JohanaCore.serverName = '';

/**
 * @var  Object   list of valid host names for this instance
 */
JohanaCore.hostnames = {};

/**
 * @var  String  base URL to the application
 */
JohanaCore.baseUrl = '/';

/**
 * @var  String  Cache directory, used by [Johana.cache]. Set by [Johana.init]
 */
JohanaCore.cacheDir;

/**
 * @var  Number  Default lifetime for caching, in seconds, used by [Johana.cache]. Set by [Johana.init]
 */
JohanaCore.cacheLife = 60;

/**
 * @var  Boolean  Whether to use internal caching for [Johana.findFile], does not apply to [Johana.cache]. Set by [Johana.init]
 */
JohanaCore.caching = false;

/**
 * @var  Boolean  Whether to enable [profiling](Johana/profiling). Set by [Johana.init]
 */
JohanaCore.profiling = false;

/**
 * @var  Boolean  Enable Johana catching and displaying errors. Set by [Johana.init]
 */
JohanaCore.errors = true;

/**
 * @var  Boolean  set the X-Powered-By header
 */
JohanaCore.expose = false;

/**
 * @var  Log  logging object
 */
JohanaCore.log;

/**
 * @var  Config  config object
 */
JohanaCore.config;

/**
 * @var  Boolean  Has [Johana.init] been called?
 */
var _init = false;

/**
 * @var  Object   Currently active modules
 */
var _modules = [];

/**
 * @var  Array   Include paths that are used to find files
 */
var _paths = [APPPATH, SYSPATH];

/**
 * @var  Array   File path cache, used when caching is true in [Johana.init]
 */
var _files = [];

/**
 * @var  Boolean  Has the file path cache changed during this execution?  Used internally when when caching is true in [Johana.init]
 */
var _filesChanged = false;


/**
 * Initializes the environment:
 *
 * - Determines the current environment
 * - Set global settings
 *
 * The following settings can be set:
 *
 * Type      | Setting    | Description                                    | Default Value
 * ----------|------------|------------------------------------------------|---------------
 * `String`  | baseUrl    | The base URL for your application.  This should be the *relative* path from your DOCROOT to your `/`, in other words, if JohanaCore is in a subfolder, set this to the subfolder name, otherwise leave it as the default.  **The leading slash is required**, trailing slash is optional.   | `"/"`
 * `String`  | charset    | Character set used for all input and output    | `"utf-8"`
 * `String`  | cacheDir   | JohanaCore's cache directory.  Used by [JohanaCore.cache] for simple internal caching, like [Fragments](JohanaCore/fragments) and **\[caching database queries](this should link somewhere)**.  This has nothing to do with the [Cache module](cache). | `APPPATH + "cache"`
 * `Number`  | cacheLife  | Lifetime, in seconds, of items cached by [JohanaCore.cache]         | `60`
 * `Boolean` | errors     | Should JohanaCore catch errors and uncaught Exceptions and show the `error_view`. See [Error Handling](JohanaCore/errors) for more info. <br /> <br /> Recommended setting: `true` while developing, `false` on production servers. | `true`
 * `Boolean` | profile    | Whether to enable the [Profiler](JohanaCore/profiling). <br /> <br />Recommended setting: `true` while developing, `false` on production servers. | `true`	 * `Boolean` | caching    | Cache file locations to speed up [JohanaCore.findFile].  This has nothing to do with [JohanaCore.cache], [Fragments](JohanaCore/fragments) or the [Cache module](cache).  <br /> <br />  Recommended setting: `false` while developing, `true` on production servers. | `false`
 *
 * @throws  Error
 * @param   Object   Array of settings.  See above.
 * @return  void
 * @uses    JohanaCore.cache
 * @uses    Profiler
 */
JohanaCore.init = function(settings)
{
	settings = settings || {};

	if (_init)
	{
		// Do not allow execution twice
		return;
	}

	// JohanaCore is now initialized
	_init = true;

	if (settings['profile'] !== undefined)
	{
		// Enable profiling
		Johana.profiling = settings['profile'];
	}

	if (settings['errors'] !== undefined)
	{
		// Enable error handling
		Johana.errors = settings['errors'];
	}

	if (Johana.errors === true)
	{
//		// Enable JohanaCore exception handling, adds stack traces and error source.
//		set_exception_handler(Object('JohanaCore_Exception', 'handler'));
//
//		// Enable JohanaCore error handling, converts all PHP errors to exceptions.
//		set_error_handler(Object('JohanaCore', 'error_handler'));
	}

	if (settings['expose'] !== undefined)
	{
		Johana.expose = settings['expose'];
	}

	// Determine if we are running in a Windows environment
	if (process.platform === 'win32')
	{
		Johana.isWindows = true;
	}

	if (settings['cacheDir'] !== undefined)
	{
		try
		{
			var cacheDirExists = fs.statSync(settings['cacheDir']).isDirectory();
		}
		catch (e)
		{
			// Invalid cache path
			var cacheDirExists = false;
		}

		if (!cacheDirExists)
		{
			try
			{
				// Create the cache directory
				fs.mkdirSync(settings['cacheDir'], 0755);
			}
			catch (e)
			{
				throw new Error('Could not create cache directory ' +
					settings['cacheDir']);
			}
		}

		// Set the cache directory path
		Johana.cacheDir = fs.realpathSync(settings['cacheDir']);
	}
	else
	{
		// Use the default cache directory
		Johana.cacheDir = APPPATH + 'cache';
	}

	try
	{
		// Check if cache dir it writable
		fs.chmodSync(Johana.cacheDir, 0755);
	}
	catch (e)
	{
		throw new Error('Directory ' + Johana.cacheDir + ' must be writable');
	}


	if (settings['cacheLife'] !== undefined)
	{
		// Set the default cache lifetime
		Johana.cacheLife = settings['cacheLife'];
	}

	if (settings['caching'] !== undefined)
	{
		// Enable or disable internal caching
		Johana.caching = settings['caching'];
	}

	if (settings['charset'] !== undefined)
	{
		// Set the system character set
		Johana.charset = settings['charset'].toLowerCase();
	}

	if (settings['baseUrl'] !== undefined)
	{
		// Set the base URL
		Johana.baseUrl = settings['baseUrl'].replace(/\/$/, '') + '/';
	}

//	// Load the logger
//	Johana.log = Log.instance();
//
//	// Load the config
//	Johana.config = Config.instance();
};

/**
 * Cleans up the environment:
 *
 * - Restore the previous error and exception handlers
 * - Destroy the Johana.log and Johana.config objects
 *
 * @return  void
 */
JohanaCore.deinit = function()
{
	if (_init)
	{
		// Destroy objects created by init
		Johana.log = Johana.config = null;

		// Reset internal storage
		_modules = _files = [];
		_paths   = [APPPATH, SYSPATH];

		// Reset file cache status
		_filesChanged = false;

		// Kohana is no longer initialized
		_init = false;
	}
};

/**
 * Provides auto-loading support of base objects
 *
 * @param   String   class name
 * @return  Boolean
 */
JohanaCore.autoLoad = function(lib)
{
	var file = lib.replace(/[A-Z]/g, '/$&').replace(/^\//, '').toLowerCase();

	var path = Johana.findFile('prototypes', file);

	if (path)
	{
		// Make some magic
		global.__defineGetter__(lib, function(){
			delete global[lib];
			return global[lib] = require(path);
		});

		global.__defineSetter__(lib, function(){
			return global[lib] = require(path);
		});

		// Object has been found
		return true;
	}

	// Object is not in the filesystem
	return false;
};

/**
 * Changes the currently enabled modules. Module paths may be relative
 * or absolute, but must point to a directory:
 *
 *     Kohana.modules({'modules/foo': MODPATH+'bar'});
 *
 * @param   Object  list of module paths
 * @return  Object  enabled modules
 */
JohanaCore.modules = function(modules)
{
	modules = modules || null;

	if (modules === null)
	{
		// Not changing modules, just return the current set
		return _modules;
	}

	// Start a new list of include paths, APPPATH first
	var paths = new Array(APPPATH);

	for (var name in modules)
	{
		try
		{
			// Check if module is valid
			var module = fs.statSync(modules[name]);
		}
		catch (e)
		{
			var module = false;
		}
		
		if (module && module.isDirectory())
		{
			// Add the module to include paths
			modules[name] = fs.realpathSync(modules[name]) + '/';

			paths.push(modules[name]);
		}
		else
		{
			// This module is invalid, remove it
			delete modules[name];
		}
	}

	// Finish the include paths by adding SYSPATH
	paths.push(SYSPATH);

	// Set the new include paths
	_paths = paths;

	// Set the current module list
	_modules = modules;

	for(var path in _modules)
	{
		var file = _modules[path] + 'init.js';

		try
		{
			// Check if exists initialization file
			var init = fs.statSync(file);
		}
		catch (e)
		{
			var init = false;
		}

		if (init && init.isFile())
		{
			// Include the module initialization file once
			require(file);
		}
	}

	return _modules;
};

/**
 * Returns the the currently active include paths, including the
 * application, system, and each module's path.
 *
 * @return  Object
 */
JohanaCore.includePaths = function()
{
	return _paths;
};


/**
 * Searches for a file in the [Cascading Filesystem](johana/files), and
 * returns the path to the file that has the highest precedence, so that it
 * can be included.
 *
 * When searching the "config", "messages", or "i18n" directories, or when
 * the `list` flag is set to true, an object of all the files that match
 * that path in the [Cascading Filesystem](johana/files) will be returned.
 * These files will return Objects which must be merged together.
 *
 * If no extension is given, the default extension '.js' will be used.
 *
 *     // Returns an absolute path to views/template.js
 *     Johana.findFile('views', 'template');
 *
 *     // Returns an absolute path to media/css/style.css
 *     Johana.findFile('media', 'css/style', 'css');
 *
 *     // Returns an Object of all the "mimes" configuration files
 *     Johana.findFile('config', 'mimes');
 *
 * @param   String   directory name (views, i18n, classes, extensions, etc.)
 * @param   String   filename with subdirectory
 * @param   String   extension to search for
 * @param   Boolean  return an array of files?
 * @return  Object   a list of files when list is true
 * @return  String   single file path
 */
JohanaCore.findFile = function(dir, file, ext, list)
{
	ext = ext || null; list = list || false;

	if (ext === null)
	{
		// Use the default extension
		ext = '.js';
	}
	else if (ext)
	{
		// Prefix the extension with a period
		ext = '.' + ext;
	}
	else
	{
		// Use no extension
		ext = '';
	}

	// Create a partial path of the filename
	var path = dir + '/' + file + ext;

	if (Johana.caching === true && _files[path + (list ? '_list' : '_path')] !== undefined)
	{
		// This path has been cached
		return _files[path + (list ? '_list' : '_path')];
	}

	if (Johana.profiling === true)
	{
		// Start a new benchmark
		var benchmark = Profiler.start('Johana', 'findFile');
	}
	else
	{
		var benchmark = false;
	}

	if (list || dir === 'config' || dir === 'i18n' || dir === 'messages')
	{
		// Include paths must be searched in reverse
		var paths = _paths.slice().reverse();

		// Array of files that have been found
		var found = [];

		for (var dir in paths)
		{
			try
			{
				// check if file exists
				var file = fs.statSync(paths[dir] + path);
			}
			catch (e)
			{
				var file = false;
			}

			if (file && file.isFile())
			{
				// This path has a file, add it to the list
				found.push(paths[dir] + path);
			}
		}
	}
	else
	{
		// The file has not been found yet
		found = false;

		for (var dir in _paths)
		{
			try
			{
				// check if file exists
				var file = fs.statSync(_paths[dir] + path);
			}
			catch (e)
			{
				var file = false;
			}

			if (file && file.isFile())
			{
				// This path has a file, add it to the list
				found = _paths[dir] + path;
				break;
			}
		}
	}

	if (Johana.caching === true)
	{
		// Add the path to the cache
		_files[path + (list ? '_list' : '_path')] = found;

		// Files have been changed
		_filesChanged = true;
	}

	if (benchmark)
	{
		// Stop the benchmark
		Profiler.stop(benchmark);
	}

	return found;
};

module.exports = JohanaCore;
