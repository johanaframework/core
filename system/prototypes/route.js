/**
 * Routes are used to determine the controller and action for a requested URI.
 * Every route generates a regular expression which is used to match a URI
 * and a route. Routes may also contain keys which can be used to set the
 * controller, action, and parameters.
 *
 * Each <key> will be translated to a regular expression using a default
 * regular expression pattern. You can override the default pattern by providing
 * a pattern for the key:
 *
 *     // This route will only match when <id> is a digit
 *     Route.set('user', 'user/<action>/<id>', {id: '\d+'});
 *
 *     // This route will match when <path> is anything
 *     Route.set('file', '<path>', {path:'.*'});
 *
 * It is also possible to create optional segments by using parentheses in
 * the URI definition:
 *
 *     // This is the standard default route, and no keys are required
 *     Route.set('default', '(<controller>(/<action>(/<id>)))');
 *
 *     // This route only requires the <file> key
 *     Route.set('file', '(<path>/)<file>(.<format>)', {path:'.*',format:'\w+'});
 *
 * Routes also provide a way to generate URIs (called "reverse routing"), which
 * makes them an extremely powerful and flexible way to generate internal links.
 *
 * @package    
 * @category   Base
 * @author     
 * @copyright  (c) 2008-2011 
 * @license    
 */
