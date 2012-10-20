var Core = require('../Core').Core;

////////////////////////////////////////////////////////////////////////////////

exports.NetworkEmitter = Core.MessageEmitter.singleton(
/** @lends Device.NetworkEmitter.prototype */
{
	classname: 'NetworkEmitter',
	
	/**
	 * @class The <code>NetworkEmitter</code> class constructs a singleton object that sends its
	 * listeners a unique value when any of the following changes occur:
	 * <ul>
	 * <li>The device loses access to a network.</li>
	 * <li>The device gains access to a network.</li>
	 * <li>The device switches between cellular and wi-fi network access.</li>
	 * </ul>
	 * The unique value that the listeners receive corresponds to an enumerated value of 
	 * <code>{@link Device.NetworkEmitter#Status}</code>.<br /><br />
	 * In addition, the <code>NetworkEmitter</code> class provides listeners that receive updates on
	 * the number of active HTTP requests, the average data traffic, and the maximum time it is
	 * taking to set up a new HTTP connection.<br /><br />
	 * @singleton
	 * @constructs The default constructor. 
	 * @see Device.NetworkEmitter#Status
	 * @augments Core.MessageEmitter
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	initialize: function()
	{
		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);

    this._lastStatus = null;
    this._perfEmitter = null;
    this._connEmitter = null;
    this._minRate = 5*1024;  // B/s
    this._duration = 5000;   // in msec
    this._samples = [];
    this._sum = 0;
    this._unconformFor = 0;
    this._lastSampleAt = 0;
    this._maxConnTime = 5000; // in msec
	},

	/**
	 * Retrieve the network status of the device.
	 * @returns {Device.NetworkEmitter#Status} The current device network status.
	 * @status iOS, Android, Test
	 * @since 1.0
	 */
	getLastStatus: function()
	{
		return this._lastStatus;
	},

	/** 
	 * Enumeration values for device network status.
	 * @fieldOf Device.NetworkEmitter.prototype
	 */
	Status:
	{
		/** 
		* No network connectivity. 
		* @fieldOf Device.NetworkEmitter.prototype
		* @constant
		*/
		None: 0,
		
		/** 
		* Cellular network connectivity. 
		* @fieldOf Device.NetworkEmitter.prototype
		* @constant
		*/
		Cellular: 1,
		
		/** 
		* Wi-Fi network connectivity. 
		* @fieldOf Device.NetworkEmitter.prototype
		* @constant
		*/
		Wifi: 2
	},

  /** private */
  _flags:
  {
    enable: 0x00000001
  },

  /**
   * Add a listener to monitor the device's network performance and execute a callback function if
   * performance is currently poor.
   * @example
   * Device.NetworkEmitter.addPerformanceListener(perfListener, function(perfStatus) {
   * 	// Set your own thresholds for acceptable performance for your application.
   *	if (perfStatus.actReqs > 10 &amp;&amp; perfStatus.aveRate < 10240) {  // 10 KB/second
   *		// Modify the application's behavior appropriately
   *    }
   * });
   * @param {Core.MessageListener} perfListener Performance listener.
   * @cb {Function} perfCb The function to call when network performance is poor.
   * @cb-param {Object} perfStatus An object containing information about network performance.
   * @cb-param {Number} perfStatus.actReqs The number of active HTTP requests.
   * @cb-param {Number} perfStatus.aveRate The average inbound and outbound data traffic in bytes
   *		per second.
   * @cb-returns {void}
   * @param {Number} [priority=0] The priority for this <code>NetworkListener</code>.
   * @returns {void}
   * @since 1.4
   */
  addPerformanceListener: function(perfListener, perfCb, priority)
  {
    if(!this._perfEmitter)
    {
      this._perfEmitter = new Core.MessageEmitter();
    }

    this._perfEmitter.addListener(perfListener, perfCb, priority);
    NgLogD("addPerformanceListener: count=" + this._perfEmitter.getListenerCount());

    if(this._perfEmitter.getListenerCount() == 1)
    {
      // Tell native to report stats.
      this._enablePerfEmitterSendGen( this._flags['enable'], this._minRate, this._duration );
    }
  },

  /**
   * Remove a listener that is monitoring the device's network performance.
   * @param {Core.MessageListener} perfListener Performance listener to remove.
   * @returns {void}
   * @since 1.4
   */
  removePerformanceListener: function(perfListener)
  {
    if(this._perfEmitter)
    {
      this._perfEmitter.removeListener(perfListener);
      NgLogD("removePerformanceListener: count=" + this._perfEmitter.getListenerCount());

      if(this._perfEmitter.getListenerCount() === 0)
      {
        // Tell native to stop reporting stats.
        this._enablePerfEmitterSendGen( 0, 0, 0 );
        this._perfEmitter = null;
      }
    }
    else
    {
      NgLogD("removePerformanceListener: perf-emitter does not exist");
    }
  },

  /**
   * Retrieve the number of <code>MessageListener</code> objects that have been registered with this
   * <code>NetworkEmitter</code> through <code>addPerformanceListener()</code>.
   * @returns {Number} The number of registered <code>MessageListener</code> objects.
   * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
   * @since 1.4.1
   */
  getPerformanceListenerCount: function() 
  {
    if(this._perfEmitter)
    {
      return this._perfEmitter.getListenerCount();
    }

    return 0;
  },

  /**
   * Add a listener to monitor the time it is taking to set up a new HTTP connection, and to execute
   * a callback function when it is taking an excessively long time to set up a new connection.
   * The listener will receive an event for every network frame until the lingering connection is 
   * established; the lingering connection has timed out; or the listener is removed.
   * @example Device.NetworkEmitter.addConnectionListener(connListener, function(connTime) {...});
   * @param {Core.MessageListener} connListener Connection listener.
   * @cb {Function} connCb The function to call when it is taking an excessively long time to set up
   *		a new HTTP connection.
   * @cb-param {Number} connTime The amount of time, in milliseconds, that it has taken so far to
   *		set up the most delayed network connection.
   * @cb-returns {void}
   * @param {Number} [priority=0] The priority for this <code>MessageListener</code>.
   * @returns {void}
   * @since 1.4
   */
  addConnectionListener: function(connListener, connCb, priority)
  {
    if(!this._connEmitter)
    {
      this._connEmitter = new Core.MessageEmitter();
    }

    this._connEmitter.addListener(connListener, connCb, priority);
    NgLogD("addConnectionListener: count=" + this._connEmitter.getListenerCount());

    if(this._connEmitter.getListenerCount() == 1)
    {
      // Tell native to report stats.
      this._enableConnEmitterSendGen( this._flags['enable'], this._maxConnTime );
    }
  },

  /**
   * Remove a connection listener that is monitoring the time it takes to set up a new HTTP 
   * connection.
   * @param {Core.MessageListener} connListener Connection listener to remove.
   * @returns {void}
   * @since 1.4
   */
  removeConnectionListener: function(connListener)
  {
    if(this._connEmitter)
    {
      this._connEmitter.removeListener(connListener);
      NgLogD("removeConnectionListener: count=" + this._connEmitter.getListenerCount());

      if(this._connEmitter.getListenerCount() === 0)
      {
        // Tell native to stop reporting stats.
        this._enableConnEmitterSendGen( 0, 0 );
        this._connEmitter = null;
      }
    }
    else
    {
      NgLogD("removeConnectionListener: already removed");
    }
  },

  /**
   * Retrieve the number of <code>MessageListener</code> objects that have been registered with this
   * <code>NetworkEmitter</code> through <code>addConnectionListener()</code>.
   * @returns {Number} The number of registered <code>MessageListener</code> objects.
   * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
   * @since 1.4.1
   */
  getConnectionListenerCount: function() 
  {
    if(this._connEmitter)
    {
      return this._connEmitter.getListenerCount();
    }

    return 0;
  },

  /**
   * @private
   * Set performance threshold parameters.
   * @param {Object} params Performance threshold parameters. Following parameters are available:
   * <pre>
   *  {
   *    minRate: {Number},  // minimum rate in B/s.
   *    duration: {Number}, // duration in msec for which it waits
   *                        // before emitting event.
   *  }
   * </pre>
   * For example, if minRate = 5*1024 (bytes) and duration = 5000 (msec), a message is emitted
   * in 5 seconds since the actual transmission rate became below the 'minRate'. If the 
   * transmission rate recovers (becomes more than minRate), the duration will be reset.
   * @returns {void}
   */
  setPerformanceThreshold: function(params)
  {
    if(params['minRate'])
    {
      this._minRate = params['minRate'];
    }
    if(params['duration'])
    {
      this._duration = params['duration'];
    }

    if(this._perfEmitter)
    {
      // Tell native that thresholds are updated.
      this._enablePerfEmitterSendGen( this._flags['enable'], this._minRate, this._duration );
    }
  },

  /**
   * @private
   * Set connection threshold parameters.
   * @param {Object} params Connection threshold parameters. Following parameters are available:
   * <pre>
   *  {
   *    maxConnTime: {Number},  // maximum connection setup time in milliseconds.
   *                            // Default is 5000, or 5 seconds.
   *  }
   * </pre>
   * @returns {void}
   */
  setConnectionThreshold: function(params)
  {
    if(params['maxConnTime'])
    {
      this._maxConnTime = params['maxConnTime'];
    }

    if(this._connEmitter)
    {
      // Tell native that thresholds are updated.
      this._enableConnEmitterSendGen( this._flags['enable'], this._maxConnTime );
    }
  },

	_statusChangedRecv: function( cmd )
	{
		var msg = {};
		if (!this._statusChangedRecvGen(cmd, msg))
		    return;

		this._lastStatus = msg['status'];
		this.emit(this._lastStatus);
	},

	_activityRecv: function( cmd )
 {
		var msg = {};
		if (!this._activityRecvGen(cmd, msg))
		    return;

    var actReqs = msg['numActiveReqs'];
    var actConns = msg['numActiveConns'];
    var opens = msg['numOpens'];
    var conns = msg['numConns'];
    var closes = msg['numCloses'];
    var sent = msg['bytesSent'];
    var rcvd = msg['bytesRcvd'];
    var connTime = msg['maxConnTime'];

    var now = Core.Time.getRealTime();

    //NgLogD('NetworkEmitter::_activityRecv: actReqs=' + actReqs + ' actConns=' + actConns + ' opens=' + opens + ' conns=' + conns + ' closes=' + closes + ' sent=' + sent + ' rcvd=' + rcvd + ' connTime=' + connTime);

    // Reset conditions
    // 1) actConns == conn: all new connections, and;
    // 2) !actConns: no connection, and;
    // 3) took more than the 'duration' since the last sampling.
    if(actConns == conns || !actConns)
    {
      if(now - this._lastSampleAt >= this._duration)
      {
        this._samples = [];
        this._sum = 0;
        this._unconformFor = 0;
      }
    }

    if(actConns > 0)
    {
      var latest = 0;
      if(this._samples.length == 150)
      {
        latest = this._samples.shift();
        if(this._sum >= latest)
        {
          this._sum -= latest;
        }
      }

      var dt = Core.Time.getFrameDelta();
      var rate = (sent + rcvd) / (dt / 1000);
      this._samples.push(rate);
      this._sum += rate;
      this._lastSampleAt = now;

      var ave = this._sum / this._samples.length;

      if(ave < this._minRate)
      {
        //NgLogD('NetworkEmitter::_activityRecv: aveRate=' + ave + ' sum=' + this._sum + ' numSamples=' + this._samples.length + ' since=' + this._unconformFor + ' now=' + now + ' deltaT=' + (now - this._unconformFor) + ' hasPerfEmitter=' + (this._perfEmitter? 'yes':'no'));
        this._unconformFor += dt;

        if(this._unconformFor >= this._duration)
        {
          if(this._perfEmitter)
          {
            //NgLogD('NetworkEmitter::_activityRecv: emitting performance event');
            this._unconformFor = 0;
            this._perfEmitter.emit({ actReqs: actReqs, actConns: actConns, aveRate: ave });
          }
        }
      }
      else
      {
        // Now it conforms to the min rate. Reset the timestamp.
        this._unconformFor = 0;
      }
    }

    if(connTime >= this._maxConnTime)
    {
      if(this._connEmitter)
      {
        //NgLogD('NetworkEmitter::_activityRecv: emitting connection event');
        this._connEmitter.emit(connTime);
      }
    }
 },

// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 336,
	// Method create = -1
	// Method statusChanged = 2
	// Method activity = 3
	// Method enablePerfEmitter = 4
	// Method enableConnEmitter = 5
	
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
					instance._statusChangedRecv( cmd );
					break;
				case 3:
					instance._activityRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in NetworkEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in NetworkEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[336] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_statusChangedRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in NetworkEmitter.statusChanged from command: " + cmd );
			return false;
		}
		
		obj[ "status" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "status" ] === undefined )
		{
			NgLogE("Could not parse status in NetworkEmitter.statusChanged from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_activityRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 8 )
		{
			NgLogE("Could not parse due to wrong argument count in NetworkEmitter.activity from command: " + cmd );
			return false;
		}
		
		obj[ "numActiveReqs" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "numActiveReqs" ] === undefined )
		{
			NgLogE("Could not parse numActiveReqs in NetworkEmitter.activity from command: " + cmd );
			return false;
		}
		
		obj[ "numActiveConns" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "numActiveConns" ] === undefined )
		{
			NgLogE("Could not parse numActiveConns in NetworkEmitter.activity from command: " + cmd );
			return false;
		}
		
		obj[ "numOpens" ] = Core.Proc.parseInt( cmd[ 2 ] );
		if( obj[ "numOpens" ] === undefined )
		{
			NgLogE("Could not parse numOpens in NetworkEmitter.activity from command: " + cmd );
			return false;
		}
		
		obj[ "numConns" ] = Core.Proc.parseInt( cmd[ 3 ] );
		if( obj[ "numConns" ] === undefined )
		{
			NgLogE("Could not parse numConns in NetworkEmitter.activity from command: " + cmd );
			return false;
		}
		
		obj[ "numCloses" ] = Core.Proc.parseInt( cmd[ 4 ] );
		if( obj[ "numCloses" ] === undefined )
		{
			NgLogE("Could not parse numCloses in NetworkEmitter.activity from command: " + cmd );
			return false;
		}
		
		obj[ "bytesSent" ] = Core.Proc.parseInt( cmd[ 5 ] );
		if( obj[ "bytesSent" ] === undefined )
		{
			NgLogE("Could not parse bytesSent in NetworkEmitter.activity from command: " + cmd );
			return false;
		}
		
		obj[ "bytesRcvd" ] = Core.Proc.parseInt( cmd[ 6 ] );
		if( obj[ "bytesRcvd" ] === undefined )
		{
			NgLogE("Could not parse bytesRcvd in NetworkEmitter.activity from command: " + cmd );
			return false;
		}
		
		obj[ "maxConnTime" ] = Core.Proc.parseInt( cmd[ 7 ] );
		if( obj[ "maxConnTime" ] === undefined )
		{
			NgLogE("Could not parse maxConnTime in NetworkEmitter.activity from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x150ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_enablePerfEmitterSendGen: function( flags, minRate, duration )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1500004, this, [ +flags, +minRate, +duration ] );
	},
	
	/** @private */
	_enableConnEmitterSendGen: function( flags, maxConnTime )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1500005, this, [ +flags, +maxConnTime ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// _statusChangedRecv: function( cmd ) {}
	// _activityRecv: function( cmd ) {}
	// enablePerfEmitter: function( flags, minRate, duration ) {}
	
	// enableConnEmitter: function( flags, maxConnTime ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});
