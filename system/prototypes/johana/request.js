/**
 * Request and response wrapper. Uses the [Route] class to determine what
 * [Controller] to send the request to.
 *
 * @package    Johana
 * @category   Base
 * @author     Johana Team
 * @copyright  (c) 2011 Johana Team
 * @license    http://johanaframework.org/license
 */
JohanaRequest = function (){
};

/**
 * @var  String  client user agent
 */
JohanaRequest.userAgent = '';

/**
 * @var  String  client IP address
 */
JohanaRequest.clientIp = '0.0.0.0';

/**
 * @var  Request  main request instance
 */
JohanaRequest.initial;

/**
 * @var  Request  currently executing request instance
 */
JohanaRequest.current;

/**
 * Creates a new request object for the given URI. New requests should be
 * created using the [Request.instance] or [Request.factory] methods.
 *
 *     var request = Request.factory(uri);
 *
 * @param   String  URI of the request
 * @return  void
 * @throws  Error
 * @uses    Route.all
 * @uses    Route.matches
 */
JohanaRequest.factory = function(uri, req)
{
	uri = uri || true; req = req || false;

	var protocol, method, referrer, userAgent, clientIp, requestedWith, body = '';

	// If this is the initial request
	if (1)// ! Request.initial)
	{
		if (req.method)
		{
			// Use the server request method
			method = req.method;
		}
		else
		{
			// Default to GET requests
			method = HttpRequest.GET;
		}

		if (req.connection.encrypted !== undefined)
		{
			// This request is secure
			protocol = 'https';
		}
		else
		{
			protocol = 'http';
		}

		if (req.headers['referer'] !== undefined)
		{
			// There is a referrer for this request
			referrer = req.headers['referer'];
		}

		if (req.connection.socket !== undefined)
		{
			// Client ip
			clientIp = req.connection.socket.remoteAddress;
		}
		else if (req.connection.remoteAddress)
		{
			// Client ip
			clientIp = req.connection.remoteAddress;
		}

		if (req.headers['user-agent'] !== undefined)
		{
			// Browser type
			userAgent = req.headers['user-agent'];
		}

		if (req.headers['x-requested-with'] !== undefined)
		{
			// Typically used to denote AJAX requests
			requestedWith = req.headers['x-requested-with'];
		}

		if (method !== 'GET')
		{
			// Ensure the raw body is saved for future use
			req.on('data', function(data) {
				body += data;
			});

			req.on('end', function(){
				// Set the request body (probably a PUT type)
				request.body(require('querystring').parse(body));
				console.log(require('querystring').parse(body));
			});
		}

//		if (uri === true)
//		{
//			// Attempt to guess the proper URI
//			uri = Request.detect_uri();
//		}

		// Create the instance singleton
		var request = new Request(uri);

		Request.initial = request;

		//console.log(req);
		// Store global GET and POST data in the initial request only
		request.query(require('querystring').parse(req.url));
//		request.post(_POST);

		if (protocol !== undefined)
		{
			// Set the request protocol
			request.protocol(protocol);
		}

		if (method !== undefined)
		{
			// Set the request method
			request.method(method);
		}

		if (referrer !== undefined)
		{
			// Set the referrer
			request.referrer(referrer);
		}

		if (userAgent !== undefined)
		{
			// Set the referrer
			request.userAgent(userAgent);
		}

		if (clientIp !== undefined)
		{
			// Set the referrer
			request.clientIp(clientIp);
		}

		if (requestedWith !== undefined)
		{
			// Apply the requested with variable
			request.requestedWith(requestedWith);
		}
	}
	else
	{
		var request = new Request(uri);
	}

	return request;
};

/**
 * Return the currently executing request. This is changed to the current
 * request when [Request::execute] is called and restored when the request
 * is completed.
 *
 *     request = Request::current();
 *
 * @return  Request
 */
JohanaRequest.current = function()
{
	return Request.current;
};

/**
 * Returns the first request encountered by this framework. This will should
 * only be set once during the first [Request::factory] invocation.
 *
 *     // Get the first request
 *     request = Request::initial();
 *
 *     // Test whether the current request is the first request
 *     if (Request::initial() === Request::current())
 *          // Do something useful
 *
 * @return  Request
 * @since   3.1.0
 */
JohanaRequest.prototype.initial = function()
{
	return Request.initial;
};

