////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Shamas Shahid
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

/**
 * <p><code>Extra</code> module is a extra UI parts of ngGo</p>
 * @name Extra
 * @namespace
 * @description <p><code>Extra</code> module is a extra UI parts of ngGo.</p>
 * <ul>
 * <li><code>{@link GLUI.Extra.Slider}</code>: The <code>Slider</code> class constructs objects of a Control that provides a sliding interface between two numeric values.</li>
 * </ul>
 */

exports.Extra = {};

exports.Extra.__defineGetter__("Slider", function() {
    delete this.Slider;
    return this.Slider = require('./Extra/Slider').Slider;
});
