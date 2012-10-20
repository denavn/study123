////////////////////////////////////////////////////////////////////////////////
// Class Proc
//
// Copyright (C) 2010 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Class = require('./Class').Class;
var Base64 = require('./Base64').Base64;

////////////////////////////////////////////////////////////////////////////////

// Command stream.
var $ = "";

var CSAppendMethods = {
	strPreCat: function(mid, obj, args) {
		var objId;
		if (mid << 16 < 0) {
			objId = '';
			// the "obj" arg will be missing here
			args = obj;
		} else {
			objId = ','+obj.__objectRegistryId;
		}
		mid = ":" + (mid >> 16) + "," + (mid << 16 >> 16);
		
		switch (args ? args.length : 0) {
			case  0: $+=mid+objId+',';break;
			case  1: $+=mid+objId+','+args[0];break;
			case  2: $+=mid+objId+','+args[0]+','+args[1];break;
			case  3: $+=mid+objId+','+args[0]+','+args[1]+','+args[2];break;
			case  4: $+=mid+objId+','+args[0]+','+args[1]+','+args[2]+','+args[3];break;
			case  5: $+=mid+objId+','+args[0]+','+args[1]+','+args[2]+','+args[3]+','+args[4];break;
			case  6: $+=mid+objId+','+args[0]+','+args[1]+','+args[2]+','+args[3]+','+args[4]+','+args[5];break;
			case  7: $+=mid+objId+','+args[0]+','+args[1]+','+args[2]+','+args[3]+','+args[4]+','+args[5]+','+args[6];break;
			case  8: $+=mid+objId+','+args[0]+','+args[1]+','+args[2]+','+args[3]+','+args[4]+','+args[5]+','+args[6]+','+args[7];break;
			case  9: $+=mid+objId+','+args[0]+','+args[1]+','+args[2]+','+args[3]+','+args[4]+','+args[5]+','+args[6]+','+args[7]+','+args[8];break;
			case 10: $+=mid+objId+','+args[0]+','+args[1]+','+args[2]+','+args[3]+','+args[4]+','+args[5]+','+args[6]+','+args[7]+','+args[8]+','+args[9];break;
			case 11: $+=mid+objId+','+args[0]+','+args[1]+','+args[2]+','+args[3]+','+args[4]+','+args[5]+','+args[6]+','+args[7]+','+args[8]+','+args[9]+','+args[10];break;
			case 12: $+=mid+objId+','+args[0]+','+args[1]+','+args[2]+','+args[3]+','+args[4]+','+args[5]+','+args[6]+','+args[7]+','+args[8]+','+args[9]+','+args[10]+','+args[11];break;
			case 13: $+=mid+objId+','+args[0]+','+args[1]+','+args[2]+','+args[3]+','+args[4]+','+args[5]+','+args[6]+','+args[7]+','+args[8]+','+args[9]+','+args[10]+','+args[11]+','+args[12];break;
			default:
				$+=mid+objId+','+args[2]+','+args[3]+','+args[4]+','+args[5]+','+args[6]+','+args[7]+','+args[8]+','+args[9]+','+args[10]+','+args[11]+','+args[12];
				for (var x = 13; x < args.length; x++) {
					$+= ','+args[x];
				}
		}
	},
	strMulCat: function(mid, obj, args) {
		var objId;
		if (mid << 16 < 0) {
			objId = '';
			// the "obj" arg will be missing here
			args = obj;
		} else {
			objId = ','+obj.__objectRegistryId;
		}
		mid = ":" + (mid >> 16) + "," + (mid << 16 >> 16);
		
		switch (args ? args.length : 0) {
			case  0: $+=mid;$+=objId;break;
			case  1: $+=mid;$+=objId;$+=args[0];break;
			case  2: $+=mid;$+=objId;$+=args[0];$+=',';$+=args[1];break;
			case  3: $+=mid;$+=objId;$+=args[0];$+=',';$+=args[1];$+=',';$+=args[2];break;
			case  4: $+=mid;$+=objId;$+=args[0];$+=',';$+=args[1];$+=',';$+=args[2];$+=',';$+=args[3];break;
			case  5: $+=mid;$+=objId;$+=args[0];$+=',';$+=args[1];$+=',';$+=args[2];$+=',';$+=args[3];$+=',';$+=args[4];break;
			case  6: $+=mid;$+=objId;$+=args[0];$+=',';$+=args[1];$+=',';$+=args[2];$+=',';$+=args[3];$+=',';$+=args[4];$+=',';$+=args[5];break;
			case  7: $+=mid;$+=objId;$+=args[0];$+=',';$+=args[1];$+=',';$+=args[2];$+=',';$+=args[3];$+=',';$+=args[4];$+=',';$+=args[5];$+=',';$+=args[6];break;
			case  8: $+=mid;$+=objId;$+=args[0];$+=',';$+=args[1];$+=',';$+=args[2];$+=',';$+=args[3];$+=',';$+=args[4];$+=',';$+=args[5];$+=',';$+=args[6];$+=',';$+=args[7];break;
			case  9: $+=mid;$+=objId;$+=args[0];$+=',';$+=args[1];$+=',';$+=args[2];$+=',';$+=args[3];$+=',';$+=args[4];$+=',';$+=args[5];$+=',';$+=args[6];$+=',';$+=args[7];$+=',';$+=args[8];break;
			case 10: $+=mid;$+=objId;$+=args[0];$+=',';$+=args[1];$+=',';$+=args[2];$+=',';$+=args[3];$+=',';$+=args[4];$+=',';$+=args[5];$+=',';$+=args[6];$+=',';$+=args[7];$+=',';$+=args[8];$+=',';$+=args[9];break;
			case 11: $+=mid;$+=objId;$+=args[0];$+=',';$+=args[1];$+=',';$+=args[2];$+=',';$+=args[3];$+=',';$+=args[4];$+=',';$+=args[5];$+=',';$+=args[6];$+=',';$+=args[7];$+=',';$+=args[8];$+=',';$+=args[9];$+=',';$+=args[10];break;
			case 12: $+=mid;$+=objId;$+=args[0];$+=',';$+=args[1];$+=',';$+=args[2];$+=',';$+=args[3];$+=',';$+=args[4];$+=',';$+=args[5];$+=',';$+=args[6];$+=',';$+=args[7];$+=',';$+=args[8];$+=',';$+=args[9];$+=',';$+=args[10];$+=',';$+=args[11];break;
			case 13: $+=mid;$+=objId;$+=args[0];$+=',';$+=args[1];$+=',';$+=args[2];$+=',';$+=args[3];$+=',';$+=args[4];$+=',';$+=args[5];$+=',';$+=args[6];$+=',';$+=args[7];$+=',';$+=args[8];$+=',';$+=args[9];$+=',';$+=args[10];$+=',';$+=args[11];$+=',';$+=args[12];break;
			default:
				$+=mid;$+=objId;$+=',';$+=args[0];$+=',';$+=args[1];$+=',';$+=args[2];$+=',';$+=args[3];$+=',';$+=args[4];$+=',';$+=args[5];$+=',';$+=args[6];$+=',';$+=args[7];$+=',';$+=args[8];$+=',';$+=args[9];$+=',';$+=args[10];$+=',';$+=args[11];$+=',';$+=args[12];
				for (var x = 13; x < args.length; x++) {
					$+= ','; $+= args[x];
				}
		}
	},
	strLoop: function(mid, obj, args) {
		var objId;
		if (mid << 16 < 0) {
			objId = '';
			// the "obj" arg will be missing here
			args = obj;
		} else {
			objId = ','+obj.__objectRegistryId;
		}
		mid = ":" + (mid >> 16) + "," + (mid << 16 >> 16);
		
		var _ = mid + objId;
		if (args) for (var i = 0, l = args.length; i < l; i++) {
			_ += ',' + args[i];
		}
		$+=_;
	}
};

