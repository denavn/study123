////////////////////////////////////////////////////////////////////////////////
// Class KeyValue
//
// Copyright (C) 2010 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////


var Core = require('../Core').Core;
var Diagnostics = require('./Diagnostics').Diagnostics;

////////////////////////////////////////////////////////////////////////////////

function KeyValueCache() {

}

exports.KeyValueCache = KeyValueCache;
/** @lends Storage.KeyValueCache.prototype 
*/

/** @private */
KeyValueCache.lruMeanCacheSize = 100;
/** @private */
KeyValueCache.instanceMap = {};
//TODO: rename this later
var StorageGlobalScopes = [];

KeyValueCache.optimizeCaches = function() 
{
	for (var storeKey in KeyValueCache.instanceMap) {
		if(KeyValueCache.instanceMap.hasOwnProperty(storeKey)) {
			KeyValueCache.instanceMap[storeKey].optimize();
		}
	}
};

KeyValueCache.lowMemoryWarning = function() 
{
	for (var storeKey in KeyValueCache.instanceMap) {
		if(KeyValueCache.instanceMap.hasOwnProperty(storeKey)) {
			var instance = KeyValueCache.instanceMap[storeKey];
			instance.data = {};

			//Purge entries in callbacks
			var newCallbacks = {};
			newCallbacks.uidGenerator = instance.callbacks.uidGenerator;
			for(var cbId in instance.callbacks)
			{
				if(instance.callbacks.hasOwnProperty(cbId)) {
					if(instance.callbacks[cbId]) {
						newCallbacks = instance.callbacks[cbId];
					}
				}
			}
			instance.callbacks = newCallbacks;
		}
	}
};

/**
* @class Provides access to the local key-value data store.
*
* The data you store with `Storage.KeyValueCache` is not tied to a specific Mobage user.
* Access the local `Storage.KeyValueCache` by using {@link Storage.KeyValueCache#local}. 
*
* If you need to store user-specific data, do one of the following:
*
* 1. Verify that your application is storing and retrieving data for the correct Mobage user. 
* Keep in mind that several different Mobage users could all use the same application on the
* same device.
* 2. As an alternative to `Storage.KeyValueCache`, consider using the
* `{@link Social.Common.Appdata}` class, which stores application data that is tied to a specific
* Mobage user.
*
* @name Storage.KeyValueCache
* @singleton
* @constructs
*/
KeyValueCache.init = function()
{
	KeyValueCache.local = new Storage.KeyValue();
	KeyValueCache.local.registerForKey("local");
};

/**
* Returns a `Storage.KeyValue` object for the local data store of the device.
*
* @name local
* @fieldOf Storage.KeyValueCache#
* @example
* var keys = Storage.KeyValueCache.local;
* 
* keys.getItem("nextQuest", {}, function(err, val, name) {
*     if (err) {
*         console.log("An error occurred while retrieving the value of " +
*           name + ": " + err);
*         return;
*     } else {
*         console.log("The value of " + name + " is " + val);
*     }
* });
*
*/

/**
 * @static Scopes this `KeyValueCache` object as global. A globally scoped KeyValueCache object can
 * be used by multiple applications for the same data. 
 * @param {String} globalKey The store key for the `KeyValueCache` object.
 * @ignore
 * @private
 */
KeyValueCache.global = function(globalKey)
{
	if(StorageGlobalScopes[globalKey])
	{
		return StorageGlobalScopes[globalKey];
	}

	//Miss Global Table Cache.
	var scope = new exports.KeyValue();
	scope.registerForKey(globalKey);
	StorageGlobalScopes[globalKey] = scope;
	return scope;
};

