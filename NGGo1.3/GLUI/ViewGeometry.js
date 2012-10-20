////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Muzammil Mahmood
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

var Class = require('../../NGCore/Client/Core/Class').Class;
var Capabilities = require('../../NGCore/Client/Core/Capabilities').Capabilities;
var Commands = require('./Commands').Commands;

/**
 * <p>Classes and objects contained by the <code>ViewGeometry</code> class.</p>
 * @name GLUI.ViewGeometry
 * @namespace
 * @description <p>The <code>ViewGeometry</code> class is a collection of classes and objects that control spatial components for UI views.
 * Derived classes from <code>ViewGeometry</code> include:</p>
 * <ul>
 * <li><code>{@link GLUI.ViewGeometry.Rect}</code></li>
 * <li><code>{@link GLUI.ViewGeometry.Scale}</code></li>
 * </ul>
 * <p><code>ViewGeometry</code> utilizes the following enumerated constants:</p>
 * <ul>
 * <li><code>{@link GLUI.ViewGeometry.FitMode}</code></li>
 * <li><code>{@link GLUI.ViewGeometry.Gravity}</code></li>
 * </ul>
 */

exports.FitModes = Commands.FitMode;
/**
 * @name GLUI.ViewGeometry.FitMode
 * @class Enumeration for image fit modes in a view.
 * @see GLUI.Commands#FitMode
 */

exports.Gravity = {
    /**
     * @name GLUI.ViewGeometry.Gravity
     * @class Enumeration for image gravity in a view.
     */
    /**
     * Center of gravity is the top-left corner of the image.
     * @fieldof GLUI.ViewGeometry.Gravity.prototype
     * @constant
     */
    TopLeft: [0.0, 0.0],
    /**
     * Center of gravity is the top-center portion of the image.
     * @fieldOf GLUI.ViewGeometry.Gravity.prototype
     * @constant
     */
    TopCenter: [0.5, 0.0],
    /**
     * Center of gravity is the top-right corner of the image.
     * @fieldOf GLUI.ViewGeometry.Gravity.prototype
     * @constant
     */
    TopRight: [1.0, 0.0],
    /**
     * Center of gravity is the left side of the image.
     * @fieldof GLUI.ViewGeometry.Gravity.prototype
     * @constant
     */
    Left: [0.0, 0.5],
    /**
     * Center of gravity is the center of the image.
     * @fieldof GLUI.ViewGeometry.Gravity.prototype
     * @constant
     */
    Center: [0.5, 0.5],
    /**
     * Center of gravity is the right side of the image.
     * @fieldof GLUI.ViewGeometry.Gravity.prototype
     * @constant
     */
    Right: [1.0, 0.5],
    /**
     * Center of gravity is the bottom-left corner of the image.
     * @fieldof GLUI.ViewGeometry.Gravity.prototype
     * @constant
     */
    BottomLeft: [0.0, 1.0],
    /**
     * Center of gravity is the bottom-center portion of the image.
     * @fieldof GLUI.ViewGeometry.Gravity.prototype
     * @constant
     */
    BottomCenter: [0.5, 1.0],
    /**
     * Center of gravity is the bottom-right corner of the image.
     * @fieldof GLUI.ViewGeometry.Gravity.prototype
     * @constant
     */
    BottomRight: [1.0, 1.0]
};

var Scale = Class.singleton( /** @lends GLUI.ViewGeometry.Scale.prototype */
{
    /**
     * @name GLUI.ViewGeometry.Scale
     * @class The <code>Scale</code> class constructs objects that handle view geometry for different scales of measurement.
     * @constructs The default constructor.
     * @augments Core.Class
     */
    initialize: function ()
    {
        var screenUnits = Capabilities.getScreenUnits();
        this.iOSConversion = screenUnits;
        this.pointConversion = this.iOSConversion * 160 / 72;
    },
    Pixels: Commands.Scaling.Pixels,
    Points: Commands.Scaling.Points,
    Unit: Commands.Scaling.Unit,
    Percent: Commands.Scaling.Percent,
    iPhone: Commands.Scaling.iPhone,
    pointConversion: 1.0,
    iOSConversion: 1.0,
    /**
     * Retrieve the supported measurement scale from the device.
     * @param {Number} units The unit of measure.
     * @param {Number} size The screen size of the device.
     * @returns The current screen dimension supported by the device.
     */
    getScale: function (units, size)
    {
        switch (+units)
        {
        case this.Points:
            return this.pointConversion;
        case this.Unit:
            return size;
        case this.Percent:
            return size / 100;
        case this.iPhone:
            return this.iOSConversion;
        }
        return 1.0;
    }
});

