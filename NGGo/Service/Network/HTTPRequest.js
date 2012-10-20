////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Mizuno Takaaki & Ngyuen Vu Thanh Tung
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc.  All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// Require Block
var XHR          = require('../../../NGCore/Client/Network/XHR').XHR;
var Class        = require('../../Foundation/Class').Class;
var Observable   = require('../../Foundation/Observable').Observable;
var URI          = require('./URI').URI;
var Headers      = require('./HTTP/Headers').Headers;
var Cookies      = require('./HTTP/Cookies').Cookies;
var Response     = require('./HTTP/Response').Response;
var RequestCache = require('./HTTP/RequestCache').RequestCache;


var HTTPRequest = Class.subclass(
/** @lends Service.Network.HTTPRequest.prototype */
{
    classname: 'HTTPRequest',
    /**
     * @class ngCore's Network.XHR wrapper to provide higher level HTTP access functionalities.
     * @constructor
     * @augments Core.Class
     * @property {Number} maxRetry Max retry number when the network trouble has occur.
     * @property {Number} retryInterval Initial retry interval(millisec). The interval doubles each retry.
     * @property {Number} maxRedirect Limit of how many times it will obey redirection responses in a given request cycle.
     * @property {Number} timeout Timeout time in millisec.
     * @property {Number} readyState (readonly) readyState of XHR.
     * @property {Boolean} isRequesting (readonly) Describe it is requesting now or not.
     * @property {Object} transport (readonly) Get internal Network.XHR object.
     * @property {Object} headers (readonly) Get HTTP.Headers object to use for request heraders.
     * @property {String} userAgent Useragent string used for request.
     * @property {String} contentType The content type for the request body.
     * @property {Object} cookies Set HTTP.Cookies object to send cookies to server.
     * @property {Object} ifModifiedSince Date object for "If-modified-since" header to conditional request.
     * @name Service.Network.HTTPRequest
     */
    initialize: function()
    {
        this.maxRetry      = 0;
        this.retryInterval = 1000;
        this.maxRedirect   = 7;
        this.useCache      = false;
        this.timeout       = 60000;
        this._isRequesting = false;
        this._xhr          = new XHR();
        this._headers      = new Headers();
        this._headers.userAgent          = "ngGo-HTTP-Agent/1.0 (https://developer.mobage.com/)";
        this._headers.contentType        = "application/x-www-form-urlencoded";
        this._headers.contentTypeCharset = "utf-8";
    },
    /**
     * Access remote URI by HTTP GET method.
     * @param {String|Service.Network.URI} uri URI to do GET access. A sting and HTTP.URI object are acceptable.
     * @param {Function} [doneCb] callback function which called when the access finished.
     */
    get: function(uri, doneCb)
    {
        this.send("GET",uri, undefined, doneCb);
    },
    /**
     * Access remote URI by HTTP POST method.
     * @param {String|Service.Network.URI} uri URI to do POST access. A sting and HTTP.URI object are acceptable.
     * @param {String} requestBody Request body string for POST access.
     * @param {Function} [doneCb] callback function which called when the access finished.
     */
    post: function(uri, requestBody, doneCb)
    {
        this.send("POST",uri, requestBody, doneCb);
    },
    /**
     * Access remote URI by specified method.
     * @param {String} method HTTP method name( GET, POST, HEAD, PUT, DELETE )
     * @param {String|Service.Network.URI} uri URI to do POST access. A sting and HTTP.URI object are acceptable.
     * @param {String} requestBody Request body string for POST access.
     * @param {Function} [doneCb] callback function which called when the access finished.
     */
    send: function(method, uri, requestBody, doneCb )
    {
        if( this._isRequesting )
        {
            this.abort();
        }
        if( typeof uri !== 'object' || uri.classname !== 'URI' )
        {
            uri = new URI(uri);
        }
        method = method.toUpperCase();
        //Handle caching process for GET method
        var needCache  = false;
        if (this.useCache && method === "GET")
        {
            var res = RequestCache.get(uri);
            //if uri exists in cache
            if (res)
            {
                this.notify("onReadyStateChange", res);
                this.notify("onSuccess", res);
                this.notify("onComplete", res);
                this._isRequesting = false;
                if( typeof doneCb === 'function' )
                {
                    try
                    {
                        doneCb(res);
                    }
                    catch (ex)
                    {
                        if( typeof NgLogException === 'function' )
                        {
                            NgLogException(ex);
                        }
                    }
                }
                return;
            }
            //if uri doesn't exist, will do as usual & save successful response into cache
            else
            {
                needCache = true;
            }
        }
        this._requestStatus = {
            method         : method,
            uri            : uri,
            requestBody    : requestBody,
            doneCb         : doneCb,
            needCache      : needCache,
            timeOutTimerID : 0,
            redirectCount  : 0,
            redirectList   : [uri],
            retryCount     : 0,
            retryInterval  : this.retryInterval
        };
        this._sendRequest();
    },
    /**
     * Abort request.
     * @returns {Boolean} Aborted or not. If it is not requesting( finished or not requested yet ), it returns false.
     */
    abort: function()
    {
        if( this._isRequesting )
        {
            this._xhr.reset();
            return true;
        }
        return false;
    },
    /**
     * Clear HTTP request cache.
     */
    clearCache: function()
    {
        RequestCache.clear();
    },
    get readyState()
    {
        return this._xhr.readyState;
    },
    set readyState(value)
    {
        if( typeof NgLogW === 'function' )
        {
            NgLogW("HTTPRequest: readyState is a read only property.");
        }
    },
    get isRequesting(){
        return this._isRequesting;
    },
    set isRequesting(value)
    {
        if( typeof NgLogW === 'function' )
        {
            NgLogW("HTTPRequest: isRequesting is a read only property.");
        }
    },
    get transport(){
        return this._xhr;
    },
    set transport(value)
    {
        if( typeof NgLogW === 'function' )
        {
            NgLogW("HTTPRequest: transport is a read only property.");
        }
    },
    get headers()
    {
        return this._headers;
    },
    set headers(value)
    {
        if( typeof NgLogW === 'function' )
        {
            NgLogW("HTTPRequest: headers is a read only property.");
        }
    },
    get userAgent()
    {
        return this._headers.userAgent;
    },
    set userAgent(value){
        this._headers.userAgent = value;
    },
    get contentType(){
        return this._headers.contentType;
    },
    set contentType(value){
        this._headers.contentType = value;
    },
    get cookies(){
        return this._headers.cookies;
    },
    set cookies(value){
        this._headers.cookies = value;
    },
    get ifModifiedSince()
    {
        return this._headers.ifModifiedSince;
    },
    set ifModifiedSince(value)
    {
        this._headers.ifModifiedSince = value;
    },
    /** @private */
    _sendRequest: function()
    {
        var i;
        var req = this._requestStatus;
        this._xhr.reset();
        this._xhr.open(req.method,req.uri.toString());
        var headers = this.headers.toArray();
        var len = headers.length;
        for( i=0; i<len; i++ )
        {
            this._xhr.setRequestHeader(headers[i].key, headers[i].value);
            NgLogD(headers[i].key+":"+headers[i].value);
        }
        if( isFinite(this.timeout) )
        {
            this._requestStatus.timeOutTimerID = setTimeout(
                this._requestTimeOut.bind(this), this.timeout*1000 );
        }
        this._xhr.onreadystatechange = this._onReadyStateChange.bind(this);
        this._xhr.send(req.requestBody);
        this._isRequesting = true;
    },
    /** @private */
    _onReadyStateChange: function()
    {
        //Implementation follows http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
        var xhr = this._xhr;
        var req = this._requestStatus;
        var res = this._buildResponse();
        this.notify("onReadyStateChange", res);
        if( xhr.readyState !== 4 )
        {
            if( xhr.readyState === 3 )
            {
                this.notify("onLoading", res);
            }
            return;
        }
        if( req.timeOutTimerID )
        {
            clearTimeout(req.timeOutTimerID);
            req.timeOutTimerID = 0;
        }
        var status = xhr.status;
        if(status === 301 || status === 302 || status === 303 || status === 307)
        {
            var uri = xhr.getResponseHeader("Location");
            this.headers.remove("Cookie");
            if (status !== 301)
            {
                if (req.method !== "GET" && req.method !== "HEAD")
                {
                    //clear headers
                    xhr.reset();
                    //change method to GET when redirect
                    req.method = "GET";
                    req.requestBody = undefined;
                }
            }
            if( uri && req.redirectCount < this.maxRedirect )
            {
                req.redirectCount++;
                uri = new URI(uri);
                req.redirectList.push(uri);
                req.uri = uri;
                req.retryCount = 0;
                req.retryInterval = this.retryInterval;
                this._sendRequest();
                return;
            }
            return;
        }
        if( status === 0 || status === 503 )
        {
            // network error
            res = this._buildResponse();
            if( req.retryCount > this.maxRetry )
            {
                this.notify("onFailure", res);
                this.notify("onComplete", res);
            }
            else
            {
                // retry
                setTimeout( this._sendRequest.bind(this), req.retryInterval);
                req.retryCount += 1;
                req.retryInterval *= 2;
            }
            return;
        }
        else
        {
            res = this._buildResponse();
            if( status >= 200 && status < 399 )
            {
                this.notify("onSuccess", res);
                //Only cache successful GET request
                if (status === 200)
                {
                    if (this.useCache && req.method === "GET" && req.needCache)
                    {
                        RequestCache.set(req.uri, res);
                    }
                }
            }else{
                this.notify("onFailure", res);
            }
            this.notify("onComplete", res);
        }
        this._isRequesting = false;
        if( typeof req.doneCb === 'function' )
        {
            try
            {
                req.doneCb(res);
            }
            catch (ex)
            {
                if( typeof NgLogException === 'function' )
                {
                    NgLogException(ex);
                }
            }
        }
    },
    /** @private */
    _requestTimeOut: function()
    {
        var req = this._requestStatus;
        if( req.timeOutTimerID && this._isRequesting )
        {
            req.timeOutTimerID = 0;
            var res = this._buildResponse();
            this.abort();
            this._isRequesting = false;
            if( req.retryCount > this.maxRetry )
            {
                this.notify("onTimeout", res);
                this.notify("onFailure", res);
                this.notify("onComplete", res);
            }
            else
            {
                // retry
                setTimeout( this._sendRequest.bind(this), req.retryInterval);
                req.retryCount += 1;
                req.retryInterval *= 2;
                return;
            }
            if( typeof req.doneCb === 'function' )
            {
                try
                {
                    req.doneCb(res);
                }
                catch (ex)
                {
                    if( typeof NgLogException === 'function' )
                    {
                        NgLogException(ex);
                    }
                }
            }
        }
    },
    /** @private */
    _buildResponse: function()
    {
        return new Response(this._xhr, this._requestStatus);
    }
},[Observable]);

exports.HTTPRequest = HTTPRequest;
