
Johana.modules({
	cache: MODPATH + 'cache'
});

Johana.init({
	baseUrl: 'http://johana.site',
	profile: false
});

Johana.conf.attach(new ConfigFile());

