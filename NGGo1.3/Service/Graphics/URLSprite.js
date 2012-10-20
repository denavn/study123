////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Suleman Naeem, Amjad Aziz
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
/*
 * URLSprite - extend GL2.Sprite to be able to use URL instead of file path
 *
 */
var Class = require('../../../NGCore/Client/Core/Class').Class;
var Sprite = require('../../../NGCore/Client/GL2/Sprite').Sprite;
var toMD5 = require('../../../NGCore/Client/Core/toMD5').toMD5;
var DownloadFile = require('../../../NGCore/Client/Network/DownloadFile').DownloadFile;
var FileSystem = require('../../../NGCore/Client/Storage/FileSystem').FileSystem;
var Animation = require('../../../NGCore/Client/GL2/Animation').Animation;
var UI = require('../../../NGCore/Client/UI').UI;
// TODO: use Mixin of NGGo
var DebugSupport = {
    dp: function (msg)
    {
        console.log("[[" + DebugSupport.debugGetFuncName.call(this, arguments.callee.caller) + "()]] " + msg);
    },
    debugGetFuncName: function (func)
    {
        var i;
        if (func && func.caller)
        {
            func = func.caller;
        }
        if (!func)
        {
            return '(unknown)';
        }
        var func_string = func.toString();
        var func_name = func_string.substring(func_string.indexOf("function ") + 9, func_string.indexOf('('));
        if (func_name !== "")
        {
            return func_name;
        }
        for (i in this)
        {
            if (typeof this[i] === 'function' && this[i].toString() === func_string)
            {
                return this.classname + "." + i;
            }
        }
        if (func_string.length > 64)
        {
            return '(anonymous [' + func_string.substring(0, 64).replace(/[\n\r]/g, '\\n').replace(/\t+/g, ' ') + '...' + '])';
        }
        else
        {
            return '(anonymous [' + func_string.replace(/[\n\r]/g, "\\n").replace(/\t+/g, ' ') + '])';
        }
    },
    debugDumpCallStack: function ()
    {
        var i;
        var cs = "==== CALLSTACK ====\n";
        var callstack = DebugSupport.debugGetCallStack.call(this);
        if (callstack)
        {
            callstack.shift(); // remove me
            for (i = 0; i < callstack.length; i++)
            {
                cs += (callstack.length - i) + ": " + callstack[i] + "\n";
            }
        }
        console.log(cs);
    },
    debugGetCallStack: function ()
    {
        var callstack = [];
        var func = arguments.callee.caller;
        if (func && func.caller)
        {
            func = func.caller;
        }
        while (func)
        {
            callstack.push(DebugSupport.debugGetFuncName.call(this, func));
            func = func.caller;
        }
        return callstack;
    }
};
var URLSpriteManager = Class.singleton(
/** @lends Class.prototype*/
{
    classname: 'URLSpriteManager',
    _cacheFileSuffix: "-urlsprite.json",
    _periodForRemoveFile: 5000,
    initialize: function ()
    {
        this.cacheStore = {};
        this.requestStore = {};
        this.removeQueue = {};
    },
    _getCacheListPath: function (directory)
    {
        return directory + this._cacheFileSuffix;
    },
    _extractExstension: function (url)
    {
        var qpos = url.indexOf("?");
        if (qpos > -1)
        {
            url = url.slice(0, qpos);
        }
        var filepos = url.lastIndexOf("/");
        if (filepos > -1)
        {
            url = url.slice(filepos + 1);
        }
        var dotpos = url.lastIndexOf(".");
        if (dotpos === -1)
        {
            return "";
        }
        var extension = url.slice(dotpos).toLowerCase();
        if (extension === ".jpeg")
        {
            extension = ".jpg";
        }
        return extension;
    },
    /**
     * options.cache:          {Boolean}   save to cache or not
     * options.directory:      {String}    directory path for cached files
     * options.localcachetime: {Integer}   expire time
     * options.cachesize:      {Integer}   max num of cached files
     * options.addpath:        {String}    addtional path for directory
     * options.forceResize:    {Boolean}   resize forcely or not
     * options.size:           {Core.Size} size of the image to display
     */
    getImagePath: function (url, options, cb, client)
    {
        var name = toMD5(url) + this._extractExstension(url);
        var args = {
            url: url,
            options: options,
            clientInfo: [
            {
                cb: cb,
                client: client}],
            name: name,
            filePath: options.directory + "/" + options.addpath + (options.forceResize ? "original_" : "") + name
        };
        this.dp(args.filePath + ", " + url);
        if (!this.cacheStore[options.directory])
        {
            this.dp("Cache empty. Read file");
            var file = this._getCacheListPath(options.directory);
            FileSystem.readFile(file, false, this._finishReadCacheFileCb.bind(this, args));
        }
        else
        {
            this.dp("Cache not empty. No need to read file (" + this.cacheStore[options.directory].length.toString() + " items)");
            this._searchCache(args);
        }
    },
    _finishReadCacheFileCb: function (args, error, value)
    {
        var options = args.options;
        if (error)
        {
            this.dp("ERROR: " + error);
            this.cacheStore[options.directory] = [];
        }
        else
        {
            if (value.length > 0)
            {
                if (!this.cacheStore[options.directory] || this.cacheStore[options.directory].length === 0)
                {
                    this.dp("load done");
                    this.cacheStore[options.directory] = JSON.parse(value);
                }
                else
                {
                    this.dp("already loaded");
                }
            }
            else
            {
                this.cacheStore[options.directory] = [];
            }
        }
        this._searchCache(args);
    },
    _getCacheIndexByName: function (directory, name)
    {
        var i;
        var cache = this.cacheStore[directory];
        for (i = 0; i < cache.length; i++)
        {
            if (cache[i].name === name)
            {
                // found
                return i;
            }
        }
        return -1;
    },
    _getCacheIndexByUrl: function (directory, url)
    {
        var i;
        var cache = this.cacheStore[directory];
        for (i = 0; i < cache.length; i++)
        {
            if (cache[i].url === url)
            {
                // found
                return i;
            }
        }
        return -1;
    },
    _searchCache: function (args)
    {
        var options = args.options;
        var cache = this.cacheStore[options.directory];
        var cacheIndex = this._getCacheIndexByName(options.directory, args.name);
        if (cacheIndex >= 0)
        {
            // found
            var now = new Date();
            var expiredTime = cache[cacheIndex].epoch + options.localcachetime * 1000;
            if (now.getTime() < expiredTime)
            {
                // cache is valid, not expired
                this.dp("found [" + args.name + "] at index " + cacheIndex + " (" + (expiredTime - now.getTime()) + "ms remain), raise to top");
                this._raiseCache(args, cacheIndex);
                this._callFinishCallback(args, args.filePath);
                return;
            }
            this.dp("found [" + args.name + "] at index " + cacheIndex + ", but EXPIRED " + (now.getTime() - expiredTime) + "ms");
            cache.splice(cacheIndex, 1);
        }
        else
        {
            this.dp("not found [" + args.name + "]");
        }
        this._fetchImage(args);
    },
    _fetchImage: function (args)
    {
        var options = args.options;
        if (!this.requestStore[options.directory])
        {
            this.requestStore[options.directory] = {};
        }
        var requestStore = this.requestStore[options.directory];
        var request = requestStore[args.url];
        if (request)
        {
            this.dp("already requesting " + args.url + ", " + args.name);
            request.args.clientInfo = request.args.clientInfo.concat(args.clientInfo);
            return;
        }
        var headers = [];
        //  DownloadFile doesn't return correct status code...
        //	if (epoch) {
        //	    var time = new Date();
        //	    time.setTime(epoch);
        //	    headers.push("If-Modified-Since: " + time.toUTCString());
        //	    this.dp()("'If-Modified-Since' header: "+ headers[0]);
        //	}
        request = new DownloadFile();
        requestStore[args.url] = request;
        request.args = args;
        request.start(args.filePath, "GET", args.url, headers, this._finishFetchImage.bind(this, args));
        this.dp("Requested: GET " + args.url + ", path=[" + args.filePath + "]");
    },
    _finishFetchImage: function (args, statuscode, filesignature)
    {
        var options = args.options;
        var requestStore = this.requestStore[options.directory];
        this.dp("Status " + statuscode + ": " + args.url + " [" + args.filePath + "]");
        delete requestStore[args.url];
        var that = this;
        var _callbackAndUpdateCache = function ()
            {
                that.dp("callback: args = " + args.url + " [" + args.filePath + "]");
                that._callFinishCallback(args, args.filePath);
                if (options.cache)
                {
                    var cache = that.cacheStore[options.directory];
                    var cacheIndex = that._getCacheIndexByName(options.directory, args.name);
                    if (cacheIndex >= 0)
                    {
                        // already cached while downloading
                        that._raiseCache(args, cacheIndex);
                    }
                    else
                    {
                        that._updateCache(args);
                    }
                }
            };
        if (~~ (statuscode) === 200)
        {
            if (options.forceResize)
            {
                var _getPoweredBy2Size = function (originalSize)
                    {
                        var imageSize = 2;
                        while (true)
                        {
                            if (originalSize < 2)
                            {
                                return (imageSize > 1024) ? 1024 : imageSize;
                            }
                            originalSize /= 2;
                            imageSize *= 2;
                        }
                    };
                var w = _getPoweredBy2Size(options.size[0]);
                var h = _getPoweredBy2Size(options.size[1]);
                var size = (w > h) ? w : h;
                var tmpFilePath = args.filePath;
                var _finishCompositeCb = function (event)
                    {
                        this.dp("resize done.");
                        FileSystem.deleteFile(tmpFilePath);
                        _callbackAndUpdateCache();
                    };
                args.filePath = options.directory + "/" + options.addpath + args.name;
                this.dp("Resize " + tmpFilePath + " to " + size + "x" + size + " " + args.filePath);
                UI.compositeImages(size, size, tmpFilePath, [
                {
                    image: args.filePath,
                    fit: UI.FitMode.Stretch}], _finishCompositeCb);
            }
            else
            {
                _callbackAndUpdateCache();
            }
        }
        else if (~~ (statuscode) === 304 & options.cache)
        {
            _callbackAndUpdateCache();
        }
        else
        {
            this.dp("FAILD.");
            this._callFinishCallback(args, null);
        }
    },
    _callFinishCallback: function (args, path)
    {
        var i;
        for (i = 0; i < args.clientInfo.length; i++)
        {
            var cb = args.clientInfo[i].cb;
            this.dp("call [" + i + "] " + this.debugGetFuncName(cb) + ": " + path);
            cb(path);
        }
    },
    _updateCache: function (args)
    {
        var options = args.options;
        var cache = this.cacheStore[options.directory];
        this.dp("cache=" + JSON.stringify(cache));
        this._cancelScheduledRemoveCache(options.directory, args.name);
        var now = new Date();
        cache.unshift(
        {
            name: args.name,
            epoch: now.getTime()
        });
        if (cache.length > options.cachesize)
        {
            var removed_cache = cache.splice(options.cachesize);
            this.dp("Cache full. Reduce to " + options.cachesize + " items, removed " + JSON.stringify(removed_cache[0]));
            this._scheduleRemoveCache(options.directory, removed_cache[0]);
        }
        this._writeCacheFile(args);
    },
    _raiseCache: function (args, index)
    {
        var options = args.options;
        var cache = this.cacheStore[options.directory];
        this._cancelScheduledRemoveCache(options.directory, args.name);
        this.dp("Raise to top: " + args.name);
        var now = new Date();
        cache.splice(index, 1);
        cache.unshift(
        {
            name: args.name,
            epoch: now.getTime()
        });
        this._writeCacheFile(args);
    },
    _writeCacheFile: function (args)
    {
        var options = args.options;
        var cache = this.cacheStore[options.directory];
        var jsondata = JSON.stringify(cache);
        this.dp("Cache updated: " + jsondata);
        FileSystem.writeFile(options.directory + "-urlsprite.json", jsondata, false, this._finishWriteCacheFileCb.bind(this, args, cache));
    },
    _finishWriteCacheFileCb: function (args, cache, error)
    {
        this.dp("#### Finish Write Cache File ####" + (error ? " [ERROR] " + error : "") + "\n  " + args.url + ", [" + args.name + "]\n  cache=" + JSON.stringify(cache));
    },
    _scheduleRemoveCache: function (directory, removed_cache)
    {
        if (!this.removeQueue[directory])
        {
            this.removeQueue[directory] = [];
        }
        var removeQueue = this.removeQueue[directory];
        this.dp("Scheduled to remove after " + this._periodForRemoveFile + " msec: " + JSON.stringify(removed_cache));
        removeQueue.push(removed_cache.name);
        var that = this;
        setTimeout(function ()
        {
            var index = removeQueue.indexOf(removed_cache.name);
            if (index >= 0)
            {
                that.dp("Do remove: cache=" + JSON.stringify(removed_cache));
                removeQueue.splice(index, 1);
                FileSystem.deleteFile(directory + "/" + removed_cache.name);
            }
            else
            {
                that.dp("Not exist in remove queue: " + JSON.stringify(removed_cache));
            }
        }, this._periodForRemoveFile);
    },
    _cancelScheduledRemoveCache: function (directory, filename)
    {
        if (!this.removeQueue[directory])
        {
            return;
        }
        var removeQueue = this.removeQueue[directory];
        var index = removeQueue.indexOf(filename);
        if (index >= 0)
        {
            removeQueue.splice(index, 1);
            this.dp("Canceled to remove: " + filename);
        }
    },
    abort: function (url, directory, client)
    {
        var i;
        var requestStore = this.requestStore[directory];
        if (requestStore && requestStore[url])
        {
            var request = requestStore[url];
            for (i = 0; i < request.args.clientInfo.length; i++)
            {
                if (request.args.clientInfo[i].client === client)
                {
                    request.args.clientInfo.splice(i, 1);
                    if (request.args.clientInfo.length === 0)
                    {
                        this.dp("aborted [" + url + "] by " + client.valueOf());
                        request.abort();
                        delete requestStore[url];
                    }
                    else
                    {
                        this.dp("canceled [" + url + "] by " + client.valueOf());
                    }
                }
            }
        }
    },
    // TODO: use Mixin of NGGo
    _debug: false,
    dp: function (msg)
    {
        if (this._debug)
        {
            DebugSupport.dp.call(this, msg);
        }
    },
    debugGetFuncName: function (caller)
    {
        if (this._debug)
        {
            DebugSupport.debugGetFuncName.call(this, caller);
        }
    },
    debugDumpCallStack: function ()
    {
        if (this._debug)
        {
            DebugSupport.debugDumpCallStack.call(this);
        }
    },
    debugGetCallStack: function ()
    {
        if (this._debug)
        {
            DebugSupport.debugGetCallStack.call(this);
        }
    }
});
exports.URLSprite = Sprite.subclass( /** @lends Service.Graphics.URLSprite.prototype */
{
    "classname": 'URLSprite',
    /**
     * @class The <code>URLSprite</code> class inherits GL2.Sprite and add the image downloading function.
     * It also has caching mechanism to decrease network traffic load.
     **/
    "_default_options": {
        "cache": true,
        "directory": "urlsprite",
        "localcachetime": 3600,
        "cachesize": 100,
        "forceResize": false
    },
    /**
     * @constructs The default constructor.
     * @param {Object} option  Takes Object having following properties.    
     * options.cache:          {Boolean}   save to cache or not
     * options.directory:      {String}    directory path for cached files
     * options.localcachetime: {Integer}   expire time
     * options.cachesize:      {Integer}   max num of cached files
     * options.forceResize:    {Boolean}   resize forcely or not
     * options.size:           {Core.Size} size of the image to display
     *
     **/
    initialize: function (options)
    {
        var name;
        this.options = {};
        if (!options)
        {
            options = {};
        }
        for (name in this._default_options)
        {
            if (this._default_options.hasOwnProperty(name))
            {
                this.options[name] = options.hasOwnProperty(name) ? options[name] : this._default_options[name];
            }
        }
    },
    /**
     * Destroys resources and releases memory on backend.
     * @status Android, Flash ,iOS
     */
    destroy: function ($super)
    {
        this.abort();
        $super();
    },
    /**
     * Download a image and set it for this <code>Sprite</code>.
     * It has same interface as GL2.Sprite but it can use URL instead of local image path.
     * It can accept local image path and at that time, it's behaviour is totally same as GL2.Sprite's setImage method.
     * @param {String} image URL or the directory path to an image referenced by a frame.
     * @param {Core.Size} [size] The size of the image to display (in pixels).
     * @param {Core.Point} [anchor] The anchor coordinates that indicate the image center in the animation.
     * @param {Core.Rect} [uvs] The UV coordinates used to specify the subset of an image.
     * @param {Functon} Takes function as callback and calls when images loads.
     * @returns This function returns <code>this</code> to support method invocation chaining.
     **/
    setImage: function ($super, image, size, anchor, uvs, callback)
    {
        if (!image)
        {
            return this;
        }
        this.dp(image);
        if (image.slice(0, 7).toLowerCase() !== "http://" && image.slice(0, 8).toLowerCase() !== "https://")
        {
            this.dp("    call $super(" + image + ", " + JSON.stringify(size) + ", " + JSON.stringify(anchor) + ", " + JSON.stringify(uvs) + ")");
            var ret = $super(image, size, anchor, uvs);
            this._callFinishCallback(callback, false);
            return ret;
        }
        this.abort();
        var args = {
            cache: this.options.cache,
            directory: this.options.directory,
            localcachetime: this.options.localcachetime,
            cachesize: this.options.cachesize,
            size: size,
            addpath: "",
            forceResize: this.options.forceResize
        };
        if (!this.options.cache)
        {
            var time = new Date();
            args.addpath = "nocache/" + Math.floor(Math.random() * 100) + time.getTime();
        }
        var that = this;
        var _finishGetImagePathCb = function (path)
            {
                if (path)
                {
                    that.dp("##### _finishGetImagePathCb(): call $super(" + path + ", " + JSON.stringify(size) + ", " + JSON.stringify(anchor) + ", " + JSON.stringify(uvs) + ")");
                    $super(path, size, anchor, uvs);
                }
                else
                {
                    that.dp("##### _finishGetImagePathCb(): ERROR: Failed to set image " + image);
                }
                that._callFinishCallback(callback, (path ? false : true));
                that.requestingUrl = undefined;
            };
        this.requestingUrl = image;
        URLSpriteManager.getImagePath(image, args, _finishGetImagePathCb, this);
        return this;
    },
    /**
	 * Sets the animation to display in the urlsprite. The animation will start playing immediately,
	 * replacing any image or animation that was previously assigned to the sprite.
	 * Set animation will examine all frames in the passed animation and if it need to update then it will update the frame.
	 * It means if you are using remote images in your frames then those frames will be replaced with new frames having downloaded or cached images.
	 * @example
	 * var animation = new GL2.Animation();
	 * var localImage = "Content/enemy1.png";
	 * var remoteImage = "http://www.xyz.com/enemy2.png";
	 * animation.pushFrame(new Animation.Frame(localImage, 500, size, [0, 0]));
	 * animation.pushFrame(new Animation.Frame(remoteImage, 500, size, [0, 0]));
	 * var sprite = new URLSprite();
	 * sprite.setAnimation(animation);
	 * @param {GL2.Animation} animation The animation to display.
	 * @param {Number} [startTime=0] The time offset, in milliseconds, at which to start playing the
	 *		animation. For example, if an animation has ten frames, each of which is displayed for
	 *		50 milliseconds, and you specify the value `250`, playback will begin halfway through
	 *		the animation.
	 * @returns {this}
	 */
    setAnimation: function ($super, animation, startTime)
    {
        if(animation && animation instanceof Animation)
        {
            var frameRefreshed = function (err)
                {
                    if(!err)
                    {
                        $super(animation, startTime);
                    }
                    else
                    {
                        var errorMsg = this.classname + ".setAnimation(), could not fetch some images";
                        console.log(errorMsg);
                    }
                    return this;
                }
            this._refreshFrames(animation, 0, frameRefreshed);
        }
        else
        {
            var errorMsg = this.classname + ".setAnimation(animation , startTime); animation must be provided and should be instanceof GL2.Animation.";
            throw new Error(errorMsg);
        }
    },
    /**
     * Aborts the downloading of image.
     * @returns {Boolean} flag to tell either downloading is aborted or not. 
     **/
    abort: function ()
    {
        if (this.requestingUrl)
        {
            URLSpriteManager.abort(this.requestingUrl, this.options.directory, this);
            this.requestingUrl = undefined;
            return true;
        }
        return false;
    },
    /**
     *@private
     **/
    _callFinishCallback: function (callback, err)
    {
        this.dp("_callFinishCallback() --------");
        if (typeof callback === 'function')
        {
            try
            {
                callback(err);
            }
            catch (ex)
            {
                if (typeof NgLogException === 'function')
                {
                    NgLogException(ex);
                }
            }
        }
    },
    _refreshFrames: function (animation, index, callback)
    {
        var currentFrame = animation.getFrame(index);
        if(currentFrame)
        {
            var image = currentFrame.getImage();
            if(image.slice(0, 7).toLowerCase() !== "http://" && image.slice(0, 8).toLowerCase() !== "https://")
            {
                this._refreshFrames(animation, ++index, callback); // no need to update frmae. :)
                return;
            }
            this.abort();
            var args = {
                cache: this.options.cache,
                directory: this.options.directory,
                localcachetime: this.options.localcachetime,
                cachesize: this.options.cachesize,
                size: currentFrame.getSize(),
                addpath: "",
                forceResize: this.options.forceResize
            };
            if(!this.options.cache)
            {
                var time = new Date();
                args.addpath = "nocache/" + Math.floor(Math.random() * 100) + time.getTime();
            }
            var _finishGetImagePathCb = function (oldFrame, path)
                {
                    if(path)
                    {
                        /*
                         * Frame need to modify and no setters in GL2.Animation.Frame so creating new Frame and replacing with current Frame.
                         */
                        var frame = new Animation.Frame(path, oldFrame.getDuration(), oldFrame.getSize(), oldFrame.getAnchor(), oldFrame.getUVs());
                        animation.spliceFrames(index, 1, frame);
                        this._refreshFrames(animation, ++index, callback);
                    }
                    this.requestingUrl = undefined;
                }.bind(this, currentFrame);
            this.requestingUrl = image;
            URLSpriteManager.getImagePath(image, args, _finishGetImagePathCb, this);
        }
        else
        {
            if(callback && typeof callback === "function")
            {
                callback(null);
            }
        }
    },
    // TODO: use Mixin of NGGo
    _debug: false,
    /**
     *@private
     **/
    dp: function (msg)
    {
        if (this._debug)
        {
            DebugSupport.dp.call(this, msg);
        }
    },
    /**
     *@private
     **/
    debugGetFuncName: function (caller)
    {
        if (this._debug)
        {
            DebugSupport.debugGetFuncName.call(this, caller);
        }
    },
    /**
     *@private
     **/
    debugDumpCallStack: function ()
    {
        if (this._debug)
        {
            DebugSupport.debugDumpCallStack.call(this);
        }
    },
    /**
     *@private
     **/
    debugGetCallStack: function ()
    {
        if (this._debug)
        {
            DebugSupport.debugGetCallStack.call(this);
        }
    }
});