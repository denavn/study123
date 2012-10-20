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
 * <li><code>{@link Service.Graphics.AvatarSprite}</code>: The <code>AvatarSprite</code> class shows profile images that users have on Mobage Server.
 * <li><code>{@link Service.Graphics.Fader}</code>: This class is used for fade-in or fade-out effects.
 * <li><code>{@link Service.Graphics.ImageFont}</code>: The <code>ImageFont</code> class is used to display font styles of letters that are given in the form of spriteSheet.
 * <li><code>{@link Service.Graphics.ImageListView}</code>: The <code>ImageListView</code> provides functionality to make Horizontal and Vertical Lists of GLUI Objects, <code>GL2.Node</code> and its subclasses.
 * <li><code>{@link Service.Graphics.NinePatchSprite}</code>: NinePatch which has same I/F with GL2.Sprite.
 * <li><code>{@link Service.Graphics.ParticleEmitter}</code>: This class loads ParticleDesigner‘s plist and plays a particle animation. New emitter object plays effect automatically.
 * <li><code>{@link Service.Graphics.ScrollingLayers}</code>: The <code>ScrollingLayers</code> class is a class to manage parallax scrolling.
 * <li><code>{@link Service.Graphics.URLSprite}</code>: The <code>URLSprite</code> class inherits <code>GL2.Sprite</code> and allows downloading from URL. It also has caching mechanism to decrease network traffic load.
 * <li><code>{@link Service.Graphics.VFX}</code>: The <code>VFX</code> class helps you to run different visual effects sequentially or simultaneously.
 * </ul>
 */
exports.Graphics = {};
exports.Graphics.__defineGetter__("AvatarSprite", function ()
{
    delete this.AvatarSprite;
    return this.AvatarSprite = require('./Graphics/AvatarSprite').AvatarSprite;
});
exports.Graphics.__defineGetter__("Fader", function ()
{
    delete this.Fader;
    return this.Fader = require('./Graphics/Fader').Fader;
});
exports.Graphics.__defineGetter__("ImageFont", function ()
{
    delete this.ImageFont;
    return this.ImageFont = require('./Graphics/ImageFont').ImageFont;
});
exports.Graphics.__defineGetter__("ImageListView", function ()
{
    delete this.ImageListView;
    return this.ImageListView = require('./Graphics/ImageListView').ImageListView;
});
exports.Graphics.__defineGetter__("NinePatchSprite", function ()
{
    delete this.NinePatchSprite;
    return this.NinePatchSprite = require('./Graphics/NinePatchSprite').NinePatchSprite;
});
exports.Graphics.__defineGetter__("ParticleEmitter", function ()
{
    delete this.ParticleEmitter;
    return this.ParticleEmitter = require('./Graphics/ParticleEmitter').ParticleEmitter;
});
exports.Graphics.__defineGetter__("ScrollingLayers", function ()
{
    delete this.ScrollingLayers;
    return this.ScrollingLayers = require('./Graphics/ScrollingLayers').ScrollingLayers;
});
exports.Graphics.__defineGetter__("URLSprite", function ()
{
    delete this.URLSprite;
    return this.URLSprite = require('./Graphics/URLSprite').URLSprite;
});
exports.Graphics.__defineGetter__("VFX", function ()
{
    delete this.VFX;
    return this.VFX = require('./Graphics/VFX').VFX;
});
exports.Graphics.__defineGetter__("VFXActions", function ()
{
    delete this.VFXActions;
    return this.VFXActions = require('./Graphics/VFXActions').VFXActions;
});