/**
 * Returns information about the client user agent.
 *
 *     // Returns "Chrome" when using Google Chrome
 *     browser = Request::user_agent('browser');
 *
 * Multiple values can be returned at once by using an array:
 *
 *     // Get the browser and platform with a single call
 *     info = Request::user_agent(array('browser', 'platform'));
 *
 * When using an array for the value, an associative array will be returned.
 *
 * @param   Mixed   value String to return: browser, version, robot, mobile, platform; or array of values
 * @return  Mixed   requested information, false if nothing is found
 * @uses    Johana::config
 * @uses    Request.user_agent
 */
JohanaRequest.prototype.user_agent = function(value)
{
	if (is_array(value))
	{
		agent = array();
		for (v in value)
		{
			// Add each key to the set
			agent[v] = Request.user_agent(v);
		}

		return agent;
	}

	//static info;

	if (isset(info[value]))
	{
		// This value has already been found
		return info[value];
	}

	if (value === 'browser' || value == 'version')
	{
		// Load browsers
		browsers = Johana.config('user_agents').browser;

		for (name in browsers)
		{//browsers as search => name
			if (stripos(Request.user_agent, search) !== false)
			{
				// Set the browser name
				info['browser'] = name;

				if (preg_match('#'.preg_quote(search) + '[^0-9.]*+([0-9.][0-9.a-z]*)#i', Request.user_agent, matches))
				{
					// Set the version number
					info['version'] = matches[1];
				}
				else
				{
					// No version number found
					info['version'] = false;
				}

				return info[value];
			}
		}
	}
	else
	{
		// Load the search group for this type
		group = Johana.config('user_agents').value;

		for (name in group)
		{//group as search => name
			if (stripos(Request.user_agent, search) !== false)
			{
				// Set the value name
				return info[value] = name;
			}
		}
	}

	// The value requested could not be found
	return info[value] = false;
};

/**
 * Returns the accepted content types. If a specific type is defined,
 * the quality of that type will be returned.
 *
 *     types = Request::accept_type();
 *
 * @param   String  type Content MIME type
 * @return  Mixed   An array of all types or a specific type as a String
 * @uses    Request::_parse_accept
 */
JohanaRequest.prototype.accept_type = function(type)
{
	type = type || null;
	//static accepts;

	if (accepts === null)
	{
		// Parse the HTTP_ACCEPT header
		accepts = Request._parse_accept(_SERVER['HTTP_ACCEPT'], {'*/*' : 1.0});
	}

	if (isset(type))
	{
		// Return the quality setting for this type
		return isset(accepts[type]) ? accepts[type] : accepts['*/*'];
	}

	return accepts;
};

/**
 * Returns the accepted languages. If a specific language is defined,
 * the quality of that language will be returned. If the language is not
 * accepted, false will be returned.
 *
 *     langs = Request::accept_lang();
 *
 * @param   String  lang  Language code
 * @return  Mixed   An array of all types or a specific type as a String
 * @uses    Request::_parse_accept
 */
JohanaRequest.prototype.accept_lang = function(lang)
{
	lang = lang || null;
	//static accepts;

	if (accepts === null)
	{
		// Parse the HTTP_ACCEPT_LANGUAGE header
		accepts = Request._parse_accept(_SERVER['HTTP_ACCEPT_LANGUAGE']);
	}

	if (isset(lang))
	{
		// Return the quality setting for this lang
		return isset(accepts[lang]) ? accepts[lang] : false;
	}

	return accepts;
};

/**
 * Returns the accepted encodings. If a specific encoding is defined,
 * the quality of that encoding will be returned. If the encoding is not
 * accepted, false will be returned.
 *
 *     encodings = Request::accept_encoding();
 *
 * @param   String  type Encoding type
 * @return  Mixed   An array of all types or a specific type as a String
 * @uses    Request::_parse_accept
 */
JohanaRequest.prototype.accept_encoding = function()
{
	type = type || null;
	//static accepts;

	if (accepts === null)
	{
		// Parse the HTTP_ACCEPT_LANGUAGE header
		accepts = Request._parse_accept(_SERVER['HTTP_ACCEPT_ENCODING']);
	}

	if (isset(type))
	{
		// Return the quality setting for this type
		return isset(accepts[type]) ? accepts[type] : false;
	}

	return accepts;
};

/**
 * Process URI
 *
 * @param   String  uri     URI
 * @param   array   routes  Route
 * @return  array
 */
