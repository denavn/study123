var Class = require('./Class').Class;
var Point = require('./Point').Point;
var Size = require('./Size').Size;

exports.Rect = Class.subclass(
/** @lends Core.Rect.prototype */
{
	classname: 'Rect',
	
	/**
	 * @class The <code>Rect</code> class constructs a rectangle object that is derived from two values: a point of origin  
	 * and a size.	 
	 * @status iOS, Android, Flash
	 * @constructs The default constructor.
	 * @example
	 * // All components set to zero.
	 * var style1 = new Core.Rect();
	 * @example
	 * // Copy an existing rect.
	 * var style2 = new Core.Rect(style1);
	 * @example
	 * // Specify a point and size.
	 * var style3 = new Core.Rect(new Core.Point(), new Core.Size());
	 * @example
	 * // Specify four components.
	 * var style4 = new Core.Rect(0, 0, 100, 100);
	 * @augments Core.Class
	 * @param {Core.Point} [origin=0] The rectangle point of origin.
	 * @param {Core.Size} [size=0] The rectangle size.
	 * @throws {Wrong number of arguments for a Rect} Number of parameters passed by this call is invalid.
	 * @since 1.0
	 */
	initialize: function(origin, size)
	{
		switch(arguments.length)
		{
			case 0:
				// ()
				this._origin = new Point();
				this._size = new Size();
				break;
			case 1:
				var rhs = arguments[0];
				if(rhs === undefined)
				{
					// (undefined)
					this._origin = new Point();
					this._size = new Size();
				}
				else if(!rhs.hasOwnProperty('length'))
				{
					// (rect)
					this._origin = new Point(rhs.getOrigin());
					this._size = new Size(rhs.getSize());
				}
				else
				{
					switch(rhs.length)
					{
						case 0:
							// ([])
							this._origin = new Point();
							this._size = new Size();
							break;
						case 1:
							// ([rect])
							rhs = rhs[0];
							this._origin = new Point(rhs.getOrigin());
							this._size = new Size(rhs.getSize());
							break;
						case 2:
							// ([point, size])
							// ([[x, y], [width, height]])
							this._origin = new Point(rhs[0]);
							this._size = new Size(rhs[1]);
							break;
						case 4:
							// ([x, y, width, height])
							this._origin = new Point(rhs[0], rhs[1]);
							this._size = new Size(rhs[2], rhs[3]);
							break;
						default:
							throw new Error('Wrong number of arguments for a Rect');
					}
				}
				break;
			case 2:
				// (point, size)
				this._origin = new Point(arguments[0]);
				this._size = new Size(arguments[1]);
				break;
			case 4:
				// (x, y, width, height)
				this._origin = new Point(arguments[0], arguments[1]);
				this._size = new Size(arguments[2], arguments[3]);
				break;
			default:
				throw new Error('Wrong number of arguments for a Rect');
		}
	},
	
	/**
	 * Set the value of all components for this <code>rect</code>. 
	 * @param {Core.Point} [origin=0] The new point of origin.
	 * @param {Core.Size} [size=0] The new rectangle size.
	 * @returns {this}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setAll: function(origin, size)
	{
		this.constructor.apply(this, arguments);
		return this;
	},
	
	/**
	 * Duplicate the point of origin of this <code>rect</code>.
	 * @returns {Core.Point} A new rectangle with an identical origin and size.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	clone: function()
	{
		return new this.constructor(this);
	},
	
	/**
	 * Retrieve the point of origin for this <code>rect</code>.
	 * @returns {Core.Point} The current point of origin.
	 * @see Core.Rect#setOrigin
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getOrigin: function()
	{
		return this._origin;
	},
	
	/**
	 * Set the point of origin for this <code>rect</code>.
	 * @param {Core.Point} origin The new point of origin.
	 * @returns {this}
	 * @see Core.Rect#getOrigin
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setOrigin: function(origin)
	{
		this._origin.setAll(origin);
		return this;
	},
	
	/**
	 * Change the point of origin so that the center of this <code>rect</code> is at the specified location.
	 * @param {Core.Point} origin The new point of origin that results in a rectangle with a center position at the specified location.
	 * @returns {this}
	 * @see Core.Rect#setSizeCentered
	 * @see Core.Rect#setOrigin
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setOriginCentered: function(origin)
	{
		origin = new Core.Point(origin);
		this._origin.setX(origin.getX() - this._size.getWidth()/2);
		this._origin.setY(origin.getY() - this._size.getHeight()/2);
		return this;
	},
	
	/**
	 * Retrieve the size of this <code>rect</code>.
	 * @returns {Core.Size} The current rectangle size.
	 * @see Core.Rect#setSize
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getSize: function()
	{
		return this._size;
	},
	
	/**
	 * Set the size of this <code>rect</code>.
	 * @param {Core.Size} size The new rectangle size.
	 * @returns {this}
	 * @see Core.Rect#getSize
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setSize: function(size)
	{
		this._size.setAll(size);
		return this;
	},
	
	/**
	 * Set the size of this <code>rect</code> and preserve the current center position.
	 * @param {Core.Size} size The new rectangle size that retains the current center position.
	 * @returns {this}
	 * @see Core.Rect#setOriginCentered
	 * @see Core.Rect#setSize
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setSizeCentered: function(size)
	{
		var oldWidth = this._size.getWidth();
		var oldHeight = this._size.getHeight();
		
		this._size.setAll(size);

		this._origin.setX(this._origin.getX() + oldWidth/2 - this._size.getWidth()/2);
		this._origin.setY(this._origin.getY() + oldHeight/2 - this._size.getHeight()/2);
		return this;
	},
	
	/**
	 * Retrieve the minimum value for <i>x</i>. This is represented by the left coordinate.
	 * @returns {Number} The current minimum value of  the <i>x</i> coordinate.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getMinX: function()
	{
		return this._origin.getX();
	},
	
	/**
	 * Retrieve the average of the minimum and maximum <i>x</i> values. This is the middle coordinate.
	 * @returns {Number} The current average of the minimum and maximum <i>x</i> coordinate values. 
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getMidX: function()
	{
		return this._origin.getX() +  this._size.getWidth()/2;
	},
	
	/**
	 * Retrieve the maximum value for <i>x</i>. This is the right coordinate.
	 * @returns {Number} The current maximum value of the <i>x</i> coordinate.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getMaxX: function()
	{
		return this._origin.getX() + this._size.getWidth();
	},
	
	/**
	 * Retrieve the minimum value for <i>y</i>. This is the top coordinate.
	 * @returns {Number} The current minimum value of the <i>y</i> coordinate.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getMinY: function()
	{
		return this._origin.getY();
	},
	
	/**
	 * Retrieve the average of the minimum and maximum <i>y</i> values. This is the middle coordinate.
	 * @returns {Number} The current average of the minimum and maximum <i>y</i> coordinate values.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getMidY: function()
	{
		return this._origin.getY() + this._size.getHeight()/2;
	},
	
	/**
	 * Retrieve the maximum value for <i>y</i>. This is the bottom coordinate.
	 * @returns {Number} The current maximum value of the <i>y</i> coordinate.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getMaxY: function()
	{
		return this._origin.getY() + this._size.getHeight();
	}
});
