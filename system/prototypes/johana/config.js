/**
 * Wrapper for configuration objects. Multiple configuration readers can be
 * attached to allow loading configuration from files, database, etc.
 *
 * @package    Johana
 * @category   Configuration
 * @author     Johana Team
 * @copyright  (c) 2011 Johana Team
 * @license    http://johanaframework.org/license
 */
JohanaConfig = function()
{
	/**
	 * @var  Array  Configuration readers
	 */
	this._readers = [];
};

/**
 * Attach a configuration reader. By default, the reader will be added as
 * the first used reader. However, if the reader should be used only when
 * all other readers fail, use `false` for the second parameter.
 *
 *     config.attach(reader);        // Try first
 *     config.attach(reader, false); // Try last
 *
 * @param   Object   ConfigReader instance
 * @param   Boolean  add the reader as the first used object
 * @return  this
 */
JohanaConfig.prototype.attach = function(reader, first)
{
	if (first === true)
	{
		// Place the config reader at the top of the stack
		this._readers.unshift(reader);
	}
	else
	{
		// Place the reader at the bottom of the stack
		this._readers.push(reader);
	}

	return this;
};

/**
 * Detach a configuration reader.
 *
 *     config.detach(reader);
 *
 * @param   Object  ConfigReader instance
 * @return  this
 */
JohanaConfig.prototype.detach = function(reader)
{
	var key = this._readers.indexOf(reader);

	if (key !== -1)
	{
		// Remove the reader
		this._readers.splice(key, 1);
	}

	return this;
};

/**
 * Load a configuration group. Searches the readers in order until the
 * group is found. If the group does not exist, an empty configuration
 * array will be loaded using the first reader.
 *
 *     array = config.load(name);
 *
 * @param   String  configuration group name
 * @return  ConfigReader
 * @throws  Error
 */
JohanaConfig.prototype.load = function(group)
{
	if (this._readers.length === 0)
	{
		throw new Error('No configuration readers attached');
	}

	for (var reader in this._readers)
	{
		var config = this._readers[reader].load(group);

		if (config)
		{
			// Found a reader for this configuration group
			return config;
		}
	}

	// Reset the iterator
	var config = this._readers.slice(0, 1)[0];

	// Load the reader as an empty object
	return config.load(group, {});
};

/**
 * Copy one configuration group to all of the other readers.
 * 
 *     config.copy(name);
 *
 * @param   String   configuration group name
 * @return  this
 */
JohanaConfig.prototype.copy = function(group)
{
	// Load the configuration group
	var config = this.load(group);

	for (var reader in this._readers)
	{
		if (config instanceof this._readers[reader].constructor)
		{
			// Do not copy the config to the same group
			continue;
		}

		// Load the configuration object
		var object = this._readers[reader].load(group, {});

		for (var key in config)
		{
			// Copy each value in the config
			object.set(key, config[key]);
		}
	}

	return this;
};

/**
 * @var  JohanaConfig  Singleton static instance
 */
var _instance = null;

/**
 * Get the singleton instance of Config.
 *
 *     var config = Config.instance();
 *
 * @return  Config
 */
JohanaConfig.instance = function()
{
	if (_instance === null)
	{
		// Create a new instance
		_instance = new Config();
	}

	return _instance;
};

module.exports = JohanaConfig; // End
