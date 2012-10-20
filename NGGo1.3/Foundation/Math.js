////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

/**
 * <p><code>Foundation.Math</code> module.</p>
 * @name Foundation.Math
 * @namespace
 * @description <p><code>Math</code> module provides Mathmatical algorythm like Vector/Matrix and complementing.</p>
 * <ul>
 * <li><code>{@link Foundation.Math.Matrix2}</code>: Matrix class to calculate 2 dimensional affine transformation.</li>
 * <li><code>{@link Foundation.Math.Ops}</code>: Many algorythms for completion of motion.</li>
 * <li><code>{@link Foundation.Math.Vector2}</code>: Vector class for 2 dimensional coordination.</li>
 * </ul>
 */

exports.Math = {};

exports.Math.__defineGetter__("Matrix2", function() {
        delete this.Matrix2;
        return this.Matrix2 = require('./Math/Matrix2').Matrix2;
});
exports.Math.__defineGetter__("Vector2", function() {
        delete this.Vector2;
        return this.Vector2 = require('./Math/Vector2').Vector2;
});
exports.Math.__defineGetter__("Ops", function() {
        delete this.Ops;
        return this.Ops = require('./Math/Ops').Ops;
});
