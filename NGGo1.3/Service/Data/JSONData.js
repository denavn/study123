////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Mizumo Takaaki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Require Block
var Class       = require('../../../NGCore/Client/Core/Class').Class;
var FileSystem  = require('../../../NGCore/Client/Storage/FileSystem').FileSystem;
var NGGOError   = require('../../Foundation/NGGOError').NGGOError;
var HTTPRequest = require('../Network/HTTPRequest').HTTPRequest;

////////////////////////////////////////////////////////////////////////////////
exports.JSONData = Class.subclass(
/** @lends Service.Data.JSONData.prototype */
{
    classname: 'JSONData',
    /**
     * Error codes of <a href="Service.Data.JSONData.html"><code>JSONData</code></a>
     * @namespace ERROR
     */
    ERROR:
    {
        /** */
        NoError               :  0,
        /** */
        UnknownError          : -1,
        /** */
        Aborted               : -2,
        /** */
        NetworkError          :  1,
        /** */
        DataNotFound          :  2,
        /** */
        DataLoadError         :  3,
        /** */
        DataParseError        :  4
    },
    /**
     * @class JavaScript object wrapper class which can build from JSON data on remote, local, string JSON data and JavaScript object itself.
     * @constructor
     * @augments Core.Class
     * @name Service.Data.JSONData
     */
    initialize: function()
    {
        this._json      = {};
        this._error     = this.ERROR.NoError;
        this._errorText = "";
        this._isRemote  = false;
        this._req       = undefined;
        this._callback  = undefined;
    },
    /**
     * Aborts downloading JSON data from network. It works only when remote JSON data is specified.
     * @returns {Boolean} Aborted or not. If JSON data is not come from remote or all the data has already downloaded, it returns false.
     */
    abort: function()
    {
        if( this._isRemote && this._req )
        {
            this._req.onreadystatechange = undefined;
            this._req.abort();
            this._req = undefined;
            this._json = {};
            this._error = this.ERROR.Aborted;
            this._errorText = "JSON loading aborted";
            this. _callInitializeCallback( this._callback );
            return true;
        }
        return false;
    },
    /**
     * Loads JSON data to the object.
     * @param {String|Object} object Remote url( string or URI object ) or local file path of JSON data. It can also accespt JSON data text itself and JavaScript object.
     * @param {Function} [callback] callback function which called when the data load finished.
     */
    load: function(object, callback)
    {
        if( this._isPathRemote(object))
        {
            this._readRemoteJSONFile(object, callback);
        }
        else
        {
            if( typeof object === 'object' )
            {
                this._json = object;
                this._callInitializeCallback(callback);
            }
            else if( typeof object === 'string' )
            {
                // Trim of any white space just in case...
                object = object.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1");
                if(object[0] === '{')
                {
                    // We have json data just handle the data directly
                    try
                    {
                        this._json = JSON.parse(object);
                    }
                    catch (ex)
                    {
                        this._json = {};
                        this._error     = this.ERROR.DataParseError;
                        this._errorText = "JSON parse error";
                    }
                    this._callInitializeCallback(callback);
                }
                else
                {
                    // it is a file path so try and read it as such...
                    this._readLocalJSONFile(object, callback);
                }
            }
        }
    },
    // Accessor functions
    /**
     * @property {Object} data JSON data in the object.
     */
    get data()
    {
        return this._json;
    },
    set data(value)
    {
        this._json = value;
    },
    /**
     * @property {Boolean} isRemote It describe the data is come from remote URI. This property is read only.
     */
    get isRemote()
    {
        return this._isRemote;
    },
    set isRemote(value)
    {
        if( typeof NgLogW === 'function' )
        {
            NgLogW("JSONData: isRemote is read only property.");
        }
    },
    /** @private */
    _isPathRemote: function(path)
    {
        if( typeof path === 'object' && path.classname === 'URI' ){
            return true;
        }
        else if( typeof path === 'string' )
        {
            if( path.slice(0,7).toLowerCase() === "http://" ||
                path.slice(0,8).toLowerCase() === "https://" )
            {
                return true;
            }
        }
        return false;
    },
    /** @private */
    _readRemoteJSONFile: function(url, callback)
    {
        var req = new HTTPRequest();
        var that = this;
        req.addObserver(
            {
                onSuccess: function(res)
                {
                    that._onLoadJSONFile(url, callback, false, res.responseText);
                },
                onFailure: function(res)
                {
                    if( res.statusCode === 404 )
                    {
                        that._error = that.ERROR.DataNotFound;
                        that._errorText = "JSONFile file accsess: 404 File not found";
                        that._onLoadJSONFile(url, callback, true, "");
                    }
                    else
                    {
                        that._error = that.ERROR.NetworkError;
                        that._errorText = "JSONFile file accsess: status code: "+req.status;
                        that._onLoadJSONFile(url, callback, true ,"");
                    }
                }
            }
        );
        req.get(url);
        this._req = req;
        this._isRemote = true;
        this._callback = callback;
    },
    /** @private */
    _readLocalJSONFile: function(path, callback)
    {
        FileSystem.readFile( path, false, this._onLoadJSONFile.bind(this, path, callback));
    },
    /** @private */
    _onLoadJSONFile: function( path, callback, err, data )
    {
        this._req = null;
        this._callback = undefined;
        if( err )
        {
            if(this._error === this.ERROR.NoError && typeof err === 'string' )
            {
                this._error = this.ERROR.DataNotFound;
                this._errorText = err;
            }
        }
        else
        {
            try
            {
                this._json = JSON.parse(data);
            }
            catch (ex)
            {
                this._json = {};
                this._error     = this.ERROR.DataParseError;
                this._errorText = "JSON parse error";
            }
        }
        this._callInitializeCallback(callback);
    },
    /** @private */
    _callInitializeCallback: function( callback )
    {
        if( typeof callback === 'function' )
        {
            try
            {
                callback( this._buildErrorObject(), this );
            }
            catch (ex)
            {
                if( typeof NgLogException === 'function' )
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
    _buildErrorObject: function(){
        if( this._error === this.ERROR.NoError ){
            return undefined;
        }
        var e = new NGGOError(this._error,this._errorText);
        return e;
    }
});
