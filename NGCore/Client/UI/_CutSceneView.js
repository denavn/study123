var AbstractView = require('./AbstractView').AbstractView;
var Commands = require('./Commands').Commands;

var CutSceneView = exports.CutSceneView = AbstractView.subclass(
/** @lends UI.CutSceneView.prototype */
{
	'type':'_cutsceneview',
	
	/**
	* @class The <code>CutSceneView</code> class constructs objects that handle menu CutSceneViews in a user interface. 
	* @name UI.CutSceneView
	* @augments UI.AbstractView
	*/
	initialize: function($super, properties) {
		if (CutSceneView._init) CutSceneView._init();
		return $super(properties);
	},
	
	play: function(url, callbackFn) {
		var cbId = (typeof callbackFn == 'function')
			? Commands.registerTemporaryCallback(callbackFn.bind(this))
			: "";
		Commands.playVideo.call(this, url, cbId);
	}
});

CutSceneView._init = function() {
	delete CutSceneView._init;
	if (AbstractView._init) AbstractView._init();
	
	// No init for this class
};