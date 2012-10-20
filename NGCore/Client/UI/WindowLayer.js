var Element = require('./Element').Element;
var ViewParent = require('./ViewParent').ViewParent;
var Commands = require('./Commands').Commands;

/** @private
 * 	This ENTIRE CLASS is private.
 */
var WindowLayer = exports.WindowLayer = Element.subclass( {
	'type':'windowlayer',
	initialize: function($super, props) {
		if (WindowLayer.init) WindowLayer.init();
		$super(props);
		if (WindowLayer._init) WindowLayer._init();
		ViewParent.initialize.call(this);
		this._visible = true;
	},
	getRoot: function(){
		return this;
	},
	getParent: function(){
		return undefined;
	},
	
	getChildCount: ViewParent.getChildCount,
	getChildren: ViewParent.getChildren,
	addChild: ViewParent.addChild,
	removeChild: ViewParent.removeChild
});

WindowLayer.init = function() {
	delete WindowLayer._init;
	if (Element._init) Element._init();
	
	WindowLayer.synthesizeProperty('level', Commands.setIntValue);
};
