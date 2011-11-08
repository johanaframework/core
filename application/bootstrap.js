
/**
 * Enable modules. Modules are referenced by a relative or absolute path.
 */
Johana.modules({
	cache: MODPATH + 'cache'
});

/**
 * Initialize Johana, setting the default options.
 *
 * The following options are available:
 *
 * - string   baseUrl     path, and optionally domain, of your application   NULL
 * - boolean  errors      enable or disable error handling                   TRUE
 * - boolean  profile     enable or disable internal profiling               TRUE
 * - boolean  caching     enable or disable internal caching                 FALSE
 */
Johana.init({
	baseUrl: 'http://johana.site',
	profile: false,
	http: {
		host: "localhost",
		listen: 8001
	}
//	https: {
//		key: DOCROOT + '/certs/server.key',
//		cert: DOCROOT + '/certs/server.crt',
//		listen: 8001
//	}
});

/**
 * Attach the file write to logging. Multiple writers are supported.
 */
Johana.log.attach(new LogFile(APPPATH + 'logs'), Log.ERROR);
Johana.log.attach(new LogConsole());

/**
 * Attach a file reader to config. Multiple readers are supported.
 */
Johana.conf.attach(new ConfigFile());

Johana.onRequest = function(req, res) {

	Request.factory(req.url, req);
	Johana.log.add(Log.ERROR, 'vova');

	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(View.factory('hello').render());
};
