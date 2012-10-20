var Core = require('../Core').Core;

exports.Shape = Core.Class.subclass(
/** @lends Physics2.Shape.prototype */
{
	classname: 'Shape',
	
	/**
	 * @class The <code>Shape</code> class is a base class for constructing collision shape objects.
	 * Most properties are identical to <a href="http://www.box2d.org/manual.html">properties of the b2Body</a> class
	 * of <code>Box2d</code>.<br /><br />
	 * <b>Caution!:</b> Do not instantiate this class directly. Use classes derived from <code>Shape</code> for instantiation. This includes:
	 * <ul>
	 * <li>{@link Physics2.BoxShape}</li>
	 * <li>{@link Physics2.CircleShape}</li>
	 * <li>{@link Physics2.PolygonShape}</li>
	 * </ul>
	 * @constructs The default constructor. 
	 * @augments Core.Class
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	initialize: function()
	{
		Core.ObjectRegistry.register(this);
		
		this._isSensor = false;
		this._categoryBits = 0;
		this._maskBits = 0;
		this._groupIndex = 0;
		this._friction = 0;
		this._restitution = 0;
		this._density = 1;
		this._body = null;
		
		this._createSendGen(this.__objectRegistryId);
	},
	
	/**
	 * Destroy this instance and release resources on the backend.
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	destroy: function()
	{
		this._destroySendGen();
		
		Core.ObjectRegistry.unregister(this);
	},
	
	getBody: function()
	{
		return this._body;
	},
	
	/**
	 * Retrieve whether this <code>Shape</code> is a sensor.
	 * @returns {Boolean} Returns <code>true</code> if this shape is a sensor.
	 * @see Physics2.Shape#setIsSensor
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getIsSensor: function()
	{
		return this._isSensor;
	},
	
	/**
	 * Set whether this <code>Shape</code> is a sensor.
	 * @example var shape = new Physics2.PolygonShape();
	 * ...
	 * shape.setIsSensor(true);
	 * @param {Boolean} isSensor Set as <code>true</code> if this shape is a sensor.
	 * @returns {this}
	 * @see Physics2.Shape#getIsSensor
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	setIsSensor: function(isSensor)
	{
		this._isSensor = isSensor;
		this._setIsSensorSendGen(isSensor);
		return this;
	},
	
	/**
	 * Retrieve category collision bits for this <code>Shape</code>.
	 * @returns {Number} The current number of category collision bits.
	 * @see Physics2.Shape#setCategoryBits
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	getCategoryBits: function()
	{
		return this._categoryBits;
	},
	
	/**
	 * Set category collision bits for this <code>Shape</code>.
	 * @example var shape = new Physics2.BoxShape();
	 * ...
	 * shape.setCategoryBits(1);
	 * @param {Number} categoryBits The new number of category collision bits.
	 * @returns {this}
	 * @see Physics2.Shape#getCategoryBits
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	setCategoryBits: function(categoryBits)
	{
		this._categoryBits = categoryBits;
		this._setCategoryBitsSendGen(categoryBits);
		return this;
	},
	
	/**
	 * Retrieve mask collision bits for this <code>Shape</code>.
	 * @returns {Number} The current number of mask collision bits.
	 * @see Physics2.Shape#setMaskBits
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	getMaskBits: function()
	{
		return this._maskBits;
	},
	
	/**
	 * Set mask collision bits for this <code>Shape</code>.
	 * @example var shape = new Physics2.CircleShape();
	 * ...
	 * shape.setMaskBits(1);
	 * @param {Number} maskBits The new number of mask collision bits.
	 * @returns {this}
	 * @see Physics2.Shape#getMaskBits
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	setMaskBits: function(maskBits)
	{
		this._maskBits = maskBits;
		this._setMaskBitsSendGen(maskBits);
		return this;
	},
	
	/**
	 * Retrieve the group collision index for this <code>Shape</code>.
	 * @returns {Number} The current group collision index.
	 * @see Physics2.Shape#setGroupIndex
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	getGroupIndex: function()
	{
		return this._groupIndex;
	},
	
	/**
	 * Set the group collision index for this <code>Shape</code>.
	 * @example var shape = new Physics2.BoxShape();
	 * ...
	 * shape.setGroupIndex(-1);
	 * @param {Number} groupIndex The new group collision index.
	 * @returns {this}
	 * @see Physics2.Shape#getGroupIndex
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	setGroupIndex: function(groupIndex)
	{
		this._groupIndex = groupIndex;
		this._setGroupIndexSendGen(groupIndex);
		return this;
	},
	
	/**
	 * Retrieve the amount of friction applied to this <code>Shape</code>.
	 * @returns {Number} The current amount of friction.
	 * @see Physics2.Shape#setFriction
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getFriction: function()
	{
		return this._friction;
	},
	
	/**
	 * Set the amount of friction applied to this <code>Shape</code>.
	 * @example var shape = new Physics2.PolygonShape();
	 * ...
	 * shape.setFriction(0.1);
	 * @param {Number} [friction=0] The new amount of friction.
	 * @returns {this}
	 * @see Physics2.Shape#getFriction
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setFriction: function(friction)
	{
		this._friction = friction;
		this._setFrictionSendGen(friction);
		return this;
	},
	
	/**
	 * Retrieve the restitution for this <code>Shape</code>.
	 * @returns {Number} The current restitution applied.
	 * @see Physics2.Shape#setRestitution
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getRestitution: function()
	{
		return this._restitution;
	},
	
	/**
	 * Set the restitution for this <code>Shape</code>.
	 * @example var shape = new Physics2.BoxShape();
	 * ...
	 * shape.setRestitution(0.8);
	 * @param {Number} [restitution=0] The new restitution applied.
	 * @returns {this}
	 * @see Physics2.Shape#getRestitution
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setRestitution: function(restitution)
	{
		this._restitution = restitution;
		this._setRestitutionSendGen(restitution);
		return this;
	},
	
	/**
	 * Retrieve the density of this <code>Shape</code>.
	 * @returns {Number} The current density.
	 * @see Physics2.Shape#setDensity
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getDensity: function()
	{
		return this._density;
	},
	
	/**
	 * Set the density of this <code>Shape</code>.
	 * @example var shape = new Physics2.CircleShape();
	 * ...
	 * shape.setDensity(100);
	 * @param {Number} [density=0] The new density.
	 * @returns {this}
	 * @see Physics2.Shape#getDensity
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setDensity: function(density)
	{
		this._density = density;
		this._setDensitySendGen(density);		
		return this;
	},
	
// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 316,
	// Method destroy = 1
	// Method setIsSensor = 2
	// Method setCategoryBits = 3
	// Method setMaskBits = 4
	// Method setGroupIndex = 5
	// Method setFriction = 6
	// Method setRestitution = 7
	// Method setDensity = 8
	
	/** 
	 * Command dispatch.
	 * @private
	 */
	$_commandRecvGen: (function() { var h = (function ( cmd )
	{
		var cmdId = Core.Proc.parseInt( cmd.shift(), 10 );
		
		if( cmdId > 0 )	// Instance Method.
		{
			var instanceId = Core.Proc.parseInt( cmd.shift(), 10 );
			var instance = Core.ObjectRegistry.idToObject( instanceId );
			
			if( ! instance )
			{
				NgLogE("Object instance could not be found for command " + cmd + ". It may have been destroyed this frame.");
				return;
			}
			
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown instance method id " + cmdId + " in Shape._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in Shape._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[316] = h; return h;})(),
	
	/////// Private recv methods.
	
	/////// Private send methods.
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x13c0001, this );
	},
	
	/** @private */
	_setIsSensorSendGen: function( isSensor )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13c0002, this, [ ( isSensor ? 1 : 0 ) ] );
	},
	
	/** @private */
	_setCategoryBitsSendGen: function( categoryBits )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13c0003, this, [ +categoryBits ] );
	},
	
	/** @private */
	_setMaskBitsSendGen: function( maskBits )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13c0004, this, [ +maskBits ] );
	},
	
	/** @private */
	_setGroupIndexSendGen: function( groupIndex )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13c0005, this, [ +groupIndex ] );
	},
	
	/** @private */
	_setFrictionSendGen: function( friction )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13c0006, this, [ +friction ] );
	},
	
	/** @private */
	_setRestitutionSendGen: function( restitution )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13c0007, this, [ +restitution ] );
	},
	
	/** @private */
	_setDensitySendGen: function( density )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13c0008, this, [ +density ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// destroy: function(  ) {}
	
	// setIsSensor: function( isSensor ) {}
	
	// setCategoryBits: function( categoryBits ) {}
	
	// setMaskBits: function( maskBits ) {}
	
	// setGroupIndex: function( groupIndex ) {}
	
	// setFriction: function( friction ) {}
	
	// setRestitution: function( restitution ) {}
	
	// setDensity: function( density ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
