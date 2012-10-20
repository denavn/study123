var Class = require('../Core/Class').Class;
var Commands = require('./Commands').Commands;
var Capabilities = require('../Core/Capabilities').Capabilities;

/**
 * The `UI.ViewGeometry` namespace includes a collection of classes and objects that control spatial
 * components for UI views. Classes that belong to `UI.ViewGeometry` include:
 * 
 * + `{@link UI.ViewGeometry.Rect}`
 * + `{@link UI.ViewGeometry.Scale}`
 * 
 * `UI.ViewGeometry` also includes the following enumerated constants:
 * 
 * + `{@link UI.ViewGeometry#FitMode}`
 * + `{@link UI.ViewGeometry#Gravity}`
 * @name UI.ViewGeometry
 * @namespace
 * @description
 */

var ViewGeometry = exports.ViewGeometry = {};

var Scale = ViewGeometry.Scale = exports.Scale = Class.singleton(
/** @lends UI.ViewGeometry.Scale.prototype */
{
	/**
	 * @name UI.ViewGeometry.Scale
	 * @class The `UI.ViewGeometry.Scale` class is a singleton that provides scaling factors for
	 * modifying the size of a view rectangle.
	 * @singleton
	 * @augments Core.Class
	 */
	initialize: function() {
		var screenUnits = Capabilities.getScreenUnits();
		this.iOSConversion = screenUnits;
		this.pointConversion = this.iOSConversion * 160 / 72; 
	},

	// Use the values of generated constants... Mostly for if we need to send these to native in the future.
	Pixels: Commands.Scaling.Pixels,
	Points: Commands.Scaling.Points,
	Unit: Commands.Scaling.Unit,
	Percent: Commands.Scaling.Percent,
	iPhone: Commands.Scaling.iPhone,
	
	// Internals.
    
	pointConversion: 1.0,
    
	iOSConversion: 1.0,

    /** 
     * Retrieve a scaling factor that can be used when modifying the size of a view rectangle.
     * @param {UI.Commands#Scaling} units The unit of measure.
     * @param {Number} size The width or height, in pixels, of the device's screen. Use the width
	 *		when modifying a view rectangle's width and the height when modifying a view rectangle's
	 *		height.
     * @returns {Number} The scaling factor.
     * @since 1.0
     */
	getScale: function(units, size) {
		switch (+units) {
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

/** 
 * Enumeration for image or text gravity in a view. The values in this enumeration can be assigned 
 * to the `imageGravity`, `textGravity`, or `titleGravity` property for any `UI` class that accepts
 * these properties.
 * @name Gravity
 * @fieldOf UI.ViewGeometry#
 */
var Gravity = ViewGeometry.Gravity = exports.Gravity = 

{
	/**
	 * Center of gravity is the top-left corner of the view.
	 * @name Gravity.TopLeft
	 * @fieldOf UI.ViewGeometry#
	 * @constant
	 */
	TopLeft: [0.0,0.0],
	
	/** 
	 * Center of gravity is the top-center portion of the view. 
	 * @name Gravity.TopCenter
	 * @fieldOf UI.ViewGeometry#
	 * @constant
	 */
	TopCenter: [0.5,0.0],
	
	/** 
	 * Center of gravity is the top-right corner of the view. 
	 * @name Gravity.TopRight
	 * @fieldOf UI.ViewGeometry#
	 * @constant
	 */
	TopRight: [1.0, 0.0],
	
	/** 
	 * Center of gravity is the left side of the view. 
	 * @name Gravity.Left
	 * @fieldOf UI.ViewGeometry#
	 * @constant
	 */
	Left: [0.0,0.5],
	
	/** 
	 * Center of gravity is the center of the view. 
	 * @name Gravity.Center
	 * @fieldOf UI.ViewGeometry#
	 * @constant
	 */
	Center: [0.5,0.5],
	
	/** 
	 * Center of gravity is the right side of the view. 
	 * @name Gravity.Right
	 * @fieldOf UI.ViewGeometry#
	 * @constant
	 */
	Right: [1.0,0.5],
	
	/** 
	 * Center of gravity is the bottom-left corner of the view. 
	 * @name Gravity.BottomLeft
	 * @fieldOf UI.ViewGeometry#
	 * @constant
	 */
	BottomLeft: [0.0,1.0],
	
	/** 
	 * Center of gravity is the bottom-center portion of the view. 
	 * @name Gravity.BottomCenter
	 * @fieldOf UI.ViewGeometry#
	 * @constant
	 */
	BottomCenter: [0.5,1.0],
	
	/** 
	 * Center of gravity is the bottom-right corner of the view. 
	 * @name Gravity.BottomRight
	 * @fieldOf UI.ViewGeometry#
	 * @constant
	 */
	BottomRight: [1.0,1.0]
};

 
var FitModes = ViewGeometry.FitModes = exports.FitModes = Commands.FitMode;
 
/** 
 * Enumeration for different ways to fit an image within a view. The image is resized relative to 
 * the size of the view, minus any insets that have been applied to the view.
 * @name FitMode
 * @fieldOf UI.ViewGeometry#
 */

/**
 * The image is not scaled.
 * @name FitMode.None
 * @fieldOf UI.ViewGeometry#
 * @constant
 */

/**
 * The image is proportionally scaled to fit completely within the view. If the image is smaller
 * than the size of the view, it is upscaled to fill either the width or height of the view.
 * @name FitMode.Inside
 * @fieldOf UI.ViewGeometry#
 * @constant
 */
 
/**
 * The image is proportionally scaled to fill the entire view, clipping any part of the image that
 * does not fit within the view.
 * @name FitMode.Fill
 * @fieldOf UI.ViewGeometry#
 * @constant
 */
 
/**
 * The image is non-proportionally scaled to fill the entire view.
 * @name FitMode.Stretch
 * @fieldOf UI.ViewGeometry#
 * @constant
 */

/**
 * The image is proportionally scaled to fill the entire width of the view, clipping any part of the
 * image that does not fit within the view.
 * @name FitMode.AspectWidth
 * @fieldOf UI.ViewGeometry#
 * @constant
 */

/**
 * The image is proportionally scaled to fill the entire height of the view, clipping any part of 
 * the image that does not fit within the view.
 * @name FitMode.AspectHeight
 * @fieldOf UI.ViewGeometry#
 * @constant
 */

/**
 * The image is scaled down proportionally to fit within the view. If the image is smaller than
 * the size of the view, the image is displayed at its actual size, with no upscaling.
 * @name FitMode.InsideNoUpscaling
 * @fieldOf UI.ViewGeometry#
 * @constant
 */

	
var Rect = ViewGeometry.Rect = exports.Rect = Class.subclass(
/** @lends UI.ViewGeometry.Rect.prototype */
{
	/**
	 * @name UI.ViewGeometry.Rect
	 * @class The `UI.ViewGeometry.Rect` class constructs objects that represent a rectangular
	 * portion of the device's screen. Use these objects to position a user interface's components.
	 *
	 * The constructor must specify the view rectangle's point of origin, width, and height. Your
	 * application can pass these parameters to the constructor in any of the following formats:
	 *
	 * 1. Four individual integers that represent the following, measured in pixels:
	 *     1. The location of the rectangle's upper left corner along the X axis.
	 *     2. The location of the rectangle's upper left corner along the Y axis.
	 *     3. The width of the rectangle.
	 *     4. The height of the rectangle.
	 * 2. An array that contains the four integers described above.
	 * 3. Two arrays of integers. The first array contains the first and second integers described
	 * above. The second array contains the third and fourth integers described above.
	 * 4. A `UI.ViewGeometry.Rect` object.
	 * @constructs Create a view rectangle.
	 * @augments Core.Class
	 * @example
	 * // Create a view rectangle by passing in an array of four integers.
	 * var rect = new UI.ViewGeometry.Rect([0, 0, 100, 50]);
	 * @example
	 * // Create a view rectangle by passing in two arrays.
	 * var rect = new UI.ViewGeometry.Rect([0, 0], [100, 50]);
	 * @example
	 * // Create a view rectangle by passing in another view rectangle.
	 * var rect1 = new UI.ViewGeometry.Rect([0, 0, 100, 50]);
	 * var rect2 = new UI.ViewGeometry.Rect(rect1);
	 * @param {Number|Number[]|UI.ViewGeometry.Rect} arg0 The rectangle's point of origin, width,
	 *		and height in one of the formats specified above.
	 * @since 1.0
	 */
    initialize: function(arg0)
    {
    	if (arg0 instanceof this.constructor){
    		// Another Rect
    		this.x = arg0.x;
    		this.y = arg0.y;
    		this.w = arg0.w;
    		this.h = arg0.h;
    	} else if (arg0 instanceof Array) {
    		if (arguments.length == 2 
    			&& arguments[0].length >= 2 
    			&& arguments[1] instanceof Array 
    			&& arguments[1].length >= 2) {
				
				// Arguments can be two arrays, one of which is a point and one of which is a size,
				this.x = arguments[0][0];
				this.y = arguments[0][1];
				this.w = arguments[1][0];
				this.h = arguments[1][1];
			}
			else if (arguments.length == 1 && arg0.length >= 4) {
				// Single Array
				this.x = arg0[0];
				this.y = arg0[1];
				this.w = arg0[2];
				this.h = arg0[3];
			}
			else {
				NgLogD("UI.ViewGeometry.Rect initialized with unparseable Array(s)");
			}
		} else if (arguments.length == 4) {
			// Four numbers
			this.x = arguments[0];
			this.y = arguments[1];
			this.w = arguments[2];
			this.h = arguments[3];
		}
		return this;
    },
	/**
	 * Determine whether the view rectangle is missing one of its component values or has an area of
	 * 0.
	 * @example
	 * // Create a view rectangle with a height of 0.
	 * var rect = new UI.ViewGeometry.Rect([0, 0, 100, 0]);
	 * // Verify that the view rectangle is empty.
	 * if (rect.isEmpty()) {
	 *     console.log("Empty view rectangle");
	 * }
	 * @returns {Boolean} Set to `true` if any component value is missing or if the view rectangle
	 *		has an area of 0.
	 * @since 1.0
	 */
	isEmpty: function(){
		return (this.w * this.h <= 0) || isNaN(this.x) || isNaN(this.y) || isNaN(this.w) || isNaN(this.h);
	},
	/**
	 * Create a new view rectangle with the same point of origin, width, and height as the existing
	 * view rectangle.
	 * @example
	 * // Create a new view rectangle based on an existing view rectangle.
	 * var rect1 = new UI.ViewGeometry.Rect([0, 0, 100, 50]);
	 * var rect2 = rect1.copy();
	 * @returns {UI.ViewGeometry.Rect} A new view rectangle with the same point of origin, width,
	 *		and height.
	 * @since 1.0
	 */	
	copy: function() {
		return new (this).constructor(this);
	},
    /**
	 * Retrieve the view rectangle's point of origin, width, and height.
	 * @returns {Number[]} An array of integers specifying the view rectangle's X origin, Y origin,
	 *		width, and height.
	 * @since 1.0
	 */	
	array: function() {
		return [this.x, this.y, this.w, this.h];
	},
	
	/**
	 * Replace the view rectangle with an inset of the existing rectangle. The inset will be created
	 * only on the top and right sides of the view rectangle.
	 * @function
	 * @example
	 * // Create a view rectangle, then add a top and right inset of 10 pixels.
	 * var rect = new UI.ViewGeometry.Rect([0, 0, 100, 50]);
	 * rect.inset(10);
	 * @param {Number} tr The inset, in pixels, for the top and right sides of the view rectangle.
	 * @returns {this}
	 * @since 1.0
	 */
	inset: function(t, r, b, l, units) {
		if (arguments.length > 4) {
			var xScale = Scale.getScale(units, this.w);
			var yScale = Scale.getScale(units, this.h);
			t = Math.floor(t * yScale);
			r = Math.floor(r * xScale);
			b = Math.floor(b * yScale);
			l = Math.floor(l * xScale);
		}
		
		if (arguments.length < 2) {
			r = t;
		}
		if (arguments.length < 4) {
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
	 * Replace the view rectangle with an inset of the existing rectangle. The first parameter
	 * represents the top and bottom inset, and the second parameter represents the left and right
	 * inset.
	 * @name inset^2
	 * @function
	 * @memberOf UI.ViewGeometry.Rect#
	 * @example
	 * // Create a view rectangle, then add a top and bottom inset of 10 pixels
	 * // and a left and right inset of 15 pixels.
	 * var rect = new UI.ViewGeometry.Rect([0, 0, 100, 50]);
	 * rect.inset(10, 15);
	 * @param {Number} tb The inset, in pixels, for the top and bottom of the view rectangle.
	 * @param {Number} lr The inset, in pixels, for the left and right sides of the view rectangle.
	 * @returns {this}
	 * @since 1.0
	 */
	/**
	 * Replace the view rectangle with an inset of the existing rectangle, specifying the inset for
	 * each side of the rectangle. If you include the `units` parameter, the inset will be scaled
	 * based on the value you specify.
	 * @name inset^3
	 * @function
	 * @memberOf UI.ViewGeometry.Rect#
	 * @example
	 * // Create a view rectangle, then add a top inset of 10 pixels, a right
	 * // inset of 5 pixels, a bottom inset of 20 pixels, and a left inset of
	 * // 15 pixels.
	 * var rect = new UI.ViewGeometry.Rect([0, 0, 100, 50]);
	 * rect.inset(10, 5, 20, 15);
	 * @param {Number} t The inset, in pixels, for the top of the view rectangle.
	 * @param {Number} r The inset, in pixels, for the right side of the view rectangle.
	 * @param {Number} b The inset, in pixels, for the bottom of the view rectangle.
	 * @param {Number} l The inset, in pixels, for the left side of the view rectangle.
	 * @param {UI.Commands#Scaling} [units] The scaling factor that will be used to adjust the
	 *		specified insets. By default, the inset is not scaled.
	 * @returns {this}
	 * @see UI.Commands#Scaling
	 * @since 1.0
	 */   
	
   /**
	 * Create a new view rectangle by removing a horizontal slice from the top or bottom of an
	 * existing view rectangle. If you include the `units` parameter, the slice's height will be 
	 * scaled based on the value you specify.
	 *
	 * **Note**: This method is called `sliceVertical()` because it modifies the rectangle's height
	 * along the vertical (Y) axis.
	 * @example
	 * // Create a view rectangle that is 50 pixels tall, and remove a 20-pixel-tall
	 * // horizontal slice from the top of the rectangle.
	 * var mainRect = new UI.ViewGeometry.Rect([0, 0, 100, 50]);
	 * var sliceRect = mainRect.sliceVertical(20);
	 * var mainRectInfo = mainRect.array();  // mainRectInfo == [0, 20, 100, 30]
	 * var sliceRectInfo = sliceRect.array();  // sliceRectInfo == [0, 0, 100, 20]
	 * @param {Number} height The height, in pixels, of the slice to remove from the existing view
	 *		rectangle. Use a positive value to remove the top of the existing rectangle and a
	 *		negative value to remove the bottom of the existing rectangle.
	 * @param {UI.Commands#Scaling} [units] The scaling factor that will be used to adjust the 
	 *		specified height. By default, the height is not scaled.
	 * @returns {UI.ViewGeometry.Rect} The new view rectangle that was sliced from the existing
	 *		view rectangle.
	 * @see UI.ViewGeometry.Rect#sliceHorizontal
	 * @since 1.0
	 */	
	sliceVertical: function(height, units) {
		if (arguments.length > 1) height = Math.floor(height * Scale.getScale(units, this.h));
		
		var newRect = this.copy();
		if (height < 0) {
			// Return the bottom area...
			newRect.h = -height;
			this.h += height;
			newRect.y += this.h;
		} else {
			newRect.h = height;
			this.y += height;
			this.h -= height;
		}
		return newRect;
	},
    /**
	 * Create a new view rectangle by removing a vertical slice from the left or right side of an
	 * existing view rectangle. If you include the `units` parameter, the slice's width will be 
	 * scaled based on the value you specify.
	 *
	 * **Note**: This method is called `sliceHorizontal()` because it modifies the rectangle's width
	 * along the horizontal (X) axis.
	 * @example
	 * // Create a view rectangle that is 100 pixels wide, and remove a 10-pixel-wide
	 * // vertical slice from the left side of the rectangle.
	 * var mainRect = new UI.ViewGeometry.Rect([0, 0, 100, 50]);
	 * var sliceRect = mainRect.sliceHorizontal(10);
	 * var mainRectInfo = mainRect.array();  // mainRectInfo is [10, 0, 90, 50]
	 * var sliceRectInfo = sliceRect.array();  // sliceRectInfo is [0, 0, 10, 50]
	 * @param {Number} width The width, in pixels, of the slice to remove from the existing view
	 *		rectangle. Use a positive value to remove the left side of the existing rectangle and a
	 *		negative value to remove the right side of the existing rectangle.
	 * @param {UI.Commands#Scaling} [units] The scaling factor that will be used to adjust the 
	 *		specified width. By default, the width is not scaled.
	 * @returns {UI.ViewGeometry.Rect} The new view rectangle that was sliced from the existing
	 *		view rectangle.
	 * @see UI.ViewGeometry.Rect#sliceVertical
	 * @since 1.0
	 */	
	sliceHorizontal: function(width, units) {
		if (arguments.length > 1) width = Math.floor(width * Scale.getScale(units, this.w));

		var newRect = this.copy();
		if (width < 0) {
			newRect.w = -width;
			this.w += width;
			newRect.x += this.w;
		} else {
			newRect.w = width;
			this.x += width;
			this.w -= width;
		}
		return newRect;
	},

	toString: function() {
		return "Rect: {" + this.array().join(',') + "}";
	},

	/**
	 * Divide an existing view rectangle into a grid, with evenly spaced columns and rows, and
	 * retrieve an array of new view rectangles that represent each cell in the grid. The existing
	 * view rectangle is not modified.
	 *
	 * **Note**: The width and height of each grid cell are rounded to an integer. As a result, the
	 * grid cells may cover a slightly smaller area than the existing view rectangle.
	 * @example
	 * // Create a view rectangle that is 60 pixels wide and 20 pixels high.
	 * var rect = new UI.ViewGeometry.Rect([0, 0, 60, 20]);
	 * // Divide the rectangle into two rows and three columns. Retrieve the grid
	 * // cells in the following format:
	 * // [ [ {row1col1}, {row1col2}, {row1col3} ], [ {row2col1}, {row2col2}, {row2col3} ] ]
	 * var cells = rect.getGrid(2, 3, false);
	 * // Divide the rectangle into two rows and three columns. Retrieve the grid
	 * // cells in the following format:
	 * // [ {row1col1}, {row1col2}, {row1col3}, {row2col1}, {row2col2}, {row2col3} ]
	 * var flatCells = rect.getGrid(2, 3, true);
	 * @param {Number} rows The number of rows in the grid.
	 * @param {Number} columns The number of columns in the grid.
	 * @param {Boolean} flat Set to `true` to retrieve a flat array of grid cells, ordered from left
	 *		to right along each row, starting with the top row and ending with the bottom row. Set
	 *		to `false` to retrieve an array that contains multiple child arrays; the child arrays
	 *		start with the top row and end with the bottom row, and each child array contains the
	 *		grid cells from a single row, ordered from left to right.
	 * @returns {Array[]|UI.ViewGeometry.Rect[]} An array of grid cells, in the format specified by
	 *		the `flat` parameter.
	 * @since 1.0
	 */
	getGrid: function(rows, columns, flat) {
		// Return an array of this rect divided equally into columns and rows.
		flat = (flat === true);
		var cellW = Math.floor(this.w / columns);
		var cellH = Math.floor(this.h / rows);
		
		var rowSet = [];
		for (var i = 0; i < rows; i++) {
			var colSet = [];
			for (var j = 0; j < columns; j++) {
				var r = new this.constructor(this.x + j * cellW, this.y + i * cellH, cellW, cellH);
				(flat ? rowSet : colSet).push(r);
			}
			if (!flat) rowSet.push(colSet);
		}
		return rowSet;
	}
});
