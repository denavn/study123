////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

/**
 * <p><code>Service.Audio</code> module.</p>
 * @name Service.Audio
 * @namespace
 * @description <p><code>Audio</code> module provides some modules related audio.</p>
 * <ul>
 * <li><code>{@link Service.Audio.AudioManager}</code>: The <code>AudioManager</code> class supports whole funcitions about music, sound effects.</li>
 * </ul>
 */

exports.Audio = {};

exports.Audio.__defineGetter__("AudioManager", function() {
    delete this.AudioManager;
    return this.AudioManager = require('./Audio/AudioManager').AudioManager;
});
