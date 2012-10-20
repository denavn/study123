////////////////////////////////////////////////////////////////////////////////
// Class Font
// Font object implementation
//
// Copyright (C) 2011 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Core = require('../Core').Core;

/*#if TYPECHECK
var T = Core.TypeCheck;
#endif*/

////////////////////////////////////////////////////////////////////////////////

var Font = exports.Font = Core.Class.subclass(
/** @lends GL2.Font.prototype */
{
	classname: 'Font',

	/**
	 * @class The `GL2.Font` class creates font objects that can be used by `{@link GL2.Text}`
	 * objects. When you create a new font object, you can specify that the font should be loaded
	 * asynchronously, so that the application is not blocked while it waits for the font to load.
	 * @constructs The default constructor.
	 * @augments Core.Class
	 * @example
	 * var obj = new GL2.Font("Content/fontname.ttf",
	 *    {
	 *        location: GL2.Font.FontLocation.Manifest,
	 *        size: 16,
	 *        readFontAsync: true
	 *    },
	 *    function (error, object) {
	 *        if (error) {
	 *            console.log("Unable to read font family file: " + error.description);
	 *        } else {
	 *            console.log("The font family file was read: " + object.getFontFamily());
	 *        }
	 *    }
	 * );
	 * @param {String} fontFamily Name of the font family to load.
	 * @param {Object} [options] Options for loading the font.
	 * @param {Boolean} [options.readFontAsync=false] Set to `true` to load the font asynchronously.
	 * @param {GL2.Font.FontLocation} [options.location=GL2.Font.FontLocation.Default] Location of
	 *		the font family to load.
	 * @param {Number} [options.size=18] Size of the font, in pixels per em.
	 * @cb {Function} [createCallback] createCallback The function to call after the font has been
	 *		loaded.
	 * @cb-param {Object} error error Information about the error, if any.
	 * @cb-param {GL2.Font#ErrorCode} [error.code] [error.code] A code identifying the error type.
	 * @cb-param {String} [error.description] [error.description] A description of the error.
	 * @cb-param {GL2.Font} object object The `GL2.Font` object.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status iOS, Android
	 * @since 1.8
	 */
	initialize: function( fontFamily, options, createCallback )
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg('string')]);
#endif*/
		// default state
		this._isFontValid = false;
		this._fontFamily = '';
		this._options = Font.OptionFlags.DefaultOptions;
		this._location = Font.FontLocation.Default;
		this._size = 18;

		// parameters
		if ( fontFamily && typeof( fontFamily ) == 'string' ) {
			this._fontFamily = fontFamily;
		}

		if ( options && typeof( options ) == 'object' ) {
			if ( options['readFontAsync'] ) {
				this._options |= Font.OptionFlags.ReadFontAsync;
			}
			if ( options['location'] ) {
				this._location = options['location'];
			}
			if ( options['size'] ) {
				this._size = options['size'];
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
								this._fontFamily,
								this._options,
								this._location,
								this._size );

	},

	/**
	 * Destroy the `GL2.Font` object, and release the resources allocated by the font.
	 *
	 * **Note**: If another `GL2` object is using the `GL2.Font` object, the font resources will not
	 * be released.
	 * @returns {void}
	 * @status iOS, Android
	 * @since 1.8
	 */
	destroy: function()
	{
		this._destroySendGen();
		Core.ObjectRegistry.unregister( this );
	},

	/** @private */
    _onCreateCbRecv: function( cmd ) {
		var obj = {};
		if ( this._onCreateCbRecvGen( cmd, obj ) ) {
			if ( obj['callbackId'] >= 0 ) {
				var cb = this._restoreCb( obj['callbackId'] );
				var err = obj['errCode'] ? { code:obj['errCode'], description:obj['errStr'] } : null;
                if ( !err ) {
                    this._isFontValid = true;
                }
				cb( err, this );
			}
		}
    },


