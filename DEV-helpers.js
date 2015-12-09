// Object.prototype functions need to be wrapper in this for production so it won't conflict with jQuery
// Object.defineProperty(String.prototype, METHOD_NAME, {
// 	value: function() {
// 		// METHOD FUNCTION
// 	},
// 	enumerable: false
// });

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