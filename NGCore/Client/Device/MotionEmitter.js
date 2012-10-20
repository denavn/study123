var Core = require('../Core').Core;

exports.MotionEmitter = Core.MessageEmitter.singleton(
/** @lends Device.MotionEmitter.prototype */
{
	classname: 'MotionEmitter',
	
	/**
	 * @class The <code>MotionEmitter</code> class constructs a singleton object that tracks a 
	 * device's movement through 3D space. When the device moves, the <code>MotionEmitter</code>
	 * sends its listeners a <code>{@link Device.MotionEmitter.Motion}</code> object that provides
	 * spatial information about the device.
	 * @singleton
	 * @constructs The default constructor.
	 * @see Device.MotionEmitter.Motion
	 * @augments Core.MessageEmitter
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	initialize: function()
	{
		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);

		this._lastAccel = null;
		this._lastGyro  = null;
		this._lastCompass = null;
	},

	Motion: Core.Class.subclass(
	/** @lends Device.MotionEmitter.Motion.prototype */
	{
		classname: 'Motion',
		
		/**
		 * @class <code>MotionEmitter</code> objects use <code>Motion</code> objects to provide
		 * spatial information about a device's movement. These objects report the information
		 * obtained from the device's accelerometer, gyroscope, and compass instruments during the
		 * most recent event.<br /><br />
		 * <strong>Important</strong>: By default, accelerometer data is returned using the
		 * right-hand rule on iOS and the left-hand rule on Android. To use the right-hand rule on
		 * both platforms, call <code>{@link Device.MotionEmitter#useCommonAccelerometerMode}</code>
		 * before you call <code>{@link Device.MotionEmitter.Motion#getAccelData}</code>.
		 * @constructs The default constructor. 
		 * @param {Object} accel accelerometer data for the device, indexed by "x", "y", and "z".
		 * @param {Object} gyro gyroscope accelerometer data for the device, indexed by "x", "y", and "z".
		 * @param {Object} compass compass data for the device, indexed by "x", "y", and "z".
		 * @see Device.MotionEmitter
		 * @augments Core.Class
		 * @since 1.0
		 */
		initialize: function(accel, gyro, compass)
		{
			this._accel = accel;
			this._gyro  = gyro;
			this._compass = compass;
		},
		
		/**
		 * Retrieve accelerometer data from the device. A call to <code>getAccelData()</code> on a device that contains an accelerometer
		 * returns an object that contains the accelerometer data. In all other cases, calling <code>getAccelData()</code> returns 
		 * <code>undefined</code>. The accelerometer value is based on the default orientation mode and is not affected by orientation
		 * changes.<br /><br />
		 * On iOS, the value is returned using the right-hand rule, and on Android, the value is returned using the left-hand rule.
		 * To make the value consistent across platforms, call <code>{@link Device.MotionEmitter#useCommonAccelerometerMode}</code>
		 * before you call <code>getAccelData()</code>.<br /><br />
		 * <b>Note:</b> Use <code>{@link Core.Capabilities#getHasAccel}</code> to programmatically check a 
		 * device for an accelerometer.
		 * @returns {Object} An object that contains the accelerometer data for the device, indexed by "x", "y", and "z".
		 * @see Core.Capabilities#getHasAccel
		 * @see Device.MotionEmitter#useCommonAccelerometerMode
		 * @status iOS, Android, Test, iOSTested, AndroidTested
		 * @since 1.0
		 */
		getAccelData: function()
		{
			return this._accel;
		},
		
		/**
		 * Retrieve gyroscope data from the device. A call to <code>getGyroData()</code> on a device that contains a gyroscope
		 * returns an object that contains the gyroscope data. In all other cases,
		 * this call returns <code>undefined</code>. <br /><br />
		 * <b>Note:</b> Use <code>{@link Core.Capabilities#getHasGyro}</code> to programmatically check a
		 * device for a gyroscope. 
		 * @returns {Object} An object that contains the gyroscope data for the device, indexed by "x", "y", and "z".
		 * @see Core.Capabilities#getHasGyro
		 * @status iOS, Android, Test, iOSTested, AndroidTested
		 * @since 1.0
		 */
		getGyroData: function()
		{
			return this._gyro;
		},
		
		/**
		 * Retrieve compass data from the device. A call to <code>getCompassData()</code> on a device that contains a magnetic compass
		 * returns an object that contains the compass data. In all other cases,
		 * this call returns <code>undefined</code>.<br /><br />
		 * <b>Note:</b> Use <code>{@link Core.Capabilities#getHasCompass}</code> to programmatically check a device for a compass. 
		 * @returns {Object} An object that contains the compass data for the device, indexed by "x", "y", and "z".
		 * @see Core.Capabilities#getHasCompass
		 * @status iOS, Android, Test, iOSTested, AndroidTested
		 * @since 1.0
		 */
		getCompassData: function()
		{
			return this._compass;
		}
	}),

	/**
	 * Register a <code>MessageListener</code> object with the <code>MotionEmitter</code>. If an application calls <code>emit()</code> 
	 * or <code>chain()</code> 
	 * on this emitter, a callback function passed as a parameter is called on the specified listener.
	 * The parameter for the callback function is a <code>Motion</code> object.<br /><br />
	 * <b>Note:</b> Each listener can only listen to an emitter once.<br /><br />
	 * The following code examples illustrate different call styles for <code>addListener()</code>.
	 * @example
	 * emitter.addListener(myListener, myListener.onCallback);
	 * @example
	 * emitter.addListener(myListener, myListener.onEvent, 200);
	 * @param {$super} $super This parameter is a reference to the base class implementation and is stripped out during execution. Do not supply it.
	 * @param {Core.MessageListener} listener The <code>MessageListener</code> to add.
	 * @cb {Function} func The function to call when a motion event occurs.
	 * @cb-param {Device.MotionEmitter.Motion} motion Information about the motion event.
	 * @cb-returns {void}
	 * @param {Number} [priority=0] The priority for this <code>MessageListener</code>.
	 * @see Core.MessageEmitter#emit
	 * @see Core.MessageEmitter#chain
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	addListener: function($super, listener, func, priority)
	{
		if (this.getListenerCount() === 0) {
			// start the Accelerometer if this is the first listener
			this._startMotionSendGen();
		}

		$super(listener, func, priority);
	},

	/**
	 * Remove a <code>MessageListener</code> object from this <code>MotionEmitter</code> object. 
	 * @example
	 * emitter.removeListener(myListener);
	 * @param {$super} $super This parameter is a reference to the base class implementation and is stripped out during execution. Do not supply it.
	 * @param {Core.MessageListener} listener The <code>MessageListener</code> to remove.	 
	 * @returns {Boolean} Returns <code>true</code> when the registered listener was removed. Returns <code>false</code> in all other cases.
	 * @see Core.MessageEmitter#addListener
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	removeListener: function($super, listener)
	{
		$super(listener);

		if (this.getListenerCount() === 0) {
			// stop the Accelerometer if this is the last listener
			this._stopMotionSendGen();
		}
	},

	_emitMotion: function()
	{
		var motion = new Device.MotionEmitter.Motion(this._lastAccel, this._lastGyro, this._lastCompass);
		this.emit(motion);
	},

	_accelChangedRecv: function( cmd )
	{
		var msg = {};
		if(!this._accelChangedRecvGen(cmd, msg))
			return;

		this._lastAccel = msg;
		this._emitMotion();
		
		//Cascade the original message back out to native for forwarding
		this._accelChangedSendGen(msg.x, msg.y, msg.z);
	},

	_gyroChangedRecv: function( cmd )
	{
		var msg = {};
		if(!this._gyroChangedRecvGen(cmd, msg))
			return;

		this._lastGyro = msg;
		this._emitMotion();
		
		//Cascade the original message back out to native for forwarding
		this._gyroChangedSendGen(msg.x, msg.y, msg.z);
	},
	
	_magneticChangedRecv: function( cmd ) 
	{
		var msg = {};
		if(!this._magneticChangedRecvGen(cmd, msg))
			return;
		
 		this._lastCompass = msg;
		this._emitMotion();
		
		//Cascade the original message back out to native for forwarding
		this._magneticChangedSendGen(msg.x, msg.y, msg.z);
	},

	/**
	 * Specify whether the <code>MotionEmitter</code> should use the right-hand rule to return 
	 * accelerometer data on both iOS and Android. By default, iOS uses the right-hand rule, and
	 * Android uses the left-hand rule.
	 * @param {Boolean} use Set to <code>true</code> to use the right-hand rule on both iOS and
	 *		Android. Set to <code>false</code> to use the right-hand rule on iOS and the left-hand
	 *		rule on Android.
	 * @returns {void}
	 * @see Device.MotionEmitter.Motion#getAccelData
	 * @since 1.6
	 */
	useCommonAccelerometerMode: function(use) {
		this._useCommonAccelerometerModeSendGen(use);
	},

// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 330,
	// Method create = -1
	// Method accelChanged = 2
	// Method gyroChanged = 3
	// Method magneticChanged = 4
	// Method startMotion = 5
	// Method stopMotion = 6
	// Method useCommonAccelerometerMode = 7
	
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
				
				case 2:
					instance._accelChangedRecv( cmd );
					break;
				case 3:
					instance._gyroChangedRecv( cmd );
					break;
				case 4:
					instance._magneticChangedRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in MotionEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in MotionEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[330] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_accelChangedRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 3 )
		{
			NgLogE("Could not parse due to wrong argument count in MotionEmitter.accelChanged from command: " + cmd );
			return false;
		}
		
		obj[ "x" ] = Core.Proc.parseFloat( cmd[ 0 ] );
		if( obj[ "x" ] === undefined )
		{
			NgLogE("Could not parse x in MotionEmitter.accelChanged from command: " + cmd );
			return false;
		}
		
		obj[ "y" ] = Core.Proc.parseFloat( cmd[ 1 ] );
		if( obj[ "y" ] === undefined )
		{
			NgLogE("Could not parse y in MotionEmitter.accelChanged from command: " + cmd );
			return false;
		}
		
		obj[ "z" ] = Core.Proc.parseFloat( cmd[ 2 ] );
		if( obj[ "z" ] === undefined )
		{
			NgLogE("Could not parse z in MotionEmitter.accelChanged from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_gyroChangedRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 3 )
		{
			NgLogE("Could not parse due to wrong argument count in MotionEmitter.gyroChanged from command: " + cmd );
			return false;
		}
		
		obj[ "x" ] = Core.Proc.parseFloat( cmd[ 0 ] );
		if( obj[ "x" ] === undefined )
		{
			NgLogE("Could not parse x in MotionEmitter.gyroChanged from command: " + cmd );
			return false;
		}
		
		obj[ "y" ] = Core.Proc.parseFloat( cmd[ 1 ] );
		if( obj[ "y" ] === undefined )
		{
			NgLogE("Could not parse y in MotionEmitter.gyroChanged from command: " + cmd );
			return false;
		}
		
		obj[ "z" ] = Core.Proc.parseFloat( cmd[ 2 ] );
		if( obj[ "z" ] === undefined )
		{
			NgLogE("Could not parse z in MotionEmitter.gyroChanged from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_magneticChangedRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 3 )
		{
			NgLogE("Could not parse due to wrong argument count in MotionEmitter.magneticChanged from command: " + cmd );
			return false;
		}
		
		obj[ "x" ] = Core.Proc.parseFloat( cmd[ 0 ] );
		if( obj[ "x" ] === undefined )
		{
			NgLogE("Could not parse x in MotionEmitter.magneticChanged from command: " + cmd );
			return false;
		}
		
		obj[ "y" ] = Core.Proc.parseFloat( cmd[ 1 ] );
		if( obj[ "y" ] === undefined )
		{
			NgLogE("Could not parse y in MotionEmitter.magneticChanged from command: " + cmd );
			return false;
		}
		
		obj[ "z" ] = Core.Proc.parseFloat( cmd[ 2 ] );
		if( obj[ "z" ] === undefined )
		{
			NgLogE("Could not parse z in MotionEmitter.magneticChanged from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x14affff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_accelChangedSendGen: function( x, y, z )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x14a0002, this, [ +x, +y, +z ] );
	},
	
	/** @private */
	_gyroChangedSendGen: function( x, y, z )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x14a0003, this, [ +x, +y, +z ] );
	},
	
	/** @private */
	_magneticChangedSendGen: function( x, y, z )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x14a0004, this, [ +x, +y, +z ] );
	},
	
	/** @private */
	_startMotionSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x14a0005, this );
	},
	
	/** @private */
	_stopMotionSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x14a0006, this );
	},
	
	/** @private */
	_useCommonAccelerometerModeSendGen: function( use )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x14a0007, this, [ ( use ? 1 : 0 ) ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// _accelChangedRecv: function( cmd ) {}
	// accelChanged: function( x, y, z ) {}
	
	// _gyroChangedRecv: function( cmd ) {}
	// gyroChanged: function( x, y, z ) {}
	
	// _magneticChangedRecv: function( cmd ) {}
	// magneticChanged: function( x, y, z ) {}
	
	// startMotion: function(  ) {}
	
	// stopMotion: function(  ) {}
	
	// useCommonAccelerometerMode: function( use ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});
// vim:set fdm=marker noexpandtab:
