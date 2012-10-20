var Core = require('../../Core').Core;

var ViewControllerRegistry = exports.ViewControllerRegistry = Core.Class.singleton({
	classname: 'ViewControllerRegistry',
	
	initialize: function() {
		this.visibleViewControllers = {};
		this.count = 0;
	},
	
	add: function(viewController) {
		if (typeof this.visibleViewControllers[viewController.identifier] === 'undefined') {
			this.visibleViewControllers[viewController.identifier] = viewController.classname;
			this.count++;
		}
	},
	
	remove: function(viewController) {
		if (typeof this.visibleViewControllers[viewController.identifier] !== 'undefined') {
			delete this.visibleViewControllers[viewController.identifier];
			this.count--;
		}
	},
	
	canShowInterstitial: function() {
		// return true when there are no visible view controllers currently registered
		return this.count === 0;
	}
});
	
