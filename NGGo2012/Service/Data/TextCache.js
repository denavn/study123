////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Mizumo Takaaki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Require Block
var Class             = require('../../../NGCore/Client/Core/Class').Class;
var FileSystem        = require('../../../NGCore/Client/Storage/FileSystem').FileSystem;
var KeyValueCache     = require('../../../NGCore/Client/Storage/KeyValue').KeyValueCache;
var OrderedDictionary = require('../../Foundation/OrderedDictionary').OrderedDictionary;

/** @private */
var CacheManager = Class.singleton(
{
    classname: "CacheManager",
    TYPE:
    {
        MEMORY     : 0,
        FILESYSTEM : 1,
        KEYVALUE   : 2
    },
    POLICY:
    {
        LRU : 0,
        MRU : 1,
        LFU : 2
    },
    LOCK:
    {
        UNLOCKED  : 0,
        READWRITE : 1,
        WRITE     : 2
    },
    initialize: function()
    {
        this.cache = {};
        this.queue = {};
        this.lock  = {};
    },
    preloadCache: function(options)
    {
        this._getCache(options);
    },
    getItem: function(options, key, callback)
    {
        var args = {
            key      : key,
            callback : callback
        };
        return this._getCache(options, this._onGetCache.bind(this, options, args));
    },
    _onGetCache: function(options, args, obj)
    {
        var value;
        if( typeof obj === 'object' )
        {
            // obj is an OrderedDictionary object
            var item = obj.get(args.key);
            if( item )
            {
                value = item.value;
                var dt = new Date();
                if( options.expire > 0 && (item.datetime + options.expire) < dt.getTime()/1000 )
                {
                    obj.remove(args.key);
                    value = undefined;
                }
                else
                {
                    this._reorderCache(options,args,obj);
                }
            }
        }
        this._callFunction(args.callback, [ value ] );
        return value;
    },
    _reorderCache: function(options, args, obj)
    {
        var i;
        var item = obj.remove(args.key);
        item.count++;
        var c = item.count;
        switch(options.policy){
        case this.POLICY.LRU:
        case this.POLICY.MRU:
            obj.unshift(args.key, item);
            return;
        case this.POLICY.LFU:
            var len = obj.length;
            for(i=0; i<len; i++ )
            {
                var item2 = obj.getByIndex(i);
                if( item2.count < c )
                {
                    obj.insert(i, args.key, item);
                    return;
                }
            }
            obj.push( args.key, item);
            break;
        default:
            break;
        }
    },
    _getKey: function( options )
    {
        if( typeof options !== 'object' )
        {
            return undefined;
        }
        var prefix = Object.keys(this.TYPE);
        return prefix[options.type] + ":" + options.key;
    },
    _getCache: function(options, callback)
    {
        var key = this._getKey(options);
        if( !key )
        {
            return false;
        }
        var args = {
            key: key,
            callback: callback
        };
        if( this.cache[key] )
        {
            var value = this._callFunction(callback, [ this.cache[key] ] );
            if( this.queue[key] && this.queue[key].length > 0 )
            {
                var func = this.queue[key].shift();
                if( typeof func === 'function' )
                {
                    func();
                }
            }
            return value;
        }
        else
        {
            switch(options.type)
            {
            case this.TYPE.MEMORY:
                this.cache[key] = new OrderedDictionary();
                this._callFunction(callback, [ this.cache[key] ]);
                break;
            case this.TYPE.FILESYSTEM:
                this._loadCacheFromFile(options, args);
                break;
            case this.TYPE.KEYVALUE:
                this._loadCacheFromKeyValue(options, args);
                break;
            default:
                break;
            }
        }
        return undefined;
    },
    _callFunction: function( func, args )
    {
        if( typeof func === "function" )
        {
            try
            {
                return func.apply( undefined, args );
            }
            catch (ex)
            {
                if( NgLogException )
                {
                    NgLogException(ex);
                }
            }
        }
    },
    _lockCache: function(key, type)
    {
        if( this.lock[key] )
        {
            return false;
        }
        this.lock[key] = type;
        return true;
    },
    _unlockCache: function(key)
    {
        if( this.lock[key] )
        {
            this.lock[key] = this.LOCK.UNLOCKED;
        }
        if( this.queue[key] && this.queue[key].length > 0 )
        {
            var func = this.queue[key].shift();
            if( typeof func === 'function' )
            {
                func();
            }
        }
    },
    _canRead: function(key)
    {
        if( this.lock[key] === this.LOCK.READWRITE )
        {
            return false;
        }
        return true;
    },
    _loadCacheFromFile: function(options, args)
    {
        if( !this._lockCache(args.key, this.LOCK.READWRITE) )
        {
            if( !this.queue[args.key] )
            {
                this.queue[args.key] = [];
            }
            this.queue[args.key].push(this._getCache.bind(this, options, args.callback ));
            return;
        }
        FileSystem.readFile ( "Cache/" + args.key + ".json", false,
                              this._onLoadCache.bind(this, options, args) );
    },
    _onLoadCache: function(options, args, err, data )
    {
        if( err )
        {
            this.cache[args.key] = new OrderedDictionary();
        }
        else
        {
            try
            {
                this.cache[args.key] = new OrderedDictionary(data);
            }
            catch (ex)
            {
                this.cache[args.key] = new OrderedDictionary();
                if(typeof NgLogException === 'function' )
                {
                    NgLogException(ex);
                }
            }
        }
        this._callFunction( args.callback, [ this.cache[args.key] ] );
        this._unlockCache(args.key);
    },
    _loadCacheFromKeyValue: function(options, args)
    {
        if( !this._lockCache(args.key, this.LOCK.READWRITE) )
        {
            if( !this.queue[args.key] )
            {
                this.queue[args.key] = [];
            }
            this.queue[key].push(this._getCache.bind(this, options, args.callback ));
            return;
        }
        KeyValueCache.local.getItem("Cache/"+args.key,
                                            this._onLoadCache.bind(this, options, args) );
    },
    setItem: function(options, key, value, callback)
    {
        var args = {
            key: key,
            value: value,
            callback: callback
        };
        args.cachekey = this._getKey(options);
        if( !this._lockCache(args.cachekey, this.LOCK.WRITE) )
        {
            if( !this.queue[args.cachekey] )
            {
                this.queue[args.cachekey] = [];
            }
            this.queue[args.cachekey].push(this.setItem.bind(this, options, key, value, callback ));
            return;
        }
        this._getCache(options, this._onGetCacheForSet.bind(this, options, args));
    },
    _onGetCacheForSet: function(options, args, obj)
    {
        if( typeof obj !== 'object' )
        {
            obj = new OrderedDictionary();
            this.cache[args.cachekey] = obj;
        }
        var item = obj.remove(args.key);
        if( !item )
        {
            item = { count: 0 };
        }
        var dt = new Date();
        item.value = args.value;
        item.datetime = dt.getTime()/1000;
        if( obj.length >= options.size)
        {
            switch(options.policy)
            {
            case this.POLICY.LRU:
            case this.POLICY.LFU:
                obj.pop(args.key);
                break;
            case this.POLICY.MRU:
                obj.shift(args.key);
                break;
            default:
                obj.pop(args.key);
                break;
            }
        }
        obj.unshift(args.key, item);
        switch(options.type)
        {
        case this.TYPE.MEMORY:
            this._onLoadCacheForSet(options, args, obj, undefined);
            break;
        case this.TYPE.FILESYSTEM:
            this._saveCacheToFile(options, args, obj);
            break;
        case this.TYPE.KEYVALUE:
            this._saveCacheToKeyValue(options, args, obj);
            break;
        default:
            this._onLoadCacheForSet(options, args, obj, undefined);
            break;
        }
    },
    removeItem: function(options, key, callback )
    {
        var args = {
            key: key,
            callback: callback
        };
        args.cachekey = this._getKey(options);
        if( !this._lockCache(args.cachekey, this.LOCK.WRITE) )
        {
            if( !this.queue[args.cachekey] )
            {
                this.queue[args.cachekey] = [];
            }
            this.queue[args.cachekey].push(this.removeItem.bind(this, options, key, callback ));
            return;
        }
        this._getCache(options, this._onGetCacheForRemove.bind(this, options, args));
    },
    _onGetCacheForRemove: function(options, args, obj)
    {
        if( typeof obj !== 'object' )
        {
            obj = new OrderedDictionary();
            this.cache[args.cachekey] = obj;
        }
        if( !args.key )
        {
            obj.clear();
        }
        else
        {
            obj.remove(args.key);
        }
        switch(options.type)
        {
        case this.TYPE.MEMORY:
            this._onLoadCacheForSet(options, args, obj, undefined);
            break;
        case this.TYPE.FILESYSTEM:
            this._saveCacheToFile(options, args, obj);
            break;
        case this.TYPE.KEYVALUE:
            this._saveCacheToKeyValue(options, args, obj);
            break;
        default:
            this._onLoadCacheForSet(options, args, obj, undefined);
            break;
        }
    },
    _saveCacheToFile: function(options, args, obj)
    {
        FileSystem.writeFile( "Cache/" + args.cachekey + ".json", obj.toJSON(),
                              false, this._onLoadCacheForSet.bind(this, options, args, obj) );
    },
    _saveCacheToKeyValue: function(options, args, obj)
    {
        KeyValueCache.local.setItem("Cache/"+args.cachekey, obj.toJSON(),
                                            this._onLoadCacheForSet.bind(this, options, args, obj) );

    },
    _onLoadCacheForSet: function(options, args, obj, error)
    {
        this._callFunction(args.callback, [error, args.value]);
        this._unlockCache(args.cachekey);
    }
});

