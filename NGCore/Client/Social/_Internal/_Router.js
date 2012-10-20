////////////////////////////////////////////////////////////////////////////////
// Class Router INTERNAL ROUTING CLASS
//
// Copyright (C) 2010 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////


var Class = require('../../../Shared/Class').Class;
var Core = require('../../Core').Core;
var GSCommand = require("./GSCommand");
var Public = require("../../Social").Social;

////////////////////////////////////////////////////////////////////////////////
var RouterVerbose = false;

exports.Router = Class.subclass(
/** @lends GameService.Router.prototype */
{
	classname: 'Router',
	
	/**
	 * Function.
	 * @constructs
	 * @augments Core.Class
	 */
	initialize: function()
	{
		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
	},
	
	/** Member var to help shortcircuit uneccessary bounces out to native. */
	zone:-2,
	
// {{?Wg Generated Code}}
	
	// Enums.
	/** 
			* Zone for this Router Singleton (per-process)
			* @private */
	Zone:
	{ 
		/** Public Zone */
		Public: -2,
		/** GameService Zone */
		GameService: -1
	},
	
	///////
	// Class constants (for internal use only):
	_classId: 346,
	// Method create = -1
	// Method sendToOtherProcess = 2
	// Method onCreate = 3
	
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
				
				case 2:
					instance._sendToOtherProcessRecv( cmd );
					break;
				case 3:
					instance._onCreateRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in Router._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in Router._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[346] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_sendToOtherProcessRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in Router.sendToOtherProcess from command: " + cmd );
			return false;
		}
		
		obj[ "gsCommand" ] = Core.Proc.parseObject( cmd[ 0 ] );
		if( obj[ "gsCommand" ] === undefined )
		{
			NgLogE("Could not parse gsCommand in Router.sendToOtherProcess from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_onCreateRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in Router.onCreate from command: " + cmd );
			return false;
		}
		
		obj[ "zone" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "zone" ] === undefined )
		{
			NgLogE("Could not parse zone in Router.onCreate from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x15affff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_sendToOtherProcessSendGen: function( gsCommand )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x15a0002, this, [ Core.Proc.encodeObject( gsCommand ) ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// _sendToOtherProcessRecv: function( cmd ) {}
	// sendToOtherProcess: function( gsCommand ) {}
	
	// _onCreateRecv: function( cmd ) {}
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

	,
	_onCreateRecv:function(cmd) {
		if (!this._onCreateRecvGen(cmd,this)){
			return;
		}
		NgLogD("_Router/_onCreateRecv: "+this.zone);
		//We already stored the zone directly in ourselves (by passing in 'this').
	},
	_sendToOtherProcessRecv: function( cmd )
	{
		var decodedCommand = {};
		if(!this._sendToOtherProcessRecvGen(cmd,decodedCommand)){
			NgLogE("Decode of data for router, failed.");
			return;
		}
		
		var commandObject = decodedCommand["gsCommand"];
		
		//Incoming commands all get executed immediately.
		if(this.zone == this.Zone.Public) {
			if(RouterVerbose) {
				NgLogD("_Router/_sendToOtherProcessRecv - in public");
			}
			
			this.dispatchGameCommand(commandObject);
		}
		else if(this.zone == this.Zone.GameService) {
			if(RouterVerbose) {
				NgLogD("_Router/ _sendToOtherProcessRecv - not in public");
			}
			
			// Dispatch Immediately, because we are in the game interpreter
			this.dispatchGameServiceCommand(commandObject);
		}
		else {
			NgLogE("Unknown Command Zone for the GameService Router.");
			// Assume public
			this.dispatchGameCommand(commandObject);
		}
	},
 	sendToOtherProcess: function( gsCommand ) 
	{
		var jsonCommand = GSCommand.makeSafe(gsCommand);
		if(!jsonCommand) {
			NgLogD("Couldn't prep GSCommand message for sending!");
			return;
		}
		
		if(RouterVerbose) {
			NgLogD("_Router.js/sendToOtherProcess: " + JSON.stringify(jsonCommand));
		}
		
		this._sendToOtherProcessSendGen(jsonCommand);
	},
	sendCommandToGameService:function(gsCommand) 
	{		
		if(this.zone == this.Zone.Public) {
			if(RouterVerbose) {
				NgLogD("_Router: sendCommandToGameService - in public");
			}
			
			// In the Public Interface, this is an alias for sendToOtherProcess
			this.sendToOtherProcess(gsCommand);
		}
		else if(this.zone == this.Zone.GameService) {
			if(RouterVerbose) {
				NgLogD("_Router: sendCommandToGameService - not in public");
			}
			
			// Dispatch Immediately, because we are in the game interpreter
			this.dispatchGameServiceCommand(gsCommand);
		}
		else {
			NgLogE("Unknown Command Zone for the GameService Router.");
			// Assume public
			this.sendToOtherProcess(gsCommand);
		}
	},
	sendCommandToGame:function(gsCommand)
	{
		if(this.zone == this.Zone.GameService) {
			// In the GameService Interface, this is an alias for sendToOtherProcess
			this.sendToOtherProcess(gsCommand);
		}
		else if(this.zone == this.Zone.Public) {
			// Dispatch Immediately, because we are in the game interpreter
			this.dispatchGameCommand(gsCommand);
		}
		else {
			NgLogE("Unknown Command Zone for the GameService Router.");
			// Assume this is not the game
			this.sendToOtherProcess(gsCommand);
		}
	},
	dispatchGameCommand:function(jsonCommand) 
	{
		var tCommand = GSCommand.makeExecutable(jsonCommand);
		//For the time being we expect this to almost always be callbacks
		if(tCommand && tCommand.hasOwnProperty("callbackFunc")) {	
			if( typeof tCommand["callbackFunc"] == "function" ) {
				var args = null;
				var error = null;
				if(tCommand.hasOwnProperty("error")) {
					error = tCommand["error"];
				}
				if(tCommand.hasOwnProperty("callbackData")) {
					args = tCommand["callbackData"];
				}

				//Time to execute the callback function!
				tCommand["callbackFunc"](error,args);
			}
		}
		else if(tCommand) {
			// Case there was no callbackFunc this is odd!!
			var apiURL = null;
			if(tCommand && tCommand.hasOwnProperty("apiURL") ) {
				apiURL = tCommand["apiURL"];

				var apiPieces = apiURL.split(".");
				var curPackage = Public;

				
				exports._dispatchHelper(curPackage, apiPieces, jsonCommand);
			}
		}
	},
	dispatchGameServiceCommand:function(jsonCommand) 
	{
		//Don't decode the callbackId into a func when on a different interpreter!
		var apiURL = null;
		if(jsonCommand && jsonCommand.hasOwnProperty("apiURL") ) {
			apiURL = jsonCommand["apiURL"];

			var apiPieces = apiURL.split(".");
			var curPackage = require("./Privileged").Social;
			
			exports._dispatchHelper(curPackage, apiPieces, jsonCommand);
		}
		else {
			NgLogE("Someone called GameService without the proper parameters.\n");
		}
	},
	setVerboseLogging:function(useVerbose)
	{
		RouterVerbose = useVerbose;
	}
});
/** @protected */
exports._dispatchHelper = function(curPackage, apiPieces, jsonCommand){
	var nibble;
	var handedOwnership = false;
	
	while(apiPieces.length && !handedOwnership)
	{
		if (curPackage.dispatchCommand){
			curPackage.dispatchCommand(apiPieces, jsonCommand);
			handedOwnership = true;
		}
		else if (curPackage.hasOwnProperty((nibble = apiPieces.shift()))) {
			try {
				curPackage = curPackage[nibble];
			}
			catch (e){
				NgLogException(e);
			}
		}
		else {
			//Total Fail
			NgLogE("Cannot find namespace " + jsonCommand.apiURL + " in GameService");
			curPackage = null;
			break;
		}
	}

	if(!handedOwnership && curPackage && typeof curPackage == "function" ) {
		try {
			curPackage(jsonCommand);
		} catch(gsException) {
			NgLogException(gsException);
		}

		return; //done dispatching!
	}
};