JohanaRequest.prototype.process_uri = function(uri, routes)
{
	routes = routes || null;

	// Load routes
	routes = (empty(routes)) ? Route.all() : routes;
	params = null;

	for (name in routes)
	{
		//routes as name => route
		// We found something suitable
		if (params = route.matches(uri))
		{
			return {
				'params' : params,
				'route' : route
			};
		}
	}

	return null;
};

/**
 * Parses an accept header and returns an array (type => quality) of the
 * accepted types, ordered by quality.
 *
 *     accept = Request::_parse_accept(header, defaults);
 *
 * @param   String   header   Header to parse
 * @param   array    accepts  Default values
 * @return  array
 */
JohanaRequest.prototype._parse_accept = function(header, accepts)
{
	accepts = accepts || null;
	if ( ! empty(header))
	{
		// Get all of the types
		types = explode(',', header);

		for (type in types)
		{
			// Split the type into parts
			parts = explode(';', type);

			// Make the type only the MIME
			type = trim(array_shift(parts));

			// Default quality is 1.0
			quality = 1.0;

			for (part in parts)
			{
				// Prevent undefined value notice below
				if (strpos(part, '=') === false)
					continue;

				// Separate the key and value
				//list (key, value) = explode('=', trim(part));

				if (key === 'q')
				{
					// There is a quality for this type
					quality = 0.1;//(float) trim(value);
				}
			}

			// Add the accept type and quality
			accepts[type] = quality;
		}
	}

	// Make sure that accepts is an array
	accepts = new Array(accepts);

	// Order by quality
	arsort(accepts);

	return accepts;
};

/**
 * @var  String  client user agent
 */
JohanaRequest.prototype._userAgent = '';

/**
 * @var  String  client IP address
 */
JohanaRequest.prototype._clientIp = '0.0.0.0';

/**
 * @var  String  the x-requested-with header which most likely
 *               will be xmlhttprequest
 */
JohanaRequest.prototype._requestedWith;

/**
 * @var  String  method: GET, POST, PUT, DELETE, HEAD, etc
 */
JohanaRequest.prototype._method = 'GET';

/**
 * @var  String  protocol: HTTP/1.1, FTP, CLI, etc
 */
JohanaRequest.prototype._protocol;

/**
 * @var  String  referring URL
 */
JohanaRequest.prototype._referrer;

/**
 * @var  Route       route matched for this request
 */
JohanaRequest.prototype._route;

/**
 * @var  Route       array of routes to manually look at instead of the global namespace
 */
JohanaRequest.prototype._routes;

/**
 * @var  Johana_Response  response
 */
JohanaRequest.prototype._response;

/**
 * @var  Johana_HTTP_Header  headers to sent as part of the request
 */
JohanaRequest.prototype._header;

/**
 * @var  String the body
 */
JohanaRequest.prototype._body;

/**
 * @var  String  controller directory
 */
JohanaRequest.prototype._directory = '';

/**
 * @var  String  controller to be executed
 */
JohanaRequest.prototype._controller;

/**
 * @var  String  action to be executed in the controller
 */
JohanaRequest.prototype._action;

/**
 * @var  String  the URI of the request
 */
JohanaRequest.prototype._uri;

/**
 * @var  boolean  external request
 */
JohanaRequest.prototype._external = false;

/**
 * @var  array   parameters from the route
 */
JohanaRequest.prototype._params = [];

/**
 * @var array    query parameters
 */
JohanaRequest.prototype._get = [];

/**
 * @var array    post parameters
 */
JohanaRequest.prototype._post = [];

/**
 * @var array    cookies to send with the request
 */
JohanaRequest.prototype._cookies = [];

/**
 * @var Johana_Request_Client
 */
JohanaRequest.prototype._client;

/**
 * Creates a new request object for the given URI. New requests should be
 * created using the [Request::instance] or [Request::factory] methods.
 *
 *     request = new Request(uri);
 *
 * If cache parameter is set, the response for the request will attempt to
 * be retrieved from the cache.
 *
 * @param   String  uri URI of the request
 * @param   Cache   cache
 * @param   array   injected_routes an array of routes to use, for testing
 * @return  void
 * @throws  Johana_Request_Exception
 * @uses    Route::all
 * @uses    Route::matches
 */
