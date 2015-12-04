var Router = function(){
	this.routes = [];
	this.homeroute = {available : false, index : 0};
}

/**
 * Application router
 * @type {{listen: Function, analyzeHash: Function, init: Function}}
 */
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
		if(this.homeroute.available && (hash == '#' || hash == '')) this.routes[this.homeroute.index]['cb']();
		else{
			this.routes.forEach(function(val, ind){
				var route = "#"+val['route'];
				var routeMatcher = new RegExp(route.replace(/{[^\s/]+}/g, '([\\w-]+)'));

				var match = hash.match(routeMatcher);

				if(match){
					var params = {};
					val['params'].forEach(function(pVal, pInd){
						params[pVal] = match[pInd+1];
					})
					val['cb'](params);
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
	}
}

var cache = {
	templates : {}
}

Object.prototype.isSuccessful = function() {
	if (this.status == undefined) return false;
	return this.status >= 200 && this.status < 400;
}


var get = {
	template : function(settings, callback){
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
			callback();
			return false;
		}
		else if(settings['name'] in cache.templates){
			callback(fillTemplate(cache.templates[settings['name']]));
		}
		else{
			var request = new XMLHttpRequest();
			request.open('GET', '/templates/'+settings['name']+'.html', true);
			request.onload = function() {
				if (request.isSuccessful()) {
					var template = request.responseText;
					cache.templates[settings['name']] = template;
					callback(fillTemplate(template));
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

var router = new Router();

window.onhashchange = function(){
	router.analyzeHash(window.location.hash);
}