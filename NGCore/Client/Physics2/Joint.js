var Core = require('../Core').Core;

exports.Joint = Core.Class.subclass(
/** @lends Physics2.Joint.prototype */
{
	classname: 'Joint',
	
	/**
	 * @class The <code>Joint</code> class is a base class for constructing objects that connect two application bodies (see <code>{@link Physics2.Body}</code>).
	 * Most properties are identical to <a href="http://www.box2d.org/manual.html">properties of the b2Joint</a> class
	 * of <code>Box2d</code>.<br /><br />
	 * <b>Caution!:</b> Do not instantiate this class directly. Use classes derived from <code>Joint</code> for instantiation. This includes:
	 * <ul>
	 * <li>{@link Physics2.DistanceJoint}</li>
	 * <li>{@link Physics2.MouseJoint}</li>
	 * <li>{@link Physics2.PrismaticJoint}</li>
	 * <li>{@link Physics2.PulleyJoint}</li>
	 * <li>{@link Physics2.RevoluteJoint}</li>
	 * <li>{@link Physics2.WeldJoint}</li>
	 * </ul>
	 * @constructs The default constructor. 	
	 * @augments Core.Class
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	initialize: function()
	{
		this._bodyA = null;
		this._bodyB = null;
		this._collideConnected = false;
		
		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
	},
	
	/**
	 * Destroy this instance and release resources on the backend.
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	destroy: function()
	{
		if(this._bodyA)
		{
			this._bodyA._willRemoveFromJoint(this);
			this._bodyA = null;
		}
		
		if(this._bodyB)
		{
			this._bodyB._willRemoveFromJoint(this);
			this._bodyB = null;
		}
		
		this._destroySendGen();
		Core.ObjectRegistry.unregister(this);
	},
	
	/**
	 * Retrieve the first connected body for this <code>Joint</code>.
	 * @returns {Physics2.Body} The current first connected body.
	 * @see Physics2.Joint#setBodyA
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getBodyA: function()
	{
		return this._bodyA;
	},
	
	/**
	 * Set the first connected body for this <code>Joint</code>.<br /><br />
	 * <strong>Important</strong>: Before calling this method, you must call
	 * <code>{@link Physics2.World#addBody}</code> to add the body to the
	 * <code>{@link Physics2.World}</code> object. If you do not do this, the joint will not
	 * function.
	 * @example
	 * var world = new Physics2.World();
	 * var b1 = new Physics2.Body();
	 * world.addBody(b1);
	 * var joint = new Physics2.DistanceJoint();
	 * joint.setBodyA(b1);
	 * @param {Physics2.Body} bodyA The new first connected body.
	 * @returns {this}
	 * @see Physics2.Joint#getBodyA
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	setBodyA: function(bodyA)
	{
		//Let prev body know it was detached from this joint
		if(this._bodyA!==null)
			this._bodyA._willRemoveFromJoint(this);

		//Assign new body
		this._bodyA = bodyA;

		//Let new body know it was attached to this joint
		if(bodyA!==null)
			bodyA._didAddToJoint(this);

		this._setBodyASendGen( (bodyA === null) ? -1 : Core.ObjectRegistry.objectToId(bodyA) );
		return this;
	},
	
	/**
	 * Retrieve the second connected body for this <code>Joint</code>.
	 * @returns {Physics2.Body} The current second connected body.
	 * @see Physics2.Joint#setBodyB
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getBodyB: function()
	{
		return this._bodyB;
	},
	
	/**
	 * Set the second connected body for this <code>Joint</code>.<br /><br />
	 * <strong>Important</strong>: Before calling this method, you must call
	 * <code>{@link Physics2.World#addBody}</code> to add the body to the
	 * <code>{@link Physics2.World}</code> object. If you do not do this, the joint will not
	 * function.
	 * @example
	 * var world = new Physics2.World();
	 * var b2 = new Physics2.Body();
	 * world.addBody(b2);
	 * var joint = new Physics2.DistanceJoint();
	 * joint.setBodyB(b2);
	 * @param {Physics2.Body} bodyB The new second connected body.
	 * @returns {this}
	 * @see Physics2.Joint#getBodyB
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	setBodyB: function(bodyB)
	{
		//Let prev body know it was detached from this joint
		if(this._bodyB!==null)
			this._bodyB._willRemoveFromJoint(this);

		//Assign new body
		this._bodyB = bodyB;

		//Let new body know it was attached to this joint
		if(bodyB!==null)
			bodyB._didAddToJoint(this);

		this._setBodyBSendGen( (bodyB === null) ? -1 : Core.ObjectRegistry.objectToId(bodyB) );
		return this;
	},
	
	/**
	 * Retrieve whether two connected bodies collide with each other.
	 * @returns {Boolean} Returns <code>true</code> if connected bodies collide. Returns <code>false</code> in all other cases.
	 * @see Physics2.Joint#setCollideConnected
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getCollideConnected: function()
	{
		return this._collideConnected;
	},
	
	/**
	 * Set whether two connected bodies collide with each other.
	 * @param {Boolean} [collideConnected=false] Set as <code>true</code> if connected bodies collide.
	 * @returns {this}
	 * @see Physics2.Joint#getCollideConnected
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	setCollideConnected: function(collideConnected)
	{
		this._collideConnected = collideConnected;
		this._setCollideConnectedSendGen(collideConnected);
		return this;
	},
	
	_removeBody: function(body)
	{
		if(body==this._bodyA)
			this.setBodyA(null);
		if(body==this._bodyB)
			this.setBodyB(null);
	},

// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 320,
	// Method destroy = 1
	// Method setBodyA = 2
	// Method setBodyB = 3
	// Method setCollideConnected = 4
	
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
					NgLogE("Unknown instance method id " + cmdId + " in Joint._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in Joint._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[320] = h; return h;})(),
	
	/////// Private recv methods.
	
	/////// Private send methods.
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1400001, this );
	},
	
	/** @private */
	_setBodyASendGen: function( bodyA )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1400002, this, [ +bodyA ] );
	},
	
	/** @private */
	_setBodyBSendGen: function( bodyB )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1400003, this, [ +bodyB ] );
	},
	
	/** @private */
	_setCollideConnectedSendGen: function( collideConnected )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1400004, this, [ ( collideConnected ? 1 : 0 ) ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// destroy: function(  ) {}
	
	// setBodyA: function( bodyA ) {}
	
	// setBodyB: function( bodyB ) {}
	
	// setCollideConnected: function( collideConnected ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
