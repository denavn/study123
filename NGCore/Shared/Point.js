var Class = require('./Class').Class;

var setAll = function(x, y)
{
	switch(arguments.length)
	{
		case 0:
			// ()
			this._x = 0;
			this._y = 0;
			break;
		case 1:
			var rhs = arguments[0];
			if(rhs === undefined)
			{
				// (undefined)
				this._x = 0;
				this._y = 0;
			}
			else if(!rhs.hasOwnProperty('length'))
			{
				// (point)
				this._x = rhs.getX();
				this._y = rhs.getY();
			}
			else
			{
				switch(rhs.length)
				{
					case 0:
						// ([])
						this._x = 0;
						this._y = 0;
						break;
					case 1:
						// ([point])
						rhs = rhs[0];
						this._x = rhs.getX();
						this._y = rhs.getY();
						break;
					case 2:
						// ([x, y])
						this._x = rhs[0];
						this._y = rhs[1];
						break;
					default:
						throw new Error('Wrong number of arguments for a Point');
				}
			}
			break;
		case 2:
			// (x, y)
			this._x = arguments[0];
			this._y = arguments[1];
			break;
		default:
			throw new Error('Wrong number of arguments for a Point');
	}
	return this;
};

exports.Point = Class.subclass(
/** @lends Core.Point.prototype */
{
	classname: 'Point',
	
	/**
	 * @class The <code>Point</code> class defines a 2D point coordinate (<i>x</i> and <i>y</i>). 
	 * @status iOS, Android, Flash, Test
	 * @constructs The default constructor.
	 * @example
	 * // All components are set to zero.
	 * var style1 = new Core.Point();
	 * @example
	 * // Copy an existing point.
	 * var style2 = new Core.Point(style1);
	 * @example
	 * // Specify a value for both components.
	 * var style3 = new Core.Point(1.0, 1.0);
	 * @example
	 * // Specify a value for both components.
	 * var style4 = new Core.Point([1.0, 1.0]);
	 * @name Core.Point
	 * @augments Core.Class
	 * @param {Number} [x=0] The <i>x</i> coordinate.
	 * @param {Number} [y=0] The <i>y</i> coordinate.
	 * @throws {Wrong number of arguments for a Point} Number of parameters passed by this call is invalid.
	 * @since 1.0
	 */
	initialize: setAll,
	
	/**
	 * Set the value of both the <i>x</i> and <i>y</i> components. 
	 * @param {Number} [<i>x</i>=0] The new <i>x</i> coordinate.
	 * @param {Number} [<i>y</i>=0] The new <i>y</i> coordinate.
	 * @returns {this}
	 * @see Core.Point for examples of supported calling styles.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setAll: setAll,
	
	/**
	 * Duplicate this <code>Point</code>.
	 * @returns {Core.Point} A new point with identical <i>x</i> and <i>y</i> coordinates to the cloned point.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	clone: function()
	{
		return new this.constructor(this);
	},
	
	/**
	 * Retrieve the value of the <i>x</i> component of this <code>Point</code>.
	 * @returns {Number} The current <i>x</i> coordinate.
	 * @see Core.Point#setX
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getX: function()
	{
		return this._x;
	},
	
	/**
	 * Set the value of the <i>x</i> component for this <code>Point</code>.
	 * @param {Number} <i>x</i> The new <i>x</i> coordinate.
	 * @returns {this}
	 * @see Core.Point#getX
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setX: function(x)
	{
		this._x = x;
		return this;
	},
	
	/**
	 * Retrieve the value of the <i>y</i> component of this <code>Point</code>.
	 * @returns {Number} The current <i>y</i> coordinate.
	 * @see Core.Point#setY
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getY: function()
	{
		return this._y;
	},
	
	/**
	 * Set the value of the <i>y</i> component for this <code>Point</code>.
	 * @param {Number} <i>y</i> The new <i>y</i> coordinate.
	 * @returns {this}
	 * @see Core.Point#getY
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setY: function(y)
	{
		this._y = y;
		return this;
	}
});
