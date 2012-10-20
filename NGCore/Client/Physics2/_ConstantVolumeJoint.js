////////////////////////////////////////////////////////////////////////////////
// Class _ConstantVolumeJoint
//
// Copyright (C) 2011 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Joint = require('./Joint').Joint;

////////////////////////////////////////////////////////////////////////////////

exports._ConstantVolumeJoint = Joint.subclass(
/** @lends Physics2._ConstantVolumeJoint.prototype */
{
	classname: '_ConstantVolumeJoint',
	
	/**
	 * @class The <code>ConstantVolumeJoint</code> class constructs objects that restrict the distance between three or more bodies
	 * but does not constrain their rotation (see <code>{@link Physics2.Body}</code>).
	 * @constructs The default constructor. 
	 * @augments Physics2.Joint
	 * @status iOS, Android
	 */
	initialize: function()
	{
		this._callbackIndexCounter = 1;
		this._callbacks = [];
		this._frequencyHz = 0;
		this._dampingRatio = 0;
		this._bodies = [];
	},

	/**
	 * Destroy this instance and release resources on the backend.
	 * @status iOS, Android
	 */
	destroy : function()
	{
		if(this._bodies)
		{
	    	var length = this._bodies.length;
	    	
	    	for (var i = length - 1; i >= 0; i--)
	        {
	    		if(this._bodies[i])
	    		{
		            this._bodies[i]._willRemoveFromJoint(this);
		            this._bodies.splice( i, 1 );
	    	    }
	        }
	    	
	    	this._bodies.length = 0;
	    	this._bodies = null;
    	}	
	},
	
	/**
	 * Set a connected body for this <code>Joint</code>.
	 * @example var b1 = makeCircle([w*1/3+32*-1, h*1/8], 16);
	 * ...
	 * b1.setContactFlags(Physics2.Body.ContactFlags.All);
	 * ...
	 * var joint = new Physics2.ConstantVolumeJoint();
	 * joint.addBody(b1);
	 * @param {Physics2.Body} body The new connected body.
	 * @returns This function returns <code>this</code> to support method invocation chaining.
	 * @see Physics2.ConstantVolumeJoint#getBodies
	 * @status iOS, Android
	 */
	addBody: function (body)
	{
		if(body !== null)
		{
			//Assign new body
			this._bodies.push(body);
			body._didAddToJoint(this);
		}
		
		this._addBodySendGen(Core.ObjectRegistry.objectToId(body));
		return this;
	},
	
	/**
	 * Retrieve the array of bodies for this <code>ConstantVolumeJoint</code>.
	 * @returns {Physics2.Bodies} The current array of body.
	 * @see Physics2.ConstantVolumeJoint#addBody
	 * @status iOS, Android
	 */
	getBodies: function()
	{
		return this._bodies;
	},
	
	/**
	 * Retrieve the damping frequency of this <code>ConstantVolumeJoint</code>.
	 * @returns {Number} The current damping frequency.
	 * @see Physics2.ConstantVolumeJoint#setFrequencyHz
	 * @status iOS, Android
	 */
	getFrequencyHz: function()
	{
		return this._frequencyHz;
	},
	
	/**
	 * Set the damping frequency for this <code>ConstantVolumeJoint</code>.
	 * @example var joint = new Physics2.ConstantVolumeJoint();
	 * joint.setFrequencyHz(1);
	 * @param {Number} [frequencyHz=0] The new damping frequency.
	 * @returns This function returns <code>this</code> to support method invocation chaining.
	 * @see Physics2.ConstantVolumeJoint#getFrequencyHz
	 * @status iOS, Android
	 */
	setFrequencyHz: function(frequencyHz)
	{
		this._frequencyHz = frequencyHz;
		this._setFrequencyHzSendGen(frequencyHz);
		return this;
	},
	
	/**
	 * Retrieve the damping ratio of this <code>ConstantVolumeJoint</code>.
	 * @returns {Number} The current damping ratio.
	 * @see Physics2.ConstantVolumeJoint#setDampingRatio
	 * @status iOS, Android
	 */
	getDampingRatio: function()
	{
		return this._dampingRatio;
	},
	
	/**
	 * Set the damping ratio for this <code>ConstantVolumeJoint</code>.
	 * @example var joint = new Physics2.ConstantVolumeJoint();
	 * joint.setDampingRatio(10);
	 * @param {Number} [dampingRatio=0] The new damping ratio.
	 * @returns This function returns <code>this</code> to support method invocation chaining.
	 * @see Physics2.ConstantVolumeJoint#setDampingRatio
	 * @status iOS, Android
	 */
	setDampingRatio: function(dampingRatio)
	{
		this._dampingRatio = dampingRatio;
		this._setDampingRatioSendGen(dampingRatio);
		return this;
	},
	
	
	/**
	 * Get the center of mass for this <code>Joint</code>.
	 * @example var joint = new Physics2.ConstantVolumeJoint();
	 * ... 
	 * joint.getCenterOfMass( function (value) {	
	 *	    console.log ("Main.testConstantVolumeJoint.getCenterOfMass: ("+value._x+","+value._y+")")
	 * });
	 * @param {function} callback called at the end of this function.
	 * @status iOS, Android
	 */
	getCenterOfMass: function( callback )
	{
		if (!(callback instanceof Function)) {
			throw new Error('getCenterOfMass requires a callback function, given: ' + callback);
		}
		
		var id = 0;
		if (callback) {
			id = this._callbackIndexCounter++;
			this._callbacks[id] = callback;
		}
		
		this._getCenterOfMassSendGen(id);
	},
	
	_getCenterOfMassCommandCbRecv: function( cmd )
	{
		var msg = {};
		if (!this._getCenterOfMassCommandCbRecvGen(cmd, msg)) {
			return;
		}

		var id = msg.callbackId;
		var centerOfMass = new Core.Point(msg.x, msg.y);
		
		var cb = this._callbacks[id];
		if (!cb) {
			NgLogE("_getCenterOfMassCommandCbRecv command : No registered callback found, id = " + id);
			return;
		}
		
		delete this._callbacks[id];
		cb(centerOfMass);
	},
	
	/**
	 * Get the array of normals for this <code>Joint</code>.
	 * @example var joint = new Physics2.ConstantVolumeJoint();
	 * ... 
	 * joint.getNormals( function (normals) {
	 *  var i = 1;
	 *  for (key in normals)
	 *  {
	 *	   var normal = normals[key];
	 *	   console.log ("Main.testConstantVolumeJoint.getNormals " +i+": ("+normal._x+","+normal._y+")");
	 *	   i++;
	 *  }
	 * });
	 * @param {function} callback called at the end of this function.
	 * @status iOS, Android
	 */
	getNormals: function(callback) {
		
		if (!(callback instanceof Function)) {
			throw new Error('getNormals requires a callback function, given: ' + callback);
		}
		
		var id = 0;
		if (callback) {
			id = this._callbackIndexCounter++;
			this._callbacks[id] = callback;
		}
		
		this._getNormalsSendGen(id);
	},
	
	_getNormalsEventRecv: function(cmd)
	{
		var header = {};
		if( ! this._getNormalsEventRecvGen(cmd, header) )
			return;
		
		var normals = [];
		var callback = this._callbacks[header.callbackId];
		delete this._callbacks[header.callbackId];
		
		for(var i=0; i < header.normalCount; ++i)
		{
			var msg = {};
			if( ! this._getNormalsEventSubCommandRecvGen(cmd, msg) )
				return;
			var normal = new Core.Point(msg.x, msg.y);
			normals.push(normal);
		}
		
		callback(normals);
	},
	
// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 358,
	// Method create = -1
	// Method destroy = 2
	// Method addBody = 3
	// Method setFrequencyHz = 4
	// Method setDampingRatio = 5
	// Method getCenterOfMass = 6
	// Method getCenterOfMassCommandCb = 7
	// Method getNormals = 8
	// Method getNormalsEvent = 9
	// Method getNormalsEventSubCommand = 10
	
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
				
				case 7:
					instance._getCenterOfMassCommandCbRecv( cmd );
					break;
				case 9:
					instance._getNormalsEventRecv( cmd );
					break;
				case 10:
					instance._getNormalsEventSubCommandRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in _ConstantVolumeJoint._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in _ConstantVolumeJoint._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[358] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_getCenterOfMassCommandCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 3 )
		{
			NgLogE("Could not parse due to wrong argument count in _ConstantVolumeJoint.getCenterOfMassCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in _ConstantVolumeJoint.getCenterOfMassCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "x" ] = Core.Proc.parseFloat( cmd[ 1 ] );
		if( obj[ "x" ] === undefined )
		{
			NgLogE("Could not parse x in _ConstantVolumeJoint.getCenterOfMassCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "y" ] = Core.Proc.parseFloat( cmd[ 2 ] );
		if( obj[ "y" ] === undefined )
		{
			NgLogE("Could not parse y in _ConstantVolumeJoint.getCenterOfMassCommandCb from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_getNormalsEventRecvGen: function( cmd, obj )
	{ 
		if( cmd.length < 2 )
		{
			NgLogE("Could not parse due to wrong argument count in _ConstantVolumeJoint.getNormalsEvent from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in _ConstantVolumeJoint.getNormalsEvent from command: " + cmd );
			return false;
		}
		
		obj[ "normalCount" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "normalCount" ] === undefined )
		{
			NgLogE("Could not parse normalCount in _ConstantVolumeJoint.getNormalsEvent from command: " + cmd );
			return false;
		}
		
		cmd.splice(0, 2);
		return true;
	},
	
	/** @private */
	_getNormalsEventSubCommandRecvGen: function( cmd, obj )
	{ 
		if( cmd.length < 2 )
		{
			NgLogE("Could not parse due to wrong argument count in _ConstantVolumeJoint.getNormalsEventSubCommand from command: " + cmd );
			return false;
		}
		
		obj[ "x" ] = Core.Proc.parseFloat( cmd[ 0 ] );
		if( obj[ "x" ] === undefined )
		{
			NgLogE("Could not parse x in _ConstantVolumeJoint.getNormalsEventSubCommand from command: " + cmd );
			return false;
		}
		
		obj[ "y" ] = Core.Proc.parseFloat( cmd[ 1 ] );
		if( obj[ "y" ] === undefined )
		{
			NgLogE("Could not parse y in _ConstantVolumeJoint.getNormalsEventSubCommand from command: " + cmd );
			return false;
		}
		
		cmd.splice(0, 2);
		return true;
	},
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x166ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1660002, this );
	},
	
	/** @private */
	_addBodySendGen: function( body )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1660003, this, [ +body ] );
	},
	
	/** @private */
	_setFrequencyHzSendGen: function( val )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1660004, this, [ +val ] );
	},
	
	/** @private */
	_setDampingRatioSendGen: function( val )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1660005, this, [ +val ] );
	},
	
	/** @private */
	_getCenterOfMassSendGen: function( callbackId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1660006, this, [ +callbackId ] );
	},
	
	/** @private */
	_getNormalsSendGen: function( callbackId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1660008, this, [ +callbackId ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// addBody: function( body ) {}
	
	// setFrequencyHz: function( val ) {}
	
	// setDampingRatio: function( val ) {}
	
	// getCenterOfMass: function( callbackId ) {}
	
	// _getCenterOfMassCommandCbRecv: function( cmd ) {}
	// getNormals: function( callbackId ) {}
	
	// _getNormalsEventRecv: function( cmd ) {}
	// _getNormalsEventSubCommandRecv: function( cmd ) {}
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
