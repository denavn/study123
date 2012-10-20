////////////////////////////////////////////////////////////////////////////////
// Class Texture
// Texture object implementation
//
// Copyright (C) 2011 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Core = require('../Core').Core;

/*#if TYPECHECK
var T = Core.TypeCheck;
#endif*/

////////////////////////////////////////////////////////////////////////////////

var Texture = exports.Texture = Core.Class.subclass(
/** @lends GL2.Texture.prototype */
{
	classname: 'Texture',

	/**
	 * @class The `GL2.Texture` class creates texture objects synchronously or
	 * asynchronously. By specifying `readImageAsync` as `true` in the options object when
	 * creating the `GL2.Texture`, the application can continue processing without blocking
	 * execution while waiting for the texture file to load.
     *
     * `GL2.Texture` can be used in place of a literal image filename
     * string in calls to `{@link GL2.Sprite#setImage}` and `{@link GL2.Primitive#setImage}`.
     * The texture object's image is referenced and bound to the node.
     *
     * `{@link GL2.Texture#getFilename}` can be used in place of a literal image filename
     * string in calls to `{@link GL2.Sprite#setImage}`, `{@link GL2.Primitive#setImage}` and `{@link GL2.Animation.Frame}`.
     * The texture object's image is referenced and bound to the node or animation frame.
     *
	 * @constructs The default constructor.
	 * @augments Core.Class
	 * @param {String} filename Name of the image file to read.
	 * @param {Object} [options] Options for loading the texture.
	 * @param {Boolean} [options.readImageAsync] Read image asynchronously if true. `createCallback` is invoked when operation completes.
	 * @param {Boolean} [options.truecolorDepth16] Truecolor image depth is 16bpp after decoding if true.
	 * @cb {Function} [createCallback] createCallback Callback function for this texture's create operation.
	 * @cb-param {Object} error error Information about the error, if any.
	 * @cb-param {GL2.Texture#ErrorCode} [error.code] [error.code] A code identifying the error type.
	 * @cb-param {String} [error.description] [error.description] A description of the error.
	 * @cb-param {GL2.Texture} object object `this` object.
	 * @cb-returns {void}
     * @example
     * var obj = new GL2.Texture(
     *    "Content/ngmoco.pvr",
     *    {
     *        "truecolorDepth16" : false,
     *        "readImageAsync" : true
     *    },
     *    function (error, object) {
     *        if (error) {
     *            console.log("Unable to read image file: " + error.description);
     *        } else {
     *            console.log("The image file was read: " + object.getFilename());
     *        }
     *    }
     * );
	 * @status iOS, Android
	 * @since 1.7
	 */
	initialize: function( filename, options, createCallback )
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg('string')]);
#endif*/
        // default state
        this._isImageValid = false;
		this._filename = '';
        this._options = Texture.OptionFlags.Default;
        this._minFilter = Texture.FilterMode.Linear;
        this._magFilter = Texture.FilterMode.Linear;
        this._wrapS = Texture.WrapMode.Clamp;
        this._wrapT = Texture.WrapMode.Clamp;

        // parameters
        if ( filename && typeof( filename ) == 'string' ) {
            this._filename = filename;
        }

        if ( options && typeof( options ) == 'object' ) {
            if ( options['readImageAsync'] ) {
                this._options |= Texture.OptionFlags.ReadImageAsync;
            }
            if ( options['truecolorDepth16'] ) {
                this._options |= Texture.OptionFlags.TruecolorDepth_BPP16;
            }
            if ( options['minFilter'] ) {
                this._minFilter = options['minFilter'];
            }
            if ( options['magFilter'] ) {
                this._magFilter = options['magFilter'];
            }
            if ( options['wrapS'] ) {
                this._wrapS = options['wrapS'];
            }
            if ( options['wrapT'] ) {
                this._wrapT = options['wrapT'];
            }
        } else {
            createCallback = options;
        }

        // callback management
		this._nextCbId = 0;
        this._cb = {};
		this._storeCb = function( cb ) {
			var cbId = -1;
			if ( cb && typeof( cb ) == 'function' ) {
				cbId = this._nextCbId++;
				this._cb[cbId] = cb;
			}
			return cbId;
		};
		this._restoreCb = function( cbId ) {
            var cb = function () {};
            if ( cbId >= 0 ) {
                cb = this._cb[cbId];
                delete this._cb[cbId];
			}
            return cb;
		};

        // finish up
		Core.ObjectRegistry.register( this );

		this._createSendGen(    this.__objectRegistryId,
                                this._storeCb( createCallback ),
                                this._filename,
                                this._options,
                                this._minFilter,
                                this._magFilter,
                                this._wrapS,
                                this._wrapT );
	},

	/**
	 * Destroy the `GL2.Texture` object, and release the resources allocated by the texture.
     *
     * **Note**: Image resources will be deallocated if there are no references held by `GL2.Node` objects.
     *
	 * @returns {void}
	 * @status iOS, Android
	 * @since 1.7
	 */
    destroy: function()
    {
        this._destroySendGen();
        Core.ObjectRegistry.unregister( this );
    },

