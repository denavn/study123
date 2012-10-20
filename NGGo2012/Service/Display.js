////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

/**
 * <p><code>Service.Display</code> module.</p>
 * @name Service.Display
 * @namespace
 * @description <p><code>Display</code> package provides many modules related displaying on the screen.</p>
 * <ul>
 * <li><code>{@link Service.Display.Camera}</code>: The <code>Camera</code> is responsible for deciding “what” to display to the screen. This is done by manipulating the <code>GL2.Nodes</code> defined within the SceneManager.
 * <li><code>{@link Service.Display.CameraManager}</code>: The <code>CameraManager</code> class handles all the tuning values available for <code>Service.Display.Camera</code>.
 * <li><code>{@link Service.Display.DebugMenu}</code>: Creates debug menu with one method call.
 * <li><code>{@link Service.Display.SceneManager}</code>: Wraps over the basic skeleton of the <code>GL2</code>'s Scene Graph to allow for quick data driven setup.
 * <li><code>{@link Service.Display.ScreenManager}</code>: Bridges difference of resolutions.
 * <li><code>{@link Service.Display.SplashScreenManager}</code>: The <code>SplashScreenManager</code> class supports text and spinner features.
 * </ul>
 */

exports.Display = {};

exports.Display.__defineGetter__("Camera", function() {
        delete this.Camera;
        return this.Camera = require('./Display/Camera').Camera;
});
exports.Display.__defineGetter__("CameraManager", function() {
        delete this.CameraManager;
        return this.CameraManager = require('./Display/CameraManager').CameraManager;
});
exports.Display.__defineGetter__("DebugMenu", function() {
        delete this.DebugMenu;
        return this.DebugMenu = require('./Display/DebugMenu').DebugMenu;
});
exports.Display.__defineGetter__("SceneManager", function() {
        delete this.SceneManager;
        return this.SceneManager = require('./Display/SceneManager').SceneManager;
});
exports.Display.__defineGetter__("ScreenManager", function() {
        delete this.ScreenManager;
        return this.ScreenManager = require('./Display/ScreenManager').ScreenManager;
});
exports.Display.__defineGetter__("SplashScreenManager", function() {
        delete this.SplashScreenManager;
        return this.SplashScreenManager = require('./Display/SplashScreenManager').SplashScreenManager;
});


