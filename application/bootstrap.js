
Johana.modules({
	cache: MODPATH + 'cache'
});

Johana.init({
	baseUrl: 'http://johana.site',
	profile: false
});

/**
 * Attach the file write to logging. Multiple writers are supported.
 */
Johana.log.attach(new LogFile(APPPATH + 'logs'), Log.ERROR);

Johana.log.attach(new LogConsole());

Johana.conf.attach(new ConfigFile());

function testList(req, res) {
	Johana.log.add(Log.DEBUG, 'Request: ' + req.url);
	Johana.log.add(Log.ERROR, 'ERRO Request: ' + req.url);

	//console.log(Request.factory(req.url, req));
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(View.factory('hello').render());
};

require('http').createServer(function (req, res) {
	testList(req, res);
}).listen(8001, "127.0.0.1");

//var options = {
//  key: require('fs').readFileSync(DOCROOT + '/certs/server.key'),
//  cert: require('fs').readFileSync(DOCROOT + '/certs/server.crt')
//};
// 
//require('https').createServer(options, function (req, res) {
//	testList(req, res);
//}).listen(8002);
