var View = require('../../UI/View').View;

var Base = exports.Base = View.subclass(
{
	classname: 'Base',

	initialize: function($super, size) {
		$super();
		
		this.size = size;
		this.setFrame(0, 0, this.size.width, this.size.height);
		
		this.keywords = '';
		this.location = null;
		this.adUnitId = null;
	},
	
	setKeywords: function(keywords) {
		this.keywords = keywords || '';
	},
	
	getKeywords: function() {
		return this.keywords;
	},
	
	setLocation: function(location) {
		this.location = location || null;
	},
	
	getLocation: function() {
		return this.location;
	},
	
	setAdUnitId: function(adUnitId) {
		this.adUnitId = adUnitId || null;
	},
	
	getAdUnitId: function() {
		return this.adUnitId;
	},

	destroy: function($super) {
		$super();
	}
});
