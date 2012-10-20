////////////////////////////////////////////////////////////////////////////////
// Class PulleyJoint
//
// Copyright (C) 2011 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Joint = require('./Joint').Joint;
var Core = require('../Core').Core;

////////////////////////////////////////////////////////////////////////////////

exports.PulleyJoint = Joint.subclass(
/** @lends Physics2.PulleyJoint.prototype */
{
	classname: 'PulleyJoint',
	
	/**
	 * @class The <code>PulleyJoint</code> class constructs objects that connects two
	 * bodies to ground and to each other. As one body goes up, the other goes down.
	 * The total length of the pulley rope is conserved according to the initial configuration.
	 * @constructs The default constructor. 
	 * @augments Physics2.Joint
	 * @status iOS, Android, Flash
	 * @since 1.6
	 */
	initialize: function()
	{
		this._groundAnchorA = new Core.Point(-1, 1);
		this._groundAnchorB = new Core.Point(1, 1);
		this._localAnchorA = new Core.Point(-1, 0);
		this._localAnchorB = new Core.Point(1, 0);

		this._lengthA = 0;
		this._lengthB = 0;
		this._ratio = 1;
	},
	
	/**
	 * Destroy this instance and release resources on the backend.
	 * @status iOS, Android, Flash
	 * @since 1.6
	 */
	destroy : function()
	{
	},
	
	/**
	 * Set the first ground anchor point in world coordinates. By default, this value is set to
	 * <code>(-1, 1)</code>.
	 * @example var joint = new Physics2.PulleyJoint();
	 * ...
	 * setGroundAnchorA(new Core.Point(25, 0));
	 * @param {Core.Point} groundAnchorA The coordinates of the new first ground anchor point.
	 * @returns {this}
	 * @see Physics2.PulleyJoint#getGroundAnchorA
	 * @status iOS, Android, Flash
	 * @since 1.6
	 */
	setGroundAnchorA : function( groundAnchorA )
	{
		var l = this._groundAnchorA;
		l.setAll.apply(l, arguments);
		this._setGroundAnchorASendGen(l.getX(),l.getY());
		return this;
	},
	
	/**
	 * Retrieve the first ground anchor point in world coordinates.
	 * @returns {Core.Point} The first ground anchor point.
	 * @see Physics2.PulleyJoint#setGroundAnchorA
	 * @status iOS, Android, Flash
	 * @since 1.6
	 */
	getGroundAnchorA : function()
	{
		return this._groundAnchorA;
	},
	
	
	/**
	 * Set the second ground anchor point in world coordinates. By default, this value is set to
	 * <code>(1, 1)</code>.
	 * @example var joint = new Physics2.PulleyJoint();
	 * ...
	 * setGroundAnchorB(new Core.Point(25, 0));
	 * @param {Core.Point} groundAnchorB The coordinates of the new second ground anchor point.
	 * @returns {this}
	 * @see Physics2.PulleyJoint#getGroundAnchorB
	 * @status iOS, Android, Flash
	 * @since 1.6
	 */
	setGroundAnchorB : function( groundAnchorB )
	{
		var l = this._groundAnchorB;
		l.setAll.apply(l, arguments);
		this._setGroundAnchorBSendGen(l.getX(),l.getY());
		return this;
	},

	/**
	 * Retrieve the second ground anchor point in world coordinates.
	 * @returns {Core.Point} The second ground anchor point.
	 * @see Physics2.PulleyJoint#setGroundAnchorB
	 * @status iOS, Android, Flash
	 * @since 1.6
	 */
	getGroundAnchorB : function()
	{
		return this._groundAnchorB;
	},
	
	
	/**
	 * Set the local anchor point for the first connected body. By default, this value is set to
	 * <code>(-1, 0)</code>.
	 * @example var joint = new Physics2.PulleyJoint();
	 * ...
	 * joint.setLocalAnchorA(new Core.Point(1, 0));
	 * @param {Core.Point} localAnchorA The coordinates of the new local anchor point for the first 
	 *		connected body.
	 * @returns {this}
	 * @see Physics2.PulleyJoint#getLocalAnchorA
	 * @status iOS, Android, Flash
	 * @since 1.6
	 */
	setLocalAnchorA : function( localAnchorA )
	{
		var l = this._localAnchorA;
		l.setAll.apply(l, arguments);
		this._setLocalAnchorASendGen(l.getX(),l.getY());
		return this;
	},

	/**
	 * Retrieve the local anchor point for the first connected body.
	 * @returns {Core.Point} The current local anchor point for the first connected body.
	 * @see Physics2.PulleyJoint#setLocalAnchorA
	 * @status iOS, Android, Flash
	 * @since 1.6
	 */
	getLocalAnchorA: function()
	{
		return this._localAnchorA;
	},
	
	/**
	 * Set the local anchor point for the second connected body. By default, this value is set to
	 * <code>(1, 0)</code>.
	 * @example var joint = new Physics2.PulleyJoint();
	 * ...
	 * joint.setLocalAnchorB(new Core.Point(1, 0));
	 * @param {Core.Point} localAnchorB The coordinates of the new local anchor point for the second 
	 *		connected body.
	 * @returns {this}
	 * @see Physics2.PulleyJoint#getLocalAnchorB
	 * @status iOS, Android, Flash
	 * @since 1.6
	 */
	setLocalAnchorB : function( localAnchorB )
	{
		var l = this._localAnchorB;
		l.setAll.apply(l, arguments);
		this._setLocalAnchorBSendGen(l.getX(),l.getY());
		return this;
	},
	
	/**
	 * Retrieve the local anchor point for the second connected body.
	 * @returns {Core.Point} The current local anchor point of the second connected body.
	 * @see Physics2.PulleyJoint#setLocalAnchorB
	 * @status iOS, Android, Flash
	 * @since 1.6
	 */
	getLocalAnchorB: function()
	{
		return this._localAnchorB;
	},
	
	/**
	 * Set the length between <code>groundAnchorA</code> and <code>localAnchorA</code>. By default,
	 * this value is set to <code>0</code>.
	 * @example var joint = new Physics2.PulleyJoint();
	 * ...
	 * setLengthA(1);
	 * @param {Number} setLengthA The new length between <code>groundAnchorA</code> and
	 *		<code>localAnchorA</code>.
	 * @returns {this}
	 * @see Physics2.PulleyJoint#getLengthA
	 * @status iOS, Android, Flash
	 * @since 1.6
	 */
	setLengthA : function( lengthA )
	{
		this._lengthA = lengthA;
		this._setLengthASendGen(lengthA);
		return this;
	},
	
	/**
	 * Retrieve the length between <code>groundAnchorA</code> and <code>localAnchorA</code>.
	 * @returns {Number} The current length between <code>groundAnchorA</code> and
	 *		<code>localAnchorA</code>.
	 * @see Physics2.PulleyJoint#setLengthA
	 * @status iOS, Android, Flash
	 * @since 1.6
	 */
	getLengthA: function()
	{
		return this._lengthA;
	},

	/**
	 * Set the length between <code>groundAnchorB</code> and <code>localAnchorB</code>. By default,
	 * this value is set to <code>0</code>.
	 * @example var joint = new Physics2.PulleyJoint();
	 * ...
	 * setLengthB(1);
	 * @param {Number} setLengthB The new length between <code>groundAnchorB</code> and
	 *		<code>localAnchorB</code>.
	 * @returns {this}
	 * @see Physics2.PulleyJoint#getLengthB
	 * @status iOS, Android, Flash
	 * @since 1.6
	 */
	setLengthB : function( lengthB )
	{
		this._lengthB = lengthB;
		this._setLengthBSendGen(lengthB);
		return this;
	},
	
	/**
	 * Retrieve the length between <code>groundAnchorB</code> and <code>localAnchorB</code>.
	 * @returns {Number} The current length between <code>groundAnchorB</code> and
	 *		<code>localAnchorB</code>.
	 * @see Physics2.PulleyJoint#setLengthB
	 * @status iOS, Android, Flash
	 * @since 1.6
	 */
	getLengthB: function()
	{
		return this._lengthB;
	},
	
	/**
	 * Set the ratio used to simulate a block-and-tackle. By default, this value is set to
	 * <code>1</code>.
	 * @example var joint = new Physics2.PulleyJoint();
	 * ...
	 * setRatio(1);
	 * @param {Number} setRatio The new ratio used to simulate a block-and-tackle.
	 * @returns {this}
	 * @see Physics2.PulleyJoint#getRatio
	 * @status iOS, Android, Flash
	 * @since 1.6
	 */
	setRatio : function( ratio )
	{
		this._ratio = ratio;
		this._setRatioSendGen(ratio);
		return this;
	},

	/**
	 * Retrieve the ratio used to simulate a block-and-tackle.
	 * @returns {Number} The current ratio used to simulate a block-and-tackle.
	 * @see Physics2.PulleyJoint#setRatio
	 * @status iOS, Android, Flash
	 * @since 1.6
	 */
	getRatio: function()
	{
		return this._ratio;
	},
	
// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 357,
	// Method create = -1
	// Method destroy = 2
	// Method setGroundAnchorA = 3
	// Method setGroundAnchorB = 4
	// Method setLocalAnchorA = 5
	// Method setLocalAnchorB = 6
	// Method setLengthA = 7
	// Method setLengthB = 8
	// Method setRatio = 9
	
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
					NgLogE("Unknown instance method id " + cmdId + " in PulleyJoint._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in PulleyJoint._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[357] = h; return h;})(),
	
	/////// Private recv methods.
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x165ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1650002, this );
	},
	
	/** @private */
	_setGroundAnchorASendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1650003, this, [ +x, +y ] );
	},
	
	/** @private */
	_setGroundAnchorBSendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1650004, this, [ +x, +y ] );
	},
	
	/** @private */
	_setLocalAnchorASendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1650005, this, [ +x, +y ] );
	},
	
	/** @private */
	_setLocalAnchorBSendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1650006, this, [ +x, +y ] );
	},
	
	/** @private */
	_setLengthASendGen: function( lengthA )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1650007, this, [ +lengthA ] );
	},
	
	/** @private */
	_setLengthBSendGen: function( lengthB )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1650008, this, [ +lengthB ] );
	},
	
	/** @private */
	_setRatioSendGen: function( ratio )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1650009, this, [ +ratio ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// setGroundAnchorA: function( x, y ) {}
	
	// setGroundAnchorB: function( x, y ) {}
	
	// setLocalAnchorA: function( x, y ) {}
	
	// setLocalAnchorB: function( x, y ) {}
	
	// setLengthA: function( lengthA ) {}
	
	// setLengthB: function( lengthB ) {}
	
	// setRatio: function( ratio ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}













});
