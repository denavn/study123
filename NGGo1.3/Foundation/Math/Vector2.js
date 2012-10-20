////////////////////////////////////////////////////////////////////////////////
/**
 *  @author    Shibukawa Yoshiki
 *  Website    http://www.ngmoco.com
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 *             Unauthorized redistribution of source code is
 *             strictly prohibited. Violators will be prosecuted.
 */
////////////////////////////////////////////////////////////////////////////////

var Class = require('../../../NGCore/Client/Core/Class').Class;

var Vector2 = Class.subclass(
/** @lends Foundation.Math.Vector2.prototype */
{
    classname: "Vector2",

    /**
     * @class The <code>Vector2</code> class constructs objects that define 2D vector value
     * for the <i>x</i> and <i>y</i> components.
     * @constructs
     * There are four different calling style for <code>Vector2</code> objects.<br><br>
     * Set both compoenent values to 0.
     * <pre class="code">var vector = new Vector2();</pre>
     * <br><br>
     * Copy an existing vector.
     * <pre class="code">var vector = new Vector2(vector);</pre>
     * <br><br>
     * Specify a value for both components.
     * <pre class="code">var vector = new Vector2(1.0, 1.0);</pre>
     * <br><br>
     * Specify a value for both components via Array.
     * <pre class="code">var vector = new Vector2([1.0, 1.0]);</pre>
     * @name Foundation.Math.Vector2
     * @augments Core.Class
     * @param {Number} [x=0] The <i>x</i> component.
     * @param {Number} [y=0] The <i>y</i> component.
     */
    initialize: function(x, y)
    {
        if (y === undefined) {
            if (x === undefined) {
                x = 0;
                y = 0;
            } else if (x.length === 2) {
                y = x[1];
                x = x[0];
            } else {
                y = x.getY();
                x = x.getX();
            }
        }
        this.x = x;
        this.y = y;
    },
    /**
     * Duplicate this <code>Vector2</code>.
     * @returns {Foundation.Math.Vector2} A new vector with identical <i>x</i> and <i>y</i> components.
     */
    clone: function()
    {
        return new Vector2(this.x, this.y);
    },
    /**
     * Sets the value of this vector to the vector sum of itself and other <code>Vector2</code>.
     * @param {Foundation.Math.Vector2} rhs the other vector.
     * @returns {Foundation.Math.Vector2} this object.
     */
    add: function( rhs )
    {
        this.x += rhs.x;
        this.y += rhs.y;
        return this;
    },
    /**
     * Sets the value of this vector to the vector sum of itself and other <code>Vector2</code> that is scaled.
     * @param {Foundation.Math.Vector2} rhs The other vector.
     * @param {Number} scale Scale value it is applied to <code>rhs</rhs>.
     * @returns {Foundation.Math.Vector2} This object.
     */
    scale_and_add: function( scale, rhs )
    {
        this.x += (rhs.x * scale);
        this.y += (rhs.y * scale);
        return this;
    },
    /**
     * Sets the value of this vector to the vector difference of itself and other <code>Vector2</code>.
     * @param {Foundation.Math.Vector2} rhs the other vector.
     * @returns {Foundation.Math.Vector2} this object.
     */
    sub: function( rhs )
    {
        this.x -= rhs.x;
        this.y -= rhs.y;
        return this;
    },
    /**
     * Sets the value of this tuple to the scalar multiplication of itself.
     * @param {Number} s the scalar value.
     * @returns {Foundation.Math.Vector2} this object.
     */
    scale: function( s ) {
        this.x *= s;
        this.y *= s;
        return this;
    },
    /**
     * Normalize this <code>Vector2</code> in place.
     * @returns {Foundation.Math.Vector2} this object.
     */
    normalize: function() {
        var length = this.length;
        this.x /= length;
        this.y /= length;
        return this;
    },
    /**
     * Calcs distance between itself and other <code>Vector2</code>.
     * @param {Foundation.Math.Vector2} rhs the other vector.
     * @returns {Number} the distance.
     */
    distance: function( rhs )
    {
        var x = rhs.x - this.x;
        var y = rhs.y - this.y;
        return Math.sqrt(x*x + y*y);
    },
    /**
     * Calcs squared distance between itself and other <code>Vector2</code>.
     * @param {Foundation.Math.Vector2} rhs the other vector.
     * @returns {Number} the squared distance.
     */
    distanceSquared: function( rhs )
    {
        var x = rhs.x - this.x;
        var y = rhs.y - this.y;
        return x*x + y*y;
    },
    /**
     * Length of this <code>Vector2</code>.
     * @fieldOf Foundation.Math.Vector2.prototype
     * @type Number
     */
    get length()
    {
        var x = this.x;
        var y = this.y;
        return Math.sqrt(x * x + y * y);
    },
    /** @private */
    set length(value)
    {
        throw new Error("length property is readonly");
    },
    /**
     * Squared length of this <code>Vector2</code>.
     * @fieldOf Foundation.Math.Vector2.prototype
     * @type Number
     */
    get lengthSquared()
    {
        var x = this.x;
        var y = this.y;
        return x * x + y * y;
    },
    /** @private */
    set lengthSquared(value)
    {
        throw new Error("lengthSquared property is readonly");
    },
    /**
     * Sets the value of the middle points between itself and other object.
     * @param {Foundation.Math.Vector2} rhs the other vector.
     * @returns {Foundation.Math.Vector2} this object.
     */
    middlePoint: function(rhs)
    {
        var t = 0.5;
        this.x += -this.x * t + rhs.x * t;
        this.y += -this.y * t + rhs.y * t;
        return this;
    },
    /**
     * Sets the value of the parametric middle points between itself and other object.
     * @param {Foundation.Math.Vector2} rhs the other vector.
     * @param {Number} t the parameter.
     * @returns {Foundation.Math.Vector2} this object.
     */
    parametricPoint: function(rhs, t)
    {
        this.x += -this.x * t + rhs.x * t;
        this.y += -this.y * t + rhs.y * t;
        return this;
    },

    parametricEval : function(rhs, t)
    {
        return new Vector2(this.x - this.x * t + rhs.x * t, this.y - this.y * t + rhs.y * t);
    },

    /**
     * Returns value of the <i>x</i> component. It is the compatible method of <code>Core.Point</code>.
     * @returns {Number} <i>x</i> component.
     */
    getX: function()
    {
        return this.x;
    },
    /**
     * Returns value of the <i>y</i> component. It is the compatible method of <code>Core.Point</code>.
     * @returns {Number} <i>y</i> component.
     */
    getY: function()
    {
        return this.y;
    },
    /**
     * Computes the dot product of the this vector and other vector.
     * @param {Foundation.Math.Vector2} rhs the other vector.
     * @returns {Number} Result value.
     */
    dotProduct: function(rhs)
    {
        return this.x * rhs.x + this.y * rhs.y;
    },
    /**
     * Computes the dot product of the this vector and other vector.
     * @param {Foundation.Math.Vector2} rhs the other vector.
     * @returns {Number} Result value.
     */
    crossProduct: function(rhs)
    {
        return this.x * rhs.y - this.y * rhs.x;
    },
    /**
     * Computes new <i>x</i> and <i>y</i> by transforming <code>Matrix2</code>
     * @param {Foundation.Math.Matrix2} matrix the transform Matrix.
     * @return {Foundation.Math.Vector2} it self.
     */
    transform: function(matrix)
    {
        var tx = this.x;
        this.x = matrix.m00 * tx + matrix.m01 * this.y + matrix.m02;
        this.y = matrix.m10 * tx + matrix.m11 * this.y + matrix.m12;
        return this;
    },

    isNaN: function()
    {
        return isNaN(this.x) || isNaN(this.y);
    },
    /**
     * Returns string presentation of <code>Vector2</code> object.
     * @return {String} String presentation of this object.
     */
    toString : function()
    {
        return "Foundation.Math.Vector2(" + this.x + ", " + this.y + ")";
    }
});

exports.Vector2 = Vector2;
