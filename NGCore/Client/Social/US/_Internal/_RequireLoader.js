/** RequireLoader.js
	Include files lazily, using throwaway property getters.
*/

function _generateGetter(name, requireFn) {
	// Need this for scoping
	return function() {
		// Remove the getter on first access and replace it with the evaluated require.
		delete this[name];
		return this[name] = requireFn(require); // Passes in require for some Interface Magic!
	};
}

exports.RequireLoader = function(map) {
	if (map instanceof Object) {
		for (var req in map) {
			this.__defineGetter__(req, _generateGetter(req, map[req]));
		}
	}
	return this;
};

exports.RequireLoader.prototype = {
	load: function(name) {
		// A little syntactic sugar if things need to be loaded.
		// requires.load("Thing") explains what is happening pretty well.
		this[name];
	}
};