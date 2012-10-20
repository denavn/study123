////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Ngyuen Vu Thanh Tung
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc.  All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// Require Block
var Class     = require('../../../Foundation/Class').Class;
var TextCache = require('../../../Service/Data/TextCache').TextCache;


var RequestCache = Class.singleton(
/** @lends Service.Network.HTTP.RequestCache.prototype */
{
    classname: 'RequestCache',
    /**
     * @class Singleton class to store request cache by using uri as a key.
     * @constructs
     * @name Service.Network.HTTP.RequestCache
     * @augments Core.Class
     */
    initialize: function()
    {
        this.length   = 0;
        this._count   = 0;
        this._default_options = {
            type   : TextCache.TYPE.MEMORY,
            policy : TextCache.POLICY.LRU,
            size   : 100,
            expire : 3600,
            key    : "nggo-requestCache"
        };
        this._cache   = new TextCache(this._default_options);
    },
    /**
     * Get cache data specified by URI
     * @param {String|Object} uri URI to get cache. A string and HTTP.URI object are acceptable.
     * @returns {String} Content cache got through HTTP.
     */
    get: function(uri)
    {
        return this._cache.get(uri.toString());
    },
    /**
     * Set cache data specified by URI
     * @param {String|Object} uri URI to set cache. A string and HTTP.URI object are acceptable.
     * @param {String} value Content got through HTTP.
     */
    set: function(uri, value)
    {
        this._cache.add(uri.toString(), value);
    },
    /**
     * Clear all cache data.
     */
    clear: function()
    {
        this._cache.clear();
    }
});

exports.RequestCache = RequestCache;
