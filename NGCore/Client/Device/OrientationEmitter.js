////////////////////////////////////////////////////////////////////////////////
// Class OrientationEmitter
//
// Copyright (C) 2010 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Core = require('../Core').Core;

////////////////////////////////////////////////////////////////////////////////

exports.OrientationEmitter = Core.MessageEmitter.singleton(
/** @lends Device.OrientationEmitter.prototype */
{
	classname: 'OrientationEmitter',
		
	/**
	 * @class <code>OrientationEmitter</code> constructs a singleton object that tracks the physical
	 * orientation of the device, as well as the orientation of the device's interface. When the
	 * physical or interface orientation changes, the listener receives an object that has the
	 * following properties:
	 * <ul>
	 *		<li><code>orientation</code>: The new orientation. Corresponds to an enumerated value of
	 *		<code>{@link Device.OrientationEmitter#Orientation}</code>.</li>
	 *		<li><code>type</code>: Indicates whether the physical or interface orientation changed.
	 *		Corresponds to an enumerated value of
	 *		<code>{@link Device.OrientationEmitter#OrientationType}</code>.</li>
	 * </ul>
	 * Rotating the device does not automatically rotate the interface presented to the user.
	 * Applications must explicitly call
	 * <code>{@link Device.OrientationEmitter#setInterfaceOrientation}</code> to rotate the
	 * interface. This allows an application to selectively choose which device orientations will
	 * result in a change to the interface orientation.<br /><br />
	 * @constructs The default constructor.
	 * @singleton
	 * @augments Core.MessageEmitter
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	initialize: function()
	{
		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);

		this._lastDeviceOrientation    = this.Orientation.Portrait;
		this._lastInterfaceOrientation = this.Orientation.Portrait;
	},
	
	/**
	 * Retrieve the device orientation.
	 * @returns {Device.OrientationEmitter#Orientation} The current device orienation.
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getDeviceOrientation: function()
	{
		return this._lastDeviceOrientation;
	},
	
	/**
	 * Retrieve the interface orientation. Initially, this is the same as the device orientation.
	 * @returns {Device.OrientationEmitter#Orientation} The current interface orientation.
	 * @see Device.OrientationEmitter#setInterfaceOrientation
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getInterfaceOrientation: function()
	{
		return this._lastInterfaceOrientation;
	},
	
	/**
	 * Set the interface orientation. The <code>LandscapeRight</code> and <code>PortraitUpsideDown</code>
	 * orientations are supported on iOS and on Android 2.3 and later.
	 * @example
	 * Device.OrientationEmitter.setInterfaceOrientation(Device.OrientationEmitter.Orientation.Portrait);
	 * @param {Device.OrientationEmitter#Orientation} orientation The new device orientation.
	 * @param {Boolean} [animated] Set to <code>true</code> to render the orientation change with an animated effect.
	 * @returns {void}
	 * @see Device.OrientationEmitter#getInterfaceOrientation
	 * @see Device.OrientationEmitter#isInterfaceOrientation
	 * @status iOS, Test
	 * @since 1.0
	 */
	setInterfaceOrientation: function(orientation, animated)
	{
		if( !this.isInterfaceOrientation( orientation ) )
		{
			NgLogE("Unknown orientation specified: " + orientation);
			return;
		}

		if (orientation != this._lastInterfaceOrientation)
		{
			NgLogD("setInterfaceOrientation to " + orientation);
			this._setInterfaceOrientationSendGen(orientation,animated);
			this._lastInterfaceOrientation = orientation;
		}
	},
	
	/**
	 * Check whether a specified orientation can be used as a parameter to
	 * <code>{@link Device.OrientationEmitter#setInterfaceOrientation}</code>.
	 * @param {Device.OrientationEmitter#Orientation} orientation The orientation to check.
	 * @returns {Boolean} Set to <code>true</code> if the specified orientation can be used to set
	 *		the interface orientation.
	 * @see Device.OrientationEmitter#getInterfaceOrientation
	 * @since 1.6
	 */
	isInterfaceOrientation: function(orientation)
	{
		return orientation == this.Orientation.Portrait
			|| orientation == this.Orientation.PortraitUpsideDown
			|| orientation == this.Orientation.LandscapeLeft
			|| orientation == this.Orientation.LandscapeRight;
	},
	
	/**
	 * Enumeration for device orientation.
	 * @fieldOf Device.OrientationEmitter#
	 */
	Orientation:
	{ 
		/** 
		* Portrait orientation. 
		* @fieldOf Device.OrientationEmitter#
		* @constant
		*/
		Portrait: 0,
		/** 
		* Portrait orientation, but rotated 180 degrees. Used only on iOS and on Android 2.3 and later.
		* @fieldOf Device.OrientationEmitter#
		* @constant
		*/
		PortraitUpsideDown: 1,
		/** 
		* Landscape orientation with the top of the device to the left. 
		* @fieldOf Device.OrientationEmitter#
		* @constant
		*/
		LandscapeLeft: 2,
		/** 
		* Landscape orientation with the top of the device to the right. Used only on iOS and on Android 2.3 and later.
		* @fieldOf Device.OrientationEmitter#
		* @constant
		*/
		LandscapeRight: 3,
		/** 
		* Oriented with the face of the device up. Used only on iOS.
		* @fieldOf Device.OrientationEmitter#
		* @constant
		*/
		FaceUp: 4,
		/** 
		* Oriented with the face of the device down. Used only on iOS.
		* @fieldOf Device.OrientationEmitter#
		* @constant
		*/
		FaceDown: 5
	},

	/**
	 * Enumeration for the type of orientation change that occurred.
	 * @fieldOf Device.OrientationEmitter#
	 */
	OrientationType:
	{
		/**
		* Device orientation has changed.
		* @fieldOf Device.OrientationEmitter#
		* @constant
		*/
		Device: 0,
		/**
		* Interface orientation has changed.
		* @fieldOf Device.OrientationEmitter#
		* @constant
		*/
		Interface: 1
	},

	_orientationChangedRecv: function( cmd )
	{
		var msg = {};
		if(!this._orientationChangedRecvGen(cmd, msg))
			return;
 
 		this._lastDeviceOrientation = msg['orientation'];
		this.emit({type: this.OrientationType.Device, orientation:msg['orientation']});
		
		//Cascade the original message back out to native for forwarding
		this._orientationChangedSendGen(msg.orientation);
	},
	
	_interfaceOrientationChangedRecv: function( cmd )
	{
		var msg = {};
		if(!this._interfaceOrientationChangedRecvGen(cmd, msg))
			return;
 
 		this._lastInterfaceOrientation = msg['orientation'];
		this.emit({type: this.OrientationType.Interface, orientation:msg['orientation']});
		
		//Cascade the original message back out to native for forwarding
		this._interfaceOrientationChangedSendGen(msg.orientation);
	},

// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 335,
	// Method create = -1
	// Method orientationChanged = 2
	// Method setInterfaceOrientation = 3
	// Method interfaceOrientationChanged = 4
	
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
					instance._orientationChangedRecv( cmd );
					break;
				case 4:
					instance._interfaceOrientationChangedRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in OrientationEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in OrientationEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[335] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_orientationChangedRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in OrientationEmitter.orientationChanged from command: " + cmd );
			return false;
		}
		
		obj[ "orientation" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "orientation" ] === undefined )
		{
			NgLogE("Could not parse orientation in OrientationEmitter.orientationChanged from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_interfaceOrientationChangedRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in OrientationEmitter.interfaceOrientationChanged from command: " + cmd );
			return false;
		}
		
		obj[ "orientation" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "orientation" ] === undefined )
		{
			NgLogE("Could not parse orientation in OrientationEmitter.interfaceOrientationChanged from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x14fffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_orientationChangedSendGen: function( orientation )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x14f0002, this, [ +orientation ] );
	},
	
	/** @private */
	_setInterfaceOrientationSendGen: function( orientation, animated )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x14f0003, this, [ +orientation, ( animated ? 1 : 0 ) ] );
	},
	
	/** @private */
	_interfaceOrientationChangedSendGen: function( orientation )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x14f0004, this, [ +orientation ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// _orientationChangedRecv: function( cmd ) {}
	// orientationChanged: function( orientation ) {}
	
	// setInterfaceOrientation: function( orientation, animated ) {}
	
	// _interfaceOrientationChangedRecv: function( cmd ) {}
	// interfaceOrientationChanged: function( orientation ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});
// vim:set fdm=marker noexpandtab:
