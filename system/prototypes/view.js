/**
 * Acts as an object wrapper for HTML pages with embedded js, called "views".
 * Variables can be assigned with the view object and referenced locally within
 * the view.
 *
 * @package    
 * @category   Base
 * @author     
 * @copyright  
 * @license    
 */
View = function(file, data)
{
	// View filename
	var _file;

	// Array of local variables
	var _data = {};

	/**
	 * Sets the view filename.
	 *
	 *     view.setFilename(file);
	 *
	 * @param   string  view filename
	 * @return  View
	 * @throws  Error
	 */
	this.setFilename = function(file)
	{
		var path = Johana.findFile('views', file, 'tpl');

		if (path === false)
		{
			throw new Error('The requested view '+file+' could not be found');
		}

		// Store the file path locally
		_file = path;

		return this;
	};

	/**
	 * Sets the initial view filename and local data. Views should almost
	 * always only be created using [View::factory].
	 *
	 *     $view = new View($file);
	 *
	 * @param   string  view filename
	 * @param   array   array of values
	 * @return  void
	 * @uses    View.setFilename
	 */
	{
		file = file || null; data = data || null;

		if (file !== null)
		{
			this.setFilename(file, file);
		}

		if (data !== null)
		{
			// Add the values to the current data
			_data = data + _data;
		}
	}

	/**
	 * Magic method, calls [View::set] with the same parameters.
	 *
	 *     $view->foo = 'something';
	 *
	 * @param   string  variable name
	 * @param   mixed   value
	 * @return  void
	 */
	this.__defineSetter__('asd', function (value)
	{
		this.set(vvvar, value);
	});

	/**
	 * Assigns a variable by name. Assigned values will be available as a
	 * variable within the view file:
	 *
	 *     // This value can be accessed as foo within the view
	 *     view.set('foo', 'my value');
	 *
	 * You can also use an array to set several values at once:
	 *
	 *     // Create the values $food and $beverage in the view
	 *     view.set({food: 'bread', beverage: 'water'});
	 *
	 * @param   string   variable name or an array of variables
	 * @param   mixed    value
	 * @return  this
	 */
	this.set = function(key, value)
	{
		value = value || null;

		if (typeof value === 'object')
		{
			for (var name in value)
			{
				_data[name] = value[name];
			}
		}
		else
		{
			_data[key] = value;
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
	 * @param    string  view filename
	 * @return   string
	 * @throws   Kohana_View_Exception
	 * @uses     View.capture
	 */
	this.render = function(file)
	{
		file = file || null;

		if (file !== null)
		{
			this.setFilename(file);
		}

		if (!_file)
		{
			throw new Error('You must set the file to use within your view before rendering');
		}

		// Combine local and global data and capture the output
		return View.capture(_file, _data);
	};
};


// Array of global variables
var _global_data = {};

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
View.factory = function(file, data)
{
	file = file || null; data = data || null;

	return new View(file, data);
};

/**
 * Captures the output that is generated when a view is included.
 * The view data will be extracted to make local variables. This method
 * is static to prevent object scope resolution.
 *
 *     $output = View::capture($file, $data);
 *
 * @param   string  filename
 * @param   array   variables
 * @return  string
 */
View.capture = function(johanaViewFilename, johanaViewData)
{
	return View.captureMicroTemplating(johanaViewFilename, johanaViewData);
};

/**
 * Captures the output that is generated when a view is included.
 * The view data will be extracted to make local variables. This method
 * is static to prevent object scope resolution.
 *
 *     $output = View::capture($file, $data);
 *
 * @param   string  filename
 * @param   array   variables
 * @return  string
 */
View.captureMicroTemplating = function(file, data)
{
	var tpl = _microTemplates[file] || false;

	if (tpl)
	{
		return tpl(data);
	}

	var view = fs.readFileSync(file).toString();

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

module.exports = View;
