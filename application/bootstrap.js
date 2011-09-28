
Johana.modules({
	cache: MODPATH + 'cache'
});

Johana.init({
	baseUrl: 'http://johana.site',
	profile: false
});

Johana.conf.attach(new ConfigFile());




function testList(req, res) {
	
	console.log(Request.factory(req.url, req));
	console.log(req.url);
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(View.factory('hello').render());
};

require('http').createServer(function (req, res) {
	testList(req, res);
}).listen(8001, "127.0.0.1");

var options = {
  key: require('fs').readFileSync(DOCROOT + '/certs/server.key'),
  cert: require('fs').readFileSync(DOCROOT + '/certs/server.crt')
};
 
require('https').createServer(options, function (req, res) {
	testList(req, res);
}).listen(8002);
