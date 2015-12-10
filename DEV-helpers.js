// Object.prototype functions need to be wrapper in this for production so it won't conflict with jQuery
// Object.defineProperty(String.prototype, METHOD_NAME, {
// 	value: function() {
// 		// METHOD FUNCTION
// 	},
// 	enumerable: false
// });

var frameworkDebugNotice =  '     __________________  \n' +
							'    |                  | \n'+
							'    |   FRAMEWORK.JS   | \n'+
							'    |                  | \n'+
							'    |    Debug mode    | \n'+
							'    |    not suited    | \n'+
							'    |  for production  | \n'+
							'    |                  | \n'+
							'    |__________________| \n \n';


Object.prototype.ajaxIsSuccessful = function() {
	if (this.status == undefined) return false;
	return this.status >= 200 && this.status < 400;
}

String.prototype.makeDocumentFragment = function(){
	var frag = document.createDocumentFragment();
    var tmp = document.createElement('span');
    tmp.innerHTML = this;
    frag.appendChild(tmp.firstChild);

    return frag;
}

String.prototype.isHomeRoute = function(namespace){
	if(this == '#'+(namespace !== '' ? namespace+'/' : '/') || this == '#'+(namespace !== '' ? namespace : '') || this == '') return true;
	else return false;
}

var logSubject = function(sub){
	var space = ' ';
	var formattedSubject = '';
	var amountSpaces = (10-sub.length)-1;
	formattedSubject += sub.toUpperCase()+':';
	for (var i = 0; i < amountSpaces; i++) {
		formattedSubject += space;
	};

	return formattedSubject;
}