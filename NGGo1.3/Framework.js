////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

/**
 * <p><code>Framework</code> module.</p>
 * @name Framework
 * @namespace
 * @description <p><code>Framework</code> module provides powerful classes to struct games.</p>
 * <ul>
 * <li><code>{@link Framework.AnimationManager} Main “Gateway” object for constructing and playing animations.</li>
 * <li><code>{@link Framework.ConfigurationManager} Defines how the ngGo engine will be initialized.</li>
 * <li><code>{@link Framework.MotionController} Executes the motion tween animation.</li>
 * <li><code>{@link Framework.Scene} Package of scene control classes.</li>
 * <li><code>{@link Framework.GUIBuilder} Class for craeting GLUI and GL2 element against json.</li>
 * </ul>
 */

exports.Framework = {};

exports.Framework.__defineGetter__("AnimationManager", function() {
	delete this.AnimationManager;
	this.AnimationManager = require('./Framework/AnimationManager').AnimationManager;
	return this.AnimationManager;
});
exports.Framework.__defineGetter__("ConfigurationManager", function() {
	delete this.ConfigurationManager;
	this.ConfigurationManager = require('./Framework/ConfigurationManager').ConfigurationManager;
	return this.ConfigurationManager;
});
exports.Framework.__defineGetter__("MotionController", function() {
	delete this.MotionController;
	this.MotionController = require('./Framework/MotionController').MotionController;
	return this.MotionController;
});
exports.Framework.__defineGetter__("Scene", function() {
	delete this.Scene;
	this.Scene = require('./Framework/Scene').Scene;
	return this.Scene;
});

exports.Framework.__defineGetter__("GUIBuilder", function() {
	delete this.GUIBuilder;
	this.GUIBuilder = require('./Framework/GUIBuilder').GUIBuilder;
	return this.GUIBuilder;
});
