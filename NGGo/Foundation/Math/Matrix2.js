////////////////////////////////////////////////////////////////////////////////
/**
*  @data:      2011-07-20
*  @file:      Matrix2.js
*  @author:    Shibukawa Yoshiki
*  Website:    http://www.ngmoco.com
*  Copyright:  2010, by ngmoco:) llc
*              Unauthorized redistribution of source code is
*              strictly prohibited. Violators will be prosecuted.
*
*  @brief:
*/
////////////////////////////////////////////////////////////////////////////////

var Class = require('../../../NGCore/Client/Core/Class').Class;

var Matrix2 = Class.subclass(
/** @lends Foundation.Math.Matrix2.prototype */
{
    classname: "Matrix2",

    /**
     * @class The <code>Matrix2</code> class constructs objects that define matrix value
     * for the 2 dimensional affine transformation.
     * @constructs
     * <pre class="code">var matrix = new Matrix2([[1.0, 1.0, 1.0], [2.0, 1.0, 3.0]]);</pre>
     * @augments Core.Class
     * @param {Number} [x=0] The <i>x</i> component.
     * @param {Number} [y=0] The <i>y</i> component.
     * @name Foundation.Math.Matrix2
     */
    initialize: function()
    {
        switch( arguments.length )
        {
        case 0:
            this.m00 = this.m11 = 1;
            this.m01 = this.m02 = this.m10 = this.m12 = 0;
            break;
        case 1:
            var arg = arguments[0];
            if ( arg.length === 2 )
            {
                if (arg[0].length === 3 && arg[1].length === 3)
                {
                    this.m00 = arg[0][0];
                    this.m01 = arg[0][1];
                    this.m02 = arg[0][2];
                    this.m10 = arg[1][0];
                    this.m11 = arg[1][1];
                    this.m12 = arg[1][2];
                }
                else
                {
                    throw new Error("Matrix2's argument should be [[1,2,3],[4,5,6]].");
                }
            }
            else if (arg.classname === "Matrix2")
            {
                this.m00 = arg.m00;
                this.m01 = arg.m01;
                this.m02 = arg.m02;
                this.m10 = arg.m10;
                this.m11 = arg.m11;
                this.m12 = arg.m12;
            }
            else
            {
                throw new Error("Matrix2's argument should be Array or Matrix2");
            }
            break;
        default:
            throw new Error("Matrix2: wrong constructor parameter");
        }
    },
    /**
     * Duplicates this <code>Matrix2</code>.
     * @returns {Foundation.Math.Matrix2} A new matirx with identical all components.
     */
    clone: function()
    {
        return new this.constructor(this);
    },
    /**
     * Creates new <code>Matrix2</code> for rotation. This is a class factory method.
     * @param {Number} Rotate angle(radian);
     * @return {Foundation.Math.Matrix2} New <code>Matrix2</code> object.
     */
    $forRotation: function(angle)
    {
        return new Matrix2([[Math.cos(angle), -Math.sin(angle), 0], [Math.sin(angle), Math.cos(angle), 0]]);
    },
    /**
     * Creates new <code>Matrix2</code> for transfer. This is a class factory method.
     * You can use following styles:<br><br>
     * <pre class="code">var matrix = Matrix2.forTransfer(10, 20);</pre>
     * <pre class="code">var matrix = Matrix2.forTransfer([10, 20]);</pre>
     * <pre class="code">var matrix = Matrix2.forTransfer(new Vector2(10, 20));</pre>
     * @param {Number} x x delta value.
     * @param {Number} y y delta value.
     * @return {Foundation.Math.Matrix2} New <code>Matrix2</code> object.
     */
    $forTransfer: function()
    {
        var x, y, arg;
        switch(arguments.length)
        {
        case 2:
            x = arguments[0];
            y = arguments[1];
            break;
        case 1:
            arg = arguments[0];
            if(arg.classname === 'Vector2')
            {
                x = arg.x;
                y = arg.y;
            }
            else if (arg.length === 2)
            {
                x = arg[0];
                y = arg[1];
            }
            else
            {
                throw new Error("forTranslation: parameter should be Array or Vector2");
            }
            break;
        }
        return new Matrix2([[1, 0, x], [0, 1, y]]);
    },
    /**
     * Creates new <code>Matrix2</code> for scaling. This is a class factory
     * method.
     * You can use following styles:<br><br>
     * Both x and y scale 10 times:
     * <pre class="code">var matrix = Matrix2.forScaling(10);</pre>
     * Use different scale factor with x and y:
     * <pre class="code">var matrix = Matrix2.forScaling(10, 20);</pre>
     * @param {Number} x x scale factor.
     * @param {Number} y [y=x] y scale factor.
     * @return {Foundation.Math.Matrix2} New <code>Matrix2</code> object.
     */
    $forScaling: function()
    {
        var x, y;
        switch(arguments.length)
        {
        case 1:
            x = y = arguments[0];
            break;
        case 2:
            x = arguments[0];
            y = arguments[1];
            break;
        default:
            throw new Error("forScaling: wrong arguments number: " + arguments.length);
        }
        return new Matrix2([[x, 0, 0], [0, y, 0]]);
    },
    /**
     * Calculates multiply of itself and the other matrix.
     * @param {Number} rhs the other matrix.
     * @return {Foundation.Math.Matrix2} Itself.
     */
    multiply: function(rhs)
    {
        var tx = this.m00;
        var ty = this.m01;
        this.m00 = tx * rhs.m00 + ty * rhs.m10;
        this.m01 = tx * rhs.m01 + ty * rhs.m11;
        this.m02 = tx * rhs.m02 + ty * rhs.m12 + this.m02;
        tx = this.m10;
        ty = this.m11;
        this.m10 = tx * rhs.m00 + ty * rhs.m10;
        this.m11 = tx * rhs.m01 + ty * rhs.m11;
        this.m12 = tx * rhs.m02 + ty * rhs.m12 + this.m12;
        return this;
    }
});

exports.Matrix2 = Matrix2;
