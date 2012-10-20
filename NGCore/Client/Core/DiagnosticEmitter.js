////////////////////////////////////////////////////////////////////////////////
// Class DiagnosticEmitter
// Diagnostic emitter to decouple diagnostic generation from updating
//
// Copyright (C) 2012 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var MessageEmitter = require('./MessageEmitter').MessageEmitter;
var MessageListener = require('./MessageListener').MessageListener;
var Proc = require('./Proc').Proc;
var Class = require('./Class').Class;
var Base64 = require('./Base64').Base64;
var ObjectRegistry = require('./ObjectRegistry').ObjectRegistry;

////////////////////////////////////////////////////////////////////////////////

/*
 * Publish/subscribe to diagnostic information
 *
 * DiagnosticEmitter allows for the asynchronous publishing of module diagnostic
 * information in an efficient manner.  Producers of diagnostic info implement a
 * callback that will be polled when diagnostic information updates are required,
 * and subscribers to diagnostics do so through the standard emitter pattern.
 * Updates may also be pushed synchronously by the producers or updated outside
 * of the callback.  They may also be pushed from native code.
 *
 * For convenience and discoverability, you can use `{@link Core.DiagnosticRegistry#findEmitter}`
 * {@link Core.DiagnosticRegistry.createEmitter}, defined in the DiagnosticRegistry singleton
 * after the DiagnosticEmitter object below to obtain diagnostic emitters:
 *
 * var emitter = DiagnosticRegistry.findEmitter('Foo');
 * var emitter = DiagnosticRegistry.createEmitter('Bar');
 * etc.
 */

