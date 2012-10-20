var Class = require('./Class').Class;

exports.Color = Class.subclass(
/** @lends Core.Color.prototype */
{
	classname: 'Color',
	
	/**
	 * @class The <code>Color</code> class constructs objects that control the RGB components of a device. 
	 * RGB is a color model used for rendering objects on-screen and is derived 
	 * from the three primary colors used in the model: red, green, and blue.
	 * Each value ranges from <code>(0-1)</code> and determines the color saturation level.	 
	 * @constructs The default constructor.
	 * @example
	 * // Create a new color with all components set to one (1 = white).
	 * var style1 = new Core.Color();
	 * @example
	 * // Copy an existing color.
	 * var style2 = new Core.Color(style1);
	 * @example
	 * // Specify all three components.
	 * var style3 = new Core.Color(1.0, 1.0, 1.0);
	 * @example
	 * // Specify the color as solid blue.
	 * var style4 = new Core.Color([0, 0, 1.0]);
	 * @example
	 * // Specify the color as solid red.
	 * var style5 = new Core.Color([1.0, 0, 0]);
	 * @example
	 * // Specify the color as a dark shade of red.
	 * var style6 = new Core.Color([.5, 0, 0]);
	 * @augments Core.Class
	 * @param {Number} [red=1] The red component.
	 * @param {Number} [green=1] The green component.
	 * @param {Number} [blue=1] The blue component.
	 * @throws {Wrong number of arguments for a Color} Number of parameters passed by this call is invalid.
	 * @since 1.0
	 */
	initialize: function(red, green, blue)
	{
		switch(arguments.length)
		{
			case 0:
				// ()
				this._red = 1.0;
				this._green = 1.0;
				this._blue = 1.0;
				break;
			case 1:
				var rhs = arguments[0];
				if(rhs === undefined)
				{
					// (undefined)
					this._red = 1.0;
					this._green = 1.0;
					this._blue = 1.0;
				}
				else if(!rhs.hasOwnProperty('length'))
				{
					// (color)
					this._red = rhs.getRed();
					this._green = rhs.getGreen();
					this._blue = rhs.getBlue();
				}
				else
				{
					switch(rhs.length)
					{
						case 0:
							// ([])
							this._red = 1.0;
							this._green = 1.0;
							this._blue = 1.0;
							break;
						case 1:
							// ([color])
							rhs = rhs[0];
							this._red = rhs.getRed();
							this._green = rhs.getGreen();
							this._blue = rhs.getBlue();
							break;
						case 3:
							// ([red, green, blue])
							this._red = rhs[0];
							this._green = rhs[1];
							this._blue = rhs[2];
							break;
						default:
							throw new Error('Wrong number of arguments for a Color');
					}
				}
				break;
			case 3:
				// (red, gree, blue)
				this._red = arguments[0];
				this._green = arguments[1];
				this._blue = arguments[2];
				break;
			default:
				throw new Error('Wrong number of arguments for a Color');
		}
		return this;
	},
	
	/**
	 * Set the saturation level for all three color components.
	 * @example Core.Color.setAll(0.5, 0.5, 1.0);
	 * @param {Number} [red=1] The red component.
	 * @param {Number} [green=1] The green component.
	 * @param {Number} [blue=1] The blue component.
	 * @returns {this}
	 * @see Core.Color for a full list of supported calling styles.
	 * @since 1.0
	 */
	setAll: function(red, green, blue)
	{
		this.constructor.apply(this, arguments);
		return this;
	},
	
	/**
	 * Retrieve the saturation level for the red component of this <code>Color</code>.
	 * @returns {Number} The current saturation level for the red component.
	 * @since 1.0
	 */
	getRed: function()
	{
		return this._red;
	},
	
	/**
	 * Retrieve the saturation level for the green component of this <code>Color</code>.
	 * @returns {Number} The current saturation level for the green component.
	 * @since 1.0
	 */
	getGreen: function()
	{
		return this._green;
	},
	
	/**
	 * Retrieve the saturation level for the blue component of this <code>Color</code>.
	 * @returns {Number} The current saturation level for the blue component.
	 * @since 1.0
	 */
	getBlue: function()
	{
		return this._blue;
	},
	
	/**
	 * Set the saturation level for the red component of this <code>Color</code>.
	 * @example Core.Color.setRed(0.7);
	 * @param {Number} red The new saturation level for the red component.
	 * @returns {this}
	 * @see Core.Color#getRed
	 * @since 1.0
	 */
	setRed: function(red)
	{
		this._red = red;
		return this;
	},
	
	/**
	 * Set the saturation level for the green component of this <code>Color</code>.
	 * @example Core.Color.setGreen(0.3);
	 * @param {Number} green The new saturation level for the green component.
	 * @returns {this}
	 * @see Core.Color#getGreen
	 * @since 1.0
	 */
	setGreen: function(green)
	{
		this._green = green;
		return this;
	},
	
	/**
	 * Set the saturation level for the blue component of this <code>Color</code>.
	 * @example Core.Color.setBlue(1.0);
	 * @param {Number} blue The new saturation level for the blue component.
	 * @returns {this}
	 * @see Core.Color#getBlue
	 * @since 1.0
	 */
	setBlue: function(blue)
	{
		this._blue = blue;
		return this;
	}
});
