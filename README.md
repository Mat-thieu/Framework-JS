#Framework JS

**This code is not ready for production, yet**

Simple boilerplate for a javascript framework, includes a feature rich router, built in template/JSON loader and [Handlebars templating engine](http://handlebarsjs.com/).
It should be easy to get started, there's less than 200 lines of decently commented code and it's not super advanced.


## Basic usage

Load the script in your head.

```html
<script src="framework.js"></script>
```

Add the <main-view></main-view> tag somewhere in your HTML, the setView() function will output here

Start creating some routes.

```javascript
router.listen('/', function(){
	// Do something when the home route is called
})

router.listen('/tst/{id}', function(params){
	// Do something when the url looks like this http://example.com#tst/10
	// Retrieve the url parameter {id} by using the callback variable params['id']
	// Note that you can have as many url parameters as you like
})
```

Create a template in the templates folder with some variable entry points

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

Now load a template using getTemplate() and inject some data into it.

```javascript
router.listen('/tst/{id}', function(params){
	_get.template('test', // Will look for /templates/test.html
		{title : 'Epic list', id : params['id']} // Make this data available in the template
		// The id variable will be equal to whatever you put into the URL (e.g. tst/10 will send 10)
	, function(tmp){
		// Insert the data into <main-view></main-view>
		setView(tmp);
	})
})
```

After all your routes, make sure to call this function

```javascript
router.init();
```

Perhaps add a link to your route
```html
<a href="#/tst/10">Test</a>
```

That's all.


## Other method(s)

Retrieve JSON data inside your route

```javascript
router.listen('/tst/{id}', function(params){
	_get.json('api.php?get='+params['id'], function(data){
		console.log(data)
	})
})
```

## Configuration

You can find the config at the first few lines of framework.js

```javascript
var frameworkSettings = {
	templateFolder : '/templates',
	debug : true, // Will log useful debugging information
	localstorageCaching : {
		enabled : true,
		expiration : 0.25 // Amount of hours before a template has to get reloaded (in this case, 15 minutes)
	}
}

```
Note that a template can only expire after the page has been reloaded, it will not expire templates realtime (this has to do with performance).


##Todo and notes

This script is compatible with all modern browsers (IE 9 and higher).

I have not looked at security.

**Todo**

- Perhaps add a method that first loads JSON and then directly injects it into a given template (this might be too much for a boilerplate script)
- Reduce number of global variables
- Resolve conflict when using Object.prototype with jQuery
- Create a more efficient router structure (with the addition of namespaces, the current implementation sucks)
- Create multi template getter, perhaps a multi data injector as well

At the moment, the router loops over every single available route until it finds a match, with the addition of namespaces it would make sense to first
determine if the current route points towards a namespace and then only look for a match within in that namespace.
Besides that, the method of registering a namespace at the moment is clumsy, it also won't allow me to detect 404 in a clean way.
