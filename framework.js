var frameworkSettings = {
	debug : true
};

var frameworkCache = {
	templates : {},
	namespaceRoutes : {},
	registeredNamespaces : [],
	events : []
}

var Framework = {
	// Analyze the given hash and try to find a matching route, if it matches, fire the route's callback
	analyzeHash : function(hash){
		// Handle the indexroute ("/"), this has to happen first (because the regex won't catch it)
		if(hash == '#/' || hash == '#' || hash == ''){
			frameworkCache.namespaceRoutes['index']['cb']();
			return false;
		}
		else{
			var foundMatch = false;
			var matchRoute = function(namespace){
				// Find a matching route within the namespace
				var fixedNamespace = namespace;
				if(namespace == 'default') fixedNamespace = '';

				frameworkCache.namespaceRoutes[namespace].some(function(routeVal, routeInd){
					var route = "#"+fixedNamespace+routeVal['route'];
					var routeMatcher = new RegExp(route.replace(/{[^\s/]+}/g, '([\\w-]+)'));

					var match = hash.match(routeMatcher);

					if(match){
						var params = {};
						// Handle a case with and without parameters
						foundMatch = true;
						if(routeVal['params'].length !== 0 && Array.isArray(routeVal['params'])){
							routeVal['params'].forEach(function(pVal, pInd){
								params[pVal] = match[pInd+1];
							})
							routeVal['cb'](params);
							return true;
						}
						else{
							 routeVal['cb']();
							 return true;
						}
					}
				})
			}
			// Find a matching namespace
			frameworkCache.registeredNamespaces.some(function(namespace, ind){
				var nsLength = namespace.length+1;
				if(hash.substring(1, nsLength) == namespace){
					// A namespace matched the URL
					matchRoute(namespace);
					return true;
				}
			})

			if(!foundMatch) matchRoute('default');

			if(!foundMatch){
				if('404' in frameworkCache.events) frameworkCache.events['404']();
				else logDebug('404', 'No 404 event available');
			}
		}
	},
	on : function(eventName, cb){
		frameworkCache.events[eventName] = cb;
	},
	init : function(settings){
		frameworkSettings = settings;
		if(settings.localstorageCaching.enabled){
			var templateStorage = localStorage.getItem('templates');
			if(templateStorage == null) localStorage.setItem('templates', JSON.stringify({}));
			else{
				var templates = JSON.parse(templateStorage);
				for(key in templates){
					// Only add templates that haven't expired to the memcahce
					if(templates[key]['expires'] >= Math.floor(Date.now()/1000)) frameworkCache.templates[key] = templates[key]['template'];
				}
			}
		}

		Framework.analyzeHash(window.location.hash);
		window.onhashchange = function(){
			logDebug('url', 'Hashchange triggered');
			Framework.analyzeHash(window.location.hash);
		}
	}
}

var Namespace = function(namespace){
	this.namespace = namespace;
	frameworkCache.namespaceRoutes[this.namespace] = [];
	frameworkCache.registeredNamespaces.push(this.namespace);
}

Namespace.prototype = {
	// Register a route
	listen : function(routeName, func){
		var thisCache = frameworkCache.namespaceRoutes[this.namespace];
		// Retrieve all router parameters (e.g. input /test/{id} would find {id})
		if(routeName == '/' && this.namespace == 'default') frameworkCache.namespaceRoutes['index'] = {cb : func, params : {}};
		else{
			var routerParams = routeName.match(/{([^{}]+)}/g, "$1");
			if(routerParams == null) thisCache.push({route : routeName, cb : func, params : {}});
			else{
				// If there are parameters, strip the brackets and store in the routes
			    var strippedRouterParams = [];
			    for (var i = 0; i < routerParams.length; i++) strippedRouterParams.push(routerParams[i].replace('{', '').replace('}', ''));

				thisCache.push({route : routeName, cb : func, params : strippedRouterParams});
			}
		}

		logDebug('router', 'Listening on route ' + this.namespace+routeName);
	}
}

