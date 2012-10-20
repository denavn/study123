var Class = require('./Class').Class;

exports.Size = Class.subclass(
/** @lends Core.Size.prototype */
{
	classname: 'Size',
	
	/**
	 * @class The <code>Size</code> class constructs objects that define size values for the <i>height</i> and <i>width</i> components. 
	 * @status iOS, Android, Flash
	 * Supported values range between <code>(0-1)</code>.
	 * @constructs The default constructor.
	 * @example
	 * // Set both component values to 0.
	 * var style1 = new Core.Size();
	 * @example
	 * // Copy an existing size.
	 * var style2 = new Core.Size(style1);
	 * @example
	 * // Specify a value for both components.
	 * var style3 = new Core.Size(1.0, 1.0);
	 * @example
	 * // Specify a value for both components.
	 * var style4 = new Core.Size([1.0, 1.0]);
	 * @augments Core.Class
	 * @param {Number} [width=0] The <i>width</i> component.
	 * @param {Number} [height=0] The <i>height</i> component.
	 * @since 1.0
	 */
	initialize: function(width, height)
	{
		switch(arguments.length)
		{
			case 0:
				// ()
				this._width = 0;
				this._height = 0;
				break;
			case 1:
				var rhs = arguments[0];
				if(rhs === undefined)
				{
					// (undefined)
					this._width = 0;
					this._height = 0;
				}
				else if(!rhs.hasOwnProperty('length'))
				{
					// (size)
					this._width = rhs.getWidth();
					this._height = rhs.getHeight();
				}
				else
				{
					switch(rhs.length)
					{
						case 0:
							// ([])
							this._width = 0;
							this._height = 0;
							break;
						case 1:
							// ([size])
							rhs = rhs[0];
							this._width = rhs.getWidth();
							this._height = rhs.getHeight();
							break;
						case 2:
							// ([x, y])
							this._width = rhs[0];
							this._height = rhs[1];
							break;
						default:
							throw new Error('Wrong number of arguments for a Size');
					}
				}
				break;
			case 2:
				// (x, y)
				this._width = arguments[0];
				this._height = arguments[1];
				break;
			default:
				throw new Error('Wrong number of arguments for a Size');
		}
	},
	
	/**
	 * Set the value of all components for this <code>Size</code>. 
	 * @param {Number} [width=0] The new <i>width</i>.
	 * @param {Number} [height=0] The new <i>height</i>.
	 * @throws {Wrong number of arguments for a Size} Number of parameters passed by this call is invalid.
	 * @returns {this}
	 * @see Core.Size for examples of supported calling styles.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setAll: function(width, height)
	{
		this.constructor.apply(this, arguments);
		return this;
	},
	
	/**
	 * Duplicate this <code>Size</code>.
	 * @returns {Core.Size} A new size with identical <i>height</i> and <i>width</i> components.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	clone: function()
	{
		return new this.constructor(this);
	},
	
	/**
	 * Retrieve the value of the <i>width</i> component for this <code>Size</code>.
	 * @returns {Number} The current <i>width</i>.
	 * @see Core.Size#setWidth
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getWidth: function()
	{
		return this._width;
	},
	
	/**
	 * Set the value of the <i>width</i> component for this <code>Size</code>.
	 * @param {Number} width The new <i>width</i>.
	 * @returns {this}
	 * @see Core.Size#getWidth
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setWidth: function(width)
	{
		this._width = width;
		return this;
	},
	
	/**
	 * Retrieve the value of the <i>height</i> component for this <code>Size</code>.
	 * @returns {Number} The current <i>height</i>.
	 * @see Core.Size#setHeight
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getHeight: function()
	{
		return this._height;
	},
	
	/**
	 * Set the value of the <i>height</i> component for this <code>Size</code>.
	 * @param {Number} height The new <i>height</i>.
	 * @returns {this}
	 * @see Core.Size#getHeight
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setHeight: function(height)
	{
		this._height = height;
		return this;
	}
});
