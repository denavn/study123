////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Mizuno Takaaki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// Require Block
var Class            = require('../../../NGCore/Client/Core/Class').Class;
var FileSystem       = require('../../../NGCore/Client/Storage/FileSystem').FileSystem;
var toMD5            = require('../../../NGCore/Client/Core/toMD5').toMD5;
var DownloadManifest = require('../../../NGCore/Client/Network/DownloadManifest').DownloadManifest;
var Capabilities     = require('../../../NGCore/Client/Core/Capabilities').Capabilities;
var NGGOError        = require('../../Foundation/NGGOError').NGGOError;
var JSONData         = require('../Data/JSONData').JSONData;

var ERROR = {
    NoError               :  0,
    UnknownError          : -1,
    Aborted               : -2,
    NetworkError          :  1,
    ListNotFound          :  2,
    ListLoadError         :  3,
    ListParseError        :  4,
    ManifestDownloadError :  5,
    FileDownloadError     :  6,
    FileDeleteError       :  7,
    CacheFileSaveError    :  8,
    SDCardFullError       :  9
};

var STATUS = {
    Initialized          :  0,
    CacheLoading         :  1,
    ListDownloading      :  2,
    ManifestDownloading  :  3,
    FileDeleting         :  4,
    FileUpdating         :  5,
    Finished             :  6,
    Aborted              :  7
};

/** @private */
var Queue = Class.singleton(
{
    classname: "Queue",
    initialized: function(){
        this.clear();
    },
    set: function( jsonPath, progressCb, doneCb, options ){
        this._queue.push([jsonPath, progressCb, doneCb, options]);
    },
    clear: function(){
        this._queue = [];
    },
    get: function(){
        if( this._queue.length > 0 ){
            var res = this._queue.shift();
            return res;
        }
        return undefined;
    },
    hasProcess: function(){
        return !!this._queue.length;
    }
});