// Register the default namespace
var router = new Namespace('default');

// Some basic get methods
var _get = {
	template : function(name, data, cb){
		if(name in frameworkCache.templates){
			// If a template has been stored in cache, load it from there
			var thisTmp = Handlebars.compile(frameworkCache.templates[name]);
			cb(thisTmp(data).makeDocumentFragment());
		}
		else{
			logDebug('ajax', 'Retrieving template from server');
			var request = new XMLHttpRequest();
			request.open('GET', frameworkSettings.templateFolder+'/'+name+'.html', true);
			request.onload = function() {
				if (request.ajaxIsSuccessful()) {
					var template = request.responseText;
					// Add the template to the cache object
					frameworkCache.templates[name] = template;

					// Parse the template using Handlebars.js
					thisTmp = Handlebars.compile(template);
					var compiledTemplate = thisTmp(data);

					// Store the template in localstorage, if it's enabled
					if(frameworkSettings.localstorageCaching.enabled){
						var templates = JSON.parse(localStorage.getItem('templates'));
						templates[name] = {template : template, expires : Math.floor(Date.now() /1000)+(frameworkSettings.localstorageCaching.expiration*60*60)};
						localStorage.setItem('templates', JSON.stringify(templates));
					}

					cb(compiledTemplate.makeDocumentFragment());
				}
				else console.error('Error loading template');
			};

			request.onerror = function() {
				console.error('Error loading template');
			};

			request.send();
		}
	},
	templates : function(templates, data, cb){
		if(!Array.isArray(templates)){
			console.error('Please specify an array of templates');
			cb();
			return false;
		}
		else{
			var loadState = {toLoad : templates.length, loaded : 0, templates : {}};

			templates.forEach(function(name, ind){
				loadState.templates[name] = '';
				if(name in frameworkCache.templates){
					var thisTmp = Handlebars.compile(frameworkCache.templates[name]);
					loadState.templates[name] = thisTmp(data).makeDocumentFragment();
					loadState.loaded++;
					if(loadState.loaded == loadState.toLoad) cb(loadState.templates);
				}
				else{
					logDebug('ajax', 'Retrieving template from server');
					var request = new XMLHttpRequest();
					request.open('GET', frameworkSettings.templateFolder+'/'+name+'.html', true);
					request.onload = function() {
						if (request.ajaxIsSuccessful()) {
							var template = request.responseText;
							// Add the template to the cache object
							frameworkCache.templates[name] = template;

							// Parse the template using Handlebars.js
							thisTmp = Handlebars.compile(template);
							var compiledTemplate = thisTmp(data);

							// Store the template in localstorage if it's enabled
							if(frameworkSettings.localstorageCaching.enabled){
								var templates = JSON.parse(localStorage.getItem('templates'));
								templates[name] = {template : template, expires : Math.floor(Date.now() /1000)+(frameworkSettings.localstorageCaching.expiration*60*60)};
								localStorage.setItem('templates', JSON.stringify(templates));
							}

							loadState.templates[name] = compiledTemplate.makeDocumentFragment();
							loadState.loaded++;

							if(loadState.loaded == loadState.toLoad) cb(loadState.templates);
						}
						else console.error('Error loading template');
					};

					request.onerror = function() {
						console.error('Error loading template');
					};
					request.send();
				}
			})
		}
	},
	json : function(url, cb){
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.onload = function() {
			if (request.ajaxIsSuccessful()) {
				logDebug('ajax', 'Retrieving JSON from server');
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
			console.error('Error loading data');
		};

		request.send();
	}
}

var _view = {
	set : function(){
		var view = document.getElementsByTagName('main-view')[0];
		view.innerHTML = '';
		if(arguments[0] !== ''){
			for (var i = 0; i < arguments.length; i++) view.appendChild(arguments[i]);
		}
	}
}
