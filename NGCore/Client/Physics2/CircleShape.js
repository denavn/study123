var Shape = require('./Shape').Shape;

exports.CircleShape = Shape.subclass(
/** @lends Physics2.CircleShape.prototype */
{
	classname: 'CircleShape',
	
	/**
	 * @class The <code>CircleShape</code> class constructs objects that define the collision circle shape.
	 * @constructs The default constructor. 
	 * @augments Physics2.Shape
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	initialize: function()
	{
		this._position = new Core.Point();
		this._radius = 0;
	},
	
	/**
	 * Destroy this instance and release resources on the backend.
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	destroy: function()
	{
	},
	
	/**
	 * Retrieve the position of this <code>CircleShape</code>.
	 * @returns {Core.Point} The current position.
	 * @see Physics2.CircleShape#setPosition
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getPosition: function()
	{
		return this._position;
	},
	
	/**
	 * Set the position for this <code>CircleShape</code>.
	 * @example var circle = new Physics2.CircleShape();
	 * circle.setPosition(0, Core.Capabilities.getScreenHeight());
	 * @param {Core.Point} [position=(0, 0)] The new position.
	 * @returns {this}
	 * @see Physics2.CircleShape#getPosition
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setPosition: function(position)
	{
		var p = this._position;
		p.setAll.apply(p, arguments);
		this._setPositionSendGen(p.getX(),p.getY());
		return this;
	},
	
	/**
	 * Retrieve the radius for this <code>CircleShape</code>.
	 * @returns {Number} The current radius.
	 * @see Physics2.CircleShape#setRadius
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getRadius: function()
	{
		return this._radius;
	},
	
	/**
	 * Set the radius for this <code>CircleShape</code>.
	 * @example function makeCircle(position, radius)
	 * ...
	 * var circle = new Physics2.CircleShape();
	 * circle.setRadius(radius);
	 * @param {Number} [radius=0] The new radius.
	 * @returns {this}
	 * @see Physics2.CircleShape#getRadius
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setRadius: function(radius)
	{
		this._radius = radius;
		this._setRadiusSendGen(radius);
		return this;
	},
	
// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 318,
	// Method create = -1
	// Method destroy = 2
	// Method setPosition = 3
	// Method setRadius = 4
	
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
					NgLogE("Unknown instance method id " + cmdId + " in CircleShape._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in CircleShape._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[318] = h; return h;})(),
	
	/////// Private recv methods.
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13effff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x13e0002, this );
	},
	
	/** @private */
	_setPositionSendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13e0003, this, [ +x, +y ] );
	},
	
	/** @private */
	_setRadiusSendGen: function( radius )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13e0004, this, [ +radius ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// setPosition: function( x, y ) {}
	
	// setRadius: function( radius ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
