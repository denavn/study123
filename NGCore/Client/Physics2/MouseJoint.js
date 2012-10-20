var Joint = require('./Joint').Joint;
var Core = require('../Core').Core;

exports.MouseJoint = Joint.subclass(
/** @lends Physics2.MouseJoint.prototype */
{
	classname: 'MouseJoint',
	
	/**
	 * @class The <code>MouseJoint</code> class constructs objects that apply a force for moving an application body to a specific point (see <code>{@link Physics2.Body}</code>).
	 * @constructs The default constructor. 
	 * @augments Physics2.Joint
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	initialize: function()
	{
		this._target = new Core.Point();
		this._maxForce = 0;
		this._frequency = 0;
		this._dampingRatio = 0;
	},
	
	/**
	 * Destroy this instance and release resources on the backend.
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	destroy: function()
	{
	},
	
	/**
	 * Retrieve the target location that applies to this <code>MouseJoint</code>.
	 * @returns {Core.Point} The current target location.
	 * @see Physics2.MouseJoint#setTarget
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getTarget: function()
	{
		return this._target;
	},
	
	/**
	 * Set the target location that applies to this <code>MouseJoint</code>.
	 * @example var circle = makeCircle([w/2, h*6/8], 16);
	 * ...
	 * joint.setTarget(c.getPosition());
	 * @param {Core.Point} [target=(0, 0)] The new target location.
	 * @returns {this}
	 * @see Physics2.MouseJoint#getTarget
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	setTarget: function(target)
	{
		var t = this._target;
		t.setAll(arguments);
		this._setTargetSendGen(t.getX(),t.getY());
		return this;
	},
	
	/**
	 * Retrieve the maximum force applied by this <code>MouseJoint</code>.
	 * @returns {Number} The current maximum force applied.
	 * @see Physics2.MouseJoint#setMaxForce
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getMaxForce: function()
	{
		return this._maxForce;
	},
	
	/**
	 * Set the maximum force applied by this <code>MouseJoint</code>.
	 * @example var joint = new Physics2.MouseJoint();
	 * joint.setMaxForce(20);
	 * @param {Number} [maxForce=0] The new maximum force applied.
	 * @returns {this}
	 * @see Physics2.MouseJoint#getMaxForce
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	setMaxForce: function(maxForce)
	{
		this._maxForce = maxForce;
		this._setMaxForceSendGen(maxForce);
		return this;
	},
	
	/**
	 * Retrieve the damping frequency that applies to this <code>MouseJoint</code>.
	 * @returns {Number} The current damping frequency.
	 * @see Physics2.MouseJoint#setFrequency
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getFrequency: function()
	{
		return this._frequency;
	},
	
	/**
	 * Set the damping frequency that applies to this <code>MouseJoint</code>.
	 * @param {Number} [frequency=0] The new damping frequency.
	 * @returns {this}
	 * @see Physics2.MouseJoint#getFrequency
	 * @since 1.0
	 */
	setFrequency: function(frequency)
	{
		this._frequency = frequency;
		this._setFrequencySendGen(frequency);
		return this;
	},
	
	/**
	 * Retrieve the damping ratio that applies to this <code>MouseJoint</code>.
	 * @returns {Number} The current damping ratio.
	 * @see Physics2.MouseJoint#setDampingRatio
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getDampingRatio: function()
	{
		return this._dampingRatio;
	},
	
	/**
	 * Set the damping ratio that applies to this <code>MouseJoint</code>.
	 * @param {Number} [dampingRatio=0] The new damping ratio.
	 * @returns {this}
	 * @see Physics2.MouseJoint#getDampingRatio
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
	_classId: 322,
	// Method create = -1
	// Method destroy = 2
	// Method setTarget = 3
	// Method setMaxForce = 4
	// Method setFrequency = 5
	// Method setDampingRatio = 6
	
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
					NgLogE("Unknown instance method id " + cmdId + " in MouseJoint._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in MouseJoint._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[322] = h; return h;})(),
	
	/////// Private recv methods.
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x142ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1420002, this );
	},
	
	/** @private */
	_setTargetSendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1420003, this, [ +x, +y ] );
	},
	
	/** @private */
	_setMaxForceSendGen: function( maxForce )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1420004, this, [ +maxForce ] );
	},
	
	/** @private */
	_setFrequencySendGen: function( frequency )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1420005, this, [ +frequency ] );
	},
	
	/** @private */
	_setDampingRatioSendGen: function( dampingRatio )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1420006, this, [ +dampingRatio ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// setTarget: function( x, y ) {}
	
	// setMaxForce: function( maxForce ) {}
	
	// setFrequency: function( frequency ) {}
	
	// setDampingRatio: function( dampingRatio ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
