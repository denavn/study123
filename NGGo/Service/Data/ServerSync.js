////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki & Tung Nguyen Vu Thanh
 *  Website     https://developer.mobage.com/
 *  Copyright   (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

var XHR          = require('../../../NGCore/Client/Network/XHR').XHR;
var FileSystem   = require('../../../NGCore/Client/Storage/FileSystem').FileSystem;
var Capabilities = require('../../../NGCore/Client/Core/Capabilities').Capabilities;
var Class        = require('../../Foundation/Class').Class;
var NGGOError    = require('../../Foundation/NGGOError').NGGOError;
var HTTPRequest  = require('../../Service/Network/HTTPRequest').HTTPRequest;
var Observable   = require('../../Foundation/Observable').Observable;



exports.ServerSync = Class.subclass(
/** @lends Service.Data.ServerSync */
{
    classname: "ServerSync",
    /**
     * Error code of <code>ServerSync</code> class.
     * @namespace ERROR
     */
    ERROR:
    {
        INVALID_TYPE: 1,
        INVALID_PATH: 2,
        FILE_READ_ERROR: 3,
        NETWORK_ERROR: 4,
        ASSET_NOT_FOUND: 5,
        NO_DATA_ERROR: 6,
        FILE_NOT_FOUND: 404,
        INTERNAL_ERROR: 11,
        PARSE_ERROR: 10
    },
    /**
     * @class <code>ServerSync</code> is a base class of ngGo manager classes.
     * This class can read data file from vearious source, and have server connection feature.
     * @borrows Foundation.Observable#addObserver
     * @borrows Foundation.Observable#deleteObserver
     * @borrows Foundation.Observable#deleteObservers
     * @borrows Foundation.Observable#countObservers
     * @borrows Foundation.Observable#notify
     * @constructs This is a constructor class.
     * @name Service.Data.ServerSync
     * @augments Foundation.Class
     */
    initialize : function() {
        this.__isRemote = false;
    },
    /**
     * Loads the configuration from JSON string or JSobject.
     * @param {String|Object} jsonData JSON string to be parsed
     * @param {Function} [callback] Callback function for when the load has completed.
     * @returns {Service.Data.ServerSync} Error code.
     */
    loadConfigFromData: function(jsonData, param, callback)
    {
        if (typeof param === "function")
        {
            callback = param;
            param = undefined;
        }
        var self = this;
        var result = this._parseJSON(jsonData, function(data) {
            return self.__onLoadData(data, param, callback);
        });
        if ((typeof result !== "boolean" || !result) && callback)
        {
            callback(result);
        }
        return result;
    },
    /**
     * Loads the configuration from a flat file or URI.
     * @param {String|Service.Network.URI} filename File name to load the JSON config data or URI.
     * @param {Function} [callback] Callback function for when the load has completed.
     */
    loadConfigFromFile: function(path, param, callback)
    {
        if (typeof param === "function")
        {
            callback = param;
            param = undefined;
        }
        var self = this;
        var afterRead = function(error, data)
        {
            if (callback && error)
            {
                callback(error);
                return;
            }
            var result = self._parseJSON(data, function(jsobj) {
                return self.__onLoadData(jsobj, param, callback);
            });
            if ((typeof result !== "boolean" || !result) && callback)
            {
                callback(result);
            }
        };
        if( typeof path === 'object' && path.classname === 'URI' )
        {
            this.__readRemoteFile(path, afterRead);
        }
        else if( typeof path === 'string' )
        {
            if( path.slice(0,7).toLowerCase() === "http://" ||
                path.slice(0,8).toLowerCase() === "https://" )
            {
                this.__isRemote = true;
                this.__readRemoteFile(path, afterRead);
            }
            else
            {
                this.__readLocalFile(path, afterRead);
                this._localConfigFile = path;
            }
        }
        else
        {
            if(callback)
            {
                callback(new NGGOError(this.ERROR.INVALID_PATH,
                    self.classname + ": `path` should be URI object or URI string."));
            }
        }
    },
    /**
     * Loads the configuration using the asset manager.
     * @param {String} assetKey
     * @param {Function} callback Callback function it is called when the loading is finished.
     */
    loadConfigFromAsset : function(assetKey, param, callback)
    {
        var AssetManager = require('./AssetManager').AssetManager;
        if (typeof param === "function")
        {
            callback = param;
            param = undefined;
        }
        var filepath = AssetManager.getAssetForKey(assetKey);
        if(filepath !== "")
        {
            this.loadConfigFromFile(filepath, callback);
        }
        else
        {
            return new NGGOError(this.error.ASSET_NOT_FOUND, self.classname + ": '" + assetKey + "' is not found.");
        }
    },
    /**
     * Setup development server handling for this module
     */
    setupDevelopment: function(development, callback)
    {
        if (development.server){
            this._developServerURL = development.server;
        }
        if (development.poll[this.classname] === true){
            /*
             * Assign local file path given in default.json.
             * If not explicitly given, it will depend on whether ngBuilder supports watching for this file or not.
             */
            if (development.localFilePath){
                if (this._localConfigFile){
                    // user folder + game folder + config file
                    var path = development.localFilePath + "/" + Capabilities.getGame() + "/" + this._localConfigFile;
                    this._startWatchLocalFile(path, callback);
                }
            }
            this.startPollingServer(callback);
        }
    },
    /**
     * Sets the server URL to poll for update requests.
     * @param {String} url URL that the camera manager will poll(nggo server).
     */
    setServerURL : function(url)
    {
        this._developServerURL = url;
    },
    /**
     * Sets the key for notification data update.
     * @param {String} url URL that the camera manager will poll(nggo server).
     */
    setNotifyKey : function(key)
    {
        this._developServerUpdateKey = key;
    },
    /**
     * Starts the Camera Manager polling the ngGo dev server.
     * <br><br>
     * If polling is working, automatically load latest preference data from ngGo server.
     */
    startPollingServer : function(callback)
    {
        this._pollServer = true;
        this._pollServerForChanges(callback);
    },

    /**
     * Stops the Camera Manager from polling the ngGo dev server.
     */
    stopPollingServer : function()
    {
        this._pollServer = false;
    },
    /**
     * Data source is remote or not;
     */
    get isRemote() {
        return this.__isRemote;
    },
    set isRemote(value) {
        throw new Error("isRemote property is readonly");
    },
    /** @private */
    _parseJSON: function(data, callback) {
        var returnvalue, json;
        switch(typeof data)
        {
        case "string":
            try
            {
                json = JSON.parse(data);
            }
            catch (ex1)
            {
                return new NGGOError(this.ERROR.PARSE_ERROR,
                    this.classname + ": Input data is invalid as JSON.");
            }
            try
            {
                returnvalue = callback(json);
            }
            catch (ex2)
            {
                console.log(data);
                returnvalue = new NGGOError(this.ERROR.PARSE_ERROR,
                                     this.classname + ": Input data is invalid as JSON.");
            }
            break;
        case "object":
            returnvalue = callback(data);
            break;
        default:
            returnvalue = new NGGOError(this.ERROR.INVALID_TYPE,
                                 this.classname + ": Input data should be Object or JSON string.");
            break;
        }
        return returnvalue;
    },
    /** @private */
    _startWatchLocalFile : function(file , callback)
    {
        var url;
        if(this.classname.slice(-7) === "Manager"){
            url = this._developServerURL + "/" + this.classname.slice(0, -7);
        } else {
            url = this._developServerURL + "/" + this.classname;
        }
        var req = new HTTPRequest();
        var self = this;
        req.addObserver({
            onSuccess: function(res)
            {
                callback(undefined, res.responseText);
            },
            onFailure: function(res)
            {
                if(res.statusCode === 404 )
                {
                    callback(new NGGOError(self.ERROR.FILE_NOT_FOUND,
                            self.classname + ": [404] File not found"));
                }
                else
                {
                    callback(new NGGOError(self.ERROR.NETWORK_ERROR,
                            self.classname + ": [" + req.status + "] Network Error"));
                }
            }
        });
        req.get(url + "/WatchLocalFile?file="+file);
    },
    /** @private */
    _pollServerForChanges : function(callback)
    {
        var url;
        if(this.classname.slice(-7) === "Manager")
        {
            url = this._developServerURL + "/" + this.classname.slice(0, -7);
        } else {
            url = this._developServerURL + "/" + this.classname;
        }

        if(this._pollServer)
        {
            var req = new HTTPRequest();
            var self = this;
            req.addObserver({
                onSuccess: function(res)
                {
                    var result = JSON.parse(res.responseText);
                    if (result.changed)
                    {
                        self.loadConfigFromFile(url, function(err) {
                            if (!err) {
                                console.log("Latest data is loaded");
                                self.notify(self._developServerUpdateKey, self);
                            } else {
                                switch(err.errorCode) {
                                case self.ERROR.PARSE_ERROR:
                                    err = new Error("JSON from server could not be parse." +
                                                    " Please check your data and try again");
                                    console.log(err);
                                    console.log(err.stack);
                                    throw err;
                                case self.ERROR.INVALID_TYPE:
                                    err = new Error("The server did not return any data.");
                                    console.log(err);
                                    console.log(err.stack);
                                    break;
                                }
                            }
                        });
                    }
                    setTimeout(function() {
                        self._pollServerForChanges(callback);
                    }, 1000);
                },
                onFailure: function(res)
                {
                    if(res.statusCode === 404 )
                    {
                        callback(new NGGOError(self.ERROR.FILE_NOT_FOUND,
                                 self.classname + ": [404] File not found"));
                    }
                    else
                    {
                        callback(new NGGOError(self.ERROR.NETWORK_ERROR,
                                 self.classname + ": [" + req.status + "] Network Error"));
                    }
                }
            });
            req.get(url + "/PollForChanges");
        }
    },
    /** @private
     * This method should be overriden.
     */
    __onLoadData: function(data, param) {
        throw new Error("__onLoadData should be overridden");
    },
    /** @private */
    __readLocalFile: function(filepath, callback) {
        var self = this;
        FileSystem.readFile(filepath, false, function(err, data)
        {
            if(err)
            {
                callback(new NGGOError(self.ERROR.FILE_READ_ERROR,
                            self.classname + ": File '" + filepath + "' not found."));
            }
            else
            {
                callback(undefined, data);
            }
        });
    },
    /** @private */
    __readRemoteFile: function(path, callback) {
        var req = new HTTPRequest();
        var self = this;
        req.addObserver(
            {
                onSuccess: function(res)
                {
                    callback(undefined, res.responseText);
                },
                onFailure: function(res)
                {
                    if(res.statusCode === 404 )
                    {
                        callback(new NGGOError(self.ERROR.FILE_NOT_FOUND,
                                               self.classname + ": [404] File not found"));
                    }
                    else
                    {
                        callback(new NGGOError(self.ERROR.NETWORK_ERROR,
                                               self.classname + ": [" + req.status + "] Network Error"));
                    }
                }
            }
        );
        req.get(path);
    }
}, [Observable]);