JohanaRequest.prototype.__construct = function(uri)
{
	// Initialise the header
	this._header = new HTTP_Header(array());

	// Assign injected routes
	this._injected_routes = injected_routes;

	// Cleanse query parameters from URI (faster that parse_url())
	split_uri = explode('?', uri);
	uri = array_shift(split_uri);

	// Initial request has global _GET already applied
	if (Request.initial !== null)
	{
		if (split_uri)
		{
			parse_str(split_uri[0], this._get);
		}
	}

	// Detect protocol (if present)
	// Always default to an internal request if we don't have an initial.
	// This prevents the default index.php from being able to proxy
	// external pages.
	if (Request.initial === null || strpos(uri, '://') === false)
	{
		// Remove trailing slashes from the URI
		uri = trim(uri, '/');

		processed_uri = Request.process_uri(uri, this._injected_routes);

		if (processed_uri === null)
	{
		throw new HTTP_Exception_404('Unable to find a route to match the URI: ' + uri);
	}

		// Store the URI
		this._uri = uri;

		// Store the matching route
		this._route = processed_uri['route'];
		params = processed_uri['params'];

		// Is this route external?
		this._external = this._route.is_external();

		if (isset(params['directory']))
		{
			// Controllers are in a sub-directory
			this._directory = params['directory'];
		}

		// Store the controller
		this._controller = params['controller'];

		if (isset(params['action']))
		{
			// Store the action
			this._action = params['action'];
		}
		else
		{
			// Use the default action
			this._action = Route.default_action;
		}

		// These are accessible as public vars and can be overloaded
		unset(params['controller'], params['action'], params['directory']);

		// Params cannot be changed once matched
		this._params = params;

		// Apply the client
		this._client = new Request_Client_Internal({'cache' : cache});
	}
	else
	{
		// Create a route
		this._route = new Route(uri);

		// Store the URI
		this._uri = uri;

		// Set external state
		this._external = true;

		// Setup the client
		this._client = new Request_Client_External({'cache' : cache});
	}
};

/**
 * Returns the response as the String representation of a request.
 *
 *     echo request;
 *
 * @return  String
 */
JohanaRequest.prototype.__toString = function()
{
	return this.render();
};

/**
 * Generates a relative URI for the current route.
 *
 *     request.uri(params);
 *
 * @param   array   params  Additional route parameters
 * @return  String
 * @uses    Route::uri
 */
JohanaRequest.prototype.uri = function(params)
{
	params = params || null;

	if ( ! isset(params['directory']))
	{
		// Add the current directory
		params['directory'] = this.directory();
	}

	if ( ! isset(params['controller']))
	{
		// Add the current controller
		params['controller'] = this.controller();
	}

	if ( ! isset(params['action']))
	{
		// Add the current action
		params['action'] = this.action();
	}

	// Add the current parameters
	params += this._params;

	uri = this._route.uri(params);

	return uri;
};

/**
 * Create a URL from the current request. This is a shortcut for:
 *
 *     echo URL::site(this.request.uri(params), protocol);
 *
 * @param   array    params    URI parameters
 * @param   Mixed    protocol  protocol String or Request object
 * @return  String
 * @since   3.0.7
 * @uses    URL::site
 */
JohanaRequest.prototype.url = function(params, protocol)
{
	params = params || null; protocol = protocol || null;

	// Create a URI with the current route and convert it to a URL
	var url = URL.site(this.uri(params), protocol);

	return url;
};

/**
 * Retrieves a value from the route parameters.
 *
 *     var id = request.param('id');
 *
 * @param   String   key      Key of the value
 * @param   Mixed    default  Default value if the key is not set
 * @return  Mixed
 */
JohanaRequest.prototype.param = function(key, def)
{
	key = key || null; def = def || null;

	if (key === null)
	{
		// Return the full object
		return this._params;
	}

	return (this._params[key] ? this._params[key] : def);
};

/**
 * Sends the response status and all set headers. The current server
 * protocol (HTTP/1.0 or HTTP/1.1) will be used when available. If not
 * available, HTTP/1.1 will be used.
 *
 *     request.send_headers();
 *
 * @return  this
 * @uses    Request.messages
 * @deprecated This should not be here, it belongs in\n
 * Response::send_headers() where it is implemented correctly.
 */
JohanaRequest.prototype.send_headers = function()
{
	if ( ! (response = this.response()) instanceof Response)
		return this;

	response.send_headers();
	return this;
};

