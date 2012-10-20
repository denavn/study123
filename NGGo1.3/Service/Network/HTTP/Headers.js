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
var Cookies           = require('./Cookies').Cookies;


var Headers = Class.subclass(
/** @lends Service.Network.HTTP.Headers.prototype */
{
    classname: 'Headers',
    _dateType: {
        "If-Modified-Since" : 1,
        "Last-Modified"     : 1
    },
    _cookieType: {
        "Set-Cookie" : 1,
        "Cookie"     : 1
    },
    /**
     * @class Class represents HTTP request/response headers.
     * @property {Number} length (readonly) Number of header. length is read only property.
     * @property {String} userAgent User-Agent header value accessor.
     * @property {String} contentType Content-Type header value accessor.
     * @property {String} contentTypeCharset Encoding str for content-Type header value.
     * @property {String} lastModified Last-Modified header value accessor.
     * @property {String} ifModifiedSince If-Modified-Since header value accessor.
     * @property {Boolean} contentIsText (readonly) It indicate the downloaded content is text or not.
     * @property {Boolean} contentIsJSON (readonly) It indicate the downloaded content is JSON or not.
     * @property {Object} HTTP.Cookies object for Cookie header.
     * @constructs
     * @augments Core.Class
     */
    initialize: function()
    {
        this._dict = new OrderedDictionary();
        this._cookies = new Cookies();
    },
    /**
     * Get header value specified by name.  If the header has only one value, it returns String. If the header has more than 2 values, it returns Array.
     * @param {String} name the name of HTTP header
     * @returns {String} the value of the http header field. If the field  have multipul values, it will return Array object.
     */
    get: function(name)
    {
        return this._dict.get(name);
    },
    /**
     * Set header value specified by name. If the header is already exist, old value is replaced with new value. value can be String or Array.
     * @param {String} name the name of HTTP header
     * @param {String} value the value of HTTP header
     */
    set: function(name, value)
    {
        if( this._dateType[name] )
        {
            value = new Date(value);
        }
        else if ( this._cookieType[name] )
        {
            if( typeof value === 'object' && value instanceof Cookies )
            {
                value = value.toString();
            }
        }
        this._dict.set(name, value);
    },
    /**
     * Set header value specified by name. If the header is already exist, new value will add after the old values. old value is replaced with new value. Value can be String or Array.
     * @param {String} name the name of HTTP header
     * @param {String} value the value of HTTP header
     */
    push: function(name, value)
    {
        if( this._dateType[name] )
        {
            value = new Date(value);
        }
        var current = this._dict.get(name);
        if( !current )
        {
            return this._dict.set(name, value);
        }
        else if( typeof current === 'object' && current instanceof Array )
        {
            return this._dict.set(name, current.push(value));
        }
        return this._dict.set(name, [current, value]);
    },
    /**
     * Remove header values specified with the name.
     * @param {String} name the name of HTTP header
     * @returns {String} removed values
     */
    remove: function(name)
    {
        return this._dict.remove(name);
    },
    /**
     * Make an array of headers
     * @returns {Array} Array of all headers. Each headers are represented as an object which includes "key" and "value".
     */
    toArray: function()
    {
        var i;
        var keys = this._dict.keys;
        var len = keys.length;
        var ret = [];

        for(i=0; i<len; i++)
        {
            this._toArrayRec(ret, keys[i], this._dict.get(keys[i]));
        }
        if( this._cookies && this._cookies.length > 0 )
        {
            ret.push( {key: "Cookie", value: this._cookies.toString()} );
        }
        return ret;
    },
    /**
     * Return all the headers as a formatted MIME header.
     * @returns {String} formatted MIME header.
     */
    toString: function()
    {
        var i;
        var array = this.toArray();
        var str = "";
        var len = array.length;

        for( i=0; i<len; i++ )
        {

            str = str + array[i].key + ": "+array[i].value + "\n";
        }
        return str;
    },
    get length()
    {
        return this._dict.length;
    },
    set length(value)
    {
        console.log("length is a read only property.");
    },
    get userAgent()
    {
        return this.get("User-Agent");
    },
    set userAgent(value)
    {
        this.set("User-Agent", value);
    },
    get contentType()
    {
        var ct = this._parseContentType(this.get("Content-Type"));
        return ct.type ? ct.type+"/"+ct.subtype : "";
    },
    set contentType(value)
    {
        var newCt = this._parseContentType(value);
        var oldCt = this._parseContentType(this.get("Content-Type"));
        if( newCt.type )
        {
            var newCtStr = newCt.type+"/"+newCt.subtype;
            if( newCt.charset )
            {
                newCtStr = newCtStr + "; charset="+newCt.charset;
            }
            else if( oldCt.charset )
            {
                newCtStr = newCtStr + "; charset="+oldCt.charset;
            }
            this.set("Content-Type", newCtStr);
        }
    },
    get contentTypeCharset()
    {
        var ct = this._parseContentType(this.get("Content-Type"));
        return ct.charset ? ct.charset : "";
    },
    set contentTypeCharset(value)
    {
        var oldCt = this._parseContentType(this.get("Content-Type"));
        if( oldCt.type )
        {
            var newCtStr = oldCt.type+"/"+oldCt.subtype;
            if( value )
            {
                newCtStr = newCtStr + "; charset="+value;
            }
            this.set("Content-Type", newCtStr);
        }
    },
    get lastModified()
    {
        this._getDateType("Last-Modified");
    },
    set lastModified(value)
    {
        this._setDateType("Last-Modified", value);
    },
    get ifModifiedSince()
    {
        this._getDateType("If-Modified-Since");
    },
    set ifModifiedSince(value)
    {
        this._setDateType("If-Modified-Since", value);
    },
    get contentIsText()
    {
        var ct = this._parseContentType(this.get("Content-Type"));
        return ct.type    === 'text' ? true :
               ct.subtype === 'json' ? true : false;
    },
    set contentIsText(value)
    {
        console.log("contentIsText is a read only property.");
    },
    get contentIsJSON()
    {
        var ct = this._parseContentType(this.get("Content-Type"));
        return ct.subtype === 'json'  ? true : false;
    },
    set contentIsJSON(value)
    {
        console.log("contentIsJSON is a read only property.");
    },
    get cookies()
    {
        return this._cookies;
    },
    set cookies(value)
    {
        this._cookies = value;
    },
    // Private Functions
    _toArrayRec: function(array, key, value)
    {
        NgLogD(key);
        var i;
        if( typeof value === 'object' )
        {
            if( value instanceof Array )
            {
                var len = value.length;
                for(i=0; i<len; i++ )
                {
                    this._toArrayRec(array, key, value[i]);
                }
            }
            else if( value instanceof Date )
            {
                array.push({ key: key, value: value.toUTCString()});
            }
            else if( value.toString )
            {
                array.push({key: key, value: value.toString()});
            }
        }
        else
        {
            array.push({ key: key, value: value});
        }
    },
    /** @private */
    _parseContentType: function(ct)
    {
        if( typeof ct === 'string' )
        {
            var reg = /([^;\/]+)\/([^;\/]+)(?:\;\s*charset=(.+))*/;
            ct = ct.toLowerCase();
            var m = ct.match(reg);
            if( m )
            {
                return {
                    type    : m[1],
                    subtype : m[2],
                    charset : m[3] ? m[3] : ""
                };
            }
        }
        return {
            type    : "",
            subtype : "",
            charset : ""
        };
    },
    /** @private */
    _getDateType: function(name)
    {
        var d = this.get(name);
        return ( typeof d === 'object' && d instanceof Date ? d : undefined );
    },
    /** @private */
    _setDateType: function(name, str)
    {
        var d;
        if( typeof str === 'object' && d instanceof Date )
        {
            d = str;
        }
        else
        {
            d = new Date(str);
        }
        this.set(name, d);
    }
});

exports.Headers = Headers;