exports.DiagnosticEmitter = MessageEmitter.subclass(
/** @lends Core.DiagnosticEmitter.prototype */
{
    classname: 'DiagnosticEmitter',

////////////////////////////////////////////////////////////////////////////////
// public API

    /**
     * @class The <code>Core.DiagnosticEmitter</code> class allows for the asynchronous
     * publishing of module diagnostic information in an efficient manner.  Producers of
     * diagnostic information implement a callback that will be polled when diagnostic
     * information updates are required, and subscribers to diagnostics do so through the
     * standard emitter pattern. Updates may also be pushed synchronously by the producers
     * or updated outside of the callback.
     * <br /><br />
     * For convenience and discoverability, you can use <code>{@link Core.DiagnosticRegistry.findEmitter}</code>
     * or <code>{@link Core.DiagnosticRegistry.createEmitter}</code> to obtain diagnostic emitters.
     * <br /><br />
     * If you are using ngBuilder 2.1.5 or later to develop your app, you can also use this class to
     * profile a specific event in your app. Call
     * <code>{@link Core.DiagnosticEmitter.startEvent}</code> to start an event and
     * <code>{@link Core.DiagnosticEmitter.stopEvent}</code>. When you run your app from ngBuilder,
     * you will be able to view diagnostic information about the event.
     * @constructs The default constructor. Typically, you will not create diagnostic
     * emitters directly, but instead will use <code>{@link Core.DiagnosticRegistry.createEmitter}</code>.
     * @param {String} name The name of the emitter.
     * @augments Core.MessageEmitter
     * @since 1.7
     */
    initialize: function(name) 
    {
	this.name = name;
	this.reset();

	this.listeners = 0;
	this.native_listeners = 0;

	this.collectors = [];
	this.native_collector =false;
	this.dirty = false;

	ObjectRegistry.register(this);
	this._createSendGen(this.__objectRegistryId, name);
	// attempt registration.  May fail if someone is using the same name.
	exports.DiagnosticRegistry.registerEmitter(this.name, this);
    },


    /**
     * Destroys this DiagnosticEmitter. When using DiagnosticEmitters and other types with
     * a native counterpart, you must explicitly destroy them to avoid leaking memory.
     * @returns {void}
     * @since 1.7
     * @status iOS, Android, Flash
     */
    destroy: function() 
    {
	exports.DiagnosticRegistry.deregisterEmitter(this.name, this);

	// destroy the emitter base class prior to the C++ class or there will
	// be some commands sent to the deregistered object when the message
	// emitter snuffs its listener array.
	MessageEmitter.prototype.destroy.apply(this);
	this._destroySendGen();
	ObjectRegistry.unregister(this);
    },
    

    /**
     * Set maximum data update rate for all listeners of this emitter.
     * Minimum interval is once per frame; however, producers may force data to be
     * emitted faster by calling <code>{@link Core.DiagnosticEmitter#push}</code>.
     * @param {Number} interval The number of frames to use as a publish interval.
     * @returns {Boolean} Set to <code>true</code> if the update was successful.
     * @since 1.7
     * @status iOS, Android, Flash
     */
    setInterval: function(interval) 
    {
	if(interval <= 0) 
	{
	    NgLogE('DiagnosticEmitter ' + this.name + ': attempt to set invalid interval ' + interval);
	    return false;
	}

	this._set_interval(interval);
	return true;
    },

    /**
     * Add a collector callback function to update data. This will be called once
     * per emission interval if there are listeners.
     * <br /><br />
     * The callback is expected to return a diagnostics object if there is an update, 
     * or <code>null</code> for no current update. The object may be of any type, but only local
     * properties are copied. The DiagnosticEmitter will not copy properties
     * from the prototype chain.
     * <br /><br />
     * Any properties returned by the collector callback are additive in that the 
     * DiagnosticEmitter maintains a copy of the diagnostics object and only updates
     * changed values. So if the collector callback returns an object with a subset of properties,
     * only those properties will be updated in the maintained diagnostics object while other 
     * properties will remain unchanged.
     * <br /><br />
     *
     * In order to clear all previous diagnostics, call <code>{@link Core.DiagnosticEmitter#reset}</code>
     * in the collector callback before returning a new diagnostics object.
     * <br /><br />
     * In addition, functions can also be returned in the diagnostics object and will be
     * emitted to listeners. Use this feature with care.
     * @param {Function} collector The function to be called to collect diagnostics. 
     * @returns {void}
     * @since 1.7
     * @status iOS, Android, Flash
     */
    pushCollector: function(collector)
    {
	if(collector && !(collector instanceof Function))
	{
	    NgLogE('DiagnosticEmitter ' + this.name + ': attempt to set invalid collector');	    
	} 
	this.collectors.push(collector);
	// get initial values
	if(this.getListenerCount() > 0)
	{
	    this.update(collector(0));
	}
    },

    /**
     * Remove a previously added collector.
     *
     * @param {Function} collector The function to be removed.
     * @returns {void}
     * @since 1.7
     * @status iOS, Android, Flash
     */
    removeCollector: function(collector)
    {
	for(var i=0;i<this.collectors.length; i++)
	{
	    if(this.collectors[i] == collector)
	    {
		this.collectors.splice(i, 1);
		return;
	    }
	}
    },

    /**
     * Clear this emitter's diagnostics. This will effectively remove all diagnostic
     * properties from the DiagnosticEmitter's diagnostics and replace
     * the contents with properties from the object passed in.
     * @param {Object} [obj] An object to reset the diagnostics to.
     * @returns {void}
     * @since 1.7
     * @status iOS, Android, Flash
     */
    reset: function(obj) 
    {
	this.diags = {name: this.name};
	if(obj) 
	{
	    this.update(obj);
	}
    },

    /**
     * Manually make a diagnostics update outside of the callback mechanism.
     * Updates are merged into the existing diagnostics.
     * @param {Object} obj The object to update the diagnostics with.
     * @returns {void}
     * @since 1.7
     * @status iOS, Android, Flash
     */
    update: function(obj) 
    {
	if(obj) 
	{
	    this.dirty = true;
	    for(var key in obj) 
	    {
		if(obj.hasOwnProperty(key)) 
		{
		    this.diags[key] = obj[key];
		}
	    }
	}
    }, 

    /**
     * Force an update to be emitted regardless of update interval.  
     * @returns {void}
     * @since 1.7
     * @status iOS, Android, Flash
     */
    push: function()
    {
	this.emit(this.diags);
    },

    /**
     * Convenience function to update and force a push in one step.
     * @param {Object} obj the object to update the diagnostics with.
     * @returns {void}
     * @since 1.7
     * @status iOS, Android, Flash
     */
    pushUpdate: function(obj)
    {
	this.update(obj);
	this.push();
    },

    /**
     * Getter for the current diagnostics information.
     * @returns {Object} The current diagnostics object.
     * @since 1.7
     * @status iOS, Android, Flash
     */
    getDiags: function() 
    {
	return this.diags;
    },

    /**
     * Create a closure over a diagnostics producer function so that it will 
     * be called only if we have listeners. It should return a diagnostics 
     * update object.
     * @param {Object} obj
     * @param {Function} fn
     *
     * @returns {Function} A function to call that will update the diagnostics. 
     * @since 1.7
     * @status iOS, Android, Flash
     * @private
     */
    curryProducer: function(obj, fn)
    {
	var that = this;
	return function() {
	    if(that.listeners > 0)
	    {
		var upd = fn.apply(obj, arguments);
		that.update(upd);
	    } 
	};
    },

	/**
	 * Start an event that can be profiled in ngBuilder. Event profiling is supported in ngBuilder
	 * 2.1.5 and later.
	 * @name Core.DiagnosticEmitter.startEvent
	 * @function
	 * @static
	 * @param {String} eventName The event to profile.
	 * @returns {void}
	 * @since 1.8
	 * @status iOS, Android, Flash
	 */
	
	/** @ignore */
	$startEvent: function (eventName) {
		this._startEventSendGen(eventName, new Date().getTime());
	},

	/**
	 * Stop an event that can be profiled in ngBuilder. Event profiling is supported in ngBuilder
	 * 2.1.5 and later.
	 * @name Core.DiagnosticEmitter.stopEvent
	 * @function
	 * @static
	 * @param {String} eventName The event to profile.
	 * @returns {void}
	 * @since 1.8
	 * @status iOS, Android, Flash
	 */
	
	/** @ignore */
	$stopEvent: function (eventName) {
		this._stopEventSendGen(eventName, new Date().getTime());
	},


////////////////////////////////////////////////////////////////////////////////

// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 362,
	// Method create = -1
	// Method destroy = 2
	// Method currentListeners = 3
	// Method updateDiagnostics = 4
	// Method nativeCollector = 5
	// Method collectNative = 6
	// Method _runTests = 7
	// Method nativeListeners = 8
	// Method setCurrentState = 9
	// Method tick = 10
	// Method startEvent = -11
	// Method stopEvent = -12
	// Method _set_interval = 13
	
	/** 
	 * Command dispatch.
	 * @private
	 */
	$_commandRecvGen: (function() { var h = (function ( cmd )
	{
		var cmdId = Proc.parseInt( cmd.shift(), 10 );
		
		if( cmdId > 0 )	// Instance Method.
		{
			var instanceId = Proc.parseInt( cmd.shift(), 10 );
			var instance = ObjectRegistry.idToObject( instanceId );
			
			if( ! instance )
			{
				NgLogE("Object instance could not be found for command " + cmd + ". It may have been destroyed this frame.");
				return;
			}
			
			switch( cmdId )
			{
				
				case 4:
					instance._updateDiagnosticsRecv( cmd );
					break;
				case 5:
					instance._nativeCollectorRecv( cmd );
					break;
				case 8:
					instance._nativeListenersRecv( cmd );
					break;
				case 10:
					instance._tickRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in DiagnosticEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in DiagnosticEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[362] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_updateDiagnosticsRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in DiagnosticEmitter.updateDiagnostics from command: " + cmd );
			return false;
		}
		
		obj[ "jsonData" ] = Proc.parseObject( cmd[ 0 ] );
		if( obj[ "jsonData" ] === undefined )
		{
			NgLogE("Could not parse jsonData in DiagnosticEmitter.updateDiagnostics from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_nativeCollectorRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in DiagnosticEmitter.nativeCollector from command: " + cmd );
			return false;
		}
		
		obj[ "exists" ] = Proc.parseBool( cmd[ 0 ] );
		if( obj[ "exists" ] === undefined )
		{
			NgLogE("Could not parse exists in DiagnosticEmitter.nativeCollector from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_nativeListenersRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in DiagnosticEmitter.nativeListeners from command: " + cmd );
			return false;
		}
		
		obj[ "num" ] = Proc.parseInt( cmd[ 0 ] );
		if( obj[ "num" ] === undefined )
		{
			NgLogE("Could not parse num in DiagnosticEmitter.nativeListeners from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_tickRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 0 )
		{
			NgLogE("Could not parse due to wrong argument count in DiagnosticEmitter.tick from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId, name )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), ]);
#endif*/
		Proc.appendToCommandString( 0x16affff, [ +__objectRegistryId, Proc.encodeString( name ) ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Proc.appendToCommandString( 0x16a0002, this );
	},
	
	/** @private */
	_currentListenersSendGen: function( num )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Proc.appendToCommandString( 0x16a0003, this, [ +num ] );
	},
	
	/** @private */
	_collectNativeSendGen: function( frame_interval )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Proc.appendToCommandString( 0x16a0006, this, [ +frame_interval ] );
	},
	
	/** @private */
	__runTestsSendGen: function( emitter_list )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Proc.appendToCommandString( 0x16a0007, this, [ Proc.encodeString( emitter_list ) ] );
	},
	
	/** @private */
	_setCurrentStateSendGen: function( jsonData )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Proc.appendToCommandString( 0x16a0009, this, [ Proc.encodeObject( jsonData ) ] );
	},
	
	/** @private */
	$_startEventSendGen: function( eventName, timeMs )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Proc.appendToCommandString( 0x16afff5, [ Proc.encodeString( eventName ), +timeMs ] );
	},
	
	/** @private */
	$_stopEventSendGen: function( eventName, timeMs )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Proc.appendToCommandString( 0x16afff4, [ Proc.encodeString( eventName ), +timeMs ] );
	},
	
	/** @private */
	__set_intervalSendGen: function( num )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Proc.appendToCommandString( 0x16a000d, this, [ +num ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId, name ) {}
	
	// destroy: function(  ) {}
	
	// currentListeners: function( num ) {}
	
	// _updateDiagnosticsRecv: function( cmd ) {}
	// _nativeCollectorRecv: function( cmd ) {}
	// collectNative: function( frame_interval ) {}
	
	// _runTests: function( emitter_list ) {}
	
	// _nativeListenersRecv: function( cmd ) {}
	// setCurrentState: function( jsonData ) {}
	
	// _tickRecv: function( cmd ) {}
	// $startEvent: function( eventName, timeMs ) {}
	
	// $stopEvent: function( eventName, timeMs ) {}
	
	// _set_interval: function( num ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


    ,
////////////////////////////////////////////////////////////////////////////////
// internal-only funcs and overrides
    _set_interval: function( num ) 
    {	
	this.__set_intervalSendGen(num);
    },

    // override for MessageEmitter
    addListener: function(listener, func, priority) 
    {
	MessageEmitter.prototype.addListener.apply(this, [listener, func, priority]);
	this.listeners = MessageEmitter.prototype.getListenerCount.apply(this);
	this.sendCurrentListeners(this.listeners);
    },
    // override for MessageEmitter
    removeListener: function(listener) 
    {
	MessageEmitter.prototype.removeListener.apply(this, [listener]);
	this.listeners = MessageEmitter.prototype.getListenerCount.apply(this);
	this.sendCurrentListeners(this.listeners);
    },

    // override for MessageEmitter
    getListenerCount: function() 
    {
	return this.listeners + this.native_listeners;
    },

    // send the current listeners to the C++ side 
    sendCurrentListeners: function(num) 
    {
	this._currentListenersSendGen(num);
    },
	
    // got diags from native code
    _updateDiagnosticsRecv: function(cmd) 
    {
	var diagblob = {};
	try {
	    if(this._updateDiagnosticsRecvGen(cmd, diagblob))
	    {
		var diagobj = diagblob.jsonData; 
		this.update(diagobj);
	    }
	}
	catch(e) {
	    NgLogE('DiagnosticEmitter: error parsing JSON received from C++, error is: ' + e);
	}
    },

    _nativeCollectorRecv: function(cmd) 
    {
	var obj = {};
	if(this._nativeCollectorRecvGen(cmd, obj))
	{
	    this.native_collector = obj.exists;
	}
    },
    
    collectNative: function(interval) 
    {
	this._collectNativeSendGen(interval);
    },
	
    _nativeListenersRecv: function( cmd ) 
    {
	var obj = {};
	if(this._nativeListenersRecvGen(cmd, obj))
	{
	    this.native_listeners = obj.num;
	}
    },
	
    setCurrentState: function( jsonData ) 
    {
	this._setCurrentStateSendGen(jsonData);
    },
	
    // Process update ticks.  If we have had a diag update collected or pushed 
    // and the update interval has expired, emit the update.
    _tickRecv: function(cmd) 
    {
	// if no listeners, do not collect or emit.
	if(this.getListenerCount() === 0) { return; }

	for(var c = 0; c < this.collectors.length; c++)
	{
	    var cfun = this.collectors[c];
	    this.update(cfun(this.last));
	}

	if(this.dirty)
	{
	    //NgLogD('DiagnosticEmitter ' + this.name + ' onTick emitting, delta=' + delta + ' last=' + this.last);
	    
	    this.dirty = false;
	    this.emit(this.diags);
	    this.setCurrentState(this.diags);
	}
    },
    
    // no-op unless conditionally compiled in on the C++ side.
    _runTests: function(emitter_list)
    {
	this.__runTestsSendGen(emitter_list);
    }
});

//
// Tools can use this to access all the registered emitters
//
exports.DiagnosticRegistry = Class.singleton({
    /** @lends Core.DiagnosticRegistry */

    classname: 'DiagnosticRegistry',
    /**
     * @class The <code>Core.DiagnosticRegistry</code> enables location and creation
     * of diagnostic emitters.<br/><br/>
     * 
     * You can define any number and type of diagnostic emitters that you would like to use
     * in your app. In order to create the emitter, call 
     * <code>{@link Core.DiagnosticRegistry.createEmitter}</code> with the name you want to use for
     * the emitter. The app can then add its collector callback and
     * set the reporting interval on the DiagnosticEmitter.
     *
     * @singleton
     * @constructs The default constructor.
     * @augments Core.Class
     * @since 1.7
     */
    initialize: function() 
    {
	ObjectRegistry.register(this);
	this.registry = {};
    },

    /** 
     * Returns the diagnostics emitter of the specified name.  
     * This method should be used by consumers of diagnostics.
     * @example
     * var myDiagEmitter = Core.DiagnosticRegistry.findEmitter("myEmitter");
     * 
     * if (myDiagEmitter) {
     *     myDiagEmitter.addListener (this, function (diagObj) {
     *         console.log("Diagnostics: ", JSON.stringify(diagObj));
     *     });
     * }
     * @param {String} name The name of the emitter you are looking for.
     * @returns {Core.DiagnosticEmitter} The emitter for that name, or undefined if it does not exist.
     * @since 1.7
     * @status iOS, Android, Flash
     */
    findEmitter: function(name)
    {
	return this.registry[name];
    },

    /** 
     * Returns the diagnostics emitter of the specified name, creating it if necessary.
     * This method should be used by diagnostic producers; it is idempotent and can be
     * called any number of times, returning the same emitter each time.
     * @example
     * function myDiagnosticsGatherer()
     * {
     *     // This assumes getDiagObject() returns an object of some type.
     *     var diagObject = getDiagObject();
     *     return diagObject;
     * }
     * var myDiagEmitter = Core.DiagnosticRegistry.createEmitter("myEmitter");
     *
     * myDiagEmitter.pushCollector(myDiagnosticsGatherer);
     *
     * myDiagEmitter.setInterval (100);
     *
     * @param {String} name The name of the emitter you are going to produce diagnostics for.
     * @returns {Core.DiagnosticEmitter} The emitter for that name
     * @since 1.7
     * @status iOS, Android, Flash
     */
    createEmitter: function(name)
    {
	var e = this.findEmitter(name);
	if(!e)
	{
	    e = new exports.DiagnosticEmitter(name);
	    // ctor registers, we done
	}
	return e;
    },

    /** 
     * Returns a list of all emitter names.
     *
     * This method should be used by consumers of diagnostics.
     * @example
     * var emitterList = Core.DiagnosticRegistry.listEmitters();
     *
     * for (e in emitterList) {
     *     console.log ("Emitter: ", emitterList[e]);
     * }
     *
     * @returns {Array} A list of the names of all of the registered DiagnosticEmitters.
     * @since 1.7
     * @status iOS, Android, Flash
     */
    listEmitters: function()
    {
	var rc = [];
	for(var key in this.registry) 
	{
	    rc.push(key);
	}
	return rc;
    },
    
    // internal functions follow
    registerEmitter: function(name, emitter)
    {
	if(this.registry[name])
	{
	    NgLogE('Duplicate registration of diagnostic emitter ' + name);
	    return false;
	}
	this.registry[name] = emitter;
	return true;
    }, 
    
    deregisterEmitter: function(name, emitter)
    {
	if(this.registry[name] != emitter)
	{
	    NgLogE('Non-registered deregistration attempt of diagnostic emitter ' + name);
	    return false;
	}
	this.registry[name] = undefined;
	return true;
    }
});
