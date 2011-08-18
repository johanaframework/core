/**
 * Acts as an object wrapper for HTML pages with embedded js, called "views".
 * Variables can be assigned with the view object and referenced locally within
 * the view.
 *
 * @package    Johana
 * @category   Base
 * @author     Johana Team
 * @copyright  (c) 2011 Johana Team
 * @license    http://johanaframework.org/license
 */

/**
 * Sets the initial view filename and local data. Views should almost
 * always only be created using [View.factory].
 *
 *     var view = new View(file);
 *
 * @param   String  view filename
 * @param   Array   array of values
 * @return  void
 * @uses    View.setFilename
 */
JohanaView = function(file, data)
{
	file = file || null; data = data || null;

	if (file !== null)
	{
		this.setFilename(file);
	}

	if (data !== null)
	{
		// Add the values to the current data
		this._data = Arr.merge(this._data, data);
	}
};

// View filename
JohanaView.prototype._file = null;

// Array of local variables
JohanaView.prototype._data = {};


/**
 * Sets the view filename.
 *
 *     view.setFilename(file);
 *
 * @param   String  view filename
 * @return  View
 * @throws  Error
 */
JohanaView.prototype.setFilename = function(file)
{
	var path = Johana.findFile('views', file, 'tpl');

	if (path === false)
	{
		throw new Error('The requested view ' + file + ' could not be found');
	}

	// Store the file path locally
	this._file = path;

	return this;
};

/**
 * Assigns a variable by name. Assigned values will be available as a
 * variable within the view file:
 *
 *     // This value can be accessed as foo within the view
 *     view.set('foo', 'my value');
 *
 * You can also use an array to set several values at once:
 *
 *     // Create the values food and beverage in the view
 *     view.set({food: 'bread', beverage: 'water'});
 *
 * @param   String   variable name or an array of variables
 * @param   Mixed    value
 * @return  View
 */
JohanaView.prototype.set = function(key, value)
{
	value = value || null;

	if (typeof key === 'object')
	{
		for (var name in key)
		{
			this._data[name] = key[name];
		}
	}
	else
	{
		this._data[key] = value;
	}

	return this;
};

/**
 * Renders the view object to a string. Global and local data are merged
 * and extracted to create local variables within the view file.
 *
 *     output = view.render();
 *
 * [!!] Global variables with the same key name as local variables will be
 * overwritten by the local variable.
 *
 * @param    String  view filename
 * @return   String
 * @throws   Error
 * @uses     View.capture
 */
JohanaView.prototype.render = function(file)
{
	file = file || null;

	if (file !== null)
	{
		this.setFilename(file);
	}

	if (!this._file)
	{
		throw new Error('You must set the file to use within your view before rendering');
	}

	// Combine local and global data and capture the output
	return View.capture(this._file, this._data);
};

// Array of global variables
var _globalData = {};

// Mikrotemplates Cache
var _microTemplates = {};

/**
 * Returns a new View object. If you do not define the "file" parameter,
 * you must call [View.setFilename].
 *
 *     view = View.factory(file);
 *
 * @param   string  view filename
 * @param   array   array of values
 * @return  View
 */
JohanaView.factory = function(file, data)
{
	file = file || null; data = data || null;

	return new View(file, data);
};

/**
 * Sets a global variable, similar to [View.set], except that the
 * variable will be accessible to all views.
 *
 *     View.setGlobal(name, value);
 *
 * @param   String  variable name or an array of variables
 * @param   Mixed   value
 * @return  Void
 */
JohanaView.setGlobal = function(key, value)
{
	value = value || null;

	if (typeof key === 'object')
	{
		for (var name in key)
		{
			_globalData[name] = key[name];
		}
	}
	else
	{
		_globalData[key] = value;
	}
};

/**
 * Captures the output that is generated when a view is included.
 * The view data will be extracted to make local variables. This method
 * is static to prevent object scope resolution.
 * By default is used Microtemplating
 *
 *     var output = View.capture(file, data);
 *
 * @param   String  filename
 * @param   Object   variables
 * @return  String
 */
JohanaView.capture = function(file, data)
{
	data = Arr.merge(_globalData, data);

	return View.captureMicroTemplating(file, data);
};

/**
 * Captures the output from Microtemplate.
 *
 *     var output = View.captureMicroTemplating(file, data);
 *
 * @param   String  filename
 * @param   Object  variables
 * @return  String
 */
JohanaView.captureMicroTemplating = function(file, data)
{
	var tpl = _microTemplates[file] || false;

	if (tpl)
	{
		return tpl(data);
	}

	var view = require('fs').readFileSync(file).toString();

	// TODO: not escape inblock quotes
	view = ('p.push(\'' + view.replace(/\'/g, "\\'") + '\');')
		.replace(/[\r\n]/g, "\\n")
		.replace(/\\n([\s\t]*)<%(.*?)%>([\s\t]*)\\n/g, "\\n$1<%$2%>")
		.replace(/<%(.*?)\/\/(.*?)%>/g, "<%$1%>")
		.replace(/<%(.*?)\/\*(.*?)\*\/(.*?)%>/g, "<%$1$3%>")
		.replace(/<%=(.*?)%>/g, "'); p.push($1); p.push('")
		.replace(/<%(.*?)%>/g, "'); $1 p.push('");

	tpl = _microTemplates[file] = new Function("data",
			"var p=[],print=function(){p.push.apply(p,arguments);};" +
			// Introduce the data as local variables using with(){}
			"with(data){ " + view + "} return p.join('');");

	return tpl(data);
};

module.exports = JohanaView;
