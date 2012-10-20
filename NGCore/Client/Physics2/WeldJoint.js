var Joint = require('./Joint').Joint;
var Core = require('../Core').Core;

exports.WeldJoint = Joint.subclass(
/** @lends Physics2.WeldJoint.prototype */
{
	classname: 'WeldJoint',
	
	/**
	 * @class The <code>WeldJoint</code> class constructs objects that hold two application bodies completely stationary relative to each other 
	 * (see <code>{@link Physics2.Body}</code>).
	 * @constructs The default constructor. 
	 * @augments Physics2.Joint
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	initialize: function()
	{
		this._localAnchorA = new Core.Point();
		this._localAnchorB = new Core.Point();
		this._referenceRotation = 0;
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
	 * Retrieve the local anchor point for the first connected body.
	 * @returns {Core.Point} The current local anchor point for the first connected body.
	 * @see Physics2.WeldJoint#setLocalAnchorA
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getLocalAnchorA: function()
	{
		return this._localAnchorA;
	},
	
	/**
	 * Set the local anchor point for the first connected body.
	 * @example var joint = new Physics2.WeldJoint();
	 * ...
	 * joint.setLocalAnchorA(25, 0);
	 * @param {Core.Point} [localAnchorA=(0,0)] The new local anchor point for the first connected body.
	 * @returns {this}
	 * @see Physics2.WeldJoint#getLocalAnchorA
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	setLocalAnchorA: function(localAnchorA)
	{
		var l = this._localAnchorA;
		l.setAll.apply(l, arguments);
		this._setLocalAnchorASendGen(l.getX(),l.getY());
		return this;
	},
	
	/**
	 * Retrieve the local anchor point for the second connected body.
	 * @returns {Core.Point} The current local anchor point for the second connected body.
	 * @see Physics2.WeldJoint#setLocalAnchorB
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getLocalAnchorB: function()
	{
		return this._localAnchorB;
	},
	
	/**
	 * Set the local anchor point for the second connected body.
	 * @example var joint = new Physics2.WeldJoint();
	 * ...
	 * joint.setLocalAnchorB(-25, 0);
	 * @param {Core.Point} [localAnchorB=(0,0)] The new local anchor point for the second connected body.
	 * @returns {this}
	 * @see Physics2.WeldJoint#setLocalAnchorB
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	setLocalAnchorB: function(localAnchorB)
	{
		var l = this._localAnchorB;
		l.setAll.apply(l, arguments);
		this._setLocalAnchorBSendGen(l.getX(),l.getY());
		return this;
	},
	
	/**
	 * Retrieve the reference rotation for this <code>WeldJoint</code>.
	 * @returns {Number} The current reference rotation.
	 * @see Physics2.WeldJoint#setReferenceRotation
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getReferenceRotation: function()
	{
		return this._referenceRotation;
	},
	
	/**
	 * Set the reference rotation for this <code>WeldJoint</code>.
	 * @example var joint = new Physics2.WeldJoint();
	 * ...
	 * joint.setReferenceRotation(-90);
	 * @param {Number} [referenceRotation=0] The new reference rotation.
	 * @returns {this}
	 * @see Physics2.WeldJoint#getReferenceRotation
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setReferenceRotation: function(referenceRotation)
	{
		this._referenceRotation = referenceRotation;
		this._setReferenceRotationSendGen(referenceRotation);
		return this;
	},
	
// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 325,
	// Method create = -1
	// Method destroy = 2
	// Method setLocalAnchorA = 3
	// Method setLocalAnchorB = 4
	// Method setReferenceRotation = 5
	
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
					NgLogE("Unknown instance method id " + cmdId + " in WeldJoint._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in WeldJoint._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[325] = h; return h;})(),
	
	/////// Private recv methods.
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x145ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1450002, this );
	},
	
	/** @private */
	_setLocalAnchorASendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1450003, this, [ +x, +y ] );
	},
	
	/** @private */
	_setLocalAnchorBSendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1450004, this, [ +x, +y ] );
	},
	
	/** @private */
	_setReferenceRotationSendGen: function( referenceRotation )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1450005, this, [ +referenceRotation ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// setLocalAnchorA: function( x, y ) {}
	
	// setLocalAnchorB: function( x, y ) {}
	
	// setReferenceRotation: function( referenceRotation ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
