////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

/**
 * <p><code>Scene</code> module.</p>
 * @name Framework.Scene
 * @namespace
 * @description <p><code>Scene</code> packages provides scene control classes.</p>
 * <ul>
 * <li><code>{@link Framework.Scene.Scene}: Base class of scenes.</li>
 * <li><code>{@link Framework.Scene.SceneDirector}: Scene transition controller.</li>
 * <li><code>{@link Framework.Scene.SceneFactory}: Scene registry.</li>
 */

exports.Scene = {};

exports.Framework.__defineGetter__("Scene", function() {
	delete this.Scene;
	this.Scene = require('./Scene/Scene').Scene;
	return this.Scene;
});
exports.Framework.__defineGetter__("SceneDirector", function() {
	delete this.SceneDirector;
	this.SceneDirector = require('./Scene/SceneDirector').SceneDirector;
	return this.SceneDirector;
});
exports.Framework.__defineGetter__("SceneFactory", function() {
	delete this.SceneFactory;
	this.SceneFactory = require('./Scene/SceneFactory').SceneFactory;
	return this.SceneFactory;
});
