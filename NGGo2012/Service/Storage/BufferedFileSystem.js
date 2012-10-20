////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Mizuno Takaaki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// Require Block
var Class      = require('../../../NGCore/Client/Core/Class').Class;
var FileSystem = require('../../../NGCore/Client/Storage/FileSystem').FileSystem;

// internal memory cache object
/** @private */
var Memory = Class.singleton(
{
    initialize: function()
    {
        this.cache = {};
    },
    set: function( key, value )
    {
        this.cache[key] = value;
    },
    get: function( key )
    {
        return this.cache[key];
    },
    remove: function( key )
    {
        delete this.cache[key];
    },
    clear: function(){
        this.cache = {};
    }
});

var BufferedFileSystem = Class.subclass(
/** @lends Service.Storage.BufferedFileSystem.prototype */
{
    classname: 'BufferedFileSystem',
    /**
     * @namespace TYPE Buffering types
     */
    TYPE:
    {
        WithTime: 0,
        WithCount: 1
    },
    /**
     * @class Storage.FileSystem wrapper to add buffering feature.
     * @constructor Constructor for the object.
     * @param {Object} [options] object includes option parameters.
     * @param {Number} [options.type=BufferedFileSystem.TYPE.WithTime] This param indicates how to do the buffering. BufferedFileSystem.TYPE.WithTime and BufferedFileSystem.TYPE.WithCount can be used.
     * @param {Number} [options.timeSpan=60] This indicate how long the buffered data will be keeped in the cache when the type is BufferedFileSystem.TYPE.WithTime. Default value is 60 sec( 1 min ).
     * @param {Number} [options.count=10] This indicate how meny times the buffered data will be keeped in the cache when the type is BufferedFileSystem.TYPE.WithCount. Default value is 10 times.
     * @augments Core.Class
     * @name Service.Storage.BufferedFileSystem
     */
    initialize: function(options)
    {
        var name;
        var _default_options = {
            type     : this.TYPE.WithTime,
            timeSpan : 60,
            count    : 10
        };
        if( !options || typeof options !== 'object' )
        {
            options = {};
        }
        this.BufferedFileSystem = {
            options: {}
        };
        for( name in _default_options )
        {
            if( _default_options.hasOwnProperty(name) ){
                this.BufferedFileSystem.options[name] = options.hasOwnProperty(name) ? options[name] : _default_options[name];
            }
        }
    },
    /**
     * Flashes cache for paticular file passed by parameter and write to the actual file.
     * @param {String} filename Filename to flash cache.
     * @param {Function} [callback] Callback function which is called when the flashing is finished.
     */
    flashFile: function(filename, callback)
    {
        var item = this._getMemoryCache(fname);
        if( item.writeCount === 0 )
        {
            this._callFunction(callback, [undefined]);
            return;
        }
        this.forceWriteFile(filename, item.data, item.binary, callback);
    },
    /**
     * Wrapper method for decompressFile of <code>Storage.FileSystem</code.
     * @param {String} filename The name of the zipfile to decompress.
     * @param {String} destination The directory path where the contents of the decompressed file are written.
     * @param {Boolean} [returnFiles] Set as <code>true</code> if <code>decompressFile()</code> should return a list of files contained in the zipfile specified by the <code>filename</code> parameter.
     * @param {Function} [callback] Specifies a callback function that returns an error if the file decompress operation fails.
     */
    decompressFile: function(filename, destination, returnFiles, callback)
    {
        return FileSystem.decompressFile(filename, destination, returnFiles, callback);
    },
    /**
     * Wrapper method for deleteFile of <code>Storage.FileSystem</code>.
     * @param {String} filename Filename to flash cache.
     * @param {Function} [callback] Callback function which is called when the deleting is finished.
     */
    deleteFile: function(filename, callback)
    {
        Memory.remove(filename);
        return FileSystem.deleteFile(filename, callback);
    },
    /**
     * Reads a file into memory from local storage. But if the content of file have already read and in the memory cache, cached content will be returned.
     * @example fs.readFile(SomeFile, true, function(err, data){...}
     * @param {String} filename The name of the file to read into memory.
     * @param {Boolean} [binary=false] Set as <code>true</code> if <code>readFile()</code> shouuld conduct a binary read.
     * @param {Function} [callback] Specifies a callback function that returns an error if the file read operation fails.
     */
    readFile: function(filename, binary, callback)
    {
        var item = this._getMemoryCache(filename);
        var reload = false;
        var options = this.BufferedFileSystem.options;
        switch( options.type ){
        case this.TYPE.WithTime:
            var date = new Date();
            if( parseInt(item.lastRead + options.timeSpan, 10) < parseInt(date.getTime()/1000, 10) )
            {
                reload = true;
            }
            break;
        case this.TYPE.WithCount:
            if( item.writeCount === -1 || item.readCount >= options.count )
            {
                reload = true;
            }
            break;
        default:
            break;
        }
        if( reload )
        {
            this.forceReadFile(filename, binary, callback);
        }
        else
        {
            item.readCount++;
            this._callFunction(callback, [undefined,item.data]);
        }
    },
    /**
     * Reads a file into memory from local storage without using cache.
     * @example fs.forceReadFile(SomeFile, true, function(err, data){...}
     * @param {String} filename The name of the file to read into memory.
     * @param {Boolean} [binary=false] Set as <code>true</code> if <code>readFile()</code> should conduct a binary read.
     * @param {Function} [callback] Specifies a callback function that returns an error if the file read operation fails.
     */
    forceReadFile: function(filename, binary, callback)
    {
        var args = {
            fname  : filename,
            binary : binary,
            cb     : callback
        };
        FileSystem.readFile( filename, binary, this._onReadFile.bind(this, args));
    },
    /**
     * Writes a file to local storage. Buffering feature activated.
     * @example fs.writeFile(SomeFile, someData, true, (function(){...});
     * @param {String} filename The name of the file to write into storage.
     * @param {Binary|String} data The data to write to the file.
     * @param {Boolean} [binary=false] Set as <code>true</code> if <code>writeFile()</code> should conduct a binary write.
     * @param {Function} [callback] Specifies a callback function that returns an error if the file write operation fails.
     */
    writeFile: function(filename, data, binary, callback)
    {
        var item = this._getMemoryCache(filename);
        var reload = false;
        var options = this.BufferedFileSystem.options;
        switch( options.type ){
        case this.TYPE.WithTime:
            var date = new Date();
            if( parseInt(item.lastWrite + options.timeSpan,10) < parseInt(date.getTime()/1000, 10) )
            {
                reload = true;
            }
            break;
        case this.TYPE.WithCount:
            if( item.writeCount === -1 || item.writeCount >= options.count )
            {
                reload = true;
            }
            break;
        default:
            break;
        }
        if( reload )
        {
            this.forceWriteFile(filename, data, binary, callback);
        }
        else
        {
            item.writeCount++;
            this._callFunction(callback, [undefined]);
        }
    },
    /**
     * Writes a file to local storage.
     * @example fs.forceWriteFile(SomeFile, someData, true, (function(){...});
     * @param {String} filename The name of the file to write into storage.
     * @param {Binary|String} data The data to write to the file.
     * @param {Boolean} [binary=false] Set as <code>true</code> if <code>writeFile()</code> should conduct a binary write.
     * @param {Function} [callback] Specifies a callback function that returns an error if the file write operation fails.
     */
    forceWriteFile: function(filename, data, binary, callback)
    {
        var args = {
            fname  : filename,
            binary : binary,
            cb     : callback,
            data   : data
        };
        FileSystem.writeFile( filename, data, binary, this._onWriteFile.bind(this, args));
    },
    /** @private */
    _onReadFile: function(args, err, data)
    {
        if( !err )
        {
            var item = this._getMemoryCache(args.fname);
            var date = new Date();
            item.lastRead = ~~(date.getTime()/1000);
            item.readCount = 0;
            item.binary = args.binary;
            item.data = data;
            Memory.set(args.fname, item);
        }
        this._callFunction(args.cb, [undefined, data]);
    },
    /** @private */
    _onWriteFile: function(args, err)
    {
        if( !err )
        {
            var item = this._getMemoryCache(args.fname);
            var date = new Date();
            item.lastWrite = ~~(date.getTime()/1000);
            item.lastRead = item.lastWrite;
            item.writeCount = 0;
            item.readCount  = 0;
            item.binary = args.binary;
            item.data = args.data;
            Memory.set(args.fname, item);
        }
        this._callFunction(args.cb, [undefined]);
    },
    /** @private */
    _callFunction: function(func, args)
    {
        if(typeof func === "function")
        {
            try
            {
                func.apply(undefined, args);
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
    _getMemoryCache: function(fname)
    {
        var item = Memory.get(fname);
        if(!item)
        {
            item = {
                lastRead   : 0,
                lastWrite  : 0,
                readCount  : -1,
                writeCount : -1,
                binary     : false,
                data       : undefined
            };
            Memory.set(fname, item);
        }
        return item;
    }
});

exports.BufferedFileSystem = BufferedFileSystem;
