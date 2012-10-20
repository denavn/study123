var Core = require('../Core').Core;

/**
 * @class The <code>Contact</code> class constructs objects that store information about collisions that occur between two bodies (see <code>{@link Physics2.Body}</code>).
 * @name Physics2.Contact
 * @augments Core.Class
 * @status iOS, Android, Flash
 */
exports.Contact = Core.Class.subclass(
/** @lends Physics2.Contact.prototype */
{
	classname: 'Contact',
	
	/**
	 * Retrieve the contact type for this <code>Contact</code>.
	 * @returns {Physics2.Body#ContactFlags} The current contact type.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getType: function()
	{
		return this._type;
	},
	
	/**
	 * Retrieve the first collision shape for this <code>Contact</code>.
	 * @returns {Physics2.Shape} The first collision shape.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getShapeA: function()
	{
		return this._shapeA;
	},
	
	/**
	 * Retrieve the second collision shape for this <code>Contact</code>.
	 * @returns {Physics2.Shape} The second collision shape.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getShapeB: function()
	{
		return this._shapeB;
	},
	
	/**
	 * Retrieve the timestamp of a collision for this <code>Contact</code> (expressed in milliseconds).
	 * @returns {Number} The current timestamp.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getTimestamp: function()
	{
		return this._timestamp;
	},
		
	/**
	 * Retrieve the normal force for this <code>Contact</code>.
	 * @returns {Core.Vector} The normal force applied to a collision between two bodies.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getNormal: function()
	{
		return this._normal;
	},
	
	/**
	 * Retrieve the number of collision locations for this <code>Contact</code>.
	 * @returns {Number} The current number of collision locations.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getLocationCount: function()
	{
		return this._locations.length;
	},
	
	/**
	 * Retrieve a collision location at a specific index.
	 * @param {Number} index The specified index.
	 * @returns {Physics2.Contact.Location} The current collision location.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getLocation: function(index)
	{
		return this._locations[index];
	},
	
	/**
	 * @class <code>Location</code> objects store the location of a single point of contact.
	 * @name Physics2.Contact.Location
	 * @augments Core.Class
	 */
	$Location: Core.Class.subclass(
	/** @lends Physics2.Contact.Location.prototype */
	{
		/**
		 * Retrieve the position of this <code>Contact</code>.
		 * @returns {Core.Point} The position.
		 * @see Physics2.Contact
	 	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
		 * @since 1.0
		 */
		getPosition: function()
		{
			return this._position;
		},
		
		/**
		 * Retrieve the impulse that is in the direction of the contact normal.
		 * @returns {Number} The normal impulse.
		 * @see Physics2.Contact
		 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 	 * @since 1.0
		 */
		getNormalImpulse: function()
		{
			return this._normalImpulse;
		},
		
		/**
		 * Retrieve the impulse that is a tangent to the contact normal.
		 * @returns {Number} The tangent impulse.
		 * @see Physics2.Contact
		 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 	 * @since 1.0
		 */
		getTangentImpulse: function()
		{
			return this._tangentImpulse;
		}
	})
});
