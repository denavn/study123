////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

/**
 * <p><code>Service</code> package is a collection of useful modulable libraries</p>
 * @name Service
 * @namespace
 * @description <p>This package contains following packages:</p>
 * <ul>
 * <li><code>{@link Service.Data}</code>: Data access modules.</li>
 * <li><code>{@link Service.Display}</code>: High level graphics modules.</li>
 * <li><code>{@link Service.Dump}</code>: Dump modules.</li>
 * <li><code>{@link Service.Graphics}</code>: Primitive graphics modules.</li>
 * <li><code>{@link Service.Network}</code>: Network modules.</li>
 * <li><code>{@link Service.Storage}</code>: NinePatch which has same I/F with GL2.Sprite.</li>
 * </ul>
 */

exports.Service = {};

exports.Service.__defineGetter__("Data", function() {
        delete this.Data;
        return this.Data = require('./Service/Data').Data;
});
exports.Service.__defineGetter__("Debug", function() {
        delete this.Debug;
        return this.Debug = require('./Service/Debug').Debug;
});
exports.Service.__defineGetter__("Display", function() {
        delete this.Display;
        return this.Display = require('./Service/Display').Display;
});
exports.Service.__defineGetter__("Draw", function() {
        delete this.AudioManager;
        return this.AudioManager = require('./Service/Draw').Draw;
});
exports.Service.__defineGetter__("Graphics", function() {
        delete this.Graphics;
        return this.Graphics = require('./Service/Graphics').Graphics;
});

exports.Service.__defineGetter__("Network", function() {
        delete this.Network;
        return this.Network = require('./Service/Network').Network;
});
exports.Service.__defineGetter__("Storage", function() {
        delete this.Storage;
        return this.Storage = require('./Service/Storage').Storage;
});
exports.Service.__defineGetter__("AudioManager", function() {
        delete this.AudioManager;
        return this.AudioManager = require('./Service/Audio/AudioManager').AudioManager;
});

