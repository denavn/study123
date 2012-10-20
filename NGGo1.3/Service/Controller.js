////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

/**
 * <p><code>Service.Controller</code> module.</p>
 * @name Service.Controller
 * @namespace
 * @description <p><code>Controller</code> module provides some modules related controller.</p>
 * <ul>
 * <li><code>{@link Service.Controller.TouchHandler}</code>: The <code>TouchHandler</code> class is a class that provides advanced touch handling gestures such as Swipe, Pinch, and LongTap.</li><br>
 * </ul>
 */

exports.Controller = {};

exports.Controller.__defineGetter__("TouchHandler", function() {
    delete this.TouchHandler;
    return this.TouchHandler = require('./Controller/TouchHandler').TouchHandler;
});
