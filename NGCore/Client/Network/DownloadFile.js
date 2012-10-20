////////////////////////////////////////////////////////////////////////////////
// Class DownloadFile
// Downloads a file to the sandbox
//
// Copyright (C) 2010 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var ObjectRegistry = require('../Core/ObjectRegistry').ObjectRegistry;
var Class = require('../Core/Class').Class;

////////////////////////////////////////////////////////////////////////////////

exports.DownloadFile = Class.subclass(
/** @lends Network.DownloadFile.prototype */
{
	classname: 'DownloadFile',
	/**
	 * @class The `DownloadFile` class constructs objects that conduct a file download through an
	 * HTTP request.
	 * @constructs The default constructor. 
	 * @augments Core.Class
	 * @since 1.0
	 */
	initialize: function() {},

	/**
	 * Initiate a file download.
	 * @example
	 * var url = "http://example.com/sample-file.png";
	 * var filename = "./Content/sample-file.png";
	 * var downloader = new Network.DownloadFile();
	 * downloader.start(filename, "GET", url, [{item: "From", content: "user@example.com"}],
	 *   function(status, md5, responseHeaders) {
	 *     console.log("Downloaded " + filename + ". Status code: " + status + 
	 *       ", MD5: " + md5);
	 *     console.log("Response headers: " + JSON.stringify(responseHeaders));
	 * });
	 * @param {String} filename A local and relative path for storing the downloaded data.
	 * @param {String} method The HTTP method to use.  Specify either `GET` or
	 *		`POST`.
	 * @param {String} url The URL of the downloaded file.
	 * @param {Object[]|String[]} headers An array providing custom headers for the HTTP request.
	 *		The array can contain either strings that contain raw text for the headers (for example,
	 *		`["From: user@example.com"]`) or objects with an `item` property representing a key and
	 *		a `content` property representing a value (for example, `[{item: "From", content:
	 *		"user@example.com"}]`). If you do not need to provide custom headers, pass in an empty
	 *		array.
	 * @cb {Function} [callback] The function to call after the download is complete.
	 * @cb-param {String} statusCode The status code that was received when downloading the file.
	 * @cb-param {String} fileSignature An MD5 checksum of the downloaded file.
	 * @cb-param {Object[]} responseHeaders An array of headers from the HTTP response. The array
	 *		contains objects with an `item` property representing a key and a `content` property
	 *		representing a value (for example, `[{item: "Location", content:
	 *		"http://example.com/sample-file.png"}]`).
	 * @cb-returns {void}
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	start: function(filename, method, url, headers, callback)
	{
		ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);

		url = url.split(' ').join('%20');
		// Check headers
		if (!(headers instanceof Array))
		{
			if(headers){
				NgLogE('Improper headers sent('+headers+'). Need an array, ex: [{item:"Content-Easter", content:"egg"}]');
			}
			headers = [];
		}

		// Send the goods
		this.__sendSendGen( filename, method, url, headers.length );

		// Send headers
		for (var i in headers)
		{
			this.__headerSendGen(headers[i].item, headers[i].content);
		}

		// Save the callback
		this.mCB = callback;
	},

    /**
      * Stop a file download.
      * @returns {void}
      * @status Flash, Test, FlashTested
      * @since 1.4.1
      */
	abort: function()
	{
		this._destroySendGen();
		ObjectRegistry.unregister(this);
	},

// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 341,
	// Method create = -1
	// Method destroy = 2
	// Method _send = 3
	// Method _header = 4
	// Method finish = 5
	// Method finishWithHeaders = 6
	
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
					instance._finishRecv( cmd );
					break;
				case 6:
					instance._finishWithHeadersRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in DownloadFile._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in DownloadFile._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[341] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_finishRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in DownloadFile.finish from command: " + cmd );
			return false;
		}
		
		obj[ "status" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "status" ] === undefined )
		{
			NgLogE("Could not parse status in DownloadFile.finish from command: " + cmd );
			return false;
		}
		
		obj[ "signature" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "signature" ] === undefined )
		{
			NgLogE("Could not parse signature in DownloadFile.finish from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_finishWithHeadersRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 3 )
		{
			NgLogE("Could not parse due to wrong argument count in DownloadFile.finishWithHeaders from command: " + cmd );
			return false;
		}
		
		obj[ "status" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "status" ] === undefined )
		{
			NgLogE("Could not parse status in DownloadFile.finishWithHeaders from command: " + cmd );
			return false;
		}
		
		obj[ "signature" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "signature" ] === undefined )
		{
			NgLogE("Could not parse signature in DownloadFile.finishWithHeaders from command: " + cmd );
			return false;
		}
		
		obj[ "headers" ] = Core.Proc.parseString( cmd[ 2 ] );
		if( obj[ "headers" ] === undefined )
		{
			NgLogE("Could not parse headers in DownloadFile.finishWithHeaders from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x155ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1550002, this );
	},
	
	/** @private */
	__sendSendGen: function( fileName, method, url, headers )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1550003, this, [ Core.Proc.encodeString( fileName ), Core.Proc.encodeString( method ), Core.Proc.encodeString( url ), +headers ] );
	},
	
	/** @private */
	__headerSendGen: function( item, content )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendSubcommandToCommandString( [ Core.Proc.encodeString( item ), Core.Proc.encodeString( content ) ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// _send: function( fileName, method, url, headers ) {}
	
	// _header: function( item, content ) {}
	
	// _finishRecv: function( cmd ) {}
	// _finishWithHeadersRecv: function( cmd ) {}
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

	,
	_finishRecv: function( cmd )
	{
		this._destroySendGen();
		
		var obj = {};
		this._finishRecvGen(cmd, obj);

		if (this.mCB)
			this.mCB(obj.status, obj.signature, {});

		ObjectRegistry.unregister(this);
	},

	_finishWithHeadersRecv: function( cmd )
	{
		this._destroySendGen();
		
		var obj = {};
		this._finishWithHeadersRecvGen(cmd, obj);


		if (this.mCB)
		{
			var headerEx = /^([\w-]+):\s*([^\n]+?)\s*$/;

			var headers = [];
			var lines = obj.headers.split('\n');

			for(var i = 0; i < lines.length; i++)
			{
				var match = headerEx.exec(lines[i]);
				if(match)
					headers.push({"item": match[1], "content": match[2]});
			}

			this.mCB(obj.status, obj.signature, headers);
		}
	
		ObjectRegistry.unregister(this);
	}
});
