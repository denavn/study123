////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

/**
 * <p><code>Service.Debug</code> module.</p>
 * @name Service.Debug
 * @namespace
 * @description <p><code>Debug</code> module provides many modules related dump.</p>
 * <ul>
 * <li><code>{@link Service.Debug.dump}</code>: The <code>dump</code>.
 * </ul>
 */

exports.Debug = {};

exports.Debug.__defineGetter__("dump", function() {
    delete this.dump;
    return this.dump = require('./Debug/Dump').dump;
});
exports.Debug.__defineGetter__("DumpSetting", function() {
    delete this.DumpSetting;
    return this.DumpSetting = require('./Debug/DumpSetting').DumpSetting;
});
