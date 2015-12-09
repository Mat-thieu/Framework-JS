// Object.prototype functions need to be wrapper in this for production so it won't conflict with jQuery
// Object.defineProperty(String.prototype, METHOD_NAME, {
// 	value: function() {
// 		// METHOD FUNCTION
// 	},
// 	enumerable: false
// });

Object.prototype.isSuccessful = function() {
	if (this.status == undefined) return false;
	return this.status >= 200 && this.status < 400;
}