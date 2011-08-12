

Route.set('auth', '<action>', {
		action:     '(join|login|logout|activation|restore)'
	}).defaults({
		directory:  'account',
		controller: 'auth',
		action:     'login'
	});