var TextCache = Class.subclass(
/** @lends Service.Data.TextCache */
{
    classname: 'TextCache',
    /**
     * Type code of <a href="Service.Data.TextCache.html"><code>TextCache</code></a>.
     * @namespace
     */
    TYPE:
    {
        /** Cache only to memory */
        MEMORY     : 0,
        /** Cache data to file */
        FILESYSTEM : 1,
        /** Cache data to key value storage */
        KEYVALUE   : 2
    },
    /**
     * Replacement policy type of <a href="Service.Data.TextCache.html"><code>TextCache</code></a>.
     * @namespace
     */
    POLICY:
    {
        /** Least Recently Used */
        LRU : 0,
        /** Most Recently Used */
        MRU : 1,
        /** Least Frequently Used */
        LFU : 2
    },
    /**
     * @class It provide the same interface for text cache on memory, filesystem and keyvalue strage.
     * @param {Object} [options] object includes option parameters.
     * @param {Number} [options.type=TextCache.TYPE.MEMORY] Type which describe where the cache data will be stored.
     * @param {Number} [options.policy=TextCache.POLICY.LRU] Replacement policy for the cache.
     * @param {Number} [options.size=100] Cache size.
     * @param {Number} [options.expire=3600] Expired time of each cache( sec ).
     * @param {String} [options.key="nggo-cache"] Key which uses for filename and key of key-value storage.
     * @constructs
     * @augments Core.Class
     * @name Service.Data.TextCache
     */
    initialize: function(options)
    {
        var name;
        var _default_options = {
            type   : this.TYPE.MEMORY,
            policy : this.POLICY.LRU,
            size   : 100,
            expire : 3600,
            key    : "nggo-cache"
        };
        if( !options || typeof options !== 'object' )
        {
            options = {};
        }
        if(!this.options)
        {
            this.options = {};
        }
        this.options.Cache = {};
        for( name in _default_options )
        {
            if( _default_options.hasOwnProperty(name))
            {
                this.options.Cache[name] = options.hasOwnProperty(name) ? options[name] : _default_options[name];
            }
        }
        CacheManager.preloadCache(this.options.Cache);
    },
    /**
     * Adds value associated with the given key to the storage.
     *
     * @param {String} key Cache key to add
     * @param {String|Number} value Value to add
     * @param {Function} [callback] Callback function which is called when the process is finished.
     */
    add: function(key, value, callback)
    {
        CacheManager.setItem(this.options.Cache, key, value, callback);
    },
    /**
     * Alias of add method.
     *
     * @param {String} key Cache key to add
     * @param {String|Number} value Value to add
     * @param {Function} [callback] Callback function which is called when the process is finished.
     */
    set: function(key, value, callback)
    {
        this.add(key, value, callback);
    },
    /**
     * Get a cache data associate with given key.
     *
     * @param {String} key Cache key to get
     * @param {Function} [callback] Callback function which is called when the process is finished.
     */
    get: function(key, callback)
    {
        return CacheManager.getItem(this.options.Cache, key, callback);
    },
    /**
     * Remove a cache data associate with given key.
     *
     * @param {String} key Cache key to get
     * @param {Function} [callback] Callback function which is called when the process is finished.
     */
    remove: function(key, callback)
    {
        CacheManager.removeItem(this.options.Cache, key, callback);
    },
    /**
     * Clear all cache data associate with the cache object.
     *
     * @param {Function} [callback] Callback function which is called when the process is finished.
     */
    clear: function(callback)
    {
        CacheManager.removeItem(this.options.Cache, undefined, callback);
    }
});

exports.TextCache = TextCache;
