var frameworkSettings = {
	templateFolder : '/templates',
	debug : true,
	localstorageCaching : {
		enabled : true,
		expiration : 0.25 // Amount of hours before a template has to get reloaded (in this case, 15 minutes)
	}
}

var frameworkCache = {
	templates : {}
}

// Applying settings, this function fires itself
var frameworkInit = function(){
	if(frameworkSettings.localstorageCaching.enabled){
		var templateStorage = localStorage.getItem('templates');
		if(templateStorage == null) localStorage.setItem('templates', JSON.stringify({}));
		else{
			var templates = JSON.parse(templateStorage);
			for(key in templates){
				if(templates[key]['expires'] >= Math.floor(Date.now()/1000)) frameworkCache.templates[key] = templates[key]['template'];
			}
		}
	}
}();

var Router = function(namespace){
	this.namespace = namespace;
	this.routes = [];
	this.indexroute = {available : false, index : 0};
}

Router.prototype = {
	// Register a route
	listen : function(routeName, func){
		// Retrieve all router parameters (e.g. input /test/{id} would find {id})
		var routerParams = routeName.match(/{([^{}]+)}/g, "$1");
		if(routerParams == null) this.routes.push({route : routeName, cb : func, params : {}});
		else{
			// If there are parameters, strip the brackets and store in the routes
		    var strippedRouterParams = [];
		    for (var i = 0; i < routerParams.length; i++) strippedRouterParams.push(routerParams[i].replace('{', '').replace('}', ''));

			this.routes.push({route : routeName, cb : func, params : strippedRouterParams});
		}

		if(frameworkSettings.debug) console.log('ROUTER:   Listening on route', this.namespace+routeName);
	},
	// Analyze the given hash and try to find a matching route, if it matches, fire the route's callback function
	analyzeHash : function(hash){
		// Handle the indexroute ("/"), this has to happen first (because the regex won't catch it)
		if(this.indexroute.available && hash.isHomeRoute(this.namespace)){
			this.routes[this.indexroute.index]['cb']();
			return false;
		}
		else{
			var self = this;
			// Find a matching route
			this.routes.forEach(function(val, ind){
				var route = "#"+(self.namespace !== '' ? self.namespace : "")+val['route'];
				var routeMatcher = new RegExp(route.replace(/{[^\s/]+}/g, '([\\w-]+)'));

				var match = hash.match(routeMatcher);

				if(match){
					var params = {};
					// Handle a case with and without parameters
					if(val['params'].length !== 0 && Array.isArray(val['params'])){
						val['params'].forEach(function(pVal, pInd){
							params[pVal] = match[pInd+1];
						})
						val['cb'](params);
					}
					else if(val['route'] !== '/'){
						 val['cb']();
					}
				}
			})
		}
	},
	// Add hashchange listener and check if an indexroute got registered
	init : function(){
		var self = this;
		// Search for a homeroute and make it easily available for the analyze method
		this.routes.forEach(function(val, ind){
			if(val['route'] == '/'){
				if(frameworkSettings.debug) console.log('ROUTER:   Homeroute available ', (self.namespace !== "" ? "("+self.namespace+" namespace)" : "(/ namespace)"));
				self.indexroute.available = true;
				self.indexroute.index = ind;
			}
		})
		// Fire the analyze method for the first time
		this.analyzeHash(window.location.hash);

		// Add hashchange listener
		window.onhashchange = function(){
			if(frameworkSettings.debug) console.log('URL:      Hashchange triggered');
			self.analyzeHash(window.location.hash);
		}
	}
}

// Register the default router
var router = new Router('');

// Some basic get methods
var _get = {
	template : function(name, data, cb){
		name = name || false;
		data = data || false;

		if(!name){
			console.error('No template specified');
			cb();
			return false;
		}
		else if(name in frameworkCache.templates){
			// If a template has been stored in cache, load it from there
			var thisTmp = Handlebars.compile(frameworkCache.templates[name]);
			cb(thisTmp(data).makeDocumentFragment());
		}
		else{
			if(frameworkSettings.debug) console.log('AJAX:     Retrieving template from server');
			var request = new XMLHttpRequest();
			request.open('GET', frameworkSettings.templateLocation+'/'+name+'.html', true);
			request.onload = function() {
				if (request.ajaxIsSuccessful()) {
					var template = request.responseText;
					// Add the template to the cache object
					frameworkCache.templates[name] = template;

					// Parse the template using Handlebars.js
					thisTmp = Handlebars.compile(template);
					template = thisTmp(data);

					if(frameworkSettings.localstorageCaching.enabled){
						var templates = JSON.parse(localStorage.getItem('templates'));
						templates[name] = {template : template, expires : Math.floor(Date.now() /1000)+(frameworkSettings.localstorageCaching.expiration*60*60)};
						localStorage.setItem('templates', JSON.stringify(templates));
					}

					cb(template.makeDocumentFragment());
				}
				else console.error('Error loading data');
			};

			request.onerror = function() {
				alert('Error loading template');
			};

			request.send();
		}
	},
	json : function(url, cb){
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.onload = function() {
			if (request.ajaxIsSuccessful()) {
				if(frameworkSettings.debug) console.log('AJAX:     Retrieving JSON from server');
				var res = false;
				// Check whether the JSON is valid
				try{
			        res = JSON.parse(request.responseText);
			    }
			    catch(e){
			        console.error('Not a valid JSON response from a request made to "'+url+'"', e);
			    }

			    if(res) cb(res);
			}
			else console.error('Error loading data');
		};

		request.onerror = function() {
			alert('Error loading data');
		};

		request.send();
	}
}
