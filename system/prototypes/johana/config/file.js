/**
 * File-based configuration reader. Multiple configuration directories can be
 * used by attaching multiple object to [Config].
 *
 * @package    Johana
 * @category   Configuration
 * @author     Johana Team
 * @copyright  (c) 2011 Johana Team
 * @license    http://johanaframework.org/license
 */
JohanaConfigFile = function(directory)
{
	ConfigReader.call(this);

	/**
	 * @var  String  Configuration group name
	 */
	this.directory = directory || 'config';
};

// Inherits
require('util').inherits(JohanaConfigFile, ConfigReader);

/**
 * Load and merge all of the configuration files in this group.
 *
 *     config.load(name);
 *
 * @param   String  configuration group name
 * @param   Object  configuration object
 * @return  this   clone of the current object
 */
JohanaConfigFile.prototype.load = function(group, config)
{
	config = config || null;

	var files = Johana.findFile(this.directory, group, null, true);

	if (files.length)
	{
		// Initialize the config array
		config = {};

		for (var file in files)
		{
			// Merge each file to the configuration array TODO: fix merge
			config = require(files[file]);
		}
	}

	return this.loaded(group, config);
};

exports = module.exports = JohanaConfigFile; // End