// API

    /** @ignore initialize docs until 1.8
     *
     * and provides control over specific properties of the texture.
     *
     * **Note**: Calls to `{@link GL2.Texture#setFilterModes}` and `{@link GL2.Texture#setWrapModes}`
     * will affect all instances and usages of that texture object by sprites, primitives, and animations.
     *
	 * @param {GL2.Texture.FilterMode} [options.minFilter] Minification filter mode.
	 * @param {GL2.Texture.FilterMode} [options.magFilter] Magnification filter mode.
	 * @param {GL2.Texture.WrapMode} [options.wrapS] S-axis wrap mode.
	 * @param {GL2.Texture.WrapMode} [options.wrapT] T-axis wrap mode.
     */

	/**
	 * Get `GL2.Texture` filename.
	 * @returns {String} The name of the image file associated with this texture object.
	 * @status iOS, Android
	 * @since 1.7
	 */
    getFilename: function() {
        return this._filename;
    },
	
	/**
	 * Set `GL2.Texture` filter modes.
	 * @param {GL2.Texture.FilterMode} minFilter Minification filter mode for this texture.
	 * @param {GL2.Texture.FilterMode} magFilter Magnification filter mode for this texture.
	 * @returns `this` to support method invocation chaining.
	 * @status iOS, Android
     * @private
	 */
    setFilterModes: function( minFilter, magFilter ) {
        this._minFilter = minFilter;
        this._magFilter = magFilter;
        this._setFilterModesSendGen( minFilter, magFilter );
        return this;
    },

	/**
	 * Get `GL2.Texture` filter modes.
	 * @returns {Object} Texture filter modes in the form of { minFilter:value, magFilter:value }
	 * @status iOS, Android
     * @private
	 */
    getFilterModes: function() {
        return { minFilter:this._minFilter, magFilter:this._magFilter };
    },

	/**
	 * Set `GL2.Texture` wrap modes.
	 * @param {GL2.Texture.WrapMode} wrapS S-axis wrap mode for this texture.
	 * @param {GL2.Texture.WrapMode} wrapT T-axis wrap mode for this texture.
	 * @returns `this` to support method invocation chaining.
	 * @status iOS, Android
     * @private
	 */
    setWrapModes: function( wrapS, wrapT ) {
        this._wrapS = wrapS;
        this._wrapT = wrapT;
        this._setWrapModesSendGen( wrapS, wrapT );
        return this;
    },

	/**
	 * Get `GL2.Texture` wrap modes.
	 * @returns {Object} Texture wrap modes in the form of { wrapS:value, wrapT:value }
	 * @status iOS, Android
     * @private
	 */
    getWrapModes: function() {
        return { wrapS:this._wrapS, wrapT:this._wrapT };
    },

	/**
     * Read meta data information about an image file.
     * @name GL2.Texture.readImageInfo
     * @function
     * @static
     *
     * @param {String} filename Name of image file to open and read meta data information.
     * @cb {Function} readCallback Callback function for image read operation.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {GL2.Texture#ErrorCode} [error.code] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {Number} width The width in pixels of the image file.
	 * @cb-param {Number} height The height in pixels of the image file.
	 * @cb-param {Boolean} hasAlpha Flag is `true` if the image file contains alpha transparency.
	 * @cb-returns {void}
     * @example
     * GL2.Texture.readImageInfo("Content/ngmoco.pvr", function (error, width, height, hasAlpha) {
     *      if (error) {
     *          console.log("Unable to read image file info: " + error.description);
     *      } else {
     *          console.log("The image file info: " + width + ", " + height + ", " + hasAlpha);
     *      }
     * });
	 * @status iOS, Android
	 * @since 1.7
     */

	$readImageInfo: function( filename, readCallback ) {
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg('string'), T.Arg('function')]);
#endif*/
        if ( !this._readCallbacks ) {
            this._readCallbacks = { uidGenerator:1 };
        }
        this._readCallbacks[++this._readCallbacks.uidGenerator] = readCallback;
        this._readImageInfoSendGen( this._readCallbacks.uidGenerator, filename );
    },

	/** @private */
    _onCreateCbRecv: function( cmd ) {
		var obj = {};
		if ( this._onCreateCbRecvGen( cmd, obj ) ) {
			if ( obj['callbackId'] >= 0 ) {
				var cb = this._restoreCb( obj['callbackId'] );
				var err = obj['errCode'] ? { code:obj['errCode'], description:obj['errStr'] } : null;
                if ( !err ) {
                    this._isImageValid = true;
                }
				cb( err, this );
			}
		}
    },

	/** @private */
	$_readImageInfoCbRecv: function( cmd ) {
        var obj = {};
        this._readImageInfoCbRecvGen( cmd, obj );

        if ( this._readCallbacks.hasOwnProperty( obj.callbackId ) ) {
            var err = obj['errCode'] ? { code:obj['errCode'], description:obj['errStr'] } : null;
            this._readCallbacks[obj.callbackId]( err, obj['width'], obj['height'], obj['hasAlpha'] );
            delete this._readCallbacks[obj.callbackId];
        }
    },

	/**
	 * No error occurred.
	 * @name ErrorCode.NoError
	 * @fieldOf GL2.Texture#
	 * @constant
	 */

	/**
	 * An unknown error occurred.
	 * @name ErrorCode.Unknown
	 * @fieldOf GL2.Texture#
	 * @constant
	 */

	/**
	 * The file was not found.
	 * @name ErrorCode.NotFound
	 * @fieldOf GL2.Texture#
	 * @constant
	 */

	/**
	 * The requested operation is not available.
	 * @name ErrorCode.Unsupported
	 * @fieldOf GL2.Texture#
	 * @constant
	 */

	/**
	 * Filter texture using nearest texel sampling.
	 * @name FilterMode.Nearest
	 * @fieldOf GL2.Texture#
	 * @constant
     * @private
	 */

	/**
	 * Filter texture using linear interpolation sampling.
	 * @name FilterMode.Linear
	 * @fieldOf GL2.Texture#
	 * @constant
     * @private
	 */

	/**
	 * Create texture without special options.
	 * @name OptionFlags.Default
	 * @fieldOf GL2.Texture#
	 * @constant
	 */

	/**
	 * Create texture using asynchronous processing if `true`.
	 * @name OptionFlags.ReadImageAsync
	 * @fieldOf GL2.Texture#
	 * @constant
	 */

	/**
	 * Create texture with a bit depth of 16 bits per pixel if `true`. This option applies to uncompressed, truecolor formats.
	 * @name OptionFlags.TruecolorDepth_BPP16
	 * @fieldOf GL2.Texture#
	 * @constant
     * @see GL2.Animation.setTextureColorDepth
	 */

	/**
	 * Clamp texture coordinates to the edge of the image along the indicated axis.
	 * @name WrapMode.Clamp
	 * @fieldOf GL2.Texture#
	 * @constant
     * @private
	 */

	/**
	 * Repeat texture coordinates using the fractional part along the indicated axis.
	 * @name WrapMode.Repeat
	 * @fieldOf GL2.Texture#
	 * @constant
     * @private
	 */

