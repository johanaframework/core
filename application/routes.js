
/**
 * Set the routes. Each route must have a minimum of a name, a URI and a set of
 * defaults for the URI.
 */

Route.set('default', '(<controller>(/<action>(/<id>)))')
	.defaults({
		controller: 'welcome',
		action:     'index'
	});
