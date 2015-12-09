#Framework JS

**This code is not ready for production**

Simple boilerplate for a javascript framework, includes a feature rich router, built in template/JSON loader and [Handlebars templating engine](http://handlebarsjs.com/).
It should be easy to get started, there's about a hundred lines of code and it's not super advanced.


## Usage

Load the script near the bottom of your body.

```html
<script src="framework.js"></script>
```

Start creating some routes.

```javascript
router.listen('/', function(){
	// Do something when the home route is called
})

router.listen('tst/{id}', function(params){
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
router.listen('tst/{id}', function(params){
	_get.template('test', // Will look for /templates/test.html
		{title : 'Epic list', id : params['id']} // Make this data available in the template
		// The id variable will be equal to whatever you put into the URL (e.g. tst/10 will send 10)
	, function(tmp){
		// Insert the data into the DOM
		_id('output').removeChildren().appendChild(tmp);
	})
})
```

After all your routes, make sure to call this function

```javascript
router.init();
```

Perhaps add a link to your route
```html
<a href="#tst/10">Test</a>
```

That's all.


## Other methods

Retrieve JSON data inside your route

```javascript
router.listen('tst/{id}', function(params){
	_get.json('api.php?get='+params['id'], function(data){
		console.log(data)
	})
})
```

By default, the **router** variable will be available for creating routes, to create a namespace, call a new Router instance

```javascript
// This might change in the next release
var adminRouter = new Router('/admin');

// Now create a new route

adminRouter.listen('/test', function(){
	// Will listen to #/admin/test
})

```


##Todo and notes

This script is compatible with all modern browsers (IE 9 and higher).

I have not looked at security.

**Todo**
- Add comments
- Add configuration (like the location of your templates, ajax timeouts, etc.)
- Perhaps add a method that first loads JSON and then directly injects it into a given template (this might be too much for a boilerplate script)
- Reduce number of global variables
- Resolve conflict when using Object.prototype with jQuery
