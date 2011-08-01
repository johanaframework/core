/**
 * Wrapper for configuration arrays. Multiple configuration readers can be
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
	var _readers = [];

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
	this.attach = function(reader, first)
	{
		first = first || true;

		if (first === true)
		{
			// Place the log reader at the top of the stack
			_readers.unshift(reader);
		}
		else
		{
			// Place the reader at the bottom of the stack
			_readers.push(reader);
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
	this.detach = function(reader)
	{
		var key = _readers.indexOf(reader);

		if (key !== -1)
		{
			// Remove the writer
			delete _readers[key];
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
	this.load = function(group)
	{
		for (var reader in _readers)
		{
			var config = _readers[reader].load(group);

			if (config)
			{
				// Found a reader for this configuration group
				return config;
			}
		}

		if (_readers.length === 0)
		{
			throw new Error('No configuration readers attached');
		}

		// Load the reader as an empty array
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
	this.copy = function(group)
	{
		// Load the configuration group
		var config = this.load(group);

		// TODO:

		return this;
	};

};

/**
 * @var  JohanaConfig  Singleton static instance
 */
var _instance = null;

/**
 * Get the singleton instance of Config.
 *
 *     config = Config.instance();
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

module.exports = JohanaConfig;
