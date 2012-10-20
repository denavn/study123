////////////////////////////////////////////////////////////////////////////////
// Class LocationEmitter
//
// Copyright (C) 2010 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Core = require('../Core').Core;

////////////////////////////////////////////////////////////////////////////////

exports.LocationEmitter = Core.MessageEmitter.singleton(
/** @lends Device.LocationEmitter.prototype */
{
	classname: 'LocationEmitter',
	
	/**
	 * Enumeration for the desired accuracy of the location measurement.
	 * @fieldOf Device.LocationEmitter#
	 */
	Accuracy:
	{
		/**
		 * Low accuracy. The location that is reported will be within several miles of the actual 
		 * location. This setting minimizes the device's power consumption.
		 * @fieldOf Device.LocationEmitter#
		 * @constant
		 */
		LOW:    0, // equivalent to "3km"  in iOS
		
		/**
		 * Medium accuracy. The location that is reported will be within roughly 100 yards of the
		 * actual location.
		 * @fieldOf Device.LocationEmitter#
		 * @constant
		 */
		MEDIUM: 1, // equivalent to "100m" in iOS
		
		/**
		 * High accuracy. The location that is reported will be within a few yards of the actual
		 * location. This setting results in the highest power consumption.
		 * @fieldOf Device.LocationEmitter#
		 * @constant
		 */
		HIGH:   2  // equivalent to "Best" in iOS
	},
	
	/**
	 * Enumeration to choose which data about the device's location will be sent to the application.
	 * @fieldOf Device.LocationEmitter#
	 */
	Elements:
	{
		/**
		 * Receive latitude data.
		 * @fieldOf Device.LocationEmitter#
		 * @constant
		 */
		LATITUDE:  1,
		
		/**
		 * Receive longitude data.
		 * @fieldOf Device.LocationEmitter#
		 * @constant
		 */
		LONGITUDE: 2,
		
		/**
		 * Receive altitude data.
		 * @fieldOf Device.LocationEmitter#
		 * @constant
		 */
		ALTITUDE:  4,
		
		/**
		 * Receive heading data.
		 * @fieldOf Device.LocationEmitter#
		 * @constant
		 */
		HEADING:   8  // equivalent to "bearing" in Android
	},

	/**
	 * @class The <code>LocationEmitter</code> class constructs a singleton object that sends its
	 * listeners a <code>{@link Device.LocationEmitter.Location}</code> object when the device's
	 * location changes.
	 * @singleton
	 * @constructs The default constructor. 
	 * @augments Core.MessageEmitter
	 * @see Device.LocationEmitter.Location
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	initialize: function()
	{
		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
		this._lastLocation = undefined;
		this._forceListeners = [];
		this.elements = this.Elements.LATITUDE | this.Elements.LONGITUDE | this.Elements.ALTITUDE | this.Elements.HEADING;
	},

	/**
	 * Set the desired accuracy for each update, as well as the information to include in each
	 * update.
	 * @param {LocationEmitter#Accuracy} accuracy Accuracy of updates. The default value is HIGH.
	 * @param {Number} elements OR-ed <code>LocationEmitter.Elements</code>. Example: LATITUDE | LONGITUDE. The default value is LATITUDE | LONGITUDE | ALTITUDE | HEADING (i.e. listens to all elements).
	 * @returns {void}
	 * @status
	 * @since 1.1.1.2
	 */
	setProperties: function(accuracy, elements)
	{
		if (typeof accuracy != 'number') accuracy = this.Accuracy.HIGH;
		if (! elements) elements = this.Elements.LATITUDE | this.Elements.LONGITUDE | this.Elements.ALTITUDE | this.Elements.HEADING;
		this.accuracy = accuracy;
		this.elements = elements;
		this._setPropertiesSendGen(accuracy,elements);
	},

	/**
	 * Add a <code>MessageListener</code> to this emitter. When an application calls <code>emit()</code> 
	 * or <code>chain()</code> 
	 * on this emitter, a callback function passed as a parameter is called on the specified listener.
	 * <br /><br />
	 * <b>Note:</b> Each listener can only listen to an emitter one time.<br /><br />
	 * The following code examples illustrate different call styles for <code>addListener()</code>.
	 * @example
	 * emitter.addListener(myListener, myListener.onCallback);
	 * @example
	 * emitter.addListener(myListener, myListener.onEvent, false);
	 * @example
	 * emitter.addListener(myListener, myListener.onEvent, true, 200);
	 * @param {$super} $super This parameter is a reference to the base class implementation and is stripped out during execution. Do not supply it.
	 * @param {Core.MessageListener} listener The <code>MessageListener</code> to add.
	 * @cb {Function} func The function to call when a location event occurs.
	 * @cb-param {Device.LocationEmitter.Location} location Information about the device's location.
	 * @cb-returns {void}
	 * @param {Boolean} forceStart Set to <code>true</code> if the application requires location services to function properly.
	 * @param {Number} [priority=0] The priority for this <code>MessageListener</code>.
	 * @throws {Error} The specified listener is already listening to the emitter.
	 * @throws {Error} The specified listener is not an instance of <code>Core.MessageListener</code>.
	 * @see Device.LocationEmitter#removeListener
	 * @see Core.MessageEmitter#emit
	 * @see Core.MessageEmitter#chain
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	addListener: function($super, listener, func, forceStart, priority) {
		if(forceStart === undefined)
		{
			this._startUpdatingSendGen(true);
			this._forceListeners.push(listener);
		}
		else
		{
			this._startUpdatingSendGen(forceStart);
			if(forceStart === true)
				this._forceListeners.push(listener);
		}

		$super(listener, func, priority);
	},
	
	/**
	 * Remove a <code>MessageListener</code> from this emitter.<br /><br /> 
	 * @example
	 * emitter.removeListener(myListener);
	 * @param {$super} $super This parameter is a reference to the base class implementation and is stripped out during execution. Do not supply it.
	 * @param {Core.MessageListener} listener The <code>MessageListener</code> to remove.
	 * @returns {Boolean} Returns <code>true</code> if the registered listener was removed. Returns <code>false</code> if the registered listener is not found 
	 * or is not registered with this emitter.
	 * @see Device.LocationEmitter#addListener
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	removeListener: function($super, listener) {
		$super(listener);

		var index = this._forceListeners.indexOf(listener);
		if(index != -1)
		{
			this._forceListeners.splice(index,1);
			if(this._forceListeners.length === 0)
				this._stopUpdatingSendGen();
		}
	},
    
	/**
	 * Retrieve the last location returned by this <code>LocationEmitter</code>.
	 * @returns {Device.LocationEmitter.Location} The last location returned.
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getLastLocation: function()
	{
		if(this._lastLocation === undefined || !this._lastLocation.getPosition()) return undefined;
		
		return this._lastLocation;
	},
	
    _locationUpdatedRecv: function( cmd ) {
		var msg = {};
		if (!this._locationUpdatedRecvGen(cmd, msg))
		    return;

		if (((this.elements & this.Elements.LATITUDE) === 0)  &&
			((this.elements & this.Elements.LONGITUDE) === 0) &&
			((this.Elements & this.Elements.ALTITUDE) === 0))
			return;

		this._lastLocation = new this.Location(
			new Core.Point(msg["latitude"], msg["longitude"]),
			msg["altitude"],
			this._lastLocation ? this._lastLocation.getHeading() : undefined,
			msg["accuracy"],
			msg["timestamp"]);

		this.emit(this._lastLocation);
    },
	
	_headingUpdatedRecv: function( cmd ) 
	{
		var msg = {};
		if (!this._headingUpdatedRecvGen(cmd, msg))
			return;
			
		if ((this.elements & this.Elements.HEADING) === 0)
			return;

		this._lastLocation = new this.Location(
			this._lastLocation ? this._lastLocation.getPosition() : undefined,
			this._lastLocation ? this._lastLocation.getAltitude() : undefined,
			msg['magneticHeading'],
			this._lastLocation ? this._lastLocation.getAccuracy() : undefined,
			msg['timestamp']);
		
		if(msg['magneticHeading']) {
			this.emit(this._lastLocation);
		}
	},
	
	Location: Core.Class.subclass(
	/** @lends Device.LocationEmitter.Location.prototype */
	{
		classname: 'Location',
		
		/**
		 * @class <code>Location</code> constructs objects that encapsulate the location of a device.
		 * <code>Location</code> objects contain spatial components, like position and heading information, and a timestamp that indicates when a location is measured.
		 * 
		 * @constructs The default constructor. 
		 * @param {Core.Point} position The latitude / longitude of the device.
		 * @param {Number} altitude The altitude of the device.
		 * @param {Number} heading The heading of the device.
		 * @param {Number} accuracy The accuracy of the measurement.
		 * @param {Number} timestamp The timestamp when the location was measured.
		 * @augments Core.Class
		 * @since 1.0
		 */
		initialize: function(position, altitude, heading, accuracy, timestamp)
		{
			this._position = position;
			this._altitude = altitude;
			this._accuracy = accuracy;
			this._heading = heading;
			this._timestamp = timestamp;
		},
		
		/**
		 * Return the position of this <code>Location</code> as latitude / longitude.
		 * @returns {Core.Point} The current latitude / longitude.
		 * @status iOS, Android, Test, iOSTested, AndroidTested
		 * @since 1.0
		 */
		getPosition: function()
		{
			return this._position;
		},
		
		/**
		 * Return the altitude of this <code>Location</code> in feet (ft).
		 * @returns {Number} The current altitude.
		 * @status iOS, Android, Test, iOSTested, AndroidTested
		 * @since 1.0
		 */
		getAltitude: function()
		{
			return this._altitude;
		},
		
		/**
		 * Return the heading of this <code>Location</code> in degrees east of north.
		 * @returns {Number} The current heading.
		 * @status iOS, Android, Test, iOSTested, AndroidTested
		 * @since 1.0
		 */
		getHeading: function()
		{
			return this._heading;
		},
		
		/**
		 * Return the accuracy of the measurement for this <code>Location</code>.
		 * @returns {Number} The current location accuracy.
		 * @status iOS, Android, Test, iOSTested, AndroidTested
		 * @since 1.0
		 */
		getAccuracy: function()
		{
			return this._accuracy;
		},
		
		/**
		 * Return the timestamp when this measurement was taken.
		 * Expressed in milliseconds since Epoch (Unix time).
		 * @returns {Number} The timestamp of the measurement.
		 * @status iOS, Android, Test, iOSTested, AndroidTested
		 * @since 1.0
		 */
		getTimestamp: function()
		{
			return this._timestamp;
		}
	}),
	
// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 333,
	// Method create = -1
	// Method destroy = 2
	// Method startUpdatingLocation = 3
	// Method stopUpdatingLocation = 4
	// Method locationUpdated = 5
	// Method startUpdatingHeading = 6
	// Method stopUpdatingHeading = 7
	// Method headingUpdated = 8
	// Method setProperties = 9
	// Method startUpdating = 10
	// Method stopUpdating = 11
	
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
				
				case 5:
					instance._locationUpdatedRecv( cmd );
					break;
				case 8:
					instance._headingUpdatedRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in LocationEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in LocationEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[333] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_locationUpdatedRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 5 )
		{
			NgLogE("Could not parse due to wrong argument count in LocationEmitter.locationUpdated from command: " + cmd );
			return false;
		}
		
		obj[ "timestamp" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "timestamp" ] === undefined )
		{
			NgLogE("Could not parse timestamp in LocationEmitter.locationUpdated from command: " + cmd );
			return false;
		}
		
		obj[ "latitude" ] = Core.Proc.parseFloat( cmd[ 1 ] );
		if( obj[ "latitude" ] === undefined )
		{
			NgLogE("Could not parse latitude in LocationEmitter.locationUpdated from command: " + cmd );
			return false;
		}
		
		obj[ "longitude" ] = Core.Proc.parseFloat( cmd[ 2 ] );
		if( obj[ "longitude" ] === undefined )
		{
			NgLogE("Could not parse longitude in LocationEmitter.locationUpdated from command: " + cmd );
			return false;
		}
		
		obj[ "altitude" ] = Core.Proc.parseFloat( cmd[ 3 ] );
		if( obj[ "altitude" ] === undefined )
		{
			NgLogE("Could not parse altitude in LocationEmitter.locationUpdated from command: " + cmd );
			return false;
		}
		
		obj[ "accuracy" ] = Core.Proc.parseFloat( cmd[ 4 ] );
		if( obj[ "accuracy" ] === undefined )
		{
			NgLogE("Could not parse accuracy in LocationEmitter.locationUpdated from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_headingUpdatedRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 4 )
		{
			NgLogE("Could not parse due to wrong argument count in LocationEmitter.headingUpdated from command: " + cmd );
			return false;
		}
		
		obj[ "timestamp" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "timestamp" ] === undefined )
		{
			NgLogE("Could not parse timestamp in LocationEmitter.headingUpdated from command: " + cmd );
			return false;
		}
		
		obj[ "magneticHeading" ] = Core.Proc.parseFloat( cmd[ 1 ] );
		if( obj[ "magneticHeading" ] === undefined )
		{
			NgLogE("Could not parse magneticHeading in LocationEmitter.headingUpdated from command: " + cmd );
			return false;
		}
		
		obj[ "trueHeading" ] = Core.Proc.parseFloat( cmd[ 2 ] );
		if( obj[ "trueHeading" ] === undefined )
		{
			NgLogE("Could not parse trueHeading in LocationEmitter.headingUpdated from command: " + cmd );
			return false;
		}
		
		obj[ "accuracy" ] = Core.Proc.parseFloat( cmd[ 3 ] );
		if( obj[ "accuracy" ] === undefined )
		{
			NgLogE("Could not parse accuracy in LocationEmitter.headingUpdated from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x14dffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x14d0002, this );
	},
	
	/** @private */
	_startUpdatingLocationSendGen: function( accuracy, distanceFilter )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x14d0003, this, [ +accuracy, +distanceFilter ] );
	},
	
	/** @private */
	_stopUpdatingLocationSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x14d0004, this );
	},
	
	/** @private */
	_locationUpdatedSendGen: function( timestamp, latitude, longitude, altitude, accuracy )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x14d0005, this, [ +timestamp, +latitude, +longitude, +altitude, +accuracy ] );
	},
	
	/** @private */
	_startUpdatingHeadingSendGen: function( orientation, angularFilter )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x14d0006, this, [ +orientation, +angularFilter ] );
	},
	
	/** @private */
	_stopUpdatingHeadingSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x14d0007, this );
	},
	
	/** @private */
	_headingUpdatedSendGen: function( timestamp, magneticHeading, trueHeading, accuracy )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x14d0008, this, [ +timestamp, +magneticHeading, +trueHeading, +accuracy ] );
	},
	
	/** @private */
	_setPropertiesSendGen: function( accuracy, elements )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x14d0009, this, [ +accuracy, +elements ] );
	},
	
	/** @private */
	_startUpdatingSendGen: function( force )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x14d000a, this, [ ( force ? 1 : 0 ) ] );
	},
	
	/** @private */
	_stopUpdatingSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x14d000b, this );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// startUpdatingLocation: function( accuracy, distanceFilter ) {}
	
	// stopUpdatingLocation: function(  ) {}
	
	// _locationUpdatedRecv: function( cmd ) {}
	// locationUpdated: function( timestamp, latitude, longitude, altitude, accuracy ) {}
	
	// startUpdatingHeading: function( orientation, angularFilter ) {}
	
	// stopUpdatingHeading: function(  ) {}
	
	// _headingUpdatedRecv: function( cmd ) {}
	// headingUpdated: function( timestamp, magneticHeading, trueHeading, accuracy ) {}
	
	// setProperties: function( accuracy, elements ) {}
	
	// startUpdating: function( force ) {}
	
	// stopUpdating: function(  ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});
