var Class = require('./Class').Class;

exports.Vector = Class.subclass(
/** @lends Core.Vector.prototype */
{
	classname: 'Vector',
	
	/**
	 * @class The <code>Vector</code> class constructs objects that define vector point values for the <i>x</i> and <i>y</i> components. 
	 * @constructs The default constructor.
	 * @example
	 * // All components are set to zero.
	 * var style1 = new Core.Vector();
	 * @example
	 * // Copy an existing vector.
	 * var style2 = new Core.Vector(style1);
	 * @example
	 * // Specify a value for both components.
	 * var style3 = new Core.Vector(1.0, 1.0);
	 * @example
	 * // Specify a value for both components.
	 * var style4 = new Core.Vector([1.0, 1.0]);
	 * @augments Core.Class
	 * @param {Number} [x=0] The <i>x</i> component.
	 * @param {Number} [y=0] The <i>y</i> component.
	 * @throws {Error} The number of parameters is invalid.
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	initialize: function()
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
					// (vector)
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
							// ([vector])
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
							throw new Error('Wrong number of arguments for a Vector');
					}
				}
				break;
			case 2:
				// (x, y)
				this._x = arguments[0];
				this._y = arguments[1];
				break;
			default:
				throw new Error('Wrong number of arguments for a Vector');
		}
	},
	
	/**
	 * Set the value of both components for this <code>Vector</code>. 
	 * @param {Number} [x=0] The new <i>x</i> coordinate.
	 * @param {Number} [y=0] The new <i>y</i> coordinate.
	 * @returns {this}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setAll: function()
	{
		this.constructor.apply(this, arguments);
		return this;
	},
	
	/**
	 * Duplicate this <code>Vector</code>.
	 * @returns {Core.Vector} A new vector with identical coordinates to the duplicated vector.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	clone: function()
	{
		return new this.constructor(this);
	},
	
	/**
	 * Retrieve the value of the <i>x</i> component for this <code>Vector</code>.
	 * @returns {Number} The current <i>x</i> coordinate.
	 * @see Core.Vector#setX
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getX: function()
	{
		return this._x;
	},
	
	/**
	 * Set the value of the <i>x</i> component for this <code>Vector</code>.
	 * @param {Number} <i>x</i> The new <i>x</i> coordinate.
	 * @returns {this}
	 * @see Core.Vector#getX
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setX: function(x)
	{
		this._x = x;
		return this;
	},
	
	/**
	 * Retrieve the value of the <i>y</i> component for this <code>Vector</code>.
	 * @returns {Number} The current <i>y</i> coordinate.
	 * @see Core.Vector#setY
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getY: function()
	{
		return this._y;
	},
	
	/**
	 * Set the value of the <i>y</i> component for this <code>Vector</code>.
	 * @param {Number} <i>y</i> The new <i>y</i> coordinate.
	 * @returns {this}
	 * @see Core.Vector#getY
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setY: function(y)
	{
		this._y = y;
		return this;
	}
});
