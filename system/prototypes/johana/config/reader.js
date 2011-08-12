/**
 * Abstract configuration reader. All configuration readers must inherits
 * this prototype.
 *
 * @package    Johana
 * @category   Configuration
 * @author     Johana Team
 * @copyright  (c) 2011 Johana Team
 * @license    http://johanaframework.org/license
 */
JohanaConfigReader = function()
{
	/**
	 * @var  String  Configuration group name
	 */
	this.group = '';
	
	/**
	 * @var  Object  Configuration data
	 */
	this.config = {};
};

/**
 * Loads a configuration group.
 *
 *     config.load(name, object);
 *
 * This method must be replaced by all readers. After the group has been
 * loaded, call `this.preparation(group, config)` for final preparation.
 *
 * @param   String  configuration group name
 * @param   Object  configuration object
 * @return  this    a clone of this object
 */
JohanaConfigReader.prototype.load = function(group, config)
{
	return this;
};

/**
 * Make final config reader preparation.
 *
 * @param   String  configuration group name
 * @param   Object  configuration object
 * @return  this    a clone of this object
 */
JohanaConfigReader.prototype.loaded = function(group, config)
{
	config = config || null;

	if (config === null)
	{
		return false;
	}

	// Clone the current object
	var cloned = Object.create(this);

	// Set the group name
	cloned.group = group;

	// Swap the object with the actual configuration
	for (var key in config)
	{
		cloned.set(key, config[key]);
	}

	return cloned;
};

/**
 * Get a variable from the configuration or return the default value.
 *
 *     var value = config.get(key);
 *
 * @param   String   array key
 * @param   Mixed    default value
 * @return  Mixed
 */
JohanaConfigReader.prototype.get = function(key, def)
{
	def = def || null;

	return this.config[key] !== undefined ? this.config[key] : def;
};

/**
 * Sets a value in the configuration object.
 *
 *     config.set(key, newValue);
 *
 * @param   String   object key
 * @param   Mixed    object value
 * @return  this
 */
JohanaConfigReader.prototype.set = function(key, value)
{
	this.config[key] = value;

	this.__defineGetter__(key, function(){
		return value;
	});

	return this;
};

/**
 * Return the raw object.
 *
 *     var object = config.asObject();
 *
 * @return  Object
 */
JohanaConfigReader.prototype.asObject = function()
{
	return this.config;
};

/**
 * Return the current group in serialized form.
 *
 * @return  String
 */
JohanaConfigReader.prototype.toString = function()
{
	return JSON.stringify(this);
};

module.exports = JohanaConfigReader; // End