exports.KeyValue = Core.Class.subclass(
/** @lends Storage.KeyValue.prototype */
{
	classname: "KeyValue",

  /** @private */
  _options: {
    blocking    : 0x0001  /* legacy blocking(main thread) mode operation for backward compatibility */
  },
	
	/**
	 * @class The `KeyValue` class constructs objects that allow you to manage application key/value
	 * pairs in a datastore.
	 * 
	 * + Use `KeyValueCache.local` to access the `local` datastore for your application.
	 *
	 * The data you store with `Storage.KeyValue` is not tied to a specific Mobage user. If you need
	 * to store user-specific data, do one of the following:
	 *
	 * 1. Verify that your application is storing and retrieving data for the correct Mobage user. 
	 * Keep in mind that several different Mobage users could all use the same application on the
	 * same device.
	 * 2. As an alternative to `Storage.KeyValue`, consider using the
	 * `{@link Social.Common.Appdata}` class, which stores application data that is tied to a specific
	 * Mobage user.
	 * @constructs The default constructor.
	 * @augments Core.Class
	 * @since 1.0
	 */
	initialize: function()
	{
		/** @private */
		this.initialized = false;
		/** @private */
		this.origin = null;
		/** @private */
		this.callbacks = {};
		/** @private */
		this.callbacks.uidGenerator = 0;
		/** @private */
		this.local = false;
		/** @private */
		this.lruCacheShrinkCounter = 0;
	
		/** @private */
		this.data = {};
		/** @private */
		this.usage = {};
		
		this.oldBinary = !Core.Capabilities.meetsBinaryVersion("1.4");

		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);

		this._getItemCount = 0;
		this._setItemCount = 0;
		this._removeItemCount = 0;

		Diagnostics.pushCollector(this.collectDiagnostics.bind(this));
	},
	
	/**
	 * Destroy this instance and release resources on the backend.
	 * @returns {void}
	 * @since 1.0
	 */
	destroy: function()
	{
		this._destroySendGen();
		Core.ObjectRegistry.unregister(this);
	},
    /*
	 * @private
	 * Call `registerForKey()` to access a datastore identified by the value of the `storeKey`
	 * parameter.
	 * @param {String} storeKey The unique identifier of the datastore.
	 * @returns {this}
     * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 */	
	registerForKey: function(storeKey) 
	{
		this.origin = storeKey;
		KeyValueCache.instanceMap[storeKey] = this;

		//Push this instance across the native bridge
		this._registerCommandSendGen(this.origin,KeyValueCache.lruMeanCacheSize);
		
		return this;
	},
	/**
	 * Retrieve the value of a key.
	 * @param {String} key The key that is associated with the value.
	 * @param {Object} options Options for the method call.
	 * @param {Boolean} [options.blocking=false] Set to `true` to retrieve the value synchronously
	 *		(i.e, the application pauses until the value is retrieved). This option can cause  
	 *		significant delays on some devices and should be used only if your application cannot
	 *		function without synchronous retrieval of a key's value.
	 * @param {Boolean} [options.ignoreCache=false] Set to `true` to retrieve the value from the 
	 *		device's storage, ignoring the cache.
	 * @cb {Function} callbackFunc The function to call after retrieving the value.
	 * @cb-param {String} err The error message, if any.
	 * @cb-param {String} val The value associated with the key.
	 * @cb-param {String} name The name of the key.
	 * @cb-returns {void}
	 * @example
	 * var keys = new Storage.KeyValue();
	 * keys.getItem("nextQuest", {}, function(err, val, name) {
	 *     if (err) {
	 *         console.log("An error occurred while retrieving the value of " +
	 *           name + ": " + err);
	 *         return;
	 *     } else {
	 *         console.log("The value of " + name + " is " + val);
	 *     }
	 * });
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getItem: function(key, options, callbackFunc) {
		this._getItemCount++;

		if (this.oldBinary && typeof options == 'object') {
			var ignCache = options['ignoreCache'];
			options = callbackFunc;
			callbackFunc = ignCache;
		}
		
    if(typeof(options) !== 'object')
    {
      /* Legacy function signature */
      if (!this.oldBinary) NgLogW("KeyValue.getItem(): using deprecated function signature");
      var ignoreCache = callbackFunc;
      callbackFunc = options;
      var callbackId;

      if(!ignoreCache)
      {
        if(this.data[key]) {
          callbackFunc(null,this.data[key],key);
          this.usage[key]++;
          return;
        }
        else
        {
          NgLogD("Value not found in cache for..falling back to native");
        }
      }

      //Generate unused callbackEntry
      callbackId = this.callbacks.uidGenerator++;

      if(!!!callbackFunc) {
      	/** @inner */
        callbackFunc = function(){};
      }
      this.callbacks[callbackId] = callbackFunc;

      this._getItemSendGen(this.origin,callbackId,key);
    }
    else
    {
      if(!options['ignoreCache'])
      {
        if(this.data[key]) {
          callbackFunc(null,this.data[key],key);
          this.usage[key]++;
          return;
        }

        //NgLogD("Value not found in cache for..falling back to native");
      }
      else
      {
        //NgLogD("KeyValue: ignoring cache...");
      }

      var op = 0;
      if(options['blocking'])
        op |= this._options.blocking;

      //Generate unused callbackEntry
      callbackId = this.callbacks.uidGenerator++;

      if(!!!callbackFunc) {
      	/** @inner */
        callbackFunc = function(){};
      }
      this.callbacks[callbackId] = callbackFunc;

      this._getItemAsyncSendGen(this.origin,callbackId,key,op);
    }
	},

	/**
	 * Deprecated signature to retrieve the value of a key.
	 * @name getItem^2
	 * @function
	 * @memberOf Storage.KeyValue#
	 * @deprecated Since version 1.4.1. Use the signature getItem(key, options, callbackFunc)
	 * rather than this signature.
	 * @example
	 * var keys = new Storage.KeyValue();
	 * keys.getItem("key_name", false, function(err, val, name) {
	 *     // Add callback code.
	 * });
	 * @param {String} key The key that is associated with the value.
	 * @param {Boolean} [ignoreCache=false] Set to `true` to retrieve the value from the device's
	 *		storage, ignoring the cache.
	 * @cb {Function} callbackFunc The function to call after retrieving the value.
	 * @cb-param {String} err The error message, if any.
	 * @cb-param {String} val The value associated with the key.
	 * @cb-param {String} name The name of the key.
	 * @cb-returns {void}
	 * @returns {void}
	 */

	/**
	 * Associate a value with a key.
	 * @param {String} key The key to associate with the value.
	 * @param {String} value The value to associate with the key.
	 * @param {Object} options Options for the method call.
	 * @param {Boolean} [options.blocking=false] Set to `true` to set the key-value pair 
	 *		synchronously (i.e., the application pauses until the key-value pair is set). This
	 *		option can cause significant delays on some devices and should be used only if your
	 *		application cannot function without synchronous storage of key-value pairs.
	 * @cb {Function} [callbackFunc] The function to call after storing the key-value pair.
	 * @cb-param {String} err The error message, if any.
	 * @cb-param {String} name The name of the key.
	 * @cb-returns {void}
	 * @example
	 * var keys = new Storage.KeyValue();
	 * keys.setItem("nextQuest", "monster_attack", {}, function(err, name) {
	 *     if (err) {
	 *         console.log("Unable to store key-value pair: " + err);
	 *     } else {
	 *         console.log("Updated the value of the key " + name);
	 *     }
	 * });
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	setItem: function(key, value, options, callbackFunc)
	{
		this._setItemCount++;

		if (this.oldBinary && typeof options == 'object') {
			options = callbackFunc;
		}

	        var callbackId;

    if(typeof(options) !== 'object')
    {
      /* Legacy function signature */
      if (!this.oldBinary) NgLogW("KeyValue.setItem(): using deprecated function signature");
      callbackFunc = options;

      this.data[key] = value;

      callbackId = this.callbacks.uidGenerator++;
      if(!!!callbackFunc) {
      	/** @inner */
        callbackFunc = function(){};
      }
      this.callbacks[callbackId] = callbackFunc;

      this._setItemSendGen(this.origin,callbackId,key,value);
    }
    else
    {
      var op = 0;
      if(options['blocking'])
        op |= this._options.blocking;

      this.data[key] = value;

      callbackId = this.callbacks.uidGenerator++;
      if(!!!callbackFunc) {
      	/** @inner */
        callbackFunc = function(){};
      }
      this.callbacks[callbackId] = callbackFunc;

      this._setItemAsyncSendGen(this.origin,callbackId,key,value,op);
    }
	},

	/**
	 * Deprecated signature for associating a value with a key.
	 * @name setItem^2
	 * @function
	 * @memberOf Storage.KeyValue#
	 * @deprecated Since version 1.4.1. Use the signature setItem(key, value, options, callbackFunc)
	 * rather than this signature.
	 * @example
	 * var keys = new Storage.KeyValue();
	 * keys.setItem("key_name", "value", function(err, name) {
	 *     // Add callback code.
	 * });
	 * @param {String} key The key to associate with the value.
	 * @param {String} value The value to associate with the key.
	 * @cb {Function} [callbackFunc] The function to call after storing the key-value pair.
	 * @cb-param {String} err The error message, if any.
	 * @cb-param {String} name The name of the key.
	 * @cb-returns {void}
	 * @returns {void}
	 */
	
	/**
	 * Remove the value that is associated with a key.
	 * @param {String} key The key that is associated with the value to remove.
	 * @param {Object} options Options for the method call.
	 * @param {Boolean} [options.blocking=false] Set to `true` to remove the key-value pair
	 *		synchronously (i.e., the application pauses until the key-value pair is removed). This 
	 *		option can cause significant delays on some devices and should be used only if your
	 *		application cannot function without synchronous storage of key-value pairs.
	 * @cb {Function} [callbackFunc] The function to call after removing the key's value.
	 * @cb-param {String} err The error message, if any.
	 * @cb-param {String} name The name of the key that was removed.
	 * @cb-returns {void}
	 * @example
	 * var keys = new Storage.KeyValue();
	 * keys.removeItem("nextQuest", {}, function(err, name) {
	 *     if (err) {
	 *         console.log("Unable to remove a key's value: " + err);
	 *     } else {
	 *         console.log("The key " + name + " was removed.");
	 *     }
	 * });
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	removeItem: function(key, options, callbackFunc)
	{
		this._removeItemCount++;

		if (this.oldBinary && typeof options == 'object') {
			options = callbackFunc;
		}
	    var callbackId;
    if(typeof(options) !== 'object')
    {
      /* Legacy function signature */
     if (!this.oldBinary) NgLogW("KeyValue.removeItem(): using deprecated function signature");
      callbackFunc = options;

      callbackId = this.callbacks.uidGenerator++;
      if(!!!callbackFunc) {
      	/** @inner */
        callbackFunc = function(){};
      }
      this.callbacks[callbackId] = callbackFunc;

      this._removeItemSendGen(this.origin,callbackId,key);
    }
    else
    {
      var op = 0;
      if(options['blocking'])
        op |= this._options.blocking;

      callbackId = this.callbacks.uidGenerator++;
      if(!!!callbackFunc) {
      	/** @inner */
        callbackFunc = function(){};
      }
      this.callbacks[callbackId] = callbackFunc;

      this._removeItemAsyncSendGen(this.origin,callbackId,key,op);
    }
	},

	/**
	 * Deprecated signature for removing the value that is associated with a key.
	 * @name removeItem^2
	 * @function
	 * @memberOf Storage.KeyValue#
	 * @deprecated Since version 1.4.1. Use the signature removeItem(key, options, callbackFunc)
	 * rather than this signature.
	 * @example
	 * var keys = new Storage.KeyValue();
	 * keys.removeItem("key_name", function(err, name) {
	 *     // Add callback code.
	 * });
	 * @param {String} key The key that is associated with the value to remove.
	 * @cb {Function} [callbackFunc] The function to call after removing the key's value.
	 * @cb-param {String} err The error message, if any.
	 * @cb-param {String} name The name of the key that was removed.
	 * @cb-returns {void}
	 * @returns {void}
	 */


	/**
	 * @private
	 * Clear all key/value pairs stored within this store
	 * NOTE: Legacy function signature, clear([{Function}cb]) is still supported but deprecated.
	 * @param {Object} options Options for the method call.
	 * @param {Boolean} [options.blocking=false] Set to `true` to make the operation block the main
	 *		thread (not recommended).
	 * @param {Function} [callbackFunc] The callback function to be called
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 */
	clear: function(options, callbackFunc)
	{
		if (this.oldBinary && typeof options == 'object') {
			options = callbackFunc;
		}
	    var callbackId;
    if(typeof(options) !== 'object')
    {
      /* Legacy function signature */
      if (!this.oldBinary) NgLogW("KeyValue.clear(): using deprecated function signature");
      callbackFunc = options;

      callbackId = this.callbacks.uidGenerator++;
      if(!!!callbackFunc) {
      	/** @inner */
        callbackFunc = function(){};
      }
      this.callbacks[callbackId] = callbackFunc;

      this._clearSendGen(this.origin,callbackId);
    }
    else
    {
      var op = 0;
      if(options['blocking'])
        op |= this._options.blocking;

      callbackId = this.callbacks.uidGenerator++;
      if(!!!callbackFunc) {
      	/** @inner */
        callbackFunc = function(){};
      }
      this.callbacks[callbackId] = callbackFunc;

      this._clearAsyncSendGen(this.origin,callbackId,op);
    }
	},
	/**
	 * @ignore
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 */
	enforceLRUCacheSize: function()
	{
		NgLogD("Enforcing KeyValue Cache Size");
		var tmp = [];
		for (var k in this.data) {
			if (this.data.hasOwnProperty(k)) {
				tmp.push(k);
			}
		}
		var usage = this.usage;
		tmp.sort(function(a,b) {
			var p1 = usage[a];
			if (!p1) {
				p1 = 0;
			}

			var p2 = usage[b];
			if (!p2) {
				p2 = 0;
			}

			if (p1 == p2) { return 0; }
			return p1 < p2 ? 1 : -1;
		});

		var oldData = this.data;
		this.data = {};
		//Copy over the lruMeanCache(number) most used entries
		var stopPoint = KeyValueCache.lruMeanCacheSize;
		for (var i = 0; i < stopPoint && i < tmp.length; i++)
		{
			if(!oldData[tmp[i]]) {
				//Case cache didn't contain that key at this point in time
				stopPoint++;
			}
			else {
				this.data[tmp[i]] = oldData[tmp[i]];
			}
		}
	},
	
	_getInstanceRecv : function(cmd)
	{
		var msg = {};
		if(!this._getInstanceRecvGen(cmd, msg))
			return;
			
		var storeKey = msg["storeKey"];

		var instance = KeyValueCache.instanceMap[storeKey];
		//NgLogD("Storage.getInstanceForCommand Found instance for key [" + storeKey + "]: " + instance + " (" + command + ")");
		return instance;
	},
	
	_registerCommandCbRecv : function(cmd)
	{		
		var msg = {};
		if(!this._registerCommandCbRecvGen(cmd, msg))
			return;
		
		//NgLogD("Storage registerCallback: "+command+"\n");
		if(msg["error"]){
			console.log("Storage: Error registering for KeyValue location '"+msg["error"]+"'");
			if(!this.initialized) {
				delete StorageGlobalScopes[msg["originalStoreKey"]];
			}
			return;
		}

		if(this.origin == "local") {
			this.local = true;
			StorageGlobalScopes[this.origin] = this;
		}

		this.origin = msg["storeKey"];
		this.initialized = true;
		
		for(var i=0; i < msg.preloadDataCount; ++i)
		{
			var preload = {};
			if(!this._preloadDataRecvGen(cmd, preload))
				return;
			
			this.data[preload.key] = preload.value;
		}
	},
	
	_getItemCommandCbRecv : function(cmd)
	{
		var msg = {};
		if(!this._getItemCommandCbRecvGen(cmd, msg))
			return;
		
		var cbId = msg["callbackId"];
		var error = msg["error"];
		var key = msg["key"];
		var value = msg["value"];
		if (error) {
			value = null;
		}

		this.data[key] = value;
		if(!this.usage[key]) {
			this.usage[key] = 1;
		} else {
			this.usage[key]++;
		}

		var cb = this.callbacks[cbId];
		if(typeof cb == "function") {
			cb(error,value,key);
			this.callbacks[cbId] = null;
		}

		if(((this.lruCacheShrinkCounter++) % KeyValueCache.lruMeanCacheSize) === 0) {
			this.enforceLRUCacheSize();
		}
		return this;
	},
	
	_setItemCommandCbRecv : function(cmd)
	{
		var msg = {};
		if(!this._setItemCommandCbRecvGen(cmd, msg))
			return;
		
		var cbId = msg["callbackId"];
		var error = msg["error"];
		var key = msg["key"];

		if(!this.usage[key]) {
			this.usage[key] = 1;
		} else {
			this.usage[key]++;
		}
		
		//NgLogD("Storage.setItemCommand Found instance for key [" + key + "]: " + " (" + cbId + ")");

		var cb = this.callbacks[cbId];
		if(typeof cb == "function") {
			//NgLogD("Storage.setItemCommand Found callback");
			cb(error,key);
			this.callbacks[cbId] = null;
		}
		if(((this.lruCacheShrinkCounter++) % KeyValueCache.lruMeanCacheSize) === 0) {
			this.enforceLRUCacheSize();
		}
	},
	
	_removeItemCbRecv : function(cmd)
	{
		var msg = {};
		if(!this._removeItemCbRecvGen(cmd, msg))
			return;
		
		var cbId = msg["callbackId"];
		var error = msg["error"];
		var key = msg["key"];
		delete this.usage[key];
		delete this.data[key];

		var cb = this.callbacks[cbId];
		if(typeof cb == "function") {
			cb(error,key);
			this.callbacks[cbId] = null;
		}
	},
	
	_clearCommandCbRecv : function(cmd)
	{
		var msg ={};
		if(!this._clearCommandCbRecvGen(cmd, msg))
			return;
		
		var cbId = msg["callbackId"];
		var error = msg["error"];

		this.data = {};
		this.usage = {};

		var cb = this.callbacks[cbId];
		if(typeof cb == "function") {
			cb(error,this.origin);
			this.callbacks[cbId] = null;
		}

	},
	
	/**
	 * Enumeration for response types.
	 * @name Responses
	 * @fieldOf Storage.KeyValue#
	 * @ignore
	 */
	
	/**
	 * Register storage.
	 * @name Responses.Register
	 * @fieldOf Storage.KeyValue#
	 * @constant
	 * @ignore
	 */
	
	/**
	 * Get item.
	 * @name Responses.GetItem
	 * @fieldOf Storage.KeyValue#
	 * @constant
	 * @ignore
	 */
	
	/**
	 * Set item.
	 * @name Responses.SetItem
	 * @fieldOf Storage.KeyValue#
	 * @constant
	 * @ignore
	 */
	
	/**
	 * Remove item.
	 * @name Responses.RemoveItem
	 * @fieldOf Storage.KeyValue#
	 * @constant
	 * @ignore
	 */
	
	/**
	 * Clear all items.
	 * @name Responses.Clear
	 * @fieldOf Storage.KeyValue#
	 * @constant
	 * @ignore
	 */
	