/** @private */
var Manifest = Class.subclass(
{
    classname: 'Manifest',
    initialize: function( object )
    {
        if( !object || typeof object !== 'object' )
        {
            object = {
                remoteUrl: "",
                localPath: "",
                manifestName: "",
                version: "",
                key: "",
                downloaded: false
            };
        }
        if( !object.remoteUrl )
        {
            object.remoteUrl = Capabilities.getContentUrl();
        }
        this.remoteUrl    = this._ensureTrailingSlashes(object.remoteUrl);
        this.localPath    = this._ensureTrailingSlashes(object.localPath);
        this.version      = object.version;
        this.manifestName = object.manifestName;
        this.downloaded   = object.downloaded || false;
        this.deleted      = false;
        if( this.downloaded && !this.version)
        {
            this.version = "NOVERSION";
        }
        this._setKey();
        this._downloadm   = null;
    },
    toHash: function()
    {
        return {
                remoteUrl: this.remoteUrl,
                localPath: this.localPath,
                manifestName: this.manifestName,
                version: this.version,
                key: this.key,
                downloaded: this.downloaded
        };
    },
    abort: function()
    {
        if( this._downloadm )
        {
            this._downloadm.abort();
        }
    },
    _ensureTrailingSlashes: function(path)
    {
        if( typeof path === 'string' ){
            return (path.match(/.*\/$/) || (!path)) ? path : path + '/';
        }else{
            return "";
        }
    },
    _setKey: function()
    {
        this.key = toMD5(this.remoteUrl+":"+this.localPath+":"+this.manifestName);
    },
    downloadFiles: function(progressCb, doneCb)
    {
        this._downloadm = new DownloadManifest();
        this._downloadm.start(this.remoteUrl, this.localPath, this.manifestName, progressCb, doneCb );
    },
    deleteFiles: function(doneCb)
    {
        var args = {
            doneCb       : doneCb,
            deletedCount : 0,
            errorCount   : 0,
            list         : []
        };
        this._abort = false;
        FileSystem.readFile ( this.localPath+this.manifestName,
                              this._onReadManifestForDelete.bind(this,args) );
    },
    _onReadManifestForDelete: function(args, err, data)
    {
        var i,j;
        if( err )
        {
            if( typeof args.doneCb === 'function' )
            {
                try
                {
                    args.doneCb(args.deletedCount, args.errorCount, args.list );
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
        var json;
        try
        {
            json = JSON.parse(data);
        } catch (ex2) {
            json = {};
        }
        args.count = 0;
        var list = [];
        for (i in json){
            if( json.hasOwnProperty(i))
            {
                list.push( this.localPath + i );
                args.count++;
            }
        }
        args.list = list;
        args.errorCount = 0;
        args.deletedCount = 0;
        for(j=0; j<args.count; j++ )
        {
            FileSystem.deleteFile(list[j], this._onDeleteFile.bind(this,args,list[j] ));
        }
    },
    _onDeleteFile: function(args, name, err)
    {
        if( err )
        {
            args.errorCount++;
        }
        args.deletedCount++;
        if( args.deletedCount >= args.count )
        {
            FileSystem.deleteFile(this.localPath+this.manifestName, this._onDeleteManifest.bind(this,args));
        }
    },
    _onDeleteManifest: function(args, error)
    {
        if( error )
        {
            args.errorCount++;
        }
        args.deletedCount++;
        if( args.errorCount === 0 )
        {
            this.deleted = true;
        }
        if( typeof args.doneCb === 'function' )
        {
            try
            {
                args.doneCb(args.deletedCount, args.errorCount, args.list );
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
});

/** @private */
var ManifestArray = Class.subclass(
{
    classname: "ManifestArray",
    initialize: function( array )
    {
        this._array = [];
        if( typeof array === "object" && array.length > 0 )
        {
            this._array = array;
        }
    },
    get: function(i){
        if( this._array.length > i ){
            return new Manifest(this._array[i]);
        }
        return undefined;
    },
    get length()
    {
        if( typeof this._array === 'object' && this._array.length > 0 )
        {
            return this._array.length;
        }
        else
        {
            return 0;
        }
    },
    set length(value){
        console.log("ManifestArray: length is a read only property.");
    }
});

/** @private */
var ManifestList = JSONData.subclass(
{
    classname: "ManifestList",
    get downloadNow()
    {
        if( !this.data )
        {
            return new ManifestArray();
        }
        if( typeof this.data['download-now'] === 'object' &&
            this.data['download-now'].length > 0 ){
            return new ManifestArray(this.data['download-now']);
        }
        return new ManifestArray();
    },
    set downloadNow(value){
        console.log("Manifest: downloadNow is a read only property.");
    },
    get downloadLater()
    {
        if( !this.data )
        {
            return new ManifestArray();
        }
        if( typeof this.data['download-later'] === 'object' &&
            this.data['download-later'].length > 0)
        {
            return new ManifestArray(this.data['download-later']);
        }
        return new ManifestArray();
    },
    set downloadLater(value)
    {
        console.log("Manifest: downloadLater is a read only property.");
    },
    get deleteList()
    {
        if( !this.data )
        {
            return new ManifestArray();
        }
        if( typeof this.data['delete'] === 'object' &&
            this.data['delete'].length > 0 )
        {
            return new ManifestArray(this.data['delete']);
        }
        return new ManifestArray();
    },
    set deleteList(value)
    {
        console.log("Manifest: deleteList is a read only property.");
    }
});

/** @private */
var ManifestCache = JSONData.subclass(
{
    classname: "ManifestCache",
    setDefault: function()
    {
        this.data = [];
    },
    generateDownloadList: function(object)
    {
        if( !object || object.classname !== 'ManifestList' ){
            return [];
        }
        var downloadList = [];
        var now = object.downloadNow;
        var nowLen = now.length;
        var downloadKey = {};
        var i = 0;
        var j = 0;
        var manifest;
        if( nowLen )
        {
            for( i=0; i<nowLen; i++ )
            {
                manifest = now.get(i);
                j = this._searchManifestByKey(manifest.key);
                if( j>-1)
                {
                    var cached = this.data[j];
                    if( !cached || !cached.downloaded ||
                        cached.version !== manifest.version )
                    {
                            downloadList.push(manifest);
                            downloadKey[manifest.key] = 1;
                    }
                }
                else
                {
                    this.data.push(manifest.toHash());
                    downloadList.push(manifest);
                    downloadKey[manifest.key] = 1;
                }
            }
        }
        var later = object.downloadLater;
        var laterLen = later.length;
        if( laterLen )
        {
            for( i=0; i<laterLen; i++ )
            {
                manifest = later.get(i);
                j = this._searchManifestByKey(manifest.key);
                if( j === -1)
                {
                    this.data.push(manifest.toHash());
                }
            }
        }
        if( downloadList.length > 0 )
        {
            var length = this.data.length;
            for(i=0;i<length;i++)
            {
                if( this.data[i] ){
                    manifest = new Manifest(this.data[i]);
                    if( manifest.manifestName && !manifest.downloaded && !downloadKey[manifest.key] )
                    {
                        downloadList.push(manifest);
                        break;
                    }
                }
            }
        }
        return downloadList;
    },
    generateDeleteList: function(object)
    {
        var i;
        if( !object || object.classname !== 'ManifestList' )
        {
            return [];
        }
        var deleteList = [];
        var del = object.deleteList;
        var delLen = del.length;
        if( delLen )
        {
            for( i=0; i<delLen; i++ )
            {
                var manifest = del.get(i);
                var j = this._searchManifestByKey(manifest.key);
                if( j !== -1)
                {
                    deleteList.push(manifest);
                }
            }
        }
        return deleteList;
    },
    updateCache: function(downloaded, deleted, path, cb)
    {
        var dwlen = downloaded.length;
        var i;
        var manifest;
        var j;
        for(i=0; i<dwlen; i++ )
        {
            manifest = new Manifest(downloaded[i]);
            j = this._searchManifestByKey(manifest.key);
            if( j === -1 )
            {
                var obj = manifest.toHash();
                this.data.push(obj);
            }else{
                this.data[j].downloaded = manifest.downloaded;
                this.data[j].version    = manifest.version;
            }
        }
        var dllen = deleted.length;
        for( i=0; i<dllen; i++ )
        {
            manifest = deleted[i];
            if( manifest.deleted )
            {
                j = this._searchManifestByKey(manifest.key);
                if( j !== -1 )
                {
                    this.data.splice(j,1);
                }
            }
        }
        FileSystem.writeFile( path, JSON.stringify(this.data),cb);
    },
    getCacheInfo: function( manifest ){
        var j = this._searchManifestByKey(manifest.key);
        if( j !== -1 )
        {
            return this.data[j];
        }
        return undefined;
    },
    _searchManifestByKey:function(key)
    {
        var i;
        if( typeof this.data !== 'object' || !this.data.length )
        {
            return -1;
        }
        var length = this.data.length;
        for(i=0;i<length;i++)
        {
            if(this.data[i]){
                var manifest = new Manifest(this.data[i]);
                if( manifest.key && manifest.key === key)
                {
                    return i;
                }
            }
        }
        return -1;
    }
});


exports.MultiManifestManager = Class.singleton(
/** @lends Service.Network.MultiManifestManager.prototype */
{
    classname: "MultiManifestManager",
    /**
     * Error codes of <a href="Service.Network.MultiManifestManager.html"><code>MultiManifestManager</code></a>.
     * @namespace
     */
    ERROR: {
        /** It works fine and no error */
        NoError               :  0,
        /** Something wrong but unknown */
        UnknownError          : -1,
        /** Operetion aborted */
        Aborted               : -2,
        /** Network error occured and cannot get the data */
        NetworkError          :  1,
        /** List didn't find and 404 error has occur */
        ListNotFound          :  2,
        /** Something trouble when loading a list */
        ListLoadError         :  3,
        /** List JSON is invalid */
        ListParseError        :  4,
        /** Some error had occur in Network.DownloadManifest */
        ManifestDownloadError :  5,
        /** Something trouble when downloading file */
        FileDownloadError     :  6,
        /** Something trouble when deleting file */
        FileDeleteError       :  7,
        /** Something trouble when saving cache file */
        CacheFileSaveError    :  8,
        /** SD Card is full */
        SDCardFullError       :  9
    },

    /**
     * Status codes of <a href="Service.Network.MultiManifestManager.html"><code>MultiManifestManager</code></a>.
     * @namespace
     */
    STATUS: {
        /** Module initialized but download process is not started yet. */
        Initialized          :  0,
        /** Loading cache from local JSON file */
        CacheLoading         :  1,
        /** Downloading manifest list */
        ListDownloading      :  2,
        /** Downloading manifest and asset files */
        ManifestDownloading  :  3,
        /** Deleting files */
        FileDeleting         :  4,
        /** Updating cache file */
        FileUpdating         :  5,
        /** Process finished */
        Finished             :  6,
        /** Process aborted */
        Aborted              :  7
    },

    /**
     * @class Singleton object which manage download histroy of multi manifest files.
     * @name Service.Network.MultiManifestManager
     * @augments Core.Class
     * @property {Service.Network.MultiManifestManager#STATUS} Status (readonly) Status code.
     * @constructs
     */
    initialize: function()
    {
        this.options = {
            cachefile: "DownloadManifestFile_Cache.json",
            maxAditionalDownloadFile: 1
        };
        Queue.clear();
        this.reset();
    },
    /**
     * Reset connection
     */
    reset: function(){
        this._status              = this.STATUS.Initialized;
        this._error               = this.ERROR.NoError;
        this._errorText           = "";
        this._jsonPath            = "";
        this._manifestListCache   = null;
        this._downloadList        = null;
        this._deleteList          = null;
        this._manifestlistObject  = null;
        this._manifestObject      = null;
        this._forceAbort          = false;
    },
    /**
     * Start to load manifest files.
     *
     * @param {String|Object} json Path for the manifest list. JSON object/File path/URL available.
     * @param {Function} [progressCb] Callback function which is called each asset file has been downloaded.
     * @param {Function} [doneCb] Callback function which is called the process have done.
     * @param {Object} [options] Object include option parameters
     * @param {String} [options.cachefile] Name of the cache file used for filename.
     * @param {Number} [options.maxAditionalDownloadFile] How many "later" manifest should be downloaded with the manifest which is needed immidietly.
     */
    start: function(json, progressCb, doneCb, options)
    {
        if( this._status !== this.STATUS.Initialized &&
            this._status !== this.STATUS.Finished &&
            this._status !== this.STATUS.Abort ){
            Queue.set( json, progressCb, doneCb, options );

            return;
        }
        this._start(json, progressCb, doneCb, options);
    },
    /**
     * Abort current loading process
     */
    abort: function()
    {
        switch(this._status){
        case this.STATUS.CacheLoading:
            this._forceAbort = true;
            break;
        case this.STATUS.ListDownloading:
            this._manifestlistObject.abort();
            this._forceAbort = true;
            break;
        case this.STATUS.ManifestDownloading:
            this._forceAbort = true;
            this._manifestObject.abort();
            this._onAbort(this._downloadArgs);
            break;
        case this.STATUS.FileDeleting:
            this._forceAbort = true;
            break;
        case this.STATUS.Initialized:
        case this.STATUS.Finished:
        case this.STATUS.Aborted:
            break;
        default:
            break;
        }
    },
    /**
     * Get paticular manifest file's version
     * @param {String} remoteUrl URI of the manifest file
     * @param {String} localPath Local path of downloaded manifest file
     * @param {String} manifestName File name of manifest file
     * @param {Function} [doneCb] Callback function which was invoked when the check finished
     * @param {Object} [options] Object includes option parameters.
     */
    getManifestStatus: function( remoteUrl, localPath, manifestName, doneCb, options )
    {
        var name;
        var merged_options = {};
        for( name in this.options )
        {
            if( this.options.hasOwnProperty(name))
            {
                merged_options[name] = ( options && options.hasOwnProperty(name)) ?
                    options[name] : this.options[name];
            }
        }
        this.reset();
        var args = {
            "remoteUrl"    : remoteUrl,
            "localPath"    : localPath,
            "manifestName" : manifestName,
            "doneCb"       : doneCb,
            "options"      : merged_options
        };
        var manifestcache = new ManifestCache();
        manifestcache.load( merged_options.cachefile,
                            this._onLoadCacheFileGetStatus.bind(this, args) );
    },
    get status()
    {
        return this._status;
    },
    set status(value){
        console.log("Network.MultiManifestManager: status property is readonly !");
    },

    /** @private */
    _start: function( jsonPath, progressCb, doneCb, options )
    {
        var name;
        var merged_options = {};
        for( name in this.options )
        {
            if( this.options.hasOwnProperty(name))
            {
                merged_options[name] = ( options && options.hasOwnProperty(name)) ?
                    options[name] : this.options[name];
            }
        }
        this.reset();
        this._jsonPath = jsonPath;
        var args = {
            "progressCb" : progressCb,
            "doneCb"     : doneCb,
            "options"    : merged_options
        };
        this._status = this.STATUS.CacheLoading;
        var manifestcache = new ManifestCache();
        manifestcache.load(merged_options.cachefile,
                           this._onLoadCacheFile.bind(this, args) );
    },
    /** @private */
    _onLoadCacheFileGetStatus: function( args, error, cache )
    {
        if( error )
        {
            cache.setDefault();
        }
        this._manifestListCache = cache;
        var manifest = new Manifest(
            {
                remoteUrl: args.remoteUrl,
                localPath: args.localPath,
                manifestName: args.manifestName
            });
        var c = cache.getCacheInfo( manifest );
        if( typeof c !== 'object' )
        {
            c = {
                downloaded: false,
                version: undefined
            };
        }
        if( typeof args.doneCb === 'function' )
        {
            try
            {
                args.doneCb( !!c.downloaded, c.version );
            }
            catch (ex)
            {
                console.log(new Error(ex));
            }
        }
    },
    /** @private */
    _onLoadCacheFile: function( args, error, cache )
    {
        if( error )
        {
            cache.setDefault();
        }
        this._manifestListCache = cache;
        if( this._forceAbort)
        {
            this._onAbort(args);
            return;
        }
        this._status = this.STATUS.ListDownloading;
        this._manifestlistObject = new ManifestList();
        this._manifestlistObject.load(this._jsonPath, this._onLoadManifestList.bind(this, args ));
    },
    /** @private */
    _onLoadManifestList: function( args, error, list )
    {
        if( this._forceAbort )
        {
            this._onAbort(args);
        }
        else if( error )
        {
            this._error = error.errorCode;
            this._errorText = error.errorText;
            this._finishWithFailure(args);
            return;
        }
        this._downloadList = this._manifestListCache.generateDownloadList(list);
        this._deleteList = this._manifestListCache.generateDeleteList(list);

        if( this._downloadList.length === 0 && this._deleteList.length === 0 )
        {
            this._finishWithSuccess(args, 0, 0);
            return;
        }
        if( this._downloadList.length > 0 )
        {
            this._downloadManifests(args);
        }
        else if( this._deleteList.length > 0 )
        {
            this._deleteManifests(args);
        }
        else
        {
            this._finishWithSuccess(args,[],[]);
        }
    },
    /** @private */
    _downloadManifests: function(args)
    {
        this._status = this.STATUS.ManifestDownloading;
        var params = {
            currentTarget: 0,
            total: []
        };
        this._manifestObject = null;
        this._downloadManifestRec(args, params, null, null );
    },
    /** @private */
    _downloadManifestRec: function( args, params, err, manifest )
    {
        if( err )
        {
            if( typeof err === 'string' && err.indexOf("SD card is full") >= 0 )
            {
                this._error = this.ERROR.SDCardFullError;
            }
            else
            {
                this._error = this.ERROR.FileDownloadError;
            }
            this._errorText = err;
            this._manifestListCache.updateCache(this._downloadList, this._deleteList,
                                                args.options.cachefile,
                                                this._onFinishSaveManifestCache.bind(this, args));
            return;
        }
        if( manifest )
        {
            manifest = this._downloadList[params.currentTarget];
            manifest.downloaded = true;
            params.currentTarget++;
            if( typeof args.progressCb === 'function' )
            {
                try
                {
                    args.progressCb( params.currentTarget,
                                     this._downloadList.length+this._deleteList.length,
                                     params.total[params.currentTarget],
                                     params.total[params.currentTarget],
                                     manifest.manifestName);
                }
                catch (ex)
                {
                    console.log(new Error(ex));
                }
            }
        }
        if( this._downloadList.length <= params.currentTarget )
        {
            if( this._deleteList.length > 0 )
            {
                this._deleteManifests(args);
            }
            else
            {
                this._status = this.STATUS.FileUpdating;
                this._manifestListCache.updateCache(this._downloadList, this._deleteList,
                                                args.options.cachefile,
                                                this._onFinishSaveManifestCache.bind(this, args));
            }
            return;
        }
        var nextManifest =this._downloadList[params.currentTarget];
        this._manifestObject = nextManifest;
        this._downloadArgs = args;
        nextManifest.downloadFiles(
                        this._manifestProgressCb.bind(this,args,params),
                        this._downloadManifestRec.bind(this, args, params));
    },
    /** @private */
    _manifestProgressCb: function( args, params, cur, total )
    {
        params.total[params.currentTarget+1] = total;
        if( typeof args.progressCb === 'function' ){
            try
            {
                var manifest = this._downloadList[params.currentTarget];
                args.progressCb( params.currentTarget+1, this._downloadList.length+this._deleteList.length,
                                 cur, total, manifest.manifestName);
            }
            catch (ex)
            {
                console.log(new Error(ex));
            }
        }
    },
    /** @private */
    _deleteManifests: function(args)
    {
        this._status = this.STATUS.FileDeleteing;
        var params = {
            currentTarget: 0
        };
        this._deleteManifestRec(args, params);
    },
    /** @private */
    _deleteManifestRec: function( args, params, deletedCount, errorCount, list )
    {
        if( list )
        {
            var manifest = this._deleteList[params.currentTarget];
            manifest.deleted = true;
            params.currentTarget++;
            if( typeof args.progressCb === 'function' )
            {
                try
                {
                    args.progressCb( this._downloadList.length + params.currentTarget,
                                     this._downloadList.length+this._deleteList.length, manifest.manifestName);
                }
                catch (ex)
                {
                    console.log(new Error(ex));
                }
            }
        }
        if( this._deleteList.length <= params.currentTarget )
        {
            this._status = this.STATUS.FileUpdating;
            this._manifestListCache.updateCache(this._downloadList, this._deleteList,
                                                args.options.cachefile,
                                                this._onFinishSaveManifestCache.bind(this, args));
            return;
        }
        if( this._forceAbort )
        {
            this._status = this.STATUS.Aborted;
            this._manifestListCache.updateCache(this._downloadList, this._deleteList,
                                                args.options.cachefile,
                                                this._onFinishSaveManifestCache.bind(this, args));
            return;
        }
        var nextManifest = this._deleteList[params.currentTarget];
        this._manifestObject = nextManifest;
        this._downloadArgs = args;
        nextManifest.deleteFiles(this._deleteManifestRec.bind(this,args, params));
    },
    /** @private */
    _buildDownloadManifestArray: function()
    {
        var i;
        var ret = [];
        if( this._downloadList instanceof Array )
        {
            var len = this._downloadList.length;
            for( i=0; i<len; i++ )
            {
                if( this._downloadList[i].downloaded )
                {
                    ret.push(this._downloadList[i].manifestName);
                }
            }
        }
        return ret;
    },
    /** @private */
    _buildDeletedManifestArray: function()
    {
        var i;
        var ret = [];
        if( this._deleteList instanceof Array )
        {
            var len = this._deleteList.length;
            for( i=0; i<len; i++ )
            {
                if( this._deleteList[i].deleted )
                {
                    ret.push(this._deleteList[i].manifestName);
                }
            }
        }
        return ret;
    },
    /** @private */
    _onFinishSaveManifestCache: function(args, error)
    {
        if( this._status !== this.STATUS.Aborted )
        {
            this._status = this.STATUS.Finished;
        }
        if( error )
        {
            this._errorText = err;
            this._error = this.ERROR.CacheFileSaveError;
        }
        if( typeof args.doneCb === 'function' )
        {
            try
            {
                args.doneCb( this._buildErrorObject(), this._buildDownloadManifestArray(), this._buildDeletedManifestArray() );
            }
            catch (err)
            {
                console.log(err);
            }
        }

        if( Queue.hasProcess() )
        {
            this.start.apply(this, Queue.get());
        }
    },
    /** @private */
    _finishWithFailure: function( args )
    {
        if( this._status !== this.STATUS.Aborted )
        {
            this._status = this.STATUS.Finished;
        }
        if( typeof args.doneCb === "function" )
        {
            try
            {
                args.doneCb( this._buildErrorObject(), [], [] );
            }
            catch (err)
            {
                console.log(err);
            }
        }
        if( Queue.hasProcess() )
        {
            this.start.apply(this, Queue.get());
        }
    },
    /** @private */
    _finishWithSuccess: function( args, downloadedManifests, deletedManifests )
    {
        if( this._status !== this.STATUS.Aborted )
        {
            this._status = this.STATUS.Finished;
        }
        if( typeof downloadedManifests !== 'object' || !downloadedManifests.length )
        {
            downloadedManifests = [];
        }
        if( typeof deletedManifests !== 'object' || !deletedManifests.length )
        {
            deletedManifests = [];
        }
        if( typeof args.doneCb === "function" )
        {
            try
            {
                args.doneCb( undefined, downloadedManifests, deletedManifests );
            }
            catch (err)
            {
                console.log(err);
            }
        }
        if( Queue.hasProcess() )
        {
            this.start.apply(this, Queue.get());
        }
    },
    /** @private */
    _onAbort:function(args){
        this._error = this.ERROR.Aborted;
        this._errorText = "Download Aborted";
        if( this._status === this.STATUS.ManifestDownloading || this._status === this.STATUS.FileDeleting )
        {
            this._status = this.status.Aborted;
            this._manifestListCache.updateCache(
                this._downloadList, this._deleteList,
                this._downloadArgs.options.cachefile,
                this._onFinishSaveManifestCache.bind(this, this._downloadArgs));
        }
        else if( typeof args.doneCb === 'function' )
        {
            this._status = this.status.Aborted;
            try
            {
                args.doneCb( this._buildErrorObject(), [],[]);
            }
            catch (err)
            {
                console.log(err);
            }
            if( Queue.hasProcess() )
            {
                this.start.apply(this, Queue.get());
            }
        }
    },
    /** @private */
    _buildErrorObject: function(){

        if( this._error === this.ERROR.NoError ){
            return undefined;
        }
        var e = new NGGOError(this._error, this._errorText);
        return e;
    }
});
