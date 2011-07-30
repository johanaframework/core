/**
 * Request and response wrapper. Uses the [Route] class to determine what
 * [Controller] to send the request to.
 *
 * @package    
 * @category   Base
 * @author     
 * @copyright  (c) 2011
 * @license    
 */
Request = function(uri)
{
	/**
	 * @var  object  route matched for this request
	 */
	this.route;

	/**
	 * @var  integer  HTTP response code: 200, 404, 500, etc
	 */
	this.status = 200;

	/**
	 * @var  string  response body
	 */
	this.response = '';

	/**
	 * @var  object  headers to send with the response body
	 */
	this.headers = {};

	/**
	 * @var  string  controller directory
	 */
	this.directory = '';

	/**
	 * @var  string  controller to be executed
	 */
	this.controller;

	/**
	 * @var  string  action to be executed in the controller
	 */
	this.action;

	/**
	 * @var  string  the URI of the request
	 */
	this.uri;

	// Parameters extracted from the route
	var _params;

	/**
	 * Creates a new request object for the given URI. New requests should be
	 * created using the [Request.instance] or [Request.factory] methods.
	 *
	 *     request = new Request(uri);
	 *
	 * @param   string  URI of the request
	 * @return  void
	 * @throws  Kohana_Request_Exception
	 * @uses    Route.all
	 * @uses    Route.matches
	 */
	{
		// Remove trailing slashes from the URI
		uri = uri.replace(/^\//, '').replace(/\/$/, '');

		// Load routes
		routes = Route.all();

		for (var name in routes)
		{
			var params;
			if (params = routes[name].matches(uri))
			{
				// Store the URI
				this.uri = uri;

				// Store the matching route
				this.route = routes[name];

				if (params['directory'] !== undefined)
				{
					// Controllers are in a sub-directory
					this.directory = params['directory'];
				}

				// Store the controller
				this.controller = params['controller'];

				if (params['action'] !== undefined)
				{
					// Store the action
					this.action = params['action'];
				}
				else
				{
					// Use the default action
					this.action = Route.defaultAction;
				}

				// These are accessible as public vars and can be overloaded
				delete params['controller'], params['action'], params['directory'];

				// Params cannot be changed once matched
				this._params = params;
			}
		}

		if (!this.controller)
		{
			// No matching route for this URI
			this.status = 404;

			throw new Error('Unable to find a route to match the URI: ' + uri);
		}
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
	 * Returns the response as the string representation of a request.
	 *
	 *     console.log(request);
	 *
	 * @return  string
	 */
//	this.toString = function()
//	{
//		return new String(this.response).toString();
//	};

	/**
	 * Generates a relative URI for the current route.
	 *
	 *     request.uri(params);
	 *
	 * @param   array   additional route parameters
	 * @return  string
	 * @uses    Route.uri
	 */
	this.uri = function(params)
	{
		params = params || {};

		if (params['directory'] === undefined)
		{
			// Add the current directory
			params['directory'] = this.directory;
		}

		if (params['controller'] === undefined)
		{
			// Add the current controller
			params['controller'] = this.controller;
		}

		if (params['action'] === undefined)
		{
			// Add the current action
			params['action'] = this.action;
		}

		// Add the current parameters
		params += this._params;

		return this.route.uri(params);
	};

	/**
	 * Create a URL from the current request. This is a shortcut for:
	 *
	 *     URL.site(this.request.uri(params), protocol);
	 *
	 * @param   string   route name
	 * @param   array    URI parameters
	 * @param   mixed    protocol string or boolean, adds protocol and domain
	 * @return  string
	 * @since   3.0.7
	 * @uses    URL.site
	 */
	this.url = function(params, protocol)
	{
		params = params || {}; protocol = protocol || null;

		// Create a URI with the current route and convert it to a URL
		return URL.site(this.uri(params), protocol);
	};

	/**
	 * Retrieves a value from the route parameters.
	 *
	 *     $id = $request->param('id');
	 *
	 * @param   string   key of the value
	 * @param   mixed    default value if the key is not set
	 * @return  mixed
	 */
	this.param = function(key, def)
	{
		key = key || null; def = def || null;

		if (key === null)
		{
			// Return the full array
			return this._params;
		}

		return (this._params[key] !== undefined) ? this._params[key] : def;
	};

	/**
	 * Generate status and all headers. The current server
	 * protocol (HTTP/1.0 or HTTP/1.1) will be used when available. If not
	 * available, HTTP/1.1 will be used.
	 *
	 *     request.headers();
	 *
	 * @return  this
	 * @uses    Request.messages
	 */
	this.headers = function()
	{
//		if ( ! headers_sent())
//		{
//			if (isset($_SERVER['SERVER_PROTOCOL']))
//			{
//				// Use the default server protocol
//				$protocol = $_SERVER['SERVER_PROTOCOL'];
//			}
//			else
//			{
//				// Default to using newer protocol
//				$protocol = 'HTTP/1.1';
//			}
//
//			// HTTP status line
//			header($protocol.' '.$this->status.' '.Request::$messages[$this->status]);
//
//			foreach ($this->headers as $name => $value)
//			{
//				if (is_string($name))
//				{
//					// Combine the name and value to make a raw header
//					$value = "{$name}: {$value}";
//				}
//
//				// Send the raw header
//				header($value, TRUE);
//			}
//		}

		return this;
	};

	/**
	 * Redirects as the request response. If the URL does not include a
	 * protocol, it will be converted into a complete URL.
	 *
	 *     $request->redirect($url);
	 *
	 * [!!] No further processing can be done after this method is called!
	 *
	 * @param   string   redirect location
	 * @param   integer  status code: 301, 302, etc
	 * @return  void
	 * @uses    URL::site
	 * @uses    Request::send_headers
	 */
	this.redirect = function(url, code)
	{
		code = code || 302;

		if (url.indexOf('://') === -1)
		{
			// Make the URI into a URL
			url = URL.site(url, true);
		}

		// Set the response status
		this.status = code;

		// Set the location header
		this.headers['Location'] = url;

		// Send headers
		this.headers();

		// Stop execution
		//exit;
	};

	/**
	 * Processes the request, executing the controller action that handles this
	 * request, determined by the [Route].
	 *
	 * 1. Before the controller action is called, the [Controller.before] method
	 * will be called.
	 * 2. Next the controller action will be called.
	 * 3. After the controller action is called, the [Controller.after] method
	 * will be called.
	 *
	 * By default, the output from the controller is captured and returned, and
	 * no headers are sent.
	 *
	 *     request.execute();
	 *
	 * @return  this
	 * @throws  Error
	 * @uses    [Kohana.profiling]
	 * @uses    [Profiler]
	 */
	this.execute = function()
	{
		// Create the class prefix
		var prefix = 'Controller';

		if (this.directory)
		{
			this.directory = this.directory.replace(/^\//, '').replace(/\/$/, '');
			// Add the directory name to the class prefix
			prefix += this.directory.replace(/\\/, '').replace(/\//, '') + '';
		}

//		if (Kohana::$profiling)
//		{
//			// Set the benchmark name
//			$benchmark = '"'.$this->uri.'"';
//
//			if ($this !== Request::$instance AND Request::$current)
//			{
//				// Add the parent request uri
//				$benchmark .= ' « "'.Request::$current->uri.'"';
//			}
//
//			// Start benchmarking
//			$benchmark = Profiler::start('Requests', $benchmark);
//		}

		// Store the currently active request
		var previous = Request.current;

		// Change the current request to this request
		Request.current = this;

		try
		{
			// Load the controller using reflection
			var controller = global[prefix + this.controller];
			console.log(controller);

			if (typeof controller !== 'function')
			{
				throw new Error('Cannot create instances of not callable controller: ' + 
					prefix + this.controller);
			}

			// Create a new instance of the controller
			var controller = new controller(this);

			// Execute the "before action" method
			controller.before();

			// Determine the action to use
			var action = (!this.action) ? Route.defaultAction : this.action;

			// Execute the main action with the parameters
			eval('controller.action_'+action+'(this._params);');

			// Execute the "after action" method
			controller.after();
		} catch (e) {
			// Restore the previous request
			Request.current = previous;

//			if (isset($benchmark))
//			{
//				// Delete the benchmark, it is invalid
//				Profiler::delete($benchmark);
//			}

			if (e instanceof ReferenceError)
			{
				// Reflection will throw exceptions for missing classes or actions
				this.status = 404;
			}
			else
			{
				// All other exceptions are PHP/server errors
				this.status = 500;
			}

			// Re-throw the exception
			throw e;
		}

		// Restore the previous request
		Request.current = previous;

//		if (isset($benchmark))
//		{
//			// Stop the benchmark
//			Profiler::stop($benchmark);
//		}

		return this;
	};
};

// HTTP status codes and messages
Request.messages =
{
	// Informational 1xx
	100 : 'Continue',
	101 : 'Switching Protocols',

	// Success 2xx
	200 : 'OK',
	201 : 'Created',
	202 : 'Accepted',
	203 : 'Non-Authoritative Information',
	204 : 'No Content',
	205 : 'Reset Content',
	206 : 'Partial Content',
	207 : 'Multi-Status',

	// Redirection 3xx
	300 : 'Multiple Choices',
	301 : 'Moved Permanently',
	302 : 'Found', // 1.1
	303 : 'See Other',
	304 : 'Not Modified',
	305 : 'Use Proxy',
	// 306 is deprecated but reserved
	307 : 'Temporary Redirect',

	// Client Error 4xx
	400 : 'Bad Request',
	401 : 'Unauthorized',
	402 : 'Payment Required',
	403 : 'Forbidden',
	404 : 'Not Found',
	405 : 'Method Not Allowed',
	406 : 'Not Acceptable',
	407 : 'Proxy Authentication Required',
	408 : 'Request Timeout',
	409 : 'Conflict',
	410 : 'Gone',
	411 : 'Length Required',
	412 : 'Precondition Failed',
	413 : 'Request Entity Too Large',
	414 : 'Request-URI Too Long',
	415 : 'Unsupported Media Type',
	416 : 'Requested Range Not Satisfiable',
	417 : 'Expectation Failed',
	422 : 'Unprocessable Entity',
	423 : 'Locked',
	424 : 'Failed Dependency',

	// Server Error 5xx
	500 : 'Internal Server Error',
	501 : 'Not Implemented',
	502 : 'Bad Gateway',
	503 : 'Service Unavailable',
	504 : 'Gateway Timeout',
	505 : 'HTTP Version Not Supported',
	507 : 'Insufficient Storage',
	509 : 'Bandwidth Limit Exceeded'
};

/**
 * @var  string  method: GET, POST, PUT, DELETE, etc
 */
Request.method = 'GET';


/**
 * @var  string  protocol: http, https, ftp, cli, etc
 */
Request.protocol = 'http';

/**
 * @var  string  referring URL
 */
Request.referrer;

/**
 * @var  string  client user agent
 */
Request.userAgent = '';

/**
 * @var  string  client IP address
 */
Request.clientIp = '0.0.0.0';

/**
 * @var  boolean  AJAX-generated request
 */
Request.isAjax = false;

/**
 * @var  object  main request instance
 */
Request.instance;

/**
 * @var  object  currently executing request instance
 */
Request.current;

/**
 * Main request singleton instance. If no URI is provided, the URI will
 * be automatically detected.
 *
 *     request = Request.instance();
 *
 * @param   string   URI of the request
 * @return  Request
 * @uses    Request.detectUri
 */
Request.instance = function(uri)
{
	uri = uri || true;

	if (!Request.instance)
	{
		if ($_SERVER['REQUEST_METHOD'] !== undefined)
		{
			// Use the server request method
			Request.method = $_SERVER['REQUEST_METHOD'];
		}

		if ($_SERVER['HTTPS'] !== undefined && $_SERVER['HTTPS'])
		{
			// This request is secure
			Request.protocol = 'https';
		}

		if ($_SERVER['HTTP_X_REQUESTED_WITH'] !== undefined && $_SERVER['HTTP_X_REQUESTED_WITH'].toLowerCase() === 'xmlhttprequest')
		{
			// This request is an AJAX request
			Request.isAjax = true;
		}

		if ($_SERVER['HTTP_REFERER'] !== undefined)
		{
			// There is a referrer for this request
			Request.referrer = $_SERVER['HTTP_REFERER'];
		}

		if ($_SERVER['HTTP_USER_AGENT'] !== undefined)
		{
			// Set the client user agent
			Request.userAgent = $_SERVER['HTTP_USER_AGENT'];
		}

		if ($_SERVER['HTTP_X_FORWARDED_FOR'] !== undefined)
		{
			// Use the forwarded IP address, typically set when the
			// client is using a proxy server.
			Request.clientIp = $_SERVER['HTTP_X_FORWARDED_FOR'];
		}
		else if ($_SERVER['HTTP_CLIENT_IP'] !== undefined)
		{
			// Use the forwarded IP address, typically set when the
			// client is using a proxy server.
			Request.clientIp = $_SERVER['HTTP_CLIENT_IP'];
		}
		else if ($_SERVER['REMOTE_ADDR'] !== undefined)
		{
			// The remote IP address
			Request.clientIp = $_SERVER['REMOTE_ADDR'];
		}

		if (Request.method !== 'GET' && Request.method !== 'POST')
		{
			// Methods besides GET and POST do not properly parse the form-encoded
			// query string into the $_POST array, so we overload it manually.
			//parse_str(file_get_contents('php://input'), $_POST);
		}

		if (uri === true)
		{
			uri = Request.detectUri();
		}

		// Reduce multiple slashes to a single slash
		uri = uri.replace(/\/\/+/, '/');

		// Remove all dot-paths from the URI, they are not valid
		uri = uri.replace(/\.[\s.\/]*/, '');

		// Create the instance singleton
		Request.instance = Request.current = new Request(uri);

		// Add the default Content-Type header
		Request.instance.headers['Content-Type'] = 'text/html; charset=utf-8';
	}

	return Request.instance;
};

/**
 * Automatically detects the URI of the main request using PATH_INFO,
 * REQUEST_URI, PHP_SELF or REDIRECT_URL.
 *
 *     uri = Request.detectUri();
 *
 * @return  string  URI of the main request
 * @throws  Error
 */
Request.detectUri = function()
{
	if ($_SERVER['PATH_INFO'] !== undefined)
	{
		// PATH_INFO does not contain the docroot or index
		uri = $_SERVER['PATH_INFO'];
	}
	else
	{
		// REQUEST_URI and PHP_SELF include the docroot and index

		if ($_SERVER['REQUEST_URI'] !== undefined)
		{
			// REQUEST_URI includes the query string, remove it
			uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

			// Decode the request URI
			uri = rawurldecode(uri);
		} 
		else if ($_SERVER['PHP_SELF'] !== undefined)
		{
			uri = $_SERVER['PHP_SELF'];
		}
		else if ($_SERVER['REDIRECT_URL']  !== undefined)
		{
			uri = $_SERVER['REDIRECT_URL'];
		}
		else
		{
			// If you ever see this error, please report an issue at http://dev.kohanaphp.com/projects/kohana3/issues
			// along with any relevant information about your web server setup. Thanks!
			throw new Error('Unable to detect the URI using PATH_INFO, REQUEST_URI, PHP_SELF or REDIRECT_URL');
		}

		// Get the path from the base URL, including the index file
		var baseUrl = parse_url(Kohana.baseUrl, PHP_URL_PATH);

		if (uri.indexOf(baseUrl) === 0)
		{
			// Remove the base URL from the URI
			uri = uri.substring(baseUrl.length);
		}
	}

	return uri;
};

/**
 * Return the currently executing request. This is changed to the current
 * request when [Request.execute] is called and restored when the request
 * is completed.
 *
 *     request = Request.current();
 *
 * @return  Request
 */
Request.current = function()
{
	return Request.current;
};

/**
 * Creates a new request object for the given URI. This differs from
 * [Request.instance] in that it does not automatically detect the URI
 * and should only be used for creating HMVC requests.
 *
 *     request = Request.factory(uri);
 *
 * @param   string  URI of the request
 * @return  Request
 */
Request.factory = function(uri)
{
	return new Request(uri);
};

module.exports = Request;
