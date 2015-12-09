var frameworkCache = {
	templates : {},
	namespaces : []
}

var Router = function(namespace){
	if(frameworkCache.namespaces.indexOf(namespace) !== -1){
		console.error('Namespace "'+namespace+'" already exists');
		return false;
	}
	else{
		frameworkCache.namespaces.push(namespace);
		this.namespace = namespace;
	}
	this.routes = [];
	this.homeroute = {available : false, index : 0};
}

Router.prototype = {
	listen : function(routeName, func){
		var routerVariables = routeName.match(/{([^{}]+)}/g, "$1");
		if(routerVariables == null) this.routes.push({route : routeName, cb : func, params : {}});
		else{
		    var strippedRouterVariables = [];
		    for (var i = 0; i < routerVariables.length; i++) {
		        strippedRouterVariables.push(routerVariables[i].replace('{', '').replace('}', ''));
		    };

			this.routes.push({route : routeName, cb : func, params : strippedRouterVariables});
		}
	},
	analyzeHash : function(hash){
		if(this.homeroute.available && hash.isHomeRoute(this.namespace)){
			this.routes[this.homeroute.index]['cb']();
			return false;
		}
		else{
			var self = this;
			this.routes.forEach(function(val, ind){
				var route = "#"+(self.namespace !== '' ? self.namespace : "")+val['route'];
				var routeMatcher = new RegExp(route.replace(/{[^\s/]+}/g, '([\\w-]+)'));

				var match = hash.match(routeMatcher);

				if(match){
					var params = {};
					if(val['params'].length !== 0 && Array.isArray(val['params'])){
						val['params'].forEach(function(pVal, pInd){
							params[pVal] = match[pInd+1];
						})
						val['cb'](params);
					}
					else {
						 if(val['route'] !== '/') val['cb']();
					}
				}
			})
		}
	},
	init : function(){
		var self = this;
		this.routes.forEach(function(val, ind){
			if(val['route'] == '/'){
				self.homeroute.available = true;
				self.homeroute.index = ind;
			}
		})
		this.analyzeHash(window.location.hash);

		window.onhashchange = function(){
			self.analyzeHash(window.location.hash);
		}
	}
}

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
			var thisTmp = Handlebars.compile(frameworkCache.templates[name]);
			cb(thisTmp(data).makeDocumentFragment());
		}
		else{
			var request = new XMLHttpRequest();
			request.open('GET', '/templates/'+name+'.html', true);
			request.onload = function() {
				if (request.ajaxIsSuccessful()) {
					var template = request.responseText;
					frameworkCache.templates[name] = template;

					thisTmp = Handlebars.compile(template);
					template = thisTmp(data);

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
				var res = false;
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

var router = new Router('');