// {{?Wg Generated Code}}
	
	// Enums.
	Responses:
	{ 
		Register: 0,
		GetItem: 1,
		SetItem: 2,
		RemoveItem: 3,
		Clear: 4
	},
	
	///////
	// Class constants (for internal use only):
	_classId: 339,
	// Method create = -1
	// Method destroy = 2
	// Method registerCommand = 3
	// Method getItem = 4
	// Method setItem = 5
	// Method removeItem = 6
	// Method clear = 7
	// Method getInstance = 8
	// Method registerCommandCb = 9
	// Method preloadData = 10
	// Method getItemCommandCb = 11
	// Method setItemCommandCb = 12
	// Method removeItemCb = 13
	// Method clearCommandCb = 14
	// Method getItemAsync = 15
	// Method setItemAsync = 16
	// Method removeItemAsync = 17
	// Method clearAsync = 18
	
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
				
				case 8:
					instance._getInstanceRecv( cmd );
					break;
				case 9:
					instance._registerCommandCbRecv( cmd );
					break;
				case 10:
					instance._preloadDataRecv( cmd );
					break;
				case 11:
					instance._getItemCommandCbRecv( cmd );
					break;
				case 12:
					instance._setItemCommandCbRecv( cmd );
					break;
				case 13:
					instance._removeItemCbRecv( cmd );
					break;
				case 14:
					instance._clearCommandCbRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in KeyValue._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in KeyValue._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[339] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_getInstanceRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 3 )
		{
			NgLogE("Could not parse due to wrong argument count in KeyValue.getInstance from command: " + cmd );
			return false;
		}
		
		obj[ "response" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "response" ] === undefined )
		{
			NgLogE("Could not parse response in KeyValue.getInstance from command: " + cmd );
			return false;
		}
		
		obj[ "storeKey" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "storeKey" ] === undefined )
		{
			NgLogE("Could not parse storeKey in KeyValue.getInstance from command: " + cmd );
			return false;
		}
		
		obj[ "key" ] = Core.Proc.parseString( cmd[ 2 ] );
		if( obj[ "key" ] === undefined )
		{
			NgLogE("Could not parse key in KeyValue.getInstance from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_registerCommandCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length < 5 )
		{
			NgLogE("Could not parse due to wrong argument count in KeyValue.registerCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "response" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "response" ] === undefined )
		{
			NgLogE("Could not parse response in KeyValue.registerCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "originalStoreKey" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "originalStoreKey" ] === undefined )
		{
			NgLogE("Could not parse originalStoreKey in KeyValue.registerCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "error" ] = Core.Proc.parseString( cmd[ 2 ] );
		if( obj[ "error" ] === undefined )
		{
			NgLogE("Could not parse error in KeyValue.registerCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "storeKey" ] = Core.Proc.parseString( cmd[ 3 ] );
		if( obj[ "storeKey" ] === undefined )
		{
			NgLogE("Could not parse storeKey in KeyValue.registerCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "preloadDataCount" ] = Core.Proc.parseInt( cmd[ 4 ] );
		if( obj[ "preloadDataCount" ] === undefined )
		{
			NgLogE("Could not parse preloadDataCount in KeyValue.registerCommandCb from command: " + cmd );
			return false;
		}
		
		cmd.splice(0, 5);
		return true;
	},
	
	/** @private */
	_preloadDataRecvGen: function( cmd, obj )
	{ 
		if( cmd.length < 2 )
		{
			NgLogE("Could not parse due to wrong argument count in KeyValue.preloadData from command: " + cmd );
			return false;
		}
		
		obj[ "key" ] = Core.Proc.parseString( cmd[ 0 ] );
		if( obj[ "key" ] === undefined )
		{
			NgLogE("Could not parse key in KeyValue.preloadData from command: " + cmd );
			return false;
		}
		
		obj[ "value" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "value" ] === undefined )
		{
			NgLogE("Could not parse value in KeyValue.preloadData from command: " + cmd );
			return false;
		}
		
		cmd.splice(0, 2);
		return true;
	},
	
	/** @private */
	_getItemCommandCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 6 )
		{
			NgLogE("Could not parse due to wrong argument count in KeyValue.getItemCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "response" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "response" ] === undefined )
		{
			NgLogE("Could not parse response in KeyValue.getItemCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "storeKey" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "storeKey" ] === undefined )
		{
			NgLogE("Could not parse storeKey in KeyValue.getItemCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 2 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in KeyValue.getItemCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "error" ] = Core.Proc.parseString( cmd[ 3 ] );
		if( obj[ "error" ] === undefined )
		{
			NgLogE("Could not parse error in KeyValue.getItemCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "key" ] = Core.Proc.parseString( cmd[ 4 ] );
		if( obj[ "key" ] === undefined )
		{
			NgLogE("Could not parse key in KeyValue.getItemCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "value" ] = Core.Proc.parseString( cmd[ 5 ] );
		if( obj[ "value" ] === undefined )
		{
			NgLogE("Could not parse value in KeyValue.getItemCommandCb from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_setItemCommandCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 6 )
		{
			NgLogE("Could not parse due to wrong argument count in KeyValue.setItemCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "response" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "response" ] === undefined )
		{
			NgLogE("Could not parse response in KeyValue.setItemCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "storeKey" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "storeKey" ] === undefined )
		{
			NgLogE("Could not parse storeKey in KeyValue.setItemCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 2 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in KeyValue.setItemCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "error" ] = Core.Proc.parseString( cmd[ 3 ] );
		if( obj[ "error" ] === undefined )
		{
			NgLogE("Could not parse error in KeyValue.setItemCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "key" ] = Core.Proc.parseString( cmd[ 4 ] );
		if( obj[ "key" ] === undefined )
		{
			NgLogE("Could not parse key in KeyValue.setItemCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "value" ] = Core.Proc.parseString( cmd[ 5 ] );
		if( obj[ "value" ] === undefined )
		{
			NgLogE("Could not parse value in KeyValue.setItemCommandCb from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_removeItemCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 5 )
		{
			NgLogE("Could not parse due to wrong argument count in KeyValue.removeItemCb from command: " + cmd );
			return false;
		}
		
		obj[ "response" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "response" ] === undefined )
		{
			NgLogE("Could not parse response in KeyValue.removeItemCb from command: " + cmd );
			return false;
		}
		
		obj[ "storeKey" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "storeKey" ] === undefined )
		{
			NgLogE("Could not parse storeKey in KeyValue.removeItemCb from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 2 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in KeyValue.removeItemCb from command: " + cmd );
			return false;
		}
		
		obj[ "error" ] = Core.Proc.parseString( cmd[ 3 ] );
		if( obj[ "error" ] === undefined )
		{
			NgLogE("Could not parse error in KeyValue.removeItemCb from command: " + cmd );
			return false;
		}
		
		obj[ "key" ] = Core.Proc.parseString( cmd[ 4 ] );
		if( obj[ "key" ] === undefined )
		{
			NgLogE("Could not parse key in KeyValue.removeItemCb from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_clearCommandCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 4 )
		{
			NgLogE("Could not parse due to wrong argument count in KeyValue.clearCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "response" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "response" ] === undefined )
		{
			NgLogE("Could not parse response in KeyValue.clearCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "storeKey" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "storeKey" ] === undefined )
		{
			NgLogE("Could not parse storeKey in KeyValue.clearCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 2 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in KeyValue.clearCommandCb from command: " + cmd );
			return false;
		}
		
		obj[ "error" ] = Core.Proc.parseString( cmd[ 3 ] );
		if( obj[ "error" ] === undefined )
		{
			NgLogE("Could not parse error in KeyValue.clearCommandCb from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x153ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1530002, this );
	},
	
	/** @private */
	_registerCommandSendGen: function( storeKey, lruMeanCacheSize )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1530003, this, [ Core.Proc.encodeString( storeKey ), +lruMeanCacheSize ] );
	},
	
	/** @private */
	_getItemSendGen: function( storeKey, callbackId, key )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1530004, this, [ Core.Proc.encodeString( storeKey ), +callbackId, Core.Proc.encodeString( key ) ] );
	},
	
	/** @private */
	_setItemSendGen: function( storeKey, callbackId, key, value )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1530005, this, [ Core.Proc.encodeString( storeKey ), +callbackId, Core.Proc.encodeString( key ), Core.Proc.encodeString( value ) ] );
	},
	
	/** @private */
	_removeItemSendGen: function( storeKey, callbackId, key )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1530006, this, [ Core.Proc.encodeString( storeKey ), +callbackId, Core.Proc.encodeString( key ) ] );
	},
	
	/** @private */
	_clearSendGen: function( storeKey, callbackId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1530007, this, [ Core.Proc.encodeString( storeKey ), +callbackId ] );
	},
	
	/** @private */
	_getItemAsyncSendGen: function( storeKey, callbackId, key, options )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x153000f, this, [ Core.Proc.encodeString( storeKey ), +callbackId, Core.Proc.encodeString( key ), +options ] );
	},
	
	/** @private */
	_setItemAsyncSendGen: function( storeKey, callbackId, key, value, options )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1530010, this, [ Core.Proc.encodeString( storeKey ), +callbackId, Core.Proc.encodeString( key ), Core.Proc.encodeString( value ), +options ] );
	},
	
	/** @private */
	_removeItemAsyncSendGen: function( storeKey, callbackId, key, options )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1530011, this, [ Core.Proc.encodeString( storeKey ), +callbackId, Core.Proc.encodeString( key ), +options ] );
	},
	
	/** @private */
	_clearAsyncSendGen: function( storeKey, callbackId, options )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1530012, this, [ Core.Proc.encodeString( storeKey ), +callbackId, +options ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// registerCommand: function( storeKey, lruMeanCacheSize ) {}
	
	// getItem: function( storeKey, callbackId, key ) {}
	
	// setItem: function( storeKey, callbackId, key, value ) {}
	
	// removeItem: function( storeKey, callbackId, key ) {}
	
	// clear: function( storeKey, callbackId ) {}
	
	// _getInstanceRecv: function( cmd ) {}
	// _registerCommandCbRecv: function( cmd ) {}
	// _preloadDataRecv: function( cmd ) {}
	// _getItemCommandCbRecv: function( cmd ) {}
	// _setItemCommandCbRecv: function( cmd ) {}
	// _removeItemCbRecv: function( cmd ) {}
	// _clearCommandCbRecv: function( cmd ) {}
	// getItemAsync: function( storeKey, callbackId, key, options ) {}
	
	// setItemAsync: function( storeKey, callbackId, key, value, options ) {}
	
	// removeItemAsync: function( storeKey, callbackId, key, options ) {}
	
	// clearAsync: function( storeKey, callbackId, options ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

	,

//Diagnostics collector
	collectDiagnostics: function(type, interval)
	{
		var collectedInfo = {
			getItem: {
				count: this._getItemCount
			},
			setItem: {
				count: this._setItemCount
			},
			removeItem: {
				count: this._removeItemCount
			}
         };

		 return collectedInfo;
	}
});
