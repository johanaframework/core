/**
 * Provides auto-loading support of prototypes that follow Johana's 
 * naming conventions
 *
 *     // Loads prototypes/my/proto/name.js
 *     Johana.autoLoad('MyProtoName');
 *
 * @package    Johana
 * @category   Core
 * @author     Johana Team
 * @copyright  (c) 2011 Johana Team
 * @license    http://johanaframework.org/license
 */
Autoload = {};

/**
 * Get list of Protorypes in folder (recursive)
 * 
 * @param  String  directory for lookup 
 * @param  String  prefix to prototype name if file is not in root dir
 * @return Array   list of prototypes names
 */
Autoload.list = function (root, prefix)
{
	prefix = prefix || '';

	var prototypes = [];

	// Load all items in root dir
	try
	{
		var files = require('fs').readdirSync(root);
	}
	catch (e)
	{
		var files = false;
	}

	for (var f in files)
	{
		// Get info about loaded fs item
		var stats = require('fs').statSync(root + '/' + files[f]);

		if (stats.isFile())
		{
			// As prototype name use filename without extension
			var proto = files[f].replace(/\.[^.]+$/, '');

			// Capitalize prototype name
			proto = proto.charAt(0).toUpperCase() + proto.slice(1);

			prototypes.push(prefix + proto);
		}
		else if (stats.isDirectory())
		{
			// Append to prefix capitalized directory name 
			var dir = files[f].charAt(0).toUpperCase() + files[f].slice(1);

			// Review sub items
			var sub = Autoload.list(root + '/' + files[f], prefix + dir);

			prototypes = prototypes.concat(sub);
		}
	}

	return prototypes;
};

/**
 * Get list of Protorypes in folder (recursive)
 * 
 * @param  String  directory for lookup 
 * @param  String  prefix to prototype name if file is not in root dir
 * @return Array   list of prototypes names
 */
Autoload.init = function (path)
{
	var prototypes = Autoload.list(path);

	for (var p in prototypes)
	{
		// Load to global context
		Johana.autoLoad(prototypes[p]);
	}
};

// Load system and application prototypes
Autoload.init(SYSPATH + 'prototypes');
Autoload.init(APPPATH + 'prototypes');
