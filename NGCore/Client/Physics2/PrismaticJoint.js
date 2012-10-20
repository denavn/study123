var Joint = require('./Joint').Joint;
var Core = require('../Core').Core;

exports.PrismaticJoint = Joint.subclass(
/** @lends Physics2.PrismaticJoint.prototype */
{
	classname: 'PrismaticJoint',
	
	/**
	 * @class The <code>PrismaticJoint</code> class constructs objects that confine movement of two application bodies 
	 * along a specific axis (see <code>{@link Physics2.Body}</code>). This concept is similar to how a piston functions. 
	 * Movement is confined to bodies moving either towards or away from each other.
	 * @constructs The default constructor. 
	 * @augments Physics2.Joint
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	initialize: function()
	{
		this._localAnchorA = new Core.Point();
		this._localAnchorB = new Core.Point();
		this._localAxis = new Core.Vector();
		this._referenceRotation = 0;
		this._enableLimit = false;
		this._lowerTranslation = 0;
		this._upperTranslation = 0;
		this._enableMotor = false;
		this._motorSpeed = 0;
		this._maxMotorForce = 0;
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
	 * @see Physics2.PrismaticJoint#setLocalAnchorA
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getLocalAnchorA: function()
	{
		return this._localAnchorA;
	},
	
	/**
	 * Set the local anchor point for the first connected body.
	 * @example var joint = new Physics2.PrismaticJoint();
	 * ...
	 * joint.setLocalAnchorA(25, 0);
	 * @param {Core.Point} [localAnchorA=(0,0)] The new local anchor point for the first connected body.
	 * @returns {this}
	 * @see Physics2.PrismaticJoint#getLocalAnchorA
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
	 * @see Physics2.PrismaticJoint#setLocalAnchorB
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getLocalAnchorB: function()
	{
		return this._localAnchorB;
	},
	
	/**
	 * Set the local anchor point for the second connected body.
	 * @example var joint = new Physics2.PrismaticJoint();
	 * ...
	 * joint.setLocalAnchorB(-25, 0);
	 * @param {Core.Point} [localAnchorB=(0,0)] The new local anchor point for the second connected body.
	 * @returns {this}
	 * @see Physics2.PrismaticJoint#getLocalAnchorB
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
	 * Retrieve the local axis of movement for this <code>PrismaticJoint</code>.
	 * @returns {Core.Vector} The current local axis of movement.
	 * @see Physics2.PrismaticJoint#setLocalAxis
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getLocalAxis: function()
	{
		return this._localAxis;
	},
	
	/**
	 * Set the local axis of movement for this <code>PrismaticJoint</code>.
	 * @example var joint = new Physics2.PrismaticJoint();
	 * ...
	 * joint.setLocalAxis(0, -1);
	 * @param {Core.Vector} [localAxis=(0,0)] The new local axis of movement.
	 * @returns {this}
	 * @see Physics2.PrismaticJoint#getLocalAxis
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setLocalAxis: function(localAxis)
	{
		var a = this._localAxis;
		a.setAll(arguments);
		this._setLocalAxisSendGen(a.getX(),a.getY());
		return this;
	},
	
	/**
	 * Retrieve the reference rotation for this <code>PrismaticJoint</code>.
	 * @returns {Number} The current reference rotation.
	 * @see Physics2.PrismaticJoint#setReferenceRotation
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getReferenceRotation: function()
	{
		return this._referenceRotation;
	},
	
	/**
	 * Set the reference rotation for this <code>PrismaticJoint</code>.
	 * @example var joint = new Physics2.PrismaticJoint();
	 * ...
	 * joint.setReferenceRotation(-90);
	 * @param {Number} [referenceRotation=0] The new reference rotation.
	 * @returns {this}
	 * @see Physics2.PrismaticJoint#getReferenceRotation
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setReferenceRotation: function(referenceRotation)
	{
		this._referenceRotation = referenceRotation;
		this._setReferenceRotationSendGen(referenceRotation);
		return this;
	},
	
	/**
	 * Retrieve whether the range limiter is enabled for this <code>PrismaticJoint</code>.
	 * @returns {Boolean} Returns <code>true</code> if range limiter is enabled.
	 * @see Physics2.PrismaticJoint#setEnableLimit
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getEnableLimit: function()
	{
		return this._enableLimit;
	},
	
	/**
	 * Set whether the range limiter is enabled for this <code>PrismaticJoint</code>.
	 * @example var joint = new Physics2.PrismaticJoint();
	 * ...
	 * joint.setEnableLimit(true);
	 * @param {Boolean} [enableLimit=false] Set as <code>true</code> to enable the range limiter.
	 * @returns {this}
	 * @see Physics2.PrismaticJoint#getEnableLimit
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
	 * Retrieve the lower range limit for this <code>PrismaticJoint</code>.
	 * @returns {Number} The current lower range limit.
	 * @see Physics2.PrismaticJoint#setLowerTranslation
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getLowerTranslation: function()
	{
		return this._lowerTranslation;
	},
	
	/**
	 * Set the lower range limit for this <code>PrismaticJoint</code>.
	 * @example var joint = new Physics2.PrismaticJoint();
	 * ...
	 * joint.setLowerTranslation(0);
	 * @param {Number} [lowerTranslation=0] The new lower range limit.
	 * @returns {this}
	 * @see Physics2.PrismaticJoint#getLowerTranslation
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setLowerTranslation: function(lowerTranslation)
	{
	    if (lowerTranslation > this._upperTranslation)
        {
            throw new Error("lower translation value must be less or equal than the upper translation");
        }
	    
		this._lowerTranslation = lowerTranslation;
		this._setLowerTranslationSendGen(lowerTranslation);
		return this;
	},
	
	/**
	 * Retrieve the upper range limit for this <code>PrismaticJoint</code>.
	 * @returns {Number} The current upper range limit.
	 * @see Physics2.PrismaticJoint#setUpperTranslation
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getUpperTranslation: function()
	{
		return this._upperTranslation;
	},
	
	/**
	 * Set the upper range limit for this <code>PrismaticJoint</code>.
	 * @example var joint = new Physics2.PrismaticJoint();
	 * ...
	 * joint.setUpperTranslation(32);
	 * @param {Number} [upperTranslation=0] The new upper range limit.
	 * @returns {this}
	 * @see Physics2.PrismaticJoint#getUpperTranslation
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setUpperTranslation: function(upperTranslation)
	{
	    if (upperTranslation < this._lowerTranslation)
        {
            throw new Error("upper translation value must be greater or equal than the lower translation");
        }    
	    
		this._upperTranslation = upperTranslation;
		this._setUpperTranslationSendGen(upperTranslation);
		return this;
	},
	
	/**
	 * Retrieve whether the motor is enabled for this <code>PrismaticJoint</code>.
	 * @returns {Boolean} Returns <code>true</code> if the motor is eanbled.
	 * @see Physics2.PrismaticJoint#setEnableMotor
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getEnableMotor: function()
	{
		return this._enableMotor;
	},
	
	/**
	 * Set whether the motor is enabled for this <code>PrismaticJoint</code>.
	 * @example var joint = new Physics2.PrismaticJoint();
	 * ...
	 * joint.setEnableMotor(true);
	 * @param {Boolean} [enableMotor=false] Set as <code>true</code> if the motor is enabled.
	 * @returns {this}
	 * @see Physics2.PrismaticJoint#getEnableMotor
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
	 * Retrieve the motor speed for this <code>PrismaticJoint</code>.
	 * @returns {Number} The current motor speed.
	 * @see Physics2.PrismaticJoint#setMotorSpeed
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getMotorSpeed: function()
	{
		return this._motorSpeed;
	},
	
	/**
	 * Set the motor speed for this <code>PrismaticJoint</code>.
	 * @example var joint = new Physics2.PrismaticJoint();
	 * ...
	 * joint.setMotorSpeed(1);
	 * @param {Number} [motorSpeed=0] The new motor speed.
	 * @returns {this}
	 * @see Physics2.PrismaticJoint#getMotorSpeed
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
	 * Retrieve the max motor force applied by this <code>PrismaticJoint</code>.
	 * @returns {Number} The current max motor force.
	 * @see Physics2.PrismaticJoint#setMaxMotorForce
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getMaxMotorForce: function()
	{
		return this._maxMotorForce;
	},
	
	/**
	 * Set the max motor force applied by this <code>PrismaticJoint</code>.
	 * @example var joint = new Physics2.PrismaticJoint();
	 * ...
	 * joint.setMaxMotorForce(1);
	 * @param {Number} [maxMotorForce=0] The new max motor force.
	 * @returns {this}
	 * @see Physics2.PrismaticJoint#getMaxMotorForce
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setMaxMotorForce: function(maxMotorForce)
	{
		this._maxMotorForce = maxMotorForce;
		this._setMaxMotorForceSendGen(maxMotorForce);
		return this;
	},
	
// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 323,
	// Method create = -1
	// Method destroy = 2
	// Method setLocalAnchorA = 3
	// Method setLocalAnchorB = 4
	// Method setLocalAxis = 5
	// Method setReferenceRotation = 6
	// Method setEnableLimit = 7
	// Method setLowerTranslation = 8
	// Method setUpperTranslation = 9
	// Method setEnableMotor = 10
	// Method setMotorSpeed = 11
	// Method setMaxMotorForce = 12
	
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
					NgLogE("Unknown instance method id " + cmdId + " in PrismaticJoint._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in PrismaticJoint._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[323] = h; return h;})(),
	
	/////// Private recv methods.
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x143ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1430002, this );
	},
	
	/** @private */
	_setLocalAnchorASendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1430003, this, [ +x, +y ] );
	},
	
	/** @private */
	_setLocalAnchorBSendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1430004, this, [ +x, +y ] );
	},
	
	/** @private */
	_setLocalAxisSendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1430005, this, [ +x, +y ] );
	},
	
	/** @private */
	_setReferenceRotationSendGen: function( referenceRotation )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1430006, this, [ +referenceRotation ] );
	},
	
	/** @private */
	_setEnableLimitSendGen: function( enableLimit )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1430007, this, [ ( enableLimit ? 1 : 0 ) ] );
	},
	
	/** @private */
	_setLowerTranslationSendGen: function( lowerTranslation )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1430008, this, [ +lowerTranslation ] );
	},
	
	/** @private */
	_setUpperTranslationSendGen: function( upperTranslation )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1430009, this, [ +upperTranslation ] );
	},
	
	/** @private */
	_setEnableMotorSendGen: function( enableMotor )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x143000a, this, [ ( enableMotor ? 1 : 0 ) ] );
	},
	
	/** @private */
	_setMotorSpeedSendGen: function( motorSpeed )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x143000b, this, [ +motorSpeed ] );
	},
	
	/** @private */
	_setMaxMotorForceSendGen: function( maxMotorForce )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x143000c, this, [ +maxMotorForce ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// setLocalAnchorA: function( x, y ) {}
	
	// setLocalAnchorB: function( x, y ) {}
	
	// setLocalAxis: function( x, y ) {}
	
	// setReferenceRotation: function( referenceRotation ) {}
	
	// setEnableLimit: function( enableLimit ) {}
	
	// setLowerTranslation: function( lowerTranslation ) {}
	
	// setUpperTranslation: function( upperTranslation ) {}
	
	// setEnableMotor: function( enableMotor ) {}
	
	// setMotorSpeed: function( motorSpeed ) {}
	
	// setMaxMotorForce: function( maxMotorForce ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