/**
 * Redirects as the request response. If the URL does not include a
 * protocol, it will be converted into a complete URL.
 *
 *     request.redirect(url);
 *
 * [!!] No further processing can be done after this method is called!
 *
 * @param   String   url   Redirect location
 * @param   integer  code  Status code: 301, 302, etc
 * @return  void
 * @uses    URL.site
 * @uses    Request.sendHeaders
 */
JohanaRequest.prototype.redirect = function(url, code)
{
	url = url || ''; code = code || 302;

	if (url.indexOf('://') === -1)
	{
		// Make the URI into a URL
		url = URL.site(url, true);
	}

	// Redirect
	var response = this.createResponse();

	// Set the response status
	response.status(code);

	// Set the location header
	response.headers('Location', url);

	// Send headers
	response.sendHeaders();

	// Stop execution
	//exit;
};

/**
 * Sets and gets the referrer from the request.
 *
 * @param   String referrer
 * @return  Mixed
 */
JohanaRequest.prototype.referrer = function(referrer)
{
	referrer = referrer || null;

	if (referrer === null)
	{
		// Act as a getter
		return this._referrer;
	}

	// Act as a setter
	this._referrer = new String(referrer).toString();

	return this;
};

/**
 * Sets and gets the user agent from the request.
 *
 * @param   String agent
 * @return  Mixed
 */
JohanaRequest.prototype.userAgent = function(userAgent)
{
	userAgent = userAgent || null;

	if (userAgent === null)
	{
		// Act as a getter
		return this._userAgent;
	}

	// Act as a setter
	this._userAgent = new String(userAgent).toString();

	return this;
};

/**
 * Sets and gets the user agent from the request.
 *
 * @param   String agent
 * @return  Mixed
 */
JohanaRequest.prototype.clientIp = function(clientIp)
{
	clientIp = clientIp || null;

	if (clientIp === null)
	{
		// Act as a getter
		return this._clientIp;
	}

	// Act as a setter
	this._clientIp = new String(clientIp).toString();

	return this;
};

/**
 * Sets and gets the route from the request.
 *
 * @param   String route
 * @return  Mixed
 */
JohanaRequest.prototype.route = function(route)
{
	route = route || null;

	if (route === null)
	{
		// Act as a getter
		return this._route;
	}

	// Act as a setter
	this._route = route;

	return this;
};

/**
 * Sets and gets the directory for the controller.
 *
 * @param   String   directory  Directory to execute the controller from
 * @return  Mixed
 */
JohanaRequest.prototype.directory = function(directory)
{
	directory = directory || null;

	if (directory === null)
	{
		// Act as a getter
		return this._directory;
	}

	// Act as a setter
	this._directory = new String(directory).toString();

	return this;
};

/**
 * Sets and gets the controller for the matched route.
 *
 * @param   String   controller  Controller to execute the action
 * @return  Mixed
 */
JohanaRequest.prototype.controller = function(controller)
{
	controller = controller || null;

	if (controller === null)
	{
		// Act as a getter
		return this._controller;
	}

	// Act as a setter
	this._controller = new String(controller).toString();

	return this;
};

/**
 * Sets and gets the action for the controller.
 *
 * @param   String   action  Action to execute the controller from
 * @return  Mixed
 */
JohanaRequest.prototype.action = function(action)
{
	action = action || null;

	if (action === null)
	{
		// Act as a getter
		return this._action;
	}

	// Act as a setter
	this._action = new String(action).toString();

	return this;
};

/**
 * Provides readonly access to the [Request_Client],
 * useful for accessing the caching methods within the
 * request client.
 *
 * @return  Request_Client
 */
JohanaRequest.prototype.getClient = function()
{
	return this._client;
};

/**
 * Gets and sets the requested with property, which should
 * be relative to the x-requested-with pseudo header.
 *
 * @param   String    requestedWith Requested with value
 * @return  Mixed
 */
JohanaRequest.prototype.requestedWith = function(requestedWith)
{
	requestedWith = requestedWith || null;

	if (requestedWith === null)
	{
		// Act as a getter
		return this.requestedWith;
	}

	// Act as a setter
	this.requestedWith = requestedWith.toLowerCase();

	return this;
};

