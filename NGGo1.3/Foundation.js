////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

/**
 * <p><code>Foundation</code> module is a collection of base parts of ngGo</p>
 * @name Foundation
 * @namespace
 * @description <p><code>Foundaton</code> module privides JavaScript level supporting.</p>
 * <ul>
 * <li><code>{@link Foundation.AutodestroyPool}</code>: Provides destroyable objects management by region-based approach.
 * <li><code>{@link Foundation.Class}</code>: Extend ngCore's <code>Core.Class</code> to add mixin feature. Mixin works on both <code>subclass()</code> method ans <code>singleton()</code> method.
 * <li><code>{@link Foundation.Math}</code>: Mathmatical algorythm like Vector/Matrix and complementing.</li>
 * <li><code>{@link Foundation.Observable}</code>: Mixin object to add oberver pattern event feature.</li>
 * <li><code>{@link Foundation.NGGOError}</code>: Error description object for callback functions.</li>
 * <li><code>{@link Foundation.Mixin}</code>: Base class for the object which is mixed into other class.</li>
 * <li><code>{@link Foundation.OrderedDictionary}</code>: Dictionary like collection which persists the order of entries similar to an array.</li>
 * </ul>
 */

exports.Foundation = {};

exports.Foundation.__defineGetter__("AutodestroyPool", function() {
        delete this.AutodestroyPool;
        return this.AutodestroyPool = require('./Foundation/AutodestroyPool').AutodestroyPool;
});
exports.Foundation.__defineGetter__("Class", function() {
        delete this.Class;
        return this.Class = require('./Foundation/Class').Class;
});
exports.Foundation.__defineGetter__("Math", function() {
        delete this.Math;
        return this.Math = require('./Foundation/Math').Math;
});
exports.Foundation.__defineGetter__("Observable", function() {
        delete this.Observable;
        return this.Observable = require('./Foundation/Observable').Observable;
});
exports.Foundation.__defineGetter__("NGGOError", function() {
        delete this.NGGOError;
        return this.NGGOError = require('./Foundation/NGGOError').NGGOError;
});
exports.Foundation.__defineGetter__("Mixin", function() {
        delete this.Mixin;
        return this.Mixin = require('./Foundation/Mixin').Mixin;
});
exports.Foundation.__defineGetter__("OrderedDictionary", function() {
        delete this.OrderedDictionary;
        return this.OrderedDictionary = require('./Foundation/OrderedDictionary').OrderedDictionary;
});
