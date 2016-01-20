#Framework JS

**This code is not ready for production, yet**

Micro Javascript framework, includes a feature rich router, built in template/JSON loader and [Handlebars templating engine](http://handlebarsjs.com/).
It should be easy to get started, there's less than 300 lines of decently commented code and it's not super advanced.


## Basic usage

Load the script in your head.

```html
<script src="framework.js"></script>
```

Add the main-view tag somewhere in your HTML, the _view.set() method will output your templates within that tag

Start creating some routes.
```javascript
router.listen('/', function(){
	// Do something when the home route is called
})

router.listen('/tst/{id}', function(params){
	// Do something when the url looks like this http://example.com#/tst/10
	// Retrieve the url parameter {id} by using the callback variable params['id']
	// Note that you can have as many url parameters as you like
})
```

Create a template in the templates folder with some variable entry points (surround the variable in double brackets, [Handlebars](http://handlebarsjs.com/) )
```html
<!-- /templates/test.html -->
<div class="card-panel">
	<h2>{{title}}</h2> <!-- Will expect a title variable -->
	<h5>ID : {{id}}</h5>
	<ul class="collection">
		<li class="collection-item">Item 1</li>
		<li class="collection-item">Item 2</li>
	</ul>
</div>
```

Now load a template using _get.template([name], [dataToInject], [callback]) and inject some data into it.
```javascript
router.listen('/tst/{id}', function(params){
	_get.template('test', // Will look for /templates/test.html
		{title : 'Epic list', id : params['id']} // Make this data available in the template
		// The id variable will be equal to whatever you put into the URL (e.g. tst/10 will send 10)
	, function(tmp){
		// Insert the data into main-view
		_view.set(tmp);
	})
})
```

After you've created all your routes, initialize the framework,
```javascript
Framework.init({
	templateFolder : '/templates',
	debug : true,
	localstorageCaching : { // This will only cache the raw templates, JSON data will always be fresh from the server
		enabled : true,
		expiration : 0.25 // Hours
	}
});
```
_NOTE: In the current version of the framework these options are required, you can turn them on or off though._

Link to one of your routes like so
```html
<a href="#/tst/10">Test</a>
```

Those are the basics.

## Other methods

Retrieve JSON data inside your route
```javascript
router.listen('/example/{id}', function(params){
	_get.json('api.php?get='+params['id'], function(data){
		console.log(data)
	})
})
```

Get multiple templates and inject some JSON into them (this is faster than retrieving both seperately).
```javascript
router.listen('/example', function(){
	_get.templates(
		['home', 'engineUpdate'], // Define which templates to load
		{lorem : "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cumque, reiciendis.", test : "Hello World"},
	function(res){
		// Ordering matters here, the data will be injected into both templates
		_view.set(res['engineUpdate'], res['home']);
	})
})
```

404 route
```javascript
Framework.on('404', function(){
	_view.set(notFoundHtml);
})
```

Create a namespace
```javascript
var exampleRouter = new Namespace('/example');

exampleRouter.listen('/one', function(){
	console.log('/example/one has been visited!');
})
```
_Use namespaces wherever possible, these contribute to better performance because you're practically creating indexes._


##Todo and notes

This script is compatible with all modern browsers (IE 9 and higher).

I have not looked at security.

**Todo**

- Write a sick XHR class
- Perhaps add a method that first loads JSON and then directly injects it into a given template (this might be too much for a boilerplate script)
- ~~Create multi template getter~~, perhaps a multi data injector as well

