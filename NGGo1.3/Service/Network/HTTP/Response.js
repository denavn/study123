////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Mizuno Takaaki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// Require Block
var Class   = require('../../../Foundation/Class').Class;
var Headers = require('./Headers').Headers;


var Response = Class.subclass(
/** @lends Service.Network.HTTP.Response.prototype */
{
    classname: 'Response',
    /**
     * @class class description
     * @example sample code
     * @constructs The default constructor.
     * @param {Network.XHR} xhr
     * @param {Object} req
     * @property {NUmber} statusCode (readonly)
     * @property {String} statusText (readonly)
     * @property {String} responseText (readonly)
     * @property {String} responseJSON (readonly)
     * @property {Boolean} isText (readonly)
     * @property {Boolean} isJSON (readonly)
     * @property {ToBeWritten} headers (readonly)
     * @augments Core.Class
     */
    initialize: function(xhr, req)
    {
        this._statusCode      = parseInt(xhr.status,10);
        this._statusText      = xhr.statusText;
        this._responseText    = xhr.responseText;
        this._redirectHistory = req.redirectList;
        this._headers         = this._buildHeaders(xhr);
        this._uri             = req.uri;
    },
    get statusCode()
    {
        return this._statusCode;
    },
    set statusCode(value)
    {
        console.log("HTTP.Response: statusCode is a read only property.");
    },
    get statusText()
    {
        return this._statusText;
    },
    set statusText(value)
    {
        console.log("HTTP.Response: statusText is a read only property.");
    },
    /**
     * @field
     * @type String
     */
    get responseText()
    {
        return this._responseText;
    },
    set responseText(value)
    {
        console.log("HTTP.Response: responseText is a read only property.");
    },
    get responseJSON()
    {
        try {
            return JSON.parse(this._responseText);
        }
        catch (err)
        {
            console.log(err);
            return undefined;
        }
    },
    set responseJSON(value)
    {
        console.log("HTTP.Response: responseJSON is a read only property.");
    },
    get isText()
    {
        return this._headers.contentIsText();
    },
    set isText(value)
    {
        console.log("HTTP.Response: isText is a read only property.");
    },
    get isJSON()
    {
        return this._headers.contentIsJSON();
    },
    set isJSON(value)
    {
        console.log("HTTP.Response: isJSON is a read only property.");
    },
    get headers()
    {
        return this._headers;
    },
    set headers(value)
    {
        console.log("HTTP.Response: headers is a read only property.");
    },
    /** @private */
    _buildHeaders: function(xhr)
    {
        var key;
        var obj = xhr.getUnflattenedResponseHeaders();
        var headers = new Headers();
        for(key in obj)
        {
            if( obj.hasOwnProperty(key))
            {
                headers.set(key, obj[key]);
            }
        }
        return headers;
    }
});

exports.Response = Response;