/**
 * Processes the request, executing the controller action that handles this
 * request, determined by the [Route].
 *
 * 1. Before the controller action is called, the [Controller::before] method
 * will be called.
 * 2. Next the controller action will be called.
 * 3. After the controller action is called, the [Controller::after] method
 * will be called.
 *
 * By default, the output from the controller is captured and returned, and
 * no headers are sent.
 *
 *     request.execute();
 *
 * @return  Response
 * @throws  Johana_Exception
 * @uses    [Johana.profiling]
 * @uses    [Profiler]
 */
JohanaRequest.prototype.execute = function()
{
	if ( ! this._client instanceof Johana_Request_Client)
	{
		throw new Johana_Request_Exception('Unable to execute :uri without a Johana_Request_Client', {
			':uri': this._uri}
		);
	}

	return this._client.execute(this);
};

/**
 * Returns whether this request is the initial request Johana received.
 * Can be used to test for sub requests.
 *
 *     if ( ! request.isInitial())
 *         // This is a sub request
 *
 * @return  Boolean
 */
JohanaRequest.prototype.isInitial = function()
{
	return (this === Request.initial);
};

/**
 * Returns whether this is an ajax request (as used by JS frameworks)
 *
 * @return  Boolean
 */
JohanaRequest.prototype.isAjax = function()
{
	return (this.requestedWith() === 'xmlhttprequest');
};

/**
 * Generates an [ETag](http://en.wikipedia.org/wiki/HTTP_ETag) from the
 * request response.
 *
 *     etag = request.generateEtag();
 *
 * [!!] If the request response is empty when this method is called, an
 * exception will be thrown!
 *
 * @return String
 * @throws Error
 */
JohanaRequest.prototype.generateEtag = function()
{
    if (this._response === null)
	{
		throw new Error('No response yet associated with request - cannot auto generate resource ETag');
	}

    var hash = require('crypto').createHash('sha1').update(this._response);

    // Generate a unique hash for the response
	return '"' + hash.digest('hex') + '"';
};

/**
 * Set or get the response for this request
 *
 * @param   Response  response  Response to apply to this request
 * @return  Response
 * @return  void
 */
JohanaRequest.prototype.response = function(response)
{
	response = response || null;

	if (response === null)
	{
		// Act as a getter
		return this._response;
	}

	// Act as a setter
	this._response = response;

	return this;
};

/**
 * Creates a response based on the type of request, i.e. an
 * RequestHttp will produce a ResponseHttp.
 *
 *      // Create a response to the request
 *      response = request.createResponse();
 *
 * @param   boolean  bind  Bind to this request
 * @return  Response
 */
JohanaRequest.prototype.createResponse = function(bind)
{
	var response = new Response({_protocol: this.protocol()});

	if (bind || bind === undefined)
	{
		// Bind a new response to the request
		this._response = response;
	}

	return response;
};

/**
 * Gets or sets the HTTP method. Usually GET, POST, PUT or DELETE in
 * traditional CRUD applications.
 *
 * @param   String   method  Method to use for this request
 * @return  Mixed
 */
JohanaRequest.prototype.method = function(method)
{
	method = method || null;

	if (method === null)
	{
		// Act as a getter
		return this._method;
	}

	// Act as a setter
	this._method = method.toUpperCase();

	return this;
};

/**
 * Gets or sets the HTTP protocol. The standard protocol to use
 * is `http`.
 *
 * @param   String   protocol  Protocol to set to the request/response
 * @return  Mixed
 */
JohanaRequest.prototype.protocol = function(protocol)
{
	protocol = protocol || null;

	if (protocol === null)
	{
		if (this._protocol)
		{
			// Act as a getter
			return this._protocol;
		}
		else
		{
			// Get the default protocol
			return HTTP.protocol;
		}
	}

	// Act as a setter
	this._protocol = protocol.toLowerCase();

	return this;
};

/**
 * Gets or sets HTTP headers to the request or response. All headers
 * are included immediately after the HTTP protocol definition during
 * transmission. This method provides a simple array or key/value
 * interface to the headers.
 *
 * @param   Mixed   key   Key or array of key/value pairs to set
 * @param   String  value Value to set to the supplied key
 * @return  Mixed
 */