var Proc = exports.Proc = Class.singleton(
{
	classname: 'Proc',
	
	initialize: function()
	{
		// $_GETENGINEENV is optional and should be added to the global scope before ngCore loads.
		/* $_GETENGINEENV() returns {
			'engine': "JSEngineType",	// eg, "v8", "SpiderMonkey", "JavaScriptCore", etc.
			'boundFunctions': {
				queueCommand: <native function>,
				queueSubcommand: <native function>,
				getCommand: <native function>,
				clearCommand: <native function>,
				
				parseInt: function,
				parseFloat: function,
				parseString: function,
				parseBinary: function,
				parseObject: function,
				
				encodeString: function,
				encodeBinary: function,
				encodeObject: function,
			}
		} */
		var env = typeof $_GETENGINEENV !== "undefined" ? $_GETENGINEENV() : undefined;
		var engine = typeof env == 'object' ? env['engine'] : undefined;
		if ( typeof env == 'object'
				&& typeof env.boundFunctions == 'object')
		{
			var bF = env.boundFunctions;
			if (bF.queueCommand) 
				this.appendToCommandString = bF.queueCommand;
			if (bF.queueSubcommand)
				this.appendSubcommandToCommandString = bF.queueSubcommand;
			if (bF.getCommand)
				this.getCommandString = bF.getCommand;
			if (bF.clearCommand)
				this.clearCommandString = bF.clearCommand;
			
			if (bF.parseInt)
				this.parseInt = bF.parseInt;
			if (bF.parseFloat)
				this.parseFloat = bF.parseFloat;
			if (bF.parseString)
				this.parseString = bF.parseString;
			if (bF.parseObject)
				this.parseObject = bF.parseObject;
			if (bF.parseBinary)
				this.parseBinary = bF.parseBinary;
			
			if (bF.encodeString)
				this.encodeString = bF.encodeString;
			if (bF.encodeObject)
				this.encodeObject = bF.encodeObject;
			if (bF.encodeBinary)
				this.encodeBinary = bF.encodeBinary;
		} else {
			// String.
			switch (engine) {
				case 'v8':
				case 'spiderMonkey':
					this.appendToCommandString = CSAppendMethods.strLoop;
					break;
				case 'webCore':
					this.appendToCommandString = CSAppendMethods.strPreCat;
					break;
				default:
				// Todo: Switch on Core.Capabilities.getPlatformOS(); Not sure it's safe to require here
					this.appendToCommandString = CSAppendMethods.strLoop;
			}
			this.appendSubcommandToCommandString = function(args) { $+= ','+args.join() };
		}
		this.clearCommandString();
	},
	
	appendToCommandString: function( str )
	{
		// Let this function initialize the singleton, but ensure pass through to real implementation.
		this.appendToCommandString.apply(this, arguments);
	},
	
	getCommandString: function()
	{
		return $;
	},
	
	clearCommandString: function ()
	{
		$ = "";
	},
	
	encodeString: Base64.encode,
	encodeBinary: Base64.encodeBinary,
	encodeObject: function(v) {
		return this.encodeString( JSON.stringify(v) );
	},
	
	parseBool: function( v )
	{
		return v == 1 ? true : false;
	},

	parseInt: function( v )
	{
		return parseInt( v, 10 );
	},
	
	parseFloat: parseFloat,
	parseString: Base64.decode,
	parseBinary: Base64.decodeBinary,
	parseObject: function( v )
	{
		return JSON.parse( this.parseString( v ) );
	},

	setPrivileged: function()
	{
		this._privileged = true;
	},

	isPrivileged: function()
	{
		return this._privileged ? true : false;
	},

// {{?Wg Generated Code}}
	///////
	// Class constants (for internal use only):
	_classId: 355,
	// Method setCoreJSVersion = -1
	// Method _loadScripts = -2
	// Method _loadScripts_push = -3
	// Method _loadScriptsComplete = -4
	
	_classRecvGen: function( cmd )
	{
		var classId = parseInt( cmd.shift(), 10 );
		
		var handler = PROC_DISPATCH_TABLE[classId];
		if(handler)
		{
			try
			{
				handler(cmd);
			}
			catch (ex)
			{
				NgHandleException(ex);
			}
		}
		else
		{
			NgLogE( "Unknown class id " + classId + " in _classRecvGen" );
		}
	},
	
	///////
	// Class constants (for internal use only):
	// Class ID = 355
	// Method setCoreJSVersion = -1
	// Method _loadScripts = -2
	// Method _loadScripts_push = -3
	// Method _loadScriptsComplete = -4
	
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
					NgLogE("Unknown instance method id " + cmdId + " in Proc._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				case -4:
					Proc.__loadScriptsCompleteRecv( cmd );
					break;
				default:
					NgLogE("Unknown static method id " + cmdId + " in Proc._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[355] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	$__loadScriptsCompleteRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in Proc._loadScriptsComplete from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Proc.parseString( cmd[ 0 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in Proc._loadScriptsComplete from command: " + cmd );
			return false;
		}
		
		obj[ "error" ] = Proc.parseString( cmd[ 1 ] );
		if( obj[ "error" ] === undefined )
		{
			NgLogE("Could not parse error in Proc._loadScriptsComplete from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/////// Private send methods.
	
	/** @private */
	$_setCoreJSVersionSendGen: function( packedVersion )
	{
		this.appendToCommandString( 0x163ffff, [ +packedVersion ] );
	},
	
	/** @private */
	$__loadScriptsSendGen: function( callbackId, numFiles )
	{
		this.appendToCommandString( 0x163fffe, [ Proc.encodeString( callbackId ), +numFiles ] );
	},
	
	/** @private */
	$__loadScripts_pushSendGen: function( executableFilePath )
	{
		this.appendSubcommandToCommandString( [ Proc.encodeString( executableFilePath ) ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $setCoreJSVersion: function( packedVersion ) {}
	
	// $_loadScripts: function( callbackId, numFiles ) {}
	
	// $_loadScripts_push: function( executableFilePath ) {}
	
	// $__loadScriptsCompleteRecv: function( cmd ) {}
	
// {{/Wg Generated Code}}

	/** @private */
	$_loadScripts: function(files, callback ) {
        if(!this._codeAddingCallbacks){
            this._codeAddingCallbacks = {uidGenerator:1};
        }
        this._codeAddingCallbacks[++this._codeAddingCallbacks.uidGenerator] = callback;
        this.__loadScriptsSendGen(this._codeAddingCallbacks.uidGenerator,files.length);
        for(var i = 0; i < files.length; i++ ){
            this.__loadScripts_pushSendGen(files[i]);
        }
    },
    
    /** @private */
	// $_loadScripts_push: function( executableFilePath ) {} -- not needed
	
	/** @private */
	$__loadScriptsCompleteRecv: function( cmd ) {
        var obj = {};
        this.__loadScriptsCompleteRecvGen(cmd,obj);

        if(this._codeAddingCallbacks.hasOwnProperty(obj.callbackId)){
            this._codeAddingCallbacks[obj.callbackId](obj.error);
            delete this._codeAddingCallbacks[obj.callbackId];
        }
    },
    /** @private */
	$load: function(file, callback) {
		if ($ng__COMBINED === true) {
		//	console.log("COMBINE MODE LAZY REQUIRE: " + file);
			setTimeout( callback.bind(null, require(file)), 1 );
			return;
		}
		
		if(this._pendingLoadCalls && arguments.length == 2){
			NgLogD("Proc.load: call already pending. Saving "+file+" for later.");
			if (typeof exception_demangle_require != "undefined") {
				NgLogD(exception_demangle_require(file));
			}
			this._pendingLoadCalls.push(function(){
				NgLogD("Proc.load: resuming saved load call for "+file);
				if (typeof exception_demangle_require != "undefined") {
					NgLogD(exception_demangle_require(file));
				}
				Proc.load(file,callback,true);
});
			return;
		} else if(!this._pendingLoadCalls){
			this._pendingLoadCalls = [];
		}
		
		var file_noext = file.replace(/\.js/,'');
		
//		var entryPointIndex = $APP_VALIDENTRYPOINTS.indexOf(file);
//		if (entryPointIndex == -1){
//			NgLogD("Proc.load: illegal program entry point! Entry must match manifest.loadable! '"+file+"'");
//		}
		
		//Convert Human readable to name-mangled if necessary.
		if(typeof $APP_REQUIREPATHMAP != "undefined" && file in $APP_REQUIREPATHMAP){
			file = $APP_REQUIREPATHMAP[file];
		}
		
		var postLoad = function(){
			NgLogD("Proc.load (postLoad) "+file);
			
			if(this._pendingLoadCalls.length){
				var next = this._pendingLoadCalls.shift();
				next();
			} else {
				this._pendingLoadCalls = null;
			}
			
			// Finally we call the 'previous' Proc.load's callback.
			callback(require(file));
		}.bind(this);
		
		//if (Core.Capabilities.getRequireIsSynchronous()) {
		//	postLoad();
		//} else {
			var array = [];
			// Scan the $APP_REQUIREPATHS array for the requested file.
			// This will be our only linear scan, because dependencies are tracked by ID.
		if (typeof $APP_REQUIREPATHS != "undefined") { //check for reference error
			var rPathIndex = $APP_REQUIREPATHS.indexOf(file);
			if (rPathIndex >= 0) {
				// All this means is that the file has not been included from anywhere else yet.
				delete $APP_REQUIREPATHS[rPathIndex];
				addDependencies(array, rPathIndex);
				/*jsl:ignore*/
				if(!$MODULE_FACTORY_REGISTRY[file]){
				/*jsl:end*/
					array.push(file + ".js");
				}
				
				// Call the system call to actually load the file.
				if(array.length){
					NgLogD("Proc.load: Loading '" + file + "'!");
					NgLogD(JSON.stringify(array));
					Proc._loadScripts(array,postLoad);
				} else {
					NgLogD("Proc.load: no files to load "+file);
					setTimeout(postLoad,1);
				}
			} else {
				NgLogD("Proc.load: Skipping '" + file + "' because it was already included.");
				setTimeout(postLoad,1);
			}
	 	}
	}
});


// Destructive Pre-order traversal of flattened n-ary tree 
var addDependencies = function(array, rPathIndex) {
	if (!$APP_DEPENDENCYTABLE || !$APP_REQUIREPATHS){return;}
	var dependencies = $APP_DEPENDENCYTABLE[rPathIndex];
	if (!(dependencies instanceof Array)) return;
	var depRPIndex;
	while (depRPIndex = dependencies.shift()) {
		// Read the file's name from the $APP_REQUIREPATHS array, if it exists.
		var depRPath = $APP_REQUIREPATHS[depRPIndex];
		// This is our condition to prevent cycles, since we delete it when processing.
		if (depRPath) {
			// Delete this entry from the array before traversing into it.
			delete $APP_REQUIREPATHS[depRPIndex];
			// If there are dependencies for this file, process them first.
			addDependencies(array, depRPIndex);
			// Add the file itself right after the dependencies.
			/*jsl:ignore*/
			if(!$MODULE_FACTORY_REGISTRY[depRPath]){ // Only if it hasn't already been loaded.
			/*jsl:end*/
				array.push(depRPath + ".js");
			}
		}
	}
};
