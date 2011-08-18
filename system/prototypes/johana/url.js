/**
 * URL helper object.
 *
 * @package    Johana
 * @category   Helpers
 * @author     Johana Team
 * @copyright  (c) 2011 Johana Team
 * @license    http://johanaframework.org/license
 */
JohanaUrl = function()
{
};

/**
 * Gets the base URL to the application.
 * To specify a protocol, provide the protocol as a string or request object.
 *
 *     // Absolute URL path with no host or protocol
 *     URL.base();
 *
 *     // Absolute URL path with host, https protocol
 *     URL.base('https');
 *
 *
 * @param   String   protocol Protocol string
 * @return  string
 */
JohanaUrl.base = function(protocol)
{
	protocol = protocol || null;

	// Start with the configured base URL
	var baseUrl = Johana.baseUrl;

	if (typeof protocol == 'string')
	{
		// Add the protocol to the base URL
		baseUrl = baseUrl.replace(/^[a-zA-Z0-9+.-]+:\/\//, protocol + '://');
	}

	return baseUrl;
};

/**
 * Fetches an absolute site URL based on a URI segment.
 *
 *     console.log(Url.site('foo/bar'));
 *
 * @param   string  uri        Site URI to convert
 * @param   mixed   protocol   Protocol string or [Request] class to use protocol from
 * @return  string
 * @uses    URL.base
 */
JohanaUrl.site = function(uri, protocol)
{
	uri = uri || ''; protocol = protocol || null;

	uri = uri.replace(/^\//, '').replace(/\/$/, '');

	// Chop off possible scheme, host, port, user and pass parts
	uri = uri.replace(/~^[-a-z0-9+.]+:\/\/[^\/]+\/?~/, '');

	// Concat the URL
	return Url.base(protocol) + uri;
};


/**
 * Merges the current GET parameters with an array of new or overloaded
 * parameters and returns the resulting query string.
 *
 *     // Returns "?sort=title&limit=10" combined with any existing GET values
 *     $query = URL::query(array('sort' => 'title', 'limit' => 10));
 *
 * Typically you would use this when you are sorting query results,
 * or something similar.
 *
 * [!!] Parameters with a NULL value are left out.
 *
 * @param   array    $params   Array of GET parameters
 * @param   boolean  $use_get  Include current request GET parameters
 * @return  string
 */
JohanaUrl.query = function(params, useGet)
{
	params = params || null;

	var $_GET = {};

	if (useGet)
	{
		if (params === null)
		{
			// Use only the current parameters
			params = $_GET;
		}
		else
		{
			// Merge the current and new parameters
			// TODO: fix merge
			//params = array_merge($_GET, $params);
		}
	}

	if (!params)
	{
		// No query parameters
		return '';
	}

	// Note: http_build_query returns an empty string for a params array with only NULL values
	var query = require('querystring').stringify(params);

	// Don't prepend '?' to an empty string
	return (query === '') ? '' : ('?' + query);
};

/**
 * Convert a phrase to a URL-safe title.
 *
 *     console.log(URL.title('My Blog Post')); // "my-blog-post"
 *
 * @param   String   title       Phrase to convert
 * @param   String   separator   Word separator (any single character)
 * @return  String
 */
JohanaUrl.title = function(title, separator)
{
	separator = separator || '-';

	// quote separator to regexp
	var sep = separator.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");

	// Replace all separator characters and whitespace by a single separator
	title = title.replace(new RegExp('[' + sep + '\\s]+', 'g'), separator).toLowerCase();

	// Trim separators from the beginning and end
	return title.replace(new RegExp('^' + sep), '').replace(new RegExp(sep+'$'), '');
};

module.exports = JohanaUrl; // End
