////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Mizuno Takaaki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc.  All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// Require Block
var Class = require('../../Foundation/Class').Class;


var URI   = Class.subclass(
/** @lends Service.Network.URI.prototype */
{
    classname: 'URI',

    /**
     * @class Class for URI manipulations
     * @constructs
     * @name Service.Network.URI
     * @augments Core.Class
     * @property {String} scheme Scheme part of URI.
     * @property {String} host Host part of URI.
     * @property {String} path Path part of URI.
     * @property {String} query Query part of URI.
     * @property {String} fragment Fragment part of URI.
     * query
     */
    initialize: function( uri )
    {
        this._scheme   = "";
        this._host     = "";
        this._path     = [];
        this._query    = "";
        this._fragment = "";
        this._original = "";
        if( typeof uri === 'string' ){
            this._parseUriString(uri, false);
            this._original = uri;
        }
    },
    $isHttpUri: function( uri )
    {
        return this._parseUriString(uri);
    },
    $_parseUriString: function(str, checkOnly)
    {
    var reg = /^(https?):\/\/([\-_.!~*\'()a-zA-Z0-9;:\@&=+\$,%]+)\/?([\-_.!~*\'()a-zA-Z0-9;\/:\@&=+\$,%]*)\??([\-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%]*)\#?([\-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]*)/i;
        var m = str.match(reg);
        if( m )
        {
            if( !checkOnly ){
                this._scheme   = m[1].toLowerCase();
                this._host     = m[2].toLowerCase();
                this._path     = this._parsePath(m[3]);
                this._query    = this._parseQuery(m[4]);
                this._fragment = m[5];
            }
            return true;
        }
        else
        {
            return false;
        }
    },
    get scheme()
    {
        return this._scheme;
    },
    set scheme(value)
    {
        if( typeof value !== 'string' ){
            throw new Error("ngGo Service.Network.URI: scheme '"+value+"' is not suported");
        }
        value = value.toLowerCase();
        if( value === 'http' || value === 'https' )
        {
            this._scheme = value;
        }
        else
        {
            throw new Error("ngGo Service.Network.URI: scheme '"+value+"' is not suported");
        }
    },
    get host()
    {
        return this._host;
    },
    set host(value)
    {
        if( typeof value !== 'string' )
        {
            throw new Error("ngGo Service.Network.URI: host '"+value+"' is not suported");
        }
        else
        {
            this._host = value;
        }
    },
    get path()
    {
        if( this._path.length === 0 )
        {
            return "/";
        }
        return "/"+this._path.join("/");
    },
    set path(value)
    {
        if( typeof value === 'object' && value instanceof Array )
        {
            this._path = value;
        }
        else if( typeof value === 'string')
        {
            this._path = this._parsePath(value);
        }
        else
        {
            throw new Error("ngGo Service.Network.URI: path '"+value+"' is not suported");
        }
    },
    get query()
    {
        var i;
        var len = this._query.length;
        var ret = [];
        for(i=0; i<len; i++)
        {
            ret.push(this._query[i].original);
        }
        return ret.join("&");
    },
    set query(value)
    {
        if( typeof value === 'string')
        {
            this._query = this._parseQuery(value);
        }
        else
        {
            throw new Error("ngGo Service.Network.URI: query '"+value+"' is not suported");
        }
    },
    get fragment()
    {
        return this._fragment;
    },
    set fragment(value)
    {
        if( typeof value === 'string')
        {
            this._fragment = value;
        }
        else
        {
            throw new Error("ngGo Service.Network.URI: query '"+value+"' is not supported");
        }
    },
    /**
     * Return URI in string.
     * @retuns {String} URI string.
     */
    toString: function()
    {
        var uri = this.scheme+"://"
            + this.host
            + this.path;
        var query = this.query;
        if( query )
        {
            uri = uri + '?' + query;
        }
        var fragment = this.fragment;
        if( fragment )
        {
            uri = uri + "#" + fragment;
        }
        return uri;
    },
    /** @private */
    _parsePath: function(path)
    {
        if( !path || typeof path !== 'string' )
        {
            return [];
        }
        var ret = path.split('/');
        return ret;
    },
    /** @private */
    _buildPath: function(path)
    {
        if( !path || !path instanceof Array )
        {
            return '/';
        }
        return '/'+path.join('/');
    },
    _parseQuery: function(query)
    {
        var i;
        if( !query || typeof query !== 'string' )
        {
            return [];
        }
        var list = query.split("&");
        var len = list.length;
        var ret = [];
        for(i=0;i<len;i++){
            var entry = list[i].split("=");
            ret.push({
                original : list[i],
                key      : entry[0] ? decodeURIComponent(entry[0]) : "",
                value    : entry[1] ? decodeURIComponent(entry[1]) : ""
            });
        }
        return ret;
    },
    /** @private */
    _buildQuery: function(query)
    {
        var i;
        if( !query || !query instanceof Array )
        {
            return "";
        }
        var len = query.length;
        var list = [];

        for(i=0; i<length; ++i)
        {
            list.push(query[i].original);
        }
        return list.join("&");
    }
});

exports.URI = URI;
