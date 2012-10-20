var Joint = require('./Joint').Joint;
var Core = require('../Core').Core;

exports.DistanceJoint = Joint.subclass(
/** @lends Physics2.DistanceJoint.prototype */
{
	classname: 'DistanceJoint',
	
	/**
	 * @class The <code>DistanceJoint</code> class constructs objects that restrict the distance between two bodies
	 * but does not constrain their rotation (see <code>{@link Physics2.Body}</code>).
	 * @constructs The default constructor. 
	 * @augments Physics2.Joint
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	initialize: function()
	{
		this._localAnchorA = new Core.Point();
		this._localAnchorB = new Core.Point();
		this._length = 0;
		this._frequency = 0;
		this._dampingRatio = 0;
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
	 * @returns {Core.Point} The current local anchor point for the first body.
	 * @see Physics2.DistanceJoint#setLocalAnchorA
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getLocalAnchorA: function()
	{
		return this._localAnchorA;
	},
	
	/**
	 * Set the local anchor point for the first connected body.
	 * @example var joint = new Physics2.DistanceJoint();
	 * joint.setLocalAnchorA(0, 16);
	 * @param {Core.Point} [localAnchorA=(0, 0)] The new local anchor point for the first body.
	 * @returns {this}
	 * @see Physics2.DistanceJoint#getLocalAnchorA
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
	 * @returns {Core.Point} The current local anchor point for the second body.
	 * @see Physics2.DistanceJoint#setLocalAnchorB
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getLocalAnchorB: function()
	{
		return this._localAnchorB;
	},
	
	/**
	 * Set the local anchor point for the second connected body.
	 * @example var joint = new Physics2.DistanceJoint();
	 * joint.setLocalAnchorB(0, -16);
	 * @param {Core.Point} [localAnchorB=(0, 0)] The new local anchor point for the second body.
	 * @returns {this}
	 * @see Physics2.DistanceJoint#getLocalAnchorB
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
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
	 * Retrieve the joint length for this <code>DistanceJoint</code>.
	 * @returns {Number} The current joint length.
	 * @see Physics2.DistanceJoint#setLength
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getLength: function()
	{
		return this._length;
	},
	
	/**
	 * Set the joint length for this <code>DistanceJoint</code>.
	 * @example var joint = new Physics2.DistanceJoint();
	 * joint.setLength(48);
	 * @param {Number} [length=0] The new joint length.
	 * @returns {this}
	 * @see Physics2.DistanceJoint#getLength
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setLength: function(length)
	{
		this._length = length;
		this._setLengthSendGen(length);
		return this;
	},
	
	/**
	 * Retrieve the damping frequency of this <code>DistanceJoint</code>.
	 * @returns {Number} The current damping frequency.
	 * @see Physics2.DistanceJoint#setFrequency
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getFrequency: function()
	{
		return this._frequency;
	},
	
	/**
	 * Set the damping frequency for this <code>DistanceJoint</code>.
	 * @example var joint = new Physics2.DistanceJoint();
	 * joint.setFrequency(1);
	 * @param {Number} [frequency=0] The new damping frequency.
	 * @returns {this}
	 * @see Physics2.DistanceJoint#getFrequency
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	setFrequency: function(frequency)
	{
		this._frequency = frequency;
		this._setFrequencySendGen(frequency);
		return this;
	},
	
	/**
	 * Retrieve the damping ratio of this <code>DistanceJoint</code>.
	 * @returns {Number} The current damping ratio.
	 * @see Physics2.DistanceJoint#setDampingRatio
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getDampingRatio: function()
	{
		return this._dampingRatio;
	},
	
	/**
	 * Set the damping ratio for this <code>DistanceJoint</code>.
	 * @example var joint = new Physics2.DistanceJoint();
	 * joint.setDampingRatio(10);
	 * @param {Number} [dampingRatio=0] The new damping ratio.
	 * @returns {this}
	 * @see Physics2.DistanceJoint#setDampingRatio
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	setDampingRatio: function(dampingRatio)
	{
		this._dampingRatio = dampingRatio;
		this._setDampingRatioSendGen(dampingRatio);
		return this;
	},
	
// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 321,
	// Method create = -1
	// Method destroy = 2
	// Method setLocalAnchorA = 3
	// Method setLocalAnchorB = 4
	// Method setLength = 5
	// Method setFrequency = 6
	// Method setDampingRatio = 7
	
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
					NgLogE("Unknown instance method id " + cmdId + " in DistanceJoint._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in DistanceJoint._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[321] = h; return h;})(),
	
	/////// Private recv methods.
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x141ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1410002, this );
	},
	
	/** @private */
	_setLocalAnchorASendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1410003, this, [ +x, +y ] );
	},
	
	/** @private */
	_setLocalAnchorBSendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1410004, this, [ +x, +y ] );
	},
	
	/** @private */
	_setLengthSendGen: function( length )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1410005, this, [ +length ] );
	},
	
	/** @private */
	_setFrequencySendGen: function( frequency )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1410006, this, [ +frequency ] );
	},
	
	/** @private */
	_setDampingRatioSendGen: function( dampingRatio )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1410007, this, [ +dampingRatio ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// setLocalAnchorA: function( x, y ) {}
	
	// setLocalAnchorB: function( x, y ) {}
	
	// setLength: function( length ) {}
	
	// setFrequency: function( frequency ) {}
	
	// setDampingRatio: function( dampingRatio ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
