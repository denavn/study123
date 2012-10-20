////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    DnLib
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
var Class = require('../../../NGCore/Client/Core/Class').Class;
var Social = require("../../../NGCore/Client/Social").Social;
var FileSystem = require('../../../NGCore/Client/Storage/FileSystem').FileSystem;
var URLSprite = require('../../GLUI/Sprite').URLSprite;
var $_lock = {};
var $_queue = {};
var PeopleWithCache = Class.subclass(
{
    "classname": "PeopleWithCache",
    "_default_options": {
        "cache": true,
        "key": "UserInfo",
        "localcachetime": 3600,
        "cachesize": 100
    },
    initialize: function (options)
    {
        this.options = {};
        if (!options)
        {
            options = {};
        }
        var name;
        for (name in this._default_options)
        {
            if (this._default_options.hasOwnProperty(name))
            {
                this.options[name] = options.hasOwnProperty(name) ? options[name] : this._default_options[name];
            }
        }
    },
    getUser: function (userId, fields, callback)
    {
        if (!this.options.cache)
        {
            return Social.Common.People.getUser(userId, fields, callback);
        }
        userId = parseInt(userId, 10);
        if (!userId)
        {
            return;
        }
        var args = {
            userId: userId,
            fields: fields,
            callback: callback
        };
        if (!$_queue[this.options.key])
        {
            $_queue[this.options.key] = [];
        }
        if ($_lock[this.options.key])
        {
            console.log("PeopleWithCache getUser Locked. Add to Queue");
            $_queue[this.options.key].push(this._getUserInternal.bind(this, args));
        }
        else
        {
            $_lock[this.options.key] = 1;
            this._getUserInternal(args);
        }
    },
    getUsers: function (userIds, fields, callback)
    {
        if (!this.options.cache)
        {
            return Social.Common.People.getUsers(userIds, fields, callback);
        }
        if (!userIds || !userIds instanceof Array || userIds.length === 0)
        {
            return;
        }
        var args = {
            userIds: userIds,
            fields: fields,
            callback: callback
        };
        if (!$_queue[this.options.key])
        {
            $_queue[this.options.key] = [];
        }
        if ($_lock[this.options.key])
        {
            console.log("PeopleWithCache getUsers Locked. Add to Queue");
            $_queue[this.options.key].push(this._getUsersInternal.bind(this, args));
        }
        else
        {
            $_lock[this.options.key] = 1;
            this._getUsersInternal(args);
        }
    },
    clearCache: function ()
    {
        FileSystem.deleteFile(
        this.options.key + "-people.json");
    },
    $unlock: function (key)
    {
        console.log("Unlock PeopleWithCache : " + key);
        $_lock[key] = 0;
        $_queue[key] = [];
    },
    _cacheRemoved: function (error)
    {
        console.log("PeopleWithCache cacheRemoved: " + error);
    },
    _getUserInternal: function (args, cache)
    {
        if (cache)
        {
            this._checkUserCacheData(args, undefined, undefined, cache);
        }
        else
        {
            FileSystem.readFile(
            this.options.key + "-people.json", false, this._checkUserCacheData.bind(this, args));
        }
    },
    _searchCache: function (cache, id)
    {
        if (cache)
        {
            var length = cache.length;
            var i;
            for (i = 0; i < length; i++)
            {
                if (cache[i] && cache[i].id === id)
                {
                    return i;
                }
            }
        }
        return -1;
    },
    _checkUserCacheData: function (args, error, value, obj)
    {
        var cache;
        if (obj)
        {
            console.log("_checkUserCacheData: get data from previous queue");
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
        var i = this._searchCache(cache, args.userId);
        if (i === -1)
        {
            return Social.Common.People.getUser(
            args.userId, args.fields, this._updateUserCacheData.bind(this, args, cache));
        }
        else
        {
            var cachedata = cache[i];
            cache.splice(i, 1);
            var now = new Date();
            if (cachedata.epoch + this.options.localcachetime * 1000 < now.getTime())
            {
                return Social.Common.People.getUser(
                args.userId, args.fields, this._updateUserCacheData.bind(this, args, cache));
            }
            else
            {
                console.log("PeopleWithCache: user info fetched from cache: " + JSON.stringify(cachedata));
                this._updateUserCacheData(args, cache, undefined, cachedata);
            }
        }
    },
    _updateUserCacheData: function (args, cache, error, cachedata)
    {
        if (!error)
        {
            var now = new Date();
            cachedata.epoch = now.getTime();
            cache.unshift(cachedata);
            var length = cache.length;
            if (length > this.options.cachesize)
            {
                cache = cache.slice(0, this.options.cachesize);
            }
            if ($_queue[this.options.key].length > 0)
            {
                console.log("_updateUserCacheData: data will be passwd to next");
                var next = $_queue[this.options.key].shift();
                next(cache);
                args.callback(error, cachedata);
            }
            else
            {
                var jsondata = JSON.stringify(cache);
                FileSystem.writeFile(
                this.options.key + "-people.json", jsondata, false, this._finishUpdateUserCacheData.bind(this, args, cachedata, error));
            }
        }
        else
        {
            this._finishUpdateUserCacheData(args, cachedata, error);
        }
    },
    _finishUpdateUserCacheData: function (args, cachedata, apierror)
    {
        if ($_queue[this.options.key].length > 0)
        {
            var next = $_queue[this.options.key].shift();
            next();
        }
        else
        {
            $_lock[this.options.key] = 0;
        }
        if (args.callback)
        {
            args.callback(apierror, cachedata);
        }
    },
    _getUsersInternal: function (args, cache)
    {
        if (cache)
        {
            this._checkUsersCacheData(args, undefined, undefined, cache);
        }
        else
        {
            FileSystem.readFile(
            this.options.key + "-people.json", false, this._checkUsersCacheData.bind(this, args));
        }
    },
    _checkUsersCacheData: function (args, error, value, obj)
    {
        var cache;
        if (obj)
        {
            console.log("_checkUsersCacheData: get data from previous queue");
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
        var len = args.userIds.length;
        var cachedUserData = [];
        var uncachedUserIds = [];
        var removeIndex = {};
        var removeCount = 0;
        var now = new Date();
        var cachetime = this.options.localcachetime * 1000;
        var j;
        for (j = 0; j < len; j++)
        {
            var id = parseInt(args.userIds[j], 10);
            if (!id)
            {
                continue;
            }
            var i = this._searchCache(cache, id);
            if (i === -1)
            {
                uncachedUserIds.push(id);
            }
            else
            {
                removeIndex[i] = 1;
                removeCount++;
                if (cache[i].epoch + cachetime < now.getTime())
                {
                    uncachedUserIds.push(id);
                }
                else
                {
                    var cachedata = cache[i];
                    cachedUserData.push(cachedata);
                    console.log("PeopleWithCache: user info fetched from cache: " + JSON.stringify(cachedata));
                }
            }
        }
        if (removeCount)
        {
            var newCache = [];
            var k;
            for (k = 0; k < len; k++)
            {
                if (!removeIndex[k])
                {
                    newCache.push(cache[k]);
                }
            }
            cache = newCache;
        }
        if (uncachedUserIds.length > 0)
        {
            Social.Common.People.getUsers(
            uncachedUserIds, args.fields, this._updateUsersCacheData.bind(this, args, cache, cachedUserData));
        }
        else
        {
            this._updateUsersCacheData(args, cache, cachedUserData, undefined, []);
        }
    },
    _updateUsersCacheData: function (args, cache, cachedUserData, error, uncachedUserData)
    {
        var length;
        if (!error)
        {
            var now = new Date();
            length = uncachedUserData.length;
            var i;
            for (i = 0; i < length; i++)
            {
                uncachedUserData[i].epoch = now.getTime();
            }
            cache = uncachedUserData.concat(cache);
        }
        if (cachedUserData && cachedUserData.length > 0)
        {
            cache = cachedUserData.concat(cache);
        }
        length = cache.length;
        if (length > this.options.cachesize)
        {
            cache = cache.slice(0, this.options.cachesize);
        }
        if ($_queue[this.options.key].length > 0)
        {
            console.log("_updateUsersCacheData: data will be passwd to next");
            var next = $_queue[this.options.key].shift();
            next(cache);
            //args.callback(error, cachedata); // Note: cacheData is undefined gives a jsLint Error
            args.callback(error);
        }
        else
        {
            var jsondata = JSON.stringify(cache);
            FileSystem.writeFile(
            this.options.key + "-people.json", jsondata, false, this._finishUpdateUsersCacheData.bind(this, args, cache, error));
        }
    },
    _finishUpdateUsersCacheData: function (args, cache, apierror)
    {
        if ($_queue[this.options.key].length > 0)
        {
            var next = $_queue[this.options.key].shift();
            next();
        }
        else
        {
            $_lock[this.options.key] = 0;
        }
        if (args.callback)
        {
            args.callback(apierror, cache);
        }
    }
});
exports.AvatarSprite = URLSprite.subclass( /** @lends Service.Graphics.AvatarSprite.prototype*/
{
    classname: "AvatarSprite",
    /**
     * @class The <code>AvatarSprite</code> class shows profile images that users have on Mobage Server. 
     * @constructs The default constructor.
     * @augments GLUI.URLSprite.
     * @param {Object} object with property key, cache, localcachetime, cachesize.
     * @param {String} image URL or the directory path to a default image referenced by a frame.
     * @param {Core.Rect | Array} uvs The UV coordinates used to specify the subset of a default image.
     * @status Android, iOS
     */
    initialize: function (options, defaultImage, defaultUvs)
    {
        var key = "UserInfo";
        if (options && options.key)
        {
            key = options.key;
        }
        if (this.options)
        {
            this.options.key = key;
        }
        else
        {
            this.options = {
                "key": key
            };
        }
        this._defaultImage = defaultImage;
        this._defaultUvs = defaultUvs;
    },
    /**
     * Sets user's Avatar image on Sprite.
     * @param {Number} userID userID given to user from Mobage Server.
     * @param {Core.Size | Array} size The size of the image to display (in pixels).
     * @param {Core.Point | Array} anchor The anchor coordinates that indicate the image center in the animation.
     * @param {Core.Rect | Array} uvs The UV coordinates used to specify the subset of an image.
     * @status Android, iOS
     */
    setAvatarImage: function (user_id, size, anchor, uvs)
    {
        var fields = [
            "id",
            "thumbnailUrl"
            ];
        var args = {
            size: size,
            anchor: anchor,
            uvs: uvs
        };
        this.setImage(this._defaultImage, size, anchor, this._defaultUvs);
        var people = new PeopleWithCache(this.options);
        people.getUser(
        user_id, fields, this._finishGetUserInfo.bind(this, args));
    },
    /**
     * @private
     */
    $unlock: function (key)
    {
        PeopleWithCache.unlock(key);
    },
    /**
     * @private
     */
    _finishGetUserInfo: function (args, error, user)
    {
        if (user && user.thumbnailUrl)
        {
            var image_url = user.thumbnailUrl;
            this.setImage(image_url, args.size, args.anchor, args.uvs);
        }
        else if (error)
        {
            console.log(error);
        }
    }
});