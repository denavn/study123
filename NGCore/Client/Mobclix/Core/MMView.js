//
//  Mobclix.Core.MMView.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var UI = require('../../UI').UI;
var $mc = require('./Utils').Utils;

/**
 * @class MMView is a memory managed subclass of UI.View that brings in all methods supplied by {@link Mobclix.Core.MMClass}
 * @name Mobclix.Core.MMView
 * @extends UI.View
 * @private
 */
var mmViewMethods = exports.MMViewMethods = 
/** @lends Mobclix.Core.MMView.prototype */
{
	__className: "MMView",

	/**
	 * Adds the child node from it's view hierarchy and retains it
	 * @private
	 * @function
	 */
	addChild: function($super, childNode, index) {
		$super(childNode, index);
		try { childNode.retain(); } catch(e) { }
	},

	/**
	 * Removes the child node from it's view hierarchy and releases it
	 * @private
	 * @function
	 */
	removeChild: function($super, childNode) {
		$super(childNode);
		try { childNode.release(); } catch(e) { }
	},

	/**
	 * Gets the current bounds of the view
	 * @function
	 * @return	{object}	Bounds of the object
	 * @private
	 */
	getBounds: function() {
		var frame = this.getFrame();
        var bounds = [frame[0], frame[1], frame[2], frame[3]];
		bounds[0] = 0;
		bounds[1] = 0;
		return bounds;
	}
};

var MMView = exports.MMView = UI.View.subclass($mc.extend(require('./MMClass').Memory, mmViewMethods));
