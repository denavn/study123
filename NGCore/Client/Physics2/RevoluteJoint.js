var Joint = require('./Joint').Joint;
var Core = require('../Core').Core;

exports.RevoluteJoint = Joint.subclass(
/** @lends Physics2.RevoluteJoint.prototype */
{
	classname: 'RevoluteJoint',
	
	/**
	 * @class The <code>RevoluteJoint</code> class constructs objects that confine movement of two application bodies, 
	 * rotating the bodies around a specified point (see {@link Physics2.Body}. This concept is similar to how a hinge functions.
	 * @constructs The default constructor. 
	 * @see Physics2.Body
	 * @augments Physics2.Joint
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	initialize: function()
	{
		this._localAnchorA = new Core.Point();
		this._localAnchorB = new Core.Point();
		this._referenceRotation = 0;
		this._enableLimit = false;
		this._lowerRotation = 0;
		this._upperRotation = 0;
		this._enableMotor = false;
		this._motorSpeed = 0;
		this._maxMotorTorque = 0;
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
	 * @see Physics2.RevoluteJoint#setLocalAnchorA
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getLocalAnchorA: function()
	{
		return this._localAnchorA;
	},
	
	/**
	 * Set the local anchor point for the first connected body.
	 * @example var joint = new Physics2.RevoluteJoint();
	 * ...
	 * joint.setLocalAnchorA(25, 0);
	 * @param {Core.Point} [localAnchorA=(0,0)] The new local anchor point.
	 * @returns {this}
	 * @see Physics2.RevoluteJoint#getLocalAnchorA
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
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
	 * @see Physics2.RevoluteJoint#setLocalAnchorB
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getLocalAnchorB: function()
	{
		return this._localAnchorB;
	},
	
	/**
	 * Set the local anchor point for the second connected body.
	 * @example var joint = new Physics2.RevoluteJoint();
	 * ...
	 * joint.setLocalAnchorB(-25, 0);
	 * @param {Core.Point} [localAnchorB=(0,0)] The new local anchor point.
	 * @returns {this}
	 * @see Physics2.RevoluteJoint#getLocalAnchorB
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
	 * Retrieve the reference rotation for this <code>RevoluteJoint</code>.
	 * @returns {Number} The current reference rotation.
	 * @see Physics2.RevoluteJoint#setReferenceRotation
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getReferenceRotation: function()
	{
		return this._referenceRotation;
	},
	
	/**
	 * Set the reference rotation for this <code>RevoluteJoint</code>.
	 * @example var joint = new Physics2.RevoluteJoint();
	 * ...
	 * joint.setReferenceRotation(-90);
	 * @param {Number} [refereceRotation=0] The new reference rotation.
	 * @returns {this}
	 * @see Physics2.RevoluteJoint#getReferenceRotation
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	setReferenceRotation: function(referenceRotation)
	{
		this._referenceRotation = referenceRotation;
		this._setReferenceRotationSendGen(referenceRotation);
		return this;
	},
	
	/**
	 * Retrieve whether the range limiter is enabled  for this <code>RevoluteJoint</code>.
	 * @returns {Boolean} Returns <code>true</code> if the range limiter is enabled.
	 * @see Physics2.RevoluteJoint#setEnableLimit
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getEnableLimit: function()
	{
		return this._enableLimit;
	},
	
	/**
	 * Set whether the range limiter is enabled for this <code>RevoluteJoint</code>.
	 * @example var joint = new Physics2.RevoluteJoint();
	 * ...
	 * joint.setEnableLimit(true);
	 * @param {Boolean} [enableLimit=false] Set as <code>true</code> if the range limiter is enabled.
	 * @returns {this}
	 * @see Physics2.RevoluteJoint#getEnableLimit
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setEnableLimit: function(enableLimit)
	{
		this._enableLimit = enableLimit;
		this._setEnableLimitSendGen(enableLimit);
		return this;
	},
	
	/**
	 * Retrieve the lower range limit for this <code>RevoluteJoint</code>.
	 * @returns {Number} The current lower range limit.
	 * @see Physics2.RevoluteJoint#setLowerRotation
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getLowerRotation: function()
	{
		return this._lowerRotation;
	},
	
	/**
	 * Set the lower range limit for this <code>RevoluteJoint</code>.
	 * @example var joint = new Physics2.RevoluteJoint();
	 * ...
	 * joint.setLowerRotation(-30);
	 * @param {Number} [lowerRotation=0] The new lower range limit.
	 * @returns {this}
	 * @see Physics2.RevoluteJoint#getLowerRotation
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setLowerRotation: function(lowerRotation)
	{
		this._lowerRotation = lowerRotation;
		this._setLowerRotationSendGen(lowerRotation);
		return this;
	},
	
	/**
	 * Retrieve the upper range limit for this <code>RevoluteJoint</code>.
	 * @returns {Number} The current upper range limit.
	 * @see Physics2.RevoluteJoint#setUpperRotation
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getUpperRotation: function()
	{
		return this._upperRotation;
	},
	
	/**
	 * Set the upper range limit for this <code>RevoluteJoint</code>.
	 * @example var joint = new Physics2.RevoluteJoint();
	 * ...
	 * joint.setUpperRotation(30);
	 * @param {Number} [upperRotation=0] The new upper range limit.
	 * @returns {this}
	 * @see Physics2.RevoluteJoint#getUpperRotation
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setUpperRotation: function(upperRotation)
	{
		this._upperRotation = upperRotation;
		this._setUpperRotationSendGen(upperRotation);
		return this;
	},
	
	/**
	 * Retrieve whether the motor is enabled for this <code>RevoluteJoint</code>.
	 * @returns {Boolean} Returns <code>true</code> if the motor is enabled.
	 * @see Physics2.RevoluteJoint#setEnableMotor
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getEnableMotor: function()
	{
		return this._enableMotor;
	},
	
	/**
	 * Set whether the motor is enabled for this <code>RevoluteJoint</code>.
	 * @example var joint = new Physics2.RevoluteJoint();
	 * ...
	 * joint.setEnableMotor(true);
	 * @param {Boolean} [enableMotor=false] Set as <code>true</code> if the motor is enabled.
	 * @returns {this}
	 * @see Physics2.RevoluteJoint#getEnableMotor
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setEnableMotor: function(enableMotor)
	{
		this._enableMotor = enableMotor;
		this._setEnableMotorSendGen(enableMotor);
		return this;
	},
	
	/**
	 * Retrieve the motor speed applied by this <code>RevoluteJoint</code>.
	 * @returns {Number} The current motor speed.
	 * @see Physics2.RevoluteJoint#setMotorSpeed
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getMotorSpeed: function()
	{
		return this._motorSpeed;
	},
	
	/**
	 * Set the motor speed applied by this <code>RevoluteJoint</code>.
	 * @example var joint = new Physics2.PrismaticJoint();
	 * ...
	 * joint.setMotorSpeed(1);
	 * @param {Number} [motorSpeed=0] The new motor speed.
	 * @returns {this}
	 * @see Physics2.RevoluteJoint#getMotorSpeed
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setMotorSpeed: function(motorSpeed)
	{
		this._motorSpeed = motorSpeed;
		this._setMotorSpeedSendGen(motorSpeed);
		return this;
	},
	
	/**
	 * Retrieve the max motor torque applied by this <code>RevoluteJoint</code>.
	 * @returns {Number} The current max motor torque.
	 * @see Physics2.RevoluteJoint#setMaxMotorTorque
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getMaxMotorTorque: function()
	{
		return this._maxMotorTorque;
	},
	
	/**
	 * Set the max motor torque applied by this <code>RevoluteJoint</code>.
	 * @example var joint = new Physics2.RevoluteJoint();
	 * ...
	 * joint.setMaxMotorTorque(1);
	 * @param {Number} [maxMotorTorque=0] The new max motor torque.
	 * @returns {this}
	 * @see Physics2.RevoluteJoint#getMaxMotorTorque
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setMaxMotorTorque: function(maxMotorTorque)
	{
		this._maxMotorTorque = maxMotorTorque;
		this._setMaxMotorTorqueSendGen(maxMotorTorque);
		return this;
	},
	
// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 324,
	// Method create = -1
	// Method destroy = 2
	// Method setLocalAnchorA = 3
	// Method setLocalAnchorB = 4
	// Method setReferenceRotation = 5
	// Method setEnableLimit = 6
	// Method setLowerRotation = 7
	// Method setUpperRotation = 8
	// Method setEnableMotor = 9
	// Method setMotorSpeed = 10
	// Method setMaxMotorTorque = 11
	
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
					NgLogE("Unknown instance method id " + cmdId + " in RevoluteJoint._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in RevoluteJoint._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[324] = h; return h;})(),
	
	/////// Private recv methods.
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x144ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1440002, this );
	},
	
	/** @private */
	_setLocalAnchorASendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1440003, this, [ +x, +y ] );
	},
	
	/** @private */
	_setLocalAnchorBSendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1440004, this, [ +x, +y ] );
	},
	
	/** @private */
	_setReferenceRotationSendGen: function( referenceRotation )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1440005, this, [ +referenceRotation ] );
	},
	
	/** @private */
	_setEnableLimitSendGen: function( enableLimit )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1440006, this, [ ( enableLimit ? 1 : 0 ) ] );
	},
	
	/** @private */
	_setLowerRotationSendGen: function( lowerRotation )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1440007, this, [ +lowerRotation ] );
	},
	
	/** @private */
	_setUpperRotationSendGen: function( upperRotation )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1440008, this, [ +upperRotation ] );
	},
	
	/** @private */
	_setEnableMotorSendGen: function( enableMotor )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1440009, this, [ ( enableMotor ? 1 : 0 ) ] );
	},
	
	/** @private */
	_setMotorSpeedSendGen: function( motorSpeed )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x144000a, this, [ +motorSpeed ] );
	},
	
	/** @private */
	_setMaxMotorTorqueSendGen: function( maxMotorTorque )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x144000b, this, [ +maxMotorTorque ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// setLocalAnchorA: function( x, y ) {}
	
	// setLocalAnchorB: function( x, y ) {}
	
	// setReferenceRotation: function( referenceRotation ) {}
	
	// setEnableLimit: function( enableLimit ) {}
	
	// setLowerRotation: function( lowerRotation ) {}
	
	// setUpperRotation: function( upperRotation ) {}
	
	// setEnableMotor: function( enableMotor ) {}
	
	// setMotorSpeed: function( motorSpeed ) {}
	
	// setMaxMotorTorque: function( maxMotorTorque ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
