////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Harris K
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

/*
 * URLSprite - extend GL2.Sprite to be able to use URL instead of file path
 *
 */
var Sprite = require('../../NGCore/Client/GL2/Sprite').Sprite;
var toMD5 = require('../../NGCore/Client/Core/toMD5').toMD5;
var DownloadFile = require('../../NGCore/Client/Network/DownloadFile').DownloadFile;
var FileSystem = require('../../NGCore/Client/Storage/FileSystem').FileSystem;
var UI = require('../../NGCore/Client/UI').UI;

var $_lock = {};
var $_queue = {};
/** @private
 * This ENTIRE CLASS is private.
 */
var URLSprite = Sprite.subclass( /** @lends GLUI.URLSprite.prototype */
{
    "classname": 'URLSprite',
    /**
     * @class The <code>URLSprite</code> class inherits GL2.Sprite and add the image downloading function.
     * (see <code><a href="GL2.Sprite.html">GL2.Sprite</a></code>).
     * It also has caching mechanism to decrease network trafic.
     **/
    "_default_options": {
        "cache": true,
        "directory": "urlsprite",
        "localcachetime": 3600,
        "cachesize": 100,
        "forceResize": true
    },
    /**
     * @ignore
     * @constructs The default constructor.
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
        this.tempfiles = {};

    },
    destroy: function ($super)
    {
        var file;
        for (file in this.tempfiles)
        {
            if (this.tempfiles.hasOwnProperty(file))
            {
                FileSystem.deleteFile(file);
            }
        }
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
     * @returns This function returns <code>this</code> to support method invocation chaining.
     **/
    setImage: function ($super, image, size, anchor, uvs)
    {
        if (!image)
        {
            return this;
        }
        if (image.slice(0, 7).toLowerCase() !== "http://" && image.slice(0, 8).toLowerCase() !== "https://")
        {
            return $super(image, size, anchor, uvs);
        }
        var url = image;
        var args = {
            _super: $super,
            url: url,
            name: toMD5(url) + this._extractExstension(url),
            size: size,
            anchor: anchor,
            uvs: uvs,
            addpath: "",
            forceResize: this.options.forceResize
        };

        if (!this.options.cache)
        {
            var time = new Date();
            args.addpath = "nocache/" + Math.floor(Math.random() * 100) + time.getTime();
        }
        if (!$_queue[this.options.directory])
        {
            $_queue[this.options.directory] = [];
        }
        if ($_lock[this.options.directory])
        {
            $_queue[this.options.directory].push(this._setImageInternal.bind(this, args));
        }
        else
        {
            $_lock[this.options.directory] = 1;
            this._setImageInternal(args);
        }
        return this;
    },
    $unlock: function (directory)
    {
        $_lock[directory] = 0;
        $_queue[directory] = [];
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
    _setImageInternal: function (args, cache)
    {
        if (this.options.cache)
        {
            if (cache)
            {
                this._checkCacheData(args, undefined, undefined, cache);
            }
            else
            {
                this._setImageWithCache(args);
            }
        }
        else
        {
            this._fetchImage(args, [], -1);
        }
    },
    _searchCache: function (cache, name)
    {
        var i;
        var length = cache.length;
        for (i = 0; i < length; i++)
        {
            if (cache[i].name === name)
            {
                return i;
            }
        }
        return -1;
    },
    _setImageWithCache: function (args)
    {
        FileSystem.readFile(
            this.options.directory + "-urlsprite.json", false, this._checkCacheData.bind(this, args));
    },
    _checkCacheData: function (args, error, value, obj)
    {
        var cache;
        if (obj)
        {
            cache = obj;
        }
        else if (!value || error)
        {
            cache = [];
        }
        else
        {
            cache = JSON.parse(value);
        }
        var i = this._searchCache(cache, args.name);
        if (i === -1)
        {
            this._fetchImage(args, cache, i);
        }
        else
        {
            var now = new Date();
            if (cache[i].epoch + this.options.localcachetime * 1000 < now.getTime())
            {
                this._fetchImage(args, cache, i, cache[i].epoch);
            }
            else
            {
                var cachedata = cache[i];
                cache.splice(i, 1);
                cache.unshift(cachedata);
                args._super(this.options.directory + "/" + args.name, args.size, args.anchor, args.uvs);
                this._updateCacheData(args, cache);
            }
        }
    },
    _updateCacheData: function (args, cache)
    {
        var i;
        var length = cache.length;
        if (length > this.options.cachesize)
        {
            for (i = this.options.cachesize; i < length; i++)
            {
                FileSystem.deleteFile(this.options.directory + "/" + cache[i].name);
            }
            cache = cache.slice(0, this.options.cachesize);
        }
        if ($_queue[this.options.directory].length > 0)
        {
            var next = $_queue[this.options.directory].shift();
            next(cache);
        }
        else
        {
            var jsondata = JSON.stringify(cache);
            FileSystem.writeFile(
            this.options.directory + "-urlsprite.json", jsondata, false, this._finishUpdateCacheData.bind(this, args));
        }
    },
    _finishUpdateCacheData: function (args, error, key)
    {
        if ($_queue[this.options.directory].length > 0)
        {
            var next = $_queue[this.options.directory].shift();
            next();
        }
        else
        {
            $_lock[this.options.directory] = 0;
        }
    },
    _fetchImage: function (args, cache, i, epoch)
    {
        var request = new DownloadFile();
        var resizePrefix = (args.forceResize) ? "original_" : "";
        var filepath = this.options.directory + "/" + args.addpath + resizePrefix + args.name;

        var headers = [];
        request.start(filepath, "GET", args.url, headers, this._finishFetchImage.bind(this, args, cache, i, request));
    },
    _finishFetchImage: function (args, cache, i, request, statuscode, filesignature)
    {
        if (statuscode === 200)
        {
            var imagePath = "./" + this.options.directory + "/" + args.addpath + args.name;
            var that = this;
            var _showAndUpdateCache = function ()
                {
                    args._super(imagePath, args.size, args.anchor, args.uvs);
                    if (that.options.cache)
                    {
                        that._addCacheData(args, cache, i);
                    }
                    else
                    {
                        that._unlockDirectory(args);
                    }
                };
            if (args.forceResize)
            {
                var _getPowerdBy2Size = function (originalSize)
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
                var x = _getPowerdBy2Size(args.size[0]);
                var y = _getPowerdBy2Size(args.size[1]);
                var resizeSize = (x > y) ? x : y;
                var resizePrefix = (args.forceResize) ? "original_" : "";
                var tmpImagePath = this.options.directory + "/" + args.addpath + resizePrefix + args.name;
                UI.compositeImages(resizeSize, resizeSize, imagePath, [
                {
                    image: tmpImagePath,
                    fit: UI.FitMode.Stretch}], function (event)
                {

                    FileSystem.deleteFile(tmpImagePath);
                    _showAndUpdateCache();
                });
            }
            else
            {
                _showAndUpdateCache();
            }
        }
        else if (statuscode === 304 && this.options.cache)
        {
            args._super("./" + this.options.directory + "/" + args.name, args.size, args.anchor, args.uvs);
            this._unlockDirectory(args);
        }
        else
        {
            this._unlockDirectory(args);
        }
    },
    _unlockDirectory: function (args)
    {
        this.tempfiles["./" + this.options.directory + "/" + args.addpath + args.name] = 1;
        if ($_queue[this.options.directory].length > 0)
        {
            var next = $_queue[this.options.directory].shift();
            next();
        }
        else
        {
            $_lock[this.options.directory] = 0;
        }
    },
    _addCacheData: function (args, cache, i)
    {
        if (!(cache instanceof Array))
        {
            cache = [];
        }
        var now = new Date();
        var cachedata = {
            "name": args.name,
            "epoch": now.getTime()
        };
        if (i > -1)
        {
            if (cache[i].name !== args.name)
            {
                i = this._searchCache(cache, args.name);
            }
            if (i > -1)
            {
                cache.splice(i, 1);
            }
        }
        cache.unshift(cachedata);
        this._updateCacheData(args, cache);
    }
});
/** @private
 *  This ENTIRE CLASS is private.
 */
var UISprite = URLSprite.subclass( /** @lends GLUI.UISprite.prototype */
{
    "classname": 'UISprite',
    /**
     * @class The <code>UISprite</code> class inherits URLSprite and adds conversion for local images to fit GL2 requirements.
     * It also has caching mechanism to decrease reconversion overhead on each access.
     **/
    "_default_options": {
        "cache": true,
        "directory": "uisprite",
        "localcachetime": 3600,
        "cachesize": 1024,
        "forceResize": true
    },
    _manifestCache: null,
    _urlImageCache: null,

    /**
     * @ignore
     * @constructs The default constructor.
     **/
    initialize: function ($super, options)
    {
        $super(options);
    },

    destroy: function ($super)
    {
        $super();
    },
    /**
     * Download a image and set it for this <code>Sprite</code>.
     * It has same interface as URLSprite but it can also convert local images.
     * It can accept local image path and at that time, it's behaviour is totally same as GL2.Sprite's setImage method.
     * @param {String} image URL or the directory path to an image referenced by a frame.
     * @param {Core.Size} [size] The size of the image to display (in pixels).
     * @param {Core.Point} [anchor] The anchor coordinates that indicate the image center in the animation.
     * @param {Core.Rect} [uvs] The UV coordinates used to specify the subset of an image.
     * @returns This function returns <code>this</code> to support method invocation chaining.
     **/
    setImage: function ($super, image, size, anchor, uvs)
    {
        var now;
        if (!image)
        {
            return this;
        }
        var imagePath = image;
        if (!size || size.length < 2 || !size[0] || size[1])
        {
            size = [128, 128];
        }
        var hashedName = toMD5(imagePath + size[0] + size[1]) + this._extractFileExstension(imagePath);

        var cachedata = null;
        if (image.slice(0, 7).toLowerCase() === "http://" || image.slice(0, 8).toLowerCase() === "https://")
        {
            if (this.options.cache && this._urlImageCache)
            {
                var i = this._searchCache(this._urlImageCache, hashedName);
                now = 0;
                if (i > -1)
                {
                    now = new Date();
                    if (this._urlImageCache[i].epoch + this.options.localcachetime * 1000 >= now.getTime())
                    {
                        cachedata = this._urlImageCache[i];
                        $super(this.options.directory + "/" + hashedName, size, anchor, uvs);
                        return this;
                    }
                }
            }
            return $super(image, size, anchor, uvs);
        }

        if (this.options.cache && this._manifestCache)
        {
            var j = this._searchCache(this._manifestCache, hashedName);
            if (j > -1)
            {
                now = new Date();
                if (this._manifestCache[j].epoch + this.options.localcachetime * 1000 >= now.getTime())
                {
                    cachedata = this._manifestCache[j];
                    $super(this.options.directory + "/" + hashedName, size, anchor, uvs);
                    return this;
                }
            }
        }

        var args = {
            _super: $super,
            imagePath: imagePath,
            name: hashedName,
            size: size,
            anchor: anchor,
            uvs: uvs,
            addpath: "",
            forceResize: this.options.forceResize
        };

        if (!this.options.cache)
        {
            var time = new Date();
            args.addpath = "nocache/" + Math.floor(Math.random() * 100) + time.getTime();
        }
        if (!$_queue[this.options.directory])
        {
            $_queue[this.options.directory] = [];
        }
        if ($_lock[this.options.directory])
        {
            $_queue[this.options.directory].push(this._setImageInternalFile.bind(this, args));
        }
        else
        {
            $_lock[this.options.directory] = 1;
            this._setImageInternalFile(args);
        }
        return this;
    },

    $setDefaultCacheMode: function (boolVal)
    {
        UISprite._default_options.cache = boolVal;
    },
    $getDefaultCacheMode: function ()
    {
        return UISprite._default_options.cache;
    },

    $setDefaultDirectory: function (directoryPath)
    {
        if (typeof (directoryPath) !== 'string')
        {
            directoryPath = 'urlimages';
        }
        UISprite._default_options.directory = directoryPath;
    },
    $getDefaultDirectory: function ()
    {
        return this._default_options.directory;
    },


    //        "_default_options" : {
    //      "cache"          : true,
    //      "directory"      : "urlimages",
    //      "localcachetime" : 3600,
    //      "cachesize"      : 1024,
    //      "forceResize"    : true
    //private Methods
    _extractFileExstension: function (imageName)
    {
        var filepos = imageName.lastIndexOf("/");
        if (filepos > -1)
        {
            imageName = imageName.slice(filepos + 1);
        }
        var dotpos = imageName.lastIndexOf(".");
        if (dotpos === -1)
        {
            return "";
        }
        var extension = imageName.slice(dotpos).toLowerCase();
        if (extension === ".jpeg")
        {
            extension = ".jpg";
        }
        return extension;
    },
    _setImageInternalFile: function (args, cache)
    {
        if (this.options.cache)
        {
            if (cache)
            {
                this._checkFileCacheData(args, undefined, undefined, cache);
            }
            else
            {
                this._setImageFileWithCache(args);
            }
        }
        else
        {
            this._resizeImage(args, [], -1);
        }
    },
    _setImageFileWithCache: function (args)
    {
        FileSystem.readFile(
        this.options.directory + "-urlsprite.json", false, this._checkFileCacheData.bind(this, args));
    },
    _checkFileCacheData: function (args, error, value, obj)
    {
        var self = this;
        var _createFolderForImages = function ()
            {
                //create default conversion output directory
                FileSystem.writeFile("./" + self.options.directory + "/.emptyfile", null, false, null);

                //create a converstion output directory for noncached images
                FileSystem.writeFile("./" + self.options.directory + "/nocache/.emptyfile", null, false, null);
            };

        var cache;
        if (obj)
        {
            cache = obj;
        }
        else if (!value || error)
        {
            _createFolderForImages();
            cache = [];
        }
        else
        {
            cache = JSON.parse(value);
            this._manifestCache = cache;
        }
        var i = this._searchCache(cache, args.name);
        if (i === -1)
        {
            this._resizeImage(args, cache, i);
        }
        else
        {

            var now = new Date();
            if (cache[i].epoch + this.options.localcachetime * 1000 < now.getTime())
            {
                this._resizeImage(args, cache, i, cache[i].epoch);
            }
            else
            {
                var cachedata = cache[i];
                cache.splice(i, 1);
                cache.unshift(cachedata);
                args._super(this.options.directory + "/" + args.name, args.size, args.anchor, args.uvs);
                this._updateFileCacheData(args, cache);
            }
        }
    },
    _updateFileCacheData: function (args, cache)
    {
        var i;
        this._manifestCache = cache;
        var length = cache.length;
        if (length > this.options.cachesize)
        {
            for (i = this.options.cachesize; i < length; i++)
            {
                FileSystem.deleteFile(this.options.directory + "/" + cache[i].name);
            }
            cache = cache.slice(0, this.options.cachesize);
        }
        if ($_queue[this.options.directory].length > 0)
        {
            var next = $_queue[this.options.directory].shift();
            next(cache);
        }
        else
        {
            var jsondata = JSON.stringify(cache);
            FileSystem.writeFile(
            this.options.directory + "-urlsprite.json", jsondata, false, this._finishFileUpdateCacheData.bind(this, args));
        }
    },
    _finishFileUpdateCacheData: function (args, error, key)
    {
        if ($_queue[this.options.directory].length > 0)
        {
            var next = $_queue[this.options.directory].shift();
            next();
        }
        else
        {
            $_lock[this.options.directory] = 0;
        }
    },
    _resizeImage: function (args, cache, i, epoch)
    {
        var resizePrefix = (args.forceResize) ? "original_" : "";
        var saveAsPath = this.options.directory + "/" + args.addpath + resizePrefix + args.name;
        this._startResizingImage(args.imagePath, saveAsPath, args, cache, i);
    },
    _startResizingImage: function (srcFile, dstFile, args, cache, i)
    {
        var imagePath = "./" + this.options.directory + "/" + args.addpath + args.name;
        var that = this;
        var _showAndUpdateCache = function ()
            {
                args._super(imagePath, args.size, args.anchor, args.uvs);
                if (that.options.cache)
                {
                    that._addFileCacheData(args, cache, i);
                }
                else
                {
                    that._unlockDirectory(args);
                }
            };
        if (args.forceResize)
        {
            var _getPowerdBy2Size = function (originalSize)
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
            var x = _getPowerdBy2Size(args.size[0]);
            var y = _getPowerdBy2Size(args.size[1]);
            var resizeSize = (x > y) ? x : y;

            UI.compositeImages(resizeSize, resizeSize, imagePath, [
            {
                image: srcFile,
                fit: UI.FitMode.Stretch}], function (event)
            {
                _showAndUpdateCache();
            });
        }
        else
        {
            _showAndUpdateCache();
        }
        this._unlockDirectory(args);
    },
    _addFileCacheData: function (args, cache, i)
    {
        if (!(cache instanceof Array))
        {
            cache = [];
        }
        var now = new Date();
        var cachedata = {
            "name": args.name,
            "epoch": now.getTime()
        };
        if (i > -1)
        {
            if (cache[i].name !== args.name)
            {
                i = this._searchCache(cache, args.name);
            }
            if (i > -1)
            {
                cache.splice(i, 1);
            }
        }
        cache.unshift(cachedata);
        this._updateFileCacheData(args, cache);
    },
    _checkCacheData: function (args, error, value, obj)
    {
        var cache;
        if (obj)
        {
            cache = obj;
        }
        else if (!value || error)
        {
            cache = [];
        }
        else
        {
            cache = JSON.parse(value);
            this._urlImageCache = cache;
        }
        var i = this._searchCache(cache, args.name);
        if (i === -1)
        {
            this._fetchImage(args, cache, i);
        }
        else
        {
            var now = new Date();
            if (cache[i].epoch + this.options.localcachetime * 1000 < now.getTime())
            {
                this._fetchImage(args, cache, i, cache[i].epoch);
            }
            else
            {
                var cachedata = cache[i];
                cache.splice(i, 1);
                cache.unshift(cachedata);
                args._super(this.options.directory + "/" + args.name, args.size, args.anchor, args.uvs);
                this._updateCacheData(args, cache);
            }
        }
    },
    _updateCacheData: function (args, cache)
    {
        var i;
        var length = cache.length;
        this._urlImageCache = cache;
        if (length > this.options.cachesize)
        {
            for (i = this.options.cachesize; i < length; i++)
            {
                FileSystem.deleteFile(this.options.directory + "/" + cache[i].name);
            }
            cache = cache.slice(0, this.options.cachesize);
        }
        if ($_queue[this.options.directory].length > 0)
        {
            var next = $_queue[this.options.directory].shift();
            next(cache);
        }
        else
        {
            var jsondata = JSON.stringify(cache);
            FileSystem.writeFile(
            this.options.directory + "-urlsprite.json", jsondata, false, this._finishUpdateCacheData.bind(this, args));
        }
    }
});

exports.URLSprite = URLSprite;
exports.UISprite = UISprite;