Route = function(uri, regex)
{
	/**
	 * @var  callback     The callback method for routes
	 */
	var _callback;

	/**
	 * @var  String  route URI
	 */
	var _uri = '';

	/**
	 * @var  Object
	 */
	var _regex = {};

	/**
	 * @var  Object
	 */
	var _defaults = {action:'index', host:false};

	/**
	 * @var  Object
	 */
	var _route_regex;

	/**
	 * @var  Object
	 */
	var _segments;

	/**
	 * @var  Object
	 */
	var _offsets;

	/**
	 * Creates a new route. Sets the URI and regular expressions for keys.
	 * Routes should always be created with [Route::set] or they will not
	 * be properly stored.
	 *
	 *     route = new Route(uri, regex);
	 *
	 * The $uri parameter can either be a string for basic regex matching or it
	 * can be a valid callback or anonymous function (php 5.3+). If you use a
	 * callback or anonymous function, your method should return an array
	 * containing the proper keys for the route. If you want the route to be
	 * "reversable", you need pass the route string as the third parameter.
	 *
	 *     route = new Route(function(uri){
	 *     		return {controller: 'foo', action: 'bar', id: uri};
	 *     	},
	 *     	'foo/bar/<id>'
	 *     );
	 *
	 * @param   mixed     route URI pattern or lambda/callback function
	 * @param   Object    key patterns
	 * @return  void
	 * @uses    Route._compile
	 */
	{
		// Use null by default
		uri = uri || null; regex = regex || null;

		if (uri === null)
		{
			// Assume the route is from cache
			return;
		}

		if (typeof uri == 'function')
		{
			_callback = uri;
			_uri = regex;
			regex = null;
		}
		else if (uri)
		{
			_uri = uri;
		}

		if (regex)
		{
			_regex = regex;
		}

		var compile = Route.compile(uri, regex);

		// Store the compiled regex locally
		_route_regex = compile['route_regex'];
		_segments = compile['segments'];
		_offsets = compile['offsets'];
	}

	/**
	 * Provides default values for keys when they are not present. The default
	 * action will always be "index" unless it is overloaded here.
	 *
	 *     route.defaults({controller:'welcome', action:'index'});
	 *
	 * @param   object  key values
	 * @return  this
	 */
	this.defaults = function(defaults)
	{
		_defaults = defaults || null;

		return this;
	};

	/**
	 * Tests if the route matches a given URI. A successful match will return
	 * all of the routed parameters as an array. A failed match will return
	 * boolean false.
	 *
	 *     // Params: controller = users, action = edit, id = 10
	 *     params = route.matches('users/edit/10');
	 *
	 * This method should almost always be used within an if/else block:
	 *
	 *     if (params = route.matches(uri))
	 *     {
	 *         // Parse the parameters
	 *     }
	 *
	 * @param   string  URI to match
	 * @return  object  on success
	 * @return  false   on failure
	 */
	this.matches = function(uri)
	{
		if (this._callback)
		{
			var params = this._callback(uri);

			if (!params)
				return false;
		}
		else
		{
			var matches = uri.match(_route_regex);

			if (!matches)
				return false;

			var params = {};

			var match = 1;
			for (var key in _segments)
			{
				params[_segments[key]] = matches[match];
				match += 1 + _offsets[_segments[key]];
			}
		}

		for (var key in _defaults)
		{
			if (!params[key])
			{
				// Set default values for any key that was not matched
				params[key] = _defaults[key];
			}
		}

		return params;
	};

	/**
	 * Returns whether this route is an external route
	 * to a remote controller.
	 *
	 * @return  boolean
	 */
	this.isExternal = function()
	{
		return (Route.localhosts.indexOf(_defaults['host'] || false) === -1);
	};

	/**
	 * Generates a URI for the current route based on the parameters given.
	 *
	 *     // Using the "default" route: "users/profile/10"
	 *     route.uri({
	 *         controller:'users',
	 *         action:profile',
	 *         id:'10'
	 *     });
	 *
	 * @param   array   URI parameters
	 * @return  string
	 * @throws  Error
	 * @uses    REGEX_Key
	 */
	this.uri = function(params)
	{
		params = params || null;

		// Start with the routed URI
		uri = _uri;

		if (uri.indexOf('<') === -1 && uri.indexOf('(') === -1)
		{
			// This is a static route, no need to replace anything

			if ( ! this.isExternal())
				return uri;

			// If the localhost setting does not have a protocol
			if ((_defaults['host'] || '').indexOf('://') === -1)
			{
				// Use the default defined protocol
				params['host'] = Route.defaultProtocol+_defaults['host'];
			}
			else
			{
				// Use the supplied host with protocol
				params['host'] = _defaults['host'];
			}

			// Compile the final uri and return it
			return params['host'].replce(/^\//, '')+'/'+uri;
		}

		var match;
		while (match = uri.match(/\([^()]+\)/))
		{
			// Search for the matched value
			var search = match[0];

			// Remove the parenthesis from the match as the replace
			var replace = match[0].substring(1, match[0].length - 1);
			//console.log(search, replace);

			while (match = replace.match(REGEX_KEY))
			{
				var key = match[0], param = match[1];

				if (params[param] !== undefined)
				{
					// Replace the key with the parameter value
					replace = replace.replace(key, params[param]);
				}
				else
				{
					// This group has missing parameters
					replace = '';
					break;
				}
			}

			uri = uri.replace(search, replace);
		}

		while (match = uri.match(REGEX_KEY))
		{
			var key = match[0], param = match[1];

			if (params[param] === undefined)
			{
				// Ungrouped parameters are required
				throw new Error('Required route parameter not passed: '+param);
			}

			uri = uri.replace(key, params[param]);
		}

		// Trim all extra slashes from the URI
		uri = uri.replace(/^\//, '').replace(/\/\/+/, '/');

		if (this.isExternal())
		{
			// Need to add the host to the URI
			host = _defaults['host'];

			if (host.indexOf('://') === -1)
			{
				// Use the default defined protocol
				host = Route.defaultProtocol + host;
			}

			// Clean up the host and prepend it to the URI
			uri = host.replace(/^\//, '')+'/' + uri;
		}

		return uri;
	};
};

// Defines the pattern of a <segment>
const REGEX_KEY     = /<([a-zA-Z0-9_]+)>/;

// What can be part of a <segment> value
const REGEX_SEGMENT = '[^/.,;?\\n]+';

// What must be escaped in the route regex
const REGEX_ESCAPE  = /[.\+*?[^\]${}=!|]/g;

/**
 * @var  String  default protocol for all routes
 *
 * @example  'http://'
 */
Route.defaultProtocol = 'http://';

/**
 * @var  Array   list of valid localhost entries
 */
Route.localhosts = new Array(false, '', 'local', 'localhost');

/**
 * @var  String  default action for all routes
 */
Route.defaultAction = 'index';

/**
 * @var  bool Indicates whether routes are cached
 */
Route.cache = false;

/**
 * @var  Object
 */
var _routes = {};

/**
 * Stores a named route and returns it. The "action" will always be set to
 * "index" if it is not defined.
 *
 *     Route.set('default', '(<controller>(/<action>(/<id>)))')
 *         .defaults({controller:'welcome'});
 *
 * @param   String   route name
 * @param   String   URI pattern
 * @param   Object   regex patterns for route keys
 * @return  Route
 */
Route.set = function(name, uri, regex)
{
	uri = uri || null;
	regex = regex || null;

	return _routes[name] = new Route(uri, regex);
};

/**
 * Retrieves a named route.
 *
 *     route = Route.get('default');
 *
 * @param   String  route name
 * @return  Route
 * @throws  Error
 */
Route.get = function(name)
{
	if (_routes[name] == undefined)
	{
		throw new Error('The requested route does not exist: ' + name);
	}

	return _routes[name];
};

/**
 * Retrieves all named routes.
 *
 *     routes = Route.all();
 *
 * @return  Array  routes by name
 */
Route.all = function()
{
	return _routes;
};

/**
 * Get the name of a route.
 *
 *     $name = Route::name($route)
 *
 * @param   object  Route instance
 * @return  string
 */
Route.getName = function(route)
{
	for (var name in _routes)
		if (_routes[name] === route)
			return name;

	return false;
};

/**
 * Returns the compiled regular expression for the route. This translates
 * keys and optional groups to a proper PCRE regular expression.
 *
 *     compiled = Route.compile('<controller>(/<action>(/<id>))',
 *         {controller:'[a-z]+',id:'\d+'});
 *
 * @return  String
 * @uses    Route.REGEX_ESCAPE
 * @uses    Route.REGEX_SEGMENT
 */
Route.compile = function(uri, regex)
{
	regex = regex || null;

	if (typeof uri != 'string')
		return;

	// The URI should be considered literal except for keys and optional parts
	// Escape everything preg_quote would escape except for : ( ) < >
	var expression = uri.replace(REGEX_ESCAPE, '\\$&');

	if (expression.indexOf('(') != -1)
	{
		// Make optional parts of the URI non-capturing and optional
		expression = expression.replace(/\(/g, '(?:').replace(/\)/g, ')?');
	}

	var offsets = {}

	// Parse the user-specified regex
	if (regex)
		for (var key in regex)
		{
			// Build groups
			var trimmed = regex[key].toString().replace(/^\//, '(')
				.replace(/\/$/, ')').replace(/^[^(]/, '($&')
				.replace(/[^)]$/, '$&)');

			offsets[key] = trimmed.match(/\([^\?:]/g).length - 1;

			expression = expression.replace('<'+key+'>', trimmed);
		}

	// Insert default regex for keys
	expression = expression.replace(/<(.*?)>/g, '('+REGEX_SEGMENT+')');

	var segments = {};
	var matches = uri.match(/<(.*?)>/g);
	for (var segment in matches)
	{
		segments[segment] = matches[segment]
			.substring(1, matches[segment].length - 1);
	}

	var compiled = {};

	compiled['route_regex'] = new RegExp('^'+expression+'$');
	compiled['segments'] = segments;
	compiled['offsets'] = offsets;

	return compiled;
};

module.exports = Route;