// API

	/**
	 * Retrieve the name of the font family.
	 * @returns {String} The font family for this font object.
	 * @status iOS, Android
	 * @since 1.8
	 */
	getFontFamily: function()
	{
		return this._fontFamily;
	},

	/**
	 * Retrieve the location where the font family is stored.
	 * @returns {GL2.Font.FontLocation} The location where the font family is stored.
	 * @status iOS, Android
	 * @since 1.8
	 */
	getFontLocation: function()
	{
		return this._location;
	},

	/**
	 * Retrieve the font size.
	 * @returns {Number} The font size, in pixels per em.
	 * @status iOS, Android
	 * @since 1.8
	 */
	getFontSize: function()
	{
		return this._size;
	},
	
	/**
	 * Enumeration for font loading errors.
	 * @name ErrorCode
	 * @fieldOf GL2.Font#
	 */
	
	/**
	 * No error occurred.
	 * @name ErrorCode.NoError
	 * @fieldOf GL2.Font#
	 * @constant
	 */

	/**
	 * An unknown error occurred.
	 * @name ErrorCode.Unknown
	 * @fieldOf GL2.Font#
	 * @constant
	 */

	/**
	 * The requested font was not found.
	 * @name ErrorCode.NotFound
	 * @fieldOf GL2.Font#
	 * @constant
	 */

	/**
	 * The requested operation is not available.
	 * @name ErrorCode.Unsupported
	 * @fieldOf GL2.Font#
	 * @constant
	 */
	
	/**
	 * Enumeration for font loading options.
	 * @name OptionFlags
	 * @fieldOf GL2.Font#
	 * @private
	 */

	/**
	 * Use the default options.
	 * @name OptionFlags.DefaultOptions
	 * @fieldOf GL2.Font#
	 * @constant
	 * @private
	 */

	/**
	 * Load the font asynchronously.
	 * @name OptionFlags.ReadFontAsync
	 * @fieldOf GL2.Font#
	 * @constant
	 * @private
	 */

	/**
	 * Enumeration to choose the source of fonts for `GL2.Font`.
	 * @name FontLocation
	 * @fieldOf GL2.Font#
	 */

	/**
	 * Use the default fonts, which are the system fonts. Equivalent to
	 * `{@link GL2.Font#FontLocation.System}`.
	 * @name FontLocation.Default
	 * @fieldOf GL2.Font#
	 * @constant
	 */

	/**
	 * Use the system fonts.
	 * @name FontLocation.System
	 * @fieldOf GL2.Font#
	 * @constant
	 */

	/**
	 * Use the fonts that are bundled with ngCore. Not currently supported.
	 * @name FontLocation.Bundled
	 * @fieldOf GL2.Font#
	 * @constant
	 * @ignore
	 */

	/**
	 * Use custom fonts that are loaded through the application manifest.
	 * @name FontLocation.Manifest
	 * @fieldOf GL2.Font#
	 * @constant
	 */

// {{?Wg Generated Code}}
	
	// Enums.
	ErrorCode:
	{ 
		NoError: 0,
		Unknown: -1,
		NotFound: -2,
		Unsupported: -3
	},
	
	FontLocation:
	{ 
		Default: 0,
		System: 1,
		Bundled: 2,
		Manifest: 3
	},
	
	OptionFlags:
	{ 
		DefaultOptions: 0,
		ReadFontAsync: 1
	},
	
	///////
	// Class constants (for internal use only):
	_classId: 369,
	// Method create = -1
	// Method destroy = 2
	// Method onCreateCb = 3
	
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
				
				case 3:
					instance._onCreateCbRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in Font._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in Font._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[369] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_onCreateCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 3 )
		{
			NgLogE("Could not parse due to wrong argument count in Font.onCreateCb from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in Font.onCreateCb from command: " + cmd );
			return false;
		}
		
		obj[ "errCode" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "errCode" ] === undefined )
		{
			NgLogE("Could not parse errCode in Font.onCreateCb from command: " + cmd );
			return false;
		}
		
		obj[ "errStr" ] = Core.Proc.parseString( cmd[ 2 ] );
		if( obj[ "errStr" ] === undefined )
		{
			NgLogE("Could not parse errStr in Font.onCreateCb from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId, callbackId, fontFamily, options, fontLocation, fontSize )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x171ffff, [ +__objectRegistryId, +callbackId, Core.Proc.encodeString( fontFamily ), +options, +fontLocation, +fontSize ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1710002, this );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId, callbackId, fontFamily, options, fontLocation, fontSize ) {}
	
	// destroy: function(  ) {}
	
	// _onCreateCbRecv: function( cmd ) {}
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});
