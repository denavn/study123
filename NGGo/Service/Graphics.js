////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

/**
 * <p><code>Service.Graphics</code> module.</p>
 * @name Service.Graphics
 * @namespace
 * @description <p><code>Graphics</code> module provides many modules related with graphics.</p>
 * <ul>
 * <li><code>{@link Service.Graphics.NinePatchSprite}</code>: NinePatch which has same I/F with GL2.Sprite.
 * </ul>
 */

exports.Graphics = {};

exports.Graphics.__defineGetter__("NinePatchSprite", function() {
        delete this.NinePatchSprite;
        return this.NinePatchSprite = require('./Graphics/NinePatchSprite').NinePatchSprite;
});
