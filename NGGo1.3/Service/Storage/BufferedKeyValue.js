////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Mizuno Takaaki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// Require Block
var Class         = require('../../../NGCore/Client/Core/Class').Class;
var KeyValueCache = require('../../../NGCore/Client/Storage/KeyValue').KeyValueCache;

/** @private */
var Memory = Class.singleton(
{
    initialize: function()
    {
        this.cache = {};
    },
    set: function( key, value )
    {
        this.cache[key] = value;
    },
    get: function( key )
    {
        return this.cache[key];
    },
    remove: function( key )
    {
        delete this.cache[key];
    },
    clear: function(){
        this.cache = {};
    }
});

var BufferedKeyValue = Class.subclass(
/** @lends Service.Storage.BufferedKeyValue.prototype */
{
    classname: 'BufferedKeyValue',
    /**
     * @namespace TYPE Buffering types
     */
    TYPE:
    {
        WithTime: 0,
        WithCount: 1
    },
    /**
     * @class It wraps Storage.FileSystem and provide same interface.
     * And it adds buffering feature to reduce actual storage access.
     * @constructor
     * @param {Object} [options] Object includes option parameters.
     * @param {Number} [options.type=BufferedKeyValue.TYPE.WithTime] This param indicates how to do the buffering. BufferedKeyValue.TYPE.WithTime and BufferedKeyValue.TYPE.WithCount can be used.
     * @param {Number} [options.timeSpan=60] This indicate how long the buffered data will be keeped in the cache when the type is BufferedKeyValue.TYPE.WithTime. Default value is 60 sec( 1 min ).
     * @param {Number} [options.count=10] This indicate how meny times the buffered data will be keeped in the cache when the type is BufferedKeyValue.TYPE.WithCount. Default value is 10 times.
     * @name Service.Storage.BufferedKeyValue
     * @augments Core.Class
     */
    initialize: function(options)
    {
        var name;
        var _default_options = {
            type     : this.TYPE.WithTime,
            timeSpan : 60,
            count    : 10
        };
        if( !options || typeof options !== 'object' )
        {
            options = {};
        }
        this.BufferedKeyValue = {
            options: {}
        };
        for( name in _default_options ){
            if( _default_options.hasOwnProperty(name) )
            {
                this.BufferedKeyValue.options[name] = options.hasOwnProperty(name) ? options[name] : _default_options[name];
            }
        }
    },
    /**
     * Flashes cache for paticular key passed by parameter and write to the actual keyvalue storage.
     * @param {String} key key to flash cache.
     * @param {Function} [callback] callback function which is called when the flashing is finished.
     */
    flashItem: function(key, callback)
    {
        var item = this._getMemoryCache(key);
        if( item.setCount === 0 )
        {
            this._callFunction(callback, [undefined]);
            return;
        }
        this.forceSetItem(key, item.data, callback);
    },
    /**
     * Removes the value that is associated with a key and clear cache.
     * @param {String} key The key that is associated with the value to remove.
     * @param {Function} [callback] Specifies a callback function.
     */
    removeItem: function(key, callback)
    {
        Memory.remove(key);
        return KeyValueCache.loacl.removeItem(key, callback);
    },
    /**
     * Passes the value associated with the key to the callback function.
     * @param {String} key The key that is associated with the value to pass to the callback function.
     * @param {Function} callback The callback function that uses the value associated with the key.
     */
    getItem: function(key, callback)
    {
        var item = this._getMemoryCache(key);
        var reload = false;
        var options = this.BufferedKeyValue.options;
        switch( options.type )
        {
        case this.TYPE.WithTime:
            var date = new Date();
            if( parseInt(item.lastGet + options.timeSpan,10) < parseInt(date.getTime()/1000,10) )
            {
                reload = true;
            }
            break;
        case this.TYPE.WithCount:
            if( item.getCount >= options.count )
            {
                reload = true;
            }
            break;
        default:
            break;
        }
        if( reload )
        {
            this.forceGetItem(key, callback);
        }
        else
        {
            item.getCount++;
            this._callFunction(callback, [undefined,item.data]);
        }
    },
    /**
     * Passes the value associated with the key to the callback function without buffering feature.
     * @param {String} key The key that is associated with the value to pass to the callback function.
     * @param {Function} callback The callback function that uses the value associated with the key.
     */
    forceGetItem: function(key, callback)
    {
        var args = {
            key          : key,
            callback     : callback
        };
        KeyValueCache.local.getItem( key, this._onGetItem.bind(this, args), true);
    },
    /**
     * Associates a value with a key.
     * @param {String} key The key to associate with the value.
     * @param {String} value The value to associate with the key.
     * @param {Function} [callback] A callback function with an error parameter. The error parameter is null when the <code>setItem()</code> function completes successfully.
     */
    setItem: function(key, value, callback)
    {
        var item = this._getMemoryCache(key);
        var reload = false;
        var options = this.BufferedKeyValue.options;
        switch( options.type )
        {
        case this.TYPE.WithTime:
            var date = new Date();
            if( parseInt(item.lastSet + options.timeSpan,10) < parseInt(date.getTime()/1000,10) )
            {
                reload = true;
            }
            break;
        case this.TYPE.WithCount:
            if( item.setCount >= options.count )
            {
                reload = true;
            }
            break;
        default:
            break;
        }
        this._setMemoryCache(key, value, reload);
        if( reload )
        {
            this.forceSetItem(key, value, callback);
        }
        else
        {
            item.data = value;
            item.writeCount++;
            this._callFunction(callback, [undefined]);
        }
    },
    /**
     * Associate a value with a key without using buffering feature.
     * @param {String} key The key to associate with the value.
     * @param {String} value The value to associate with the key.
     * @param {Function} [callback] A callback function with an error parameter. The error parameter is null when the <code>setItem()</code> function completes successfully.
     */
    forceSetItem: function(key, value, callback)
    {
        var args = {
            key          : key,
            callback     : callback,
            value        : value
        };
        this._setMemoryCache(key, value, true);
        KeyValueCache.local.setItem( key, value, this._onSetItem.bind(this, args));
    },
    /** @private */
    _onGetItem: function(args, err, data)
    {
        if( !err )
        {
            var item = this._getMemoryCache(args.key);
            var date = new Date();
            item.lastGet = ~~(date.getTime()/1000);
            item.getCount = 0;
            item.data = data;
            Memory.set(args.key,item);
        }
        this._callFunction(args.callback, [undefined, data]);
    },
    /** @private */
    _onSetItem: function(args, err)
    {
        this._callFunction(args.callback, [undefined]);
    },
    /** @private */
    _callFunction: function( func, args )
    {
        if( typeof func === "function" )
        {
            try
            {
                func.apply( undefined, args );
            }
            catch (ex)
            {
                if( typeof NgLogException === 'function' ){
                    NgLogException(ex);
                }
            }
        }
    },
    /** @private */
    _setMemoryCache: function(key, data, reload)
    {
        var item = this._getMemoryCache(key);
        if( item )
        {
            if( reload )
            {
                var date = new Date();
                item.lastSet = parseInt(date.getTime()/1000,10);
                item.lastGet = item.lastWrite;
                item.setCount = 0;
                item.getCount  = 0;
            }
            else
            {
                item.setCount++;
            }
            item.data = data;
            Memory.set(key,item);
        }
    },
    /** @private */
    _getMemoryCache: function(key)
    {
        var item = Memory.get(key);
        if(!item)
        {
            item = {
                lastSet  : 0,
                lastGet  : 0,
                getCount : 0,
                setCount : 0,
                data     : undefined
            };
            Memory.set(key, item);
        }
        return item;
    }
});

exports.BufferedKeyValue = BufferedKeyValue;
