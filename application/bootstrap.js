
Johana.modules({
	cache: MODPATH + 'cache'
});

Johana.init({
	baseUrl: 'http://johana.site',
	profile: false
});

Johana.conf.attach(new ConfigFile());

require('http').createServer(function (req, res) {
	console.log(req.url);
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World\n');
}).listen(1337, "127.0.0.1");

console.log('Server running at http://127.0.0.1:1337/');