JohanaRequest.prototype.headers = function(key, value)
{
	key = key || null; value = value || null;

	if (key instanceof HttpHeader)
	{
		// Act a setter, replace all headers
		this._header = key;

		return this;
	}

	if (! Arr.isEmpty(key))
	{
		// Act as a setter, replace all headers
		this._header.exchangeArray(key);

		return this;
	}

	if (this._header.count() === 0 && this.isInitial())
	{
		// Lazy load the request headers
		this._header = HTTP.request_headers();
	}

	if (key === null)
	{
		// Act as a getter, return all headers
		return this._header;
	}
	else if (value === null)
	{
		// Act as a getter, single header
		return (this._header.offsetExists(key)) ? this._header.offsetGet(key) : null;
	}

	// Act as a setter for a single header
	this._header[key] = value;

	return this;
};

/**
 * Set and get cookies values for this request.
 *
 * @param   Mixed    key    Cookie name, or array of cookie values
 * @param   String   value  Value to set to cookie
 * @return  String
 * @return  Mixed
 */
JohanaRequest.prototype.cookie = function(key, value)
{
	key = key || null; value = value || null;

	if ( ! Arr.isEmpty(key))
	{
		// Act as a setter, replace all cookies
		this._cookies = key;
	}

	if (key === null)
	{
		// Act as a getter, all cookies
		return this._cookies;
	}
	else if (value === null)
	{
		// Act as a getting, single cookie
		return isset(this._cookies[key]) ? this._cookies[key] : null;
	}

	// Act as a setter for a single cookie
	this._cookies[key] = value.toString();

	return this;
};

/**
 * Gets or sets the HTTP body to the request or response. The body is
 * included after the header, separated by a single empty new line.
 *
 * @param   String  content Content to set to the object
 * @return  Mixed
 */
JohanaRequest.prototype.body = function(content)
{
	content = content || null;

	if (content === null)
	{
		// Act as a getter
		return this._body;
	}

	// Act as a setter
	this._body = content;

	return this;
};

/**
 * Renders the HTTP_Interaction to a String, producing
 *
 *  - Protocol
 *  - Headers
 *  - Body
 *
 *  If there are variables set to the `Johana_Request._post`
 *  they will override any values set to body.
 *
 * @param   boolean  response  Return the rendered response, else returns the rendered request
 * @return  String
 */
JohanaRequest.prototype.render = function(response)
{
	response = response || true;

	if (response)
	{
		// Act as a getter
		return this._response.toString();
	}

	var post = this.post();

	if ( ! post)
	{
		body = this.body();
	}
	else
	{
		this.headers('content-type', 'application/x-www-form-urlencoded');
		body = http_build_query(post, null, '&');
	}

	// Prepare cookies
	if (this._cookies)
	{
		var cookieStr = new Array();

		// Parse each
		for (var key in this._cookies)
		{
			cookieStr.push(key + '=' + this._cookies[key]);
		}

		// Create the cookie String
		this._header['cookie'] = cookieStr.join('; ');
	}

	var output = this.method() + ' ' + this.uri(this.param()) + ' ' + this.protocol().toUpperCase() + '/' + HTTP.version + '\n';
	output += this._header.toString();
	output += body;

	return output;
};

/**
 * Gets or sets HTTP query String.
 *
 * @param   Mixed   key    Key or key value pairs to set
 * @param   String  value  Value to set to a key
 * @return  Mixed
 */
JohanaRequest.prototype.query = function(key, value)
{
	key = key || null; value = value || null;

	if ( ! Arr.isEmpty(key))
	{
		// Act as a setter, replace all query Strings
		this._get = key;

		return this;
	}

	if (key === null)
	{
		// Act as a getter, all query Strings
		return this._get;
	}
	else if (value === null)
	{
		// Act as a getter, single query String
		return Arr.get(this._get, key);
	}

	// Act as a setter, single query String
	this._get[key] = value;

	return this;
};

/**
 * Gets or sets HTTP POST parameters to the request.
 *
 * @param   Mixed  key    Key or key value pairs to set
 * @param   String value  Value to set to a key
 * @return  Mixed
 */
JohanaRequest.prototype.post = function(key, value)
{
	key = key || null; value = value || null;

	if ( ! Arr.isEmpty(key))
	{
		// Act as a setter, replace all fields
		this._post = key;

		return this;
	}

	if (key === null)
	{
		// Act as a getter, all fields
		return this._post;
	}
	else if (value === null)
	{
		// Act as a getter, single field
		return Arr.get(this._post, key);
	}

	// Act as a setter, single field
	this._post[key] = value;

	return this;
};

module.exports = JohanaRequest; // End