var Rect = Class.subclass( /** @lends GLUI.ViewGeometry.Rect.prototype */
{
    /**
     * @name GLUI.ViewGeometry.Rect
     * @class <code>Rect</code> constructs rectangle objects for use as positionable elements in the user interface.
     * @constructs The default constructor.
     * @augments Core.Class
     */
    initialize: function (arg0)
    {
        if (arg0 instanceof this.constructor)
        {
            // Another Rect
            this.x = arg0.x;
            this.y = arg0.y;
            this.w = arg0.w;
            this.h = arg0.h;
        }
        else if (arg0 instanceof Array)
        {
            if (arguments.length === 2 && arguments[0].length >= 2 && arguments[1] instanceof Array && arguments[1].length >= 2)
            {
                this.x = arguments[0][0];
                this.y = arguments[0][1];
                this.w = arguments[1][0];
                this.h = arguments[1][1];
            }
            else if (arguments.length === 1 && arg0.length >= 4)
            {
                this.x = arg0[0];
                this.y = arg0[1];
                this.w = arg0[2];
                this.h = arg0[3];
            }
            else
            {
                console.log("UI.ViewGeometry.Rect initialized with unparseable Array(s)");
            }
        }
        else if (arguments.length === 4)
        {
            this.x = arguments[0];
            this.y = arguments[1];
            this.w = arguments[2];
            this.h = arguments[3];
        }
        return this;
    },
    /**
     * @returns {Boolean} Returns <code>true</code> if any component value is undefined, NaN, or the value indicates this rect has an area of 0 (<i>width</i> * <i>height</i>).
     */
    isEmpty: function ()
    {
        return (this.w * this.h <= 0) || isNaN(this.x) || isNaN(this.y) || isNaN(this.w) || isNaN(this.h);
    },
    /**
     * Copy the component values of this <code>Rect</code>
     * @returns {GLUI.ViewGeometry.Rect} A new <code>Rect</code> with identical component values.
     */
    copy: function ()
    {
        return new(this).constructor(this);
    },
    /**
     * Copy the component values of this <code>Rect</code>
     * @returns {GLUI.ViewGeometry.Rect} A new <code>Rect</code> with identical component values.
     */
    array: function ()
    {
        return [this.x, this.y, this.w, this.h];
    },
    /**
     * Set the dimensions of this <code>Rect</code> as an inset.
     * @example var imageRect = null;
     * var remainingRect = rect.copy();
     * ...
     * imageRect = remainingRect.sliceHorizontal(110).inset(8,15,8,15);
     * @param {Number} t The size for the top of the rectangle.
     * @param {Number} r The size for the right side of the rectangle.
     * @param {Number} b The size for the bottom of the rectangle.
     * @param {Number} l The size for the left side of the rectangle.
     * @param {GLUI.ViewGeometry.Scale} units The unit of measure for the rectangle.
     * @returns {GLUI.ViewGeometry.Rect} This function returns <code>this</code> to support method invocation chaining.
     */
    inset: function (t, r, b, l, units)
    {
        if (arguments.length > 4)
        {
            var xScale = Scale.getScale(units, this.w);
            var yScale = Scale.getScale(units, this.h);
            t = Math.floor(t * yScale);
            r = Math.floor(r * xScale);
            b = Math.floor(b * yScale);
            l = Math.floor(l * xScale);
        }
        if (arguments.length < 2)
        {
            r = t;
        }
        if (arguments.length < 4)
        {
            b = t;
            l = r;
        }
        this.y += t;
        this.h -= t + b;
        this.x += l;
        this.w -= l + r;
        return this;
    },
    /**
     *  Create and return a new <code>Rect</code> representing the top (if positive) or bottom (if negative).
     *  Destructively modifies this Rect, removing the new rect area from the receiver.
     * @example var topPart = rect.inset(10).sliceVertical(50, GLUI.Scale.Percent);
     * @param {Number} height The new rect height.
     * @param {GLUI.ViewGeometry.Scale} [units] The scale of measurement.
     * @returns {GLUI.ViewGeometry.Rect} A new <code>Rect</code> object.<br>
     * @see GLUI.ViewGeometry.Rect#sliceHorizontal
     */
    sliceVertical: function (height, units)
    {
        if (arguments.length > 1)
        {
            height = Math.floor(height * Scale.getScale(units, this.h));
        }
        var newRect = this.copy();
        if (height < 0)
        {
            // Return the bottom area...
            newRect.h = -height;
            this.h += height;
            newRect.y += this.h;
        }
        else
        {
            newRect.h = height;
            this.y += height;
            this.h -= height;
        }
        return newRect;
    },
    /**
     *  Create and return a new <code>Rect</code> representing the left (if positive) or right (if negative).
     *  Destructively modifies this Rect, removing the new rect area from the receiver.
     * @example var imageRect = null;
     * var remainingRect = rect.copy();
     * ...
     * imageRect = remainingRect.sliceHorizontal(110).inset(8,15,8,15);
     * @param {Number} width The new rect width.
     * @param {UI.ViewGeometry.Scale} [units] The scale of measurement.
     * @returns {UI.ViewGeometry.Rect} A new <code>Rect</code> object.<br>
     * @see UI.ViewGeometry.Rect#sliceVertical
     */
    sliceHorizontal: function (width, units)
    {
        if (arguments.length > 1)
        {
            width = Math.floor(width * Scale.getScale(units, this.w));
        }

        var newRect = this.copy();
        if (width < 0)
        {
            newRect.w = -width;
            this.w += width;
            newRect.x += this.w;
        }
        else
        {
            newRect.w = width;
            this.x += width;
            this.w -= width;
        }
        return newRect;
    },
    toString: function ()
    {
        return "Rect: {" + this.array().join(',') + "}";
    },
    /**
     * Retrieve an array of component values for this <code>Rect</code> with rows and columns redistributed evenly.
     * @returns {Array (Number)}
     * @param {Number} rows The rect rows.
     * @param {Number} columns The rect columns.
     * @param {String} flat A one-dimensional array (left to right, top to bottom).
     */
    getGrid: function (rows, columns, flat)
    {
        var i,j;
        flat = (flat === true);
        var cellW = Math.floor(this.w / columns);
        var cellH = Math.floor(this.h / rows);
        var rowSet = [];
        for (i = 0; i < rows; i++)
        {
            var colSet = [];
            for (j = 0; j < columns; j++)
            {
                var r = new this.constructor(this.x + j * cellW, this.y + i * cellH, cellW, cellH);
                (flat ? rowSet : colSet).push(r);
            }
            if (!flat)
            {
                rowSet.push(colSet);
            }
        }
        return rowSet;
    }
});

exports.Scale = Scale;
exports.Rect = Rect;