// {{?Wg Generated Code}}
	
	// Enums.
	/** Texture Callback errors */
	ErrorCode:
	{ 
		NoError: 0,
		Unknown: -1,
		NotFound: -2,
		Unsupported: -3
	},
	
	/** @private Texture Filtering */
	FilterMode:
	{ 
		Nearest: 1,
		Linear: 2
	},
	
	/** Texture creation options */
	OptionFlags:
	{ 
		Default: 0,
		ReadImageAsync: 1,
		TruecolorDepth_BPP16: 2
	},
	
	/** @private Texture Wrapping */
	WrapMode:
	{ 
		Clamp: 1,
		Repeat: 2
	},
	
	///////
	// Class constants (for internal use only):
	_classId: 365,
	// Method create = -1
	// Method destroy = 2
	// Method setFilterModes = 3
	// Method setWrapModes = 4
	// Method onCreateCb = 5
	// Method readImageInfoCb = -6
	// Method readImageInfo = -7
	
	/** 
	 * Command dispatch.
	 * @private
	 */
	$_commandRecvGen: (function() { var h = (function ( cmd )
	{
		var cmdId = Core.Proc.parseInt( cmd.shift(), 10 );
		
		if( cmdId > 0 )	// Instance Method.
		{
			var instanceId = Core.Proc.parseInt( cmd.shift(), 10 );
			var instance = Core.ObjectRegistry.idToObject( instanceId );
			
			if( ! instance )
			{
				NgLogE("Object instance could not be found for command " + cmd + ". It may have been destroyed this frame.");
				return;
			}
			
			switch( cmdId )
			{
				
				case 5:
					instance._onCreateCbRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in Texture._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				case -6:
					Texture._readImageInfoCbRecv( cmd );
					break;
				default:
					NgLogE("Unknown static method id " + cmdId + " in Texture._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[365] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_onCreateCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 3 )
		{
			NgLogE("Could not parse due to wrong argument count in Texture.onCreateCb from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in Texture.onCreateCb from command: " + cmd );
			return false;
		}
		
		obj[ "errCode" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "errCode" ] === undefined )
		{
			NgLogE("Could not parse errCode in Texture.onCreateCb from command: " + cmd );
			return false;
		}
		
		obj[ "errStr" ] = Core.Proc.parseString( cmd[ 2 ] );
		if( obj[ "errStr" ] === undefined )
		{
			NgLogE("Could not parse errStr in Texture.onCreateCb from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	$_readImageInfoCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 6 )
		{
			NgLogE("Could not parse due to wrong argument count in Texture.readImageInfoCb from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in Texture.readImageInfoCb from command: " + cmd );
			return false;
		}
		
		obj[ "errCode" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "errCode" ] === undefined )
		{
			NgLogE("Could not parse errCode in Texture.readImageInfoCb from command: " + cmd );
			return false;
		}
		
		obj[ "errStr" ] = Core.Proc.parseString( cmd[ 2 ] );
		if( obj[ "errStr" ] === undefined )
		{
			NgLogE("Could not parse errStr in Texture.readImageInfoCb from command: " + cmd );
			return false;
		}
		
		obj[ "width" ] = Core.Proc.parseInt( cmd[ 3 ] );
		if( obj[ "width" ] === undefined )
		{
			NgLogE("Could not parse width in Texture.readImageInfoCb from command: " + cmd );
			return false;
		}
		
		obj[ "height" ] = Core.Proc.parseInt( cmd[ 4 ] );
		if( obj[ "height" ] === undefined )
		{
			NgLogE("Could not parse height in Texture.readImageInfoCb from command: " + cmd );
			return false;
		}
		
		obj[ "hasAlpha" ] = Core.Proc.parseBool( cmd[ 5 ] );
		if( obj[ "hasAlpha" ] === undefined )
		{
			NgLogE("Could not parse hasAlpha in Texture.readImageInfoCb from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId, callbackId, filename, options, minFilter, magFilter, wrapS, wrapT )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x16dffff, [ +__objectRegistryId, +callbackId, Core.Proc.encodeString( filename ), +options, +minFilter, +magFilter, +wrapS, +wrapT ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x16d0002, this );
	},
	
	/** @private */
	_setFilterModesSendGen: function( minFilter, magFilter )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x16d0003, this, [ +minFilter, +magFilter ] );
	},
	
	/** @private */
	_setWrapModesSendGen: function( wrapS, wrapT )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x16d0004, this, [ +wrapS, +wrapT ] );
	},
	
	/** @private */
	$_readImageInfoSendGen: function( callbackId, filename )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x16dfff9, [ +callbackId, Core.Proc.encodeString( filename ) ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId, callbackId, filename, options, minFilter, magFilter, wrapS, wrapT ) {}
	
	// destroy: function(  ) {}
	
	// setFilterModes: function( minFilter, magFilter ) {}
	
	// setWrapModes: function( wrapS, wrapT ) {}
	
	// _onCreateCbRecv: function( cmd ) {}
	// $_readImageInfoCbRecv: function( cmd ) {}
	// $readImageInfo: function( callbackId, filename ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
