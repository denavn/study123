////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Mizuno Takaaki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// Require Block
var Class             = require('../../../Foundation/Class').Class;
var OrderedDictionary = require('../../../Foundation/OrderedDictionary').OrderedDictionary;


var Cookies = Class.subclass(
/** @lends Service.Network.HTTP.Cookies.prototype */
{
    classname: 'Cookies',
    /**
     * @class Object to represent HTTP cookies.
     * @constructs
     * @name Service.Network.HTTP.Cookies
     * @param {String} [str] Cookie string
     * @property {Date|String} expire Expire date fragment.
     * <br><br>
     * You can pass string that <code>Date</code> object can accept.
     * @property {Boolean} secure or not.
     * @property {String} path Path fragment of cookie.
     * @property {String} domain Domain fragment of cookie.
     * @property {Number} length (readonly) Number of cookie values. length is read only property.
     */
    initialize: function(str)
    {
        this._cookie = undefined;
        this._expire = undefined;
        this._path   = undefined;
        this._domain = undefined;
        this._secure = false;
        if( typeof str === 'string')
        {
            this._parseCookie(str);
        }
        else
        {
            this._cookie = new OrderedDictionary();
        }
    },
    /**
     * Return Cookie string for HTTP request header.
     * @returns {String} Cookie string for HTTP request Cookie header.
     */
    toString: function()
    {
        var all, needattr;
        if( this._expire )
        {
            // this instance is for "set-cookie:"
            all = false;
            needattr = true;
        }
        else
        {
            // this instance is for "cookie:"
            all = true;
            needattr = false;
        }
        return this._buildCookie(all, needattr, false);
    },
    /**
     * Return array of each cookie entry.
     * @returns {Array} Array of each cookie name value pair.
     */
    toArray: function()
    {
        if( !this._cookie )
        {
            return [];
        }
        var all, needattr;
        if( this._expire )
        {
            // this instance is for "set-cookie:"
            all = false;
            needattr = true;
        }
        else
        {
            // this instance is for "cookie:"
            all = true;
            needattr = false;
        }
        return this._buildCookie(all, needattr, true);
    },
    /**
     * Get cookie value of given name
     * @param {String} name name to get cookie
     * @returns {String} The value of cookie
     */
    get: function(name)
    {
        return this._cookie.get(name);
    },
    /**
     * Set cookie value of given name
     * @param {String} name name to set cookie
     * @param {String} value value of cookie
     */
    set: function(name, value)
    {
        this._cookie.set(name,value);
    },
    /**
     * Remove cookie value of given name
     * @param {String} name name to remove cookie
     * @returns {String} Removed value
     */
    remove: function(name)
    {
        return this._cookie.remove(name);
    },
    get expire()
    {
        return this._expire;
    },
    set expire(value)
    {
        if( typeof value === 'object' && value instanceof Date )
        {
            this._expire = value;
        }
        else
        {
            this._expire = new Date(value);
        }
    },
    get secure()
    {
        return this._secure;
    },
    set secure(value)
    {
        this._secure = !!value;
    },
    get path()
    {
        return this._path;
    },
    set path(value)
    {
        this._path = value;
    },
    get domain()
    {
        return this._domain;
    },
    set domain(value)
    {
        this._domain = value;
    },
    get length(){
        return this._cookie.length;
    },
    set length(value){
        console.log("length is a read only property.");
    },
    /** @private */
    _parseCookie: function(str)
    {
        var i;
        var array = str.split(";");
        var reg = /\s*([^=]+)=\s*(.+)/;
        this._cookie = new OrderedDictionary();
        var len = array.length;
        for(i=0;i<len;i++)
        {
            var m = array[i].match(reg);
            if( m )
            {
                var key   = m[1];
                var value = m[2];
                switch(key.toLowerCase()){
                case "expires":
                    this._expire = new Date(value);
                    break;
                case "path":
                    this._path = value;
                    break;
                case "domain":
                    this._domain = value;
                    break;
                default:
                    this._cookie.set(key, value);
                    break;
                }
            }
            else if(array[i] === 'secure' )
            {
                this._secure = true;
            }
        }
    },
    /** @private */
    _buildCookie: function(all, needattr, wantarray)
    {
        var i;
        var cookies = this._cookie;
        if( !cookies || cookies.length === 0 )
        {
            return wantarray ? [] : "";
        }
        var array = [];
        var len = cookies.length;
        if( !all )
        {
            len = 1;
        }
        for( i=0; i<len; i++ )
        {
            array.push(cookies.getKeyByIndex(i)+"="+cookies.getByIndex(i));
        }
        if( needattr )
        {
            if( this._expire )
            {
                array.push("expire="+this._expire.toUTCString());
            }
            if( this._path )
            {
                array.push("path="+this._path);
            }
            if( this._domain )
            {
                array.push("domain="+this._domain);
            }
            if( this._secure )
            {
                array.push("secure");
            }
        }
        return wantarray ? array : array.join(";");
    }
});

exports.Cookies = Cookies;
