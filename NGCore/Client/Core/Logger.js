var Class = require('./Class').Class;
var Proc = require('./Proc').Proc;
var ObjectRegistry = require('./ObjectRegistry').ObjectRegistry;
var sprintf = require('../../Shared/Lib/sprintf').sprintf;
var Base64 = require('./Base64').Base64;

var Logger = Class.singleton(
/** @lends Core.Logger.prototype */
{
	classname: 'Logger',

	initialize: function()
	{
		ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
        timingLog = function(message, argv) {};
	},

	/** @private */
	_disable: function()
	{
		console.log("Logger : javascript logging disabled");
        console.log = Logger.log = function(message, argv) {};
        timingLog = function(message, argv) {};
	},

	_enable: function(timingOnly)
	{

        timingLog = function(message, argv)
        {
	    var i;
            if (arguments.length > 1) {
                try {
                    var params = [];
                    for (i = 0; i < arguments.length; ++i) {
                        params[i] = arguments[i];
                    }
                    var result = sprintf(params);
                    params.unshift(result);
                    message = params.join(" ");
                } catch (err) {
                    var concat = [];
                    for (i = 0; i < arguments.length; ++i) {
                        concat[i] = arguments[i];
                    }
                    message = concat.join(" ");
                }
            }
            __underscore_SysLog(message);
        };

        if (timingOnly) {
            return;
        }

        console.log = Logger.log = function(message, argv)
        {
            if (arguments.length > 1) {
		var i;
                try {
                    var params = [];
                    for (i = 0; i < arguments.length; ++i) {
                        params[i] = arguments[i];
                    }
                    var result = sprintf(params);
                    params.unshift(result);
                    message = params.join(" ");
                } catch (err) {
                    var concat = [];
                    for (i = 0; i < arguments.length; ++i) {
                        concat[i] = arguments[i];
                    }
                    message = concat.join(" ");
                }
            }
            __underscore_SysLog(message);
        };
        console.log("Logger : javascript logging enabled");
	},

	/**
	 * Log a message to the development console.
	 * @param {string} message
	 * @param {Array} argv Additional arguments to log.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	log: function(message, argv)
	{
		
	},
	
// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 305,
	// Method create = -1
	// Method log = 2
	
	/** 
	 * Command dispatch.
	 * @private
	 */
	$_commandRecvGen: (function() { var h = (function ( cmd )
	{
		var cmdId = Proc.parseInt( cmd.shift(), 10 );
		
		if( cmdId > 0 )	// Instance Method.
		{
			var instanceId = Proc.parseInt( cmd.shift(), 10 );
			var instance = ObjectRegistry.idToObject( instanceId );
			
			if( ! instance )
			{
				NgLogE("Object instance could not be found for command " + cmd + ". It may have been destroyed this frame.");
				return;
			}
			
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown instance method id " + cmdId + " in Logger._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in Logger._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[305] = h; return h;})(),
	
	/////// Private recv methods.
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Proc.appendToCommandString( 0x131ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_logSendGen: function( msg )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Proc.appendToCommandString( 0x1310002, this, [ Proc.encodeString( msg ) ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// log: function( msg ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});

Logger.instantiate();

__underscore_SysLog = function(_massage)
{
	Logger._logSendGen( _massage );
};

// JMarr Don't override console.log when on flash.
if(typeof(_NG_TARGET_FLASH) == 'undefined')
	console.log = Logger.log;

exports.Logger = Logger;
