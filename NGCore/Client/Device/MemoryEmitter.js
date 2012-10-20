var Core = require('../Core').Core;

exports.MemoryEmitter = Core.MessageEmitter.singleton(
/** @lends Device.MemoryEmitter.prototype */
{
	classname: 'MemoryEmitter',
		
	/**
	 * @class The <code>MemoryEmitter</code> class constructs a singleton object that notifies its
	 * listeners when a low memory warning is received from the system. The information that is
	 * sent to listeners is configurable and can vary by platform if desired. See
	 * <code>{@link Device.MemoryEmitter#addSummaryStatisticsListener}</code> for details about the
	 * information that can be sent to listeners.<br /><br />
	 * Applications can respond to these notifications by destroying unused objects, allowing the
	 * system to re-allocate free memory. Failure to respond to low memory warnings may cause the
	 * operating system to terminate the application.
	 * @singleton
	 * @constructs The default constructor. 
	 * @augments Core.MessageEmitter
	 * @status iOS, Android, Test
	 * @since 1.0
	 */
	initialize: function()
	{
		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
		this._summaryStatisticsEmitter = null;
		this._summaryStatisticsOption = this.StatisticsOption['common'];
		this._summaryStatisticsInterval = 1000;
	},
	
	_memoryEventRecv: function( cmd ) 
	{
		this.emit();
		
		//Cascade the original message back out to native for forwarding
		this._memoryEventSendGen();
	},
													  
	/**
	 * Enumeration values for use with {@link Device.MemoryEmitter#setSummaryStatisticsOption}.
	 * @fieldOf Device.MemoryEmitter.prototype
	 */
	StatisticsOption:
	{
		/**
		 * Map iOS and Android platform-specific information to platform-neutral information. See
		 * {@link Device.MemoryEmitter#addSummaryStatisticsListener} for more detail.
		 * @fieldOf Device.MemoryEmitter.prototype
		 * @constant
		 */
		common: 1,

		/**
		 * Provide platform-specific information for iOS and Android. See
		 * {@link Device.MemoryEmitter#addSummaryStatisticsListener} for more detail.
		 * @fieldOf Device.MemoryEmitter.prototype
		 * @constant
		 */
		raw: 2
	},

	/**
	 * Set whether the <code>MemoryEmitter</code> will provide platform-specific information,
	 * platform-neutral information, or both. The default option is 
	 * <code>{@link Device.MemoryEmitter#StatisticsOption.common}</code>.
	 * @example
	 * Device.MemoryEmitter.setSummaryStatisticsOption(Device.MemoryEmitter.
	 *   StatisticsOption.common | Device.MemoryEmitter.StatisticsOption.raw);
	 * @param {Device.MemoryEmitter#StatisticsOption} option The option to use for the
	 *		<code>MemoryEmitter</code>. To select multiple options, you can use the <code>|</code>
	 *		operator to combine multiple values. Use the value <code>0</code> to disable the
	 *		emitter.
	 * @returns {void}
	 * @since 1.4.1
	 */	
	setSummaryStatisticsOption: function( option )
	{
		this._summaryStatisticsOption = option;

		if( this._summaryStatisticsEmitter )
		{
			this._enableSummaryStatisticsSendGen( this._summaryStatisticsOption, this._summaryStatisticsInterval );
		}
	},

	/**
	 * Set the amount of time, in milliseconds, between calls to the callback function. The 
	 * default value is <code>1000</code>.
	 * @param {Number} interval The amount of time, in milliseconds, between calls to the callback
	 *		function.
	 * @returns {void}
	 * @since 1.4.1
	 */	
	setSummaryStatisticsInterval: function( interval )
	{
		this._summaryStatisticsInterval = interval;

		if( this._summaryStatisticsEmitter )
		{
			this._enableSummaryStatisticsSendGen( this._summaryStatisticsOption, this._summaryStatisticsInterval );
		}
	},

	/**
	 * Add a listener for memory statistics. 
	 * @example
	 * var MyListener = Core.MessageListener.subclass({
	 *     myCallback: function(statistics) {
	 *         if (statistics.rawValues.ActivityManager.getMemoryInfo) {
	 *             var info = JSON.stringify(statistics.rawValues.ActivityManager.
	 *               getMemoryInfo);
	 *             console.log("Android info about available memory: " + info);
	 *         }
	 *         if (statistics.totalFreeMemory) {
	 *             console.log("Platform-neutral info about available memory: " +
	 *               statistics.totalFreeMemory);
	 *         }
	 *     }
	 * });
	 * var listener = new MyListener();
	 * 
	 * Device.MemoryEmitter.addSummaryStatisticsListener(listener,
	 *   listener.myCallback);
	 * @param {Object} listener The listener that memory statistics will be sent to.
	 * @cb {Function} callback The function to call when the system sends a low memory warning.
	 * @cb-param {Object} statistics An object containing information about the amount of memory
	 *		that is available. The object's properties will vary depending on what value was
	 *		specified in <code>{@link Device.MemoryEmitter#setSummaryStatisticsOption}</code>. By
	 *		default, Android-only and iOS-only properties are not included.
	 * @cb-param {String} [statistics.rawValues./proc/pid/statm] The contents of 
	 *		<code>/proc/{application pid}/statm</code>. Android-only.
	 * @cb-param {Object} [statistics.rawValues.ActivityManager.getMemoryInfo] The value returned by
	 *		<a href="http://developer.android.com/reference/android/app/ActivityManager.html#getMemoryInfo(android.app.ActivityManager.MemoryInfo)">
	 *		ActivityManager.getMemoryInfo()</a>. Android only.
	 * @cb-param {Object} [statistics.rawValues.ActivityManager.getProcessMemoryInfo] The value
	 *		returned by
	 *		<a href="http://developer.android.com/reference/android/app/ActivityManager.html#getProcessMemoryInfo(int[])">
	 *		ActivityManager.getProcessMemoryInfo()</a>. Android only.
	 * @cb-param {Object} [statistics.rawValues.host_statistics] The value returned by 
	 *		<a href="http://web.mit.edu/darwin/src/modules/xnu/osfmk/man/host_statistics.html">
	 *		host_statistics()</a>. iOS only.
	 * @cb-param {Object} [statistics.rawValues.task_info] The value returned by
	 *		<a href="http://web.mit.edu/darwin/src/modules/xnu/osfmk/man/task_info.html">
	 *		task_info()</a>. iOS only.
	 * @cb-param {Number} [statistics.residentSize] The resident memory size of the process, in
	 *		bytes.
	 * @cb-param {Number} [statistics.totalFreeMemory] The amount of free memory on the device, in
	 *		bytes.
	 * @cb-param {Number} [statistics.virtualSize] The virtual memory size of the process, in bytes.
	 * @cb-returns {void}
	 * @param {Number} [priority=0] The priority for this <code>MessageListener</code>.
	 * @returns {void}
	 * @see Device.MemoryEmitter#setSummaryStatisticsInterval
	 * @see Device.MemoryEmitter#setSummaryStatisticsOption
	 * @since 1.4.1
	 */	
	addSummaryStatisticsListener: function( listener, callback, priority )
	{
		if( !this._summaryStatisticsEmitter )
		{
			this._summaryStatisticsEmitter = new Core.MessageEmitter();
		}
		this._summaryStatisticsEmitter.addListener( listener, callback, priority );

		if( this._summaryStatisticsEmitter.getListenerCount() == 1 )
		{
			this._enableSummaryStatisticsSendGen( this._summaryStatisticsOption, this._summaryStatisticsInterval );
		}
	},

	/**
	 * Remove a listener for memory statistics.
	 * @param {Object} listener The memory statistics listener to remove.
	 * @returns {void}
	 * @since 1.4.1
	 */	
	removeSummaryStatisticsListener: function( listener )
	{
		if( this._summaryStatisticsEmitter )
		{
			this._summaryStatisticsEmitter.remove( listener );

			if( this._summaryStatisticsEmitter.getListenerCount() === 0 )
			{
				this._enableSummaryStatisticsSendGen( 0, 0 );
				this._summaryStatisticsEmitter = null;
			}
		}
		else
		{
			NgLogD("removeRealtimeSummaryStatisticsListener: memoryEmitter does not exist");
		}
	},

	_statisticsRecv: function( cmd )
	{
		var json, msg = {};
		if( !this._statisticsRecvGen( cmd, msg ))
			return;
	        
		try
		{
			json = JSON.parse( msg.data );
		}
		catch(e)
		{
			NgLogE("_statisticsRecv: error occured while parsing JSON");
			return;
		}		

		if(this._summaryStatisticsEmitter)
		{
			this._summaryStatisticsEmitter.emit( json );
		}
	},

// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 331,
	// Method create = -1
	// Method memoryEvent = 2
	// Method enableSummaryStatistics = 3
	// Method statistics = 4
	
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
					instance._memoryEventRecv( cmd );
					break;
				case 4:
					instance._statisticsRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in MemoryEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in MemoryEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[331] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_memoryEventRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 0 )
		{
			NgLogE("Could not parse due to wrong argument count in MemoryEmitter.memoryEvent from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_statisticsRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in MemoryEmitter.statistics from command: " + cmd );
			return false;
		}
		
		obj[ "data" ] = Core.Proc.parseString( cmd[ 0 ] );
		if( obj[ "data" ] === undefined )
		{
			NgLogE("Could not parse data in MemoryEmitter.statistics from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x14bffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_memoryEventSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x14b0002, this );
	},
	
	/** @private */
	_enableSummaryStatisticsSendGen: function( option, interval )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x14b0003, this, [ +option, +interval ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// _memoryEventRecv: function( cmd ) {}
	// memoryEvent: function(  ) {}
	
	// enableSummaryStatistics: function( option, interval ) {}
	
	// _statisticsRecv: function( cmd ) {}
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});
