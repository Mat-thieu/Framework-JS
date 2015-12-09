var frameworkCache = {
	templates : {},
	namespaces : []
}

var Router = function(namespace){
	if(frameworkCache.namespaces.indexOf(namespace) !== -1) return false;
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
		if(this.homeroute.available && (hash == '#' || hash == '#/' || hash == '')){
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
					else if(self.namespace !== ''){
						val['cb']();
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
	template : function(settings, cb){
		settings['name'] = settings['name'] || false;
		settings['data'] = settings['data'] || false;

		var fillTemplate = function(res){
			if(settings['data']){
				var tmpVar = res.match(/{([^{}]+)}/g, "$1");
			    for (var i = 0; i < tmpVar.length; i++) {
		    		var regx = new RegExp(tmpVar[i], "g");
		    		res = res.replace( regx, settings['data'][tmpVar[i].replace('{', '').replace('}', '')] );
			    };
			}

			var frag = document.createDocumentFragment();
		    var tmp = document.createElement('span');
		    tmp.innerHTML = res;
		    frag.appendChild(tmp.firstChild);
			return frag;
		}

		if(!settings['name']){
			console.error('No template specified');
			cb();
			return false;
		}
		else if(settings['name'] in frameworkCache.templates){
			cb(fillTemplate(frameworkCache.templates[settings['name']]));
		}
		else{
			var request = new XMLHttpRequest();
			request.open('GET', '/templates/'+settings['name']+'.html', true);
			request.onload = function() {
				if (request.isSuccessful()) {
					var template = request.responseText;
					frameworkCache.templates[settings['name']] = template;
					cb(fillTemplate(template));
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
			if (request.isSuccessful()) {
				var res = false;
				try{
			        res = JSON.parse(request.responseText);
			    }
			    catch(e){
			        console.error('Not a valid JSON response', e);
			    }

			    if(res) cb(res);
			}
			else console.error('Error loading data');
		};

		request.onerror = function() {
			alert('Error loading template');
		};

		request.send();
	}
}

var router = new Router('');
