var GSGlobals = require("../../_Internal/GSGlobals");

var Core = require("../../../../Client/Core").Core;
var CacheR = require("../Models/Cache");

var SocialR = require('../../../Social');
var SessionR = require('./Session');

/**
 * <code>Dispatcher</code> objects know about <code>DataModel</code> objects and can "push" <code>DataModel</code> objects between interpreters.
 * <code>Dispatcher</code> objects can find classes and specific instances of objects, and may invoke their functions.
 * <code>Dispatcher</code> objects also provide a series of convenience functions to facilitate communication between interpreters.
 * @class 
 * @name Social.US.Dispatcher
 * @private
 */
var Dispatcher = exports.Dispatcher = {
				
	classname: "Dispatcher",
	callbackUIDCounter: 0,
	callbacks: {
		"-2": {},
		"-1": {}
	},
	
	/**
	 * Returns the data cache for the current session.
	 * @name Social.US.Dispatcher.cache
	 * @function
	 * @private
	 *
	 * @return {Social.US.Cache} The data cache for the current session.
	 * @see Social.US.Cache
	 */		
	cache: function(){		
		try {		
			return SessionR.Session.getCurrentSession().dataCache();
		}
		catch (err) {
			NgLogD("Mobage/Dispatcher/cache-Warning: cannot get cache. NOTE: This may be expected behavior if early on in initialization. Err=" 
				+ err);

			return null;
		}
	},
	
	
	/**
	 * Gets the current session and loads session data.
	 * If there is no current session, <code>receiveSession()</code> creates a new session.
	 *	 
	 * @name Social.US.Dispatcher.receiveSession
	 * @function
	 * @private
	 *
	 * @param {Type} command Takes a command, which may include the platform version, server mode, application name and application version. 
	 */		
	receiveSession: function(command){		
		var session = SessionR.Session.getCurrentSession();
		if(!session){
			session = new SessionR.Session();
			SessionR.Session._currentSession = session;
		}
		
		var userData = command.data.userData;
		if(userData){
			// the User object will be cached implicitly, then loaded in _loadSessionData
			Dispatcher.receiveObject({data: userData});
		}
		
		session._loadSessionData(command.data);
		
		if(SessionR.Session._emitter){
			SessionR.Session._emitter.emit({session: session});
		}
	},
	
	// DataModel communication
	/**
	 * Finds a particular instance of an object in the local interpreter and calls a method on the object.
	 *	 
	 * @name Social.US.Dispatcher.callMethodOnLocalObject
	 * @function
	 * @private
	 *
	 * @param {Command} command Takes a command object that identifies the class name of the object, 
     * its record ID, the method name to call, and any parameters for the method.
	 * The command object takes an optional callback and <code>callMethodOnLocalObject()</code> returns returns the result 
     * and/or any error code and description to the callback function.
	 */		
	callMethodOnLocalObject: function(command){		
		var recordID = command.recordID;
		var classname = command.classname;
		
		var object = Dispatcher.cache().getObjectWithRecordID(classname, recordID);
		if(object){
			var methodName = command.methodName;

			var error = false;
			var args;
			var retVal;
			if(methodName instanceof Array) {
				var methodOwner = object;
				for(var idx = 0; idx < methodName.length; idx++) {
					if(typeof methodOwner[methodName[idx]] == "function") {
						args = Dispatcher.convertArgumentsArrayFromJSON(command.arguments[idx] || []);
						retVal = methodOwner[methodName[idx]].apply(methodOwner, args);
						methodOwner = retVal;						
					}
					else {
						error = true;
						break;
					}
				}
			}
			else {
				if(typeof object[methodName] == "function") {
					args = Dispatcher.convertArgumentsArrayFromJSON(command.arguments || []);
					retVal = object[methodName].apply(object, args);
				}
				else {
					error = true;
				}
			}
			
			if(error) {
				NgLogD("ERROR: Invalid methods for calling on local object: " + command.recordID + " " + methodName);
			}
			else if(command.callback){
				var callback = Dispatcher.convertFunctionFromJSON({callbackUID: command.callback});
				if(callback){
					callback(retVal);
				}
			}
		}
	},
	
	
	/**
	 * Finds a particular instance of an object in a remote interpreter and calls a method on the remote object.
	 *	 
	 * @name Social.US.Dispatcher.callMethodOnRemoteObject
 	 * @function
 	 * @private
 	 *
	 * @param {Number} object The object reference (i.e., typically the keyword 'this').
	 * @param {String} method The method name to call.
	 * @param {Array} args An array of parameters for the method, including other <code>DataModel</code> objects or functions.
	 * @param {Function} cb Returns the result and/or any error code and description to the callback function.
	 *
	 * <b>Note:</b> If the target method wants a callback as one/more of its arguments, supply it as an element in the argument array, <b>NOT</b> as the fourth parameter.
	 */			
	callMethodOnRemoteObject: function(object, method, args, cb){		
		if(!object || !method){
			NgLogD("Public.Dispatcher.callMethodOnRemoteObject - bailing");
			if(cb){
				cb();
			}
			return;
		}

		args = Dispatcher.convertArgumentsArrayToJSON(args || []);
		
		var cmd = {
			apiURL: "US.Dispatcher.callMethodOnLocalObject",
			recordID: object.recordID,
			classname: object._classname(),
			methodName: method,
			arguments: args,
			callback: Dispatcher.convertFunctionToJSON(cb)
		};
		
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},

	/**
	 * Calls a static method on a class in the local interpreter.
	 *	 
	 * @name Social.US.Dispatcher.callClassMethodOnLocalObject	
	 * @function
	 * @private
	 *
	 * @param {Command} command Takes a command object that identifies the class name of the object, the method name to call, and any parameters for the method.
	 * The command parameter takes an optional callback function and <code>callMethodOnLocalObject()</code> returns returns the result and/or any error code and description to the callback function.
	 */		
	callClassMethodOnLocalObject: function(command){		
		Dispatcher.beginBatching();
		
		var classname = command.classname;
		var methodName = command.methodName;
		if(classname && methodName){
			var theClass = SocialR.Social.US[classname];
			if(!theClass){
				theClass = SocialR.Social.US.Service[classname];
			}
			
			if(theClass){
				var error = false;
				var args;
				var retVal;
				if(methodName instanceof Array) {
					var methodOwner = theClass;
					for(var idx = 0; idx < methodName.length; idx++) {
						if(typeof methodOwner[methodName[idx]] == "function") {
							args = Dispatcher.convertArgumentsArrayFromJSON(command.arguments[idx] || []);
							retVal = methodOwner[methodName[idx]].apply(methodOwner, args);
							methodOwner = retVal;						
						}
						else {
							error = true;
							break;
						}
					}
				}
				else {
					if(typeof theClass[methodName] == "function") {
						args = Dispatcher.convertArgumentsArrayFromJSON(command.arguments || []);
						retVal = theClass[methodName].apply(theClass, args);
					}
					else {
						error = true;
					}
				}
				
				if(error) {
					NgLogD("ERROR: Invalid methods for calling on local Class: " + classname + " " + methodName);
				}
				else if(command.callback){
					var callback = Dispatcher.convertFunctionFromJSON({callbackUID: command.callback});
					if(callback){
						callback(retVal);
					}
				}				
			}
		}
		
		Dispatcher.endBatching();
	},

	/**
	 * Calls a static method on a class in a remote interpreter.
	 *	 
	 * @name Social.US.Dispatcher.callClassMethodOnRemoteObject
	 * @function
	 * @private
	 *
	 * @param {String} theClass The name of the class.
	 * @param {String} method The method name to call.
	 * @param {Array} args An array of parameters for the method.
	 * @param {Function} cb <code>callClassMethodOnRemoteObject()</code> returns returns the result and/or any error code and description to the callback function.
	 * 
	 */			
	callClassMethodOnRemoteObject: function(theClass, methodName, args, cb){		
		if(!theClass || !methodName){
			NgLogD("Public.Dispatcher.callClassMethodOnRemoteObject - bailing");
			if(cb){
				cb();
			}
			return;
		}

		args = Dispatcher.convertArgumentsArrayToJSON(args || []);
		
		var cmd = {
			apiURL: "US.Dispatcher.callClassMethodOnLocalObject",
			classname: (theClass.classname ? theClass.classname : theClass),
			methodName: methodName,
			arguments: args,
			callback: (cb ? Dispatcher.convertFunctionToJSON(cb) : null)
		};
		
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},


	// callback communication

	/**
  	 * Takes a callback and sends it to a remote interpreter.
	 *	 
	 * @name Social.US.Dispatcher.sendCallbackToRemote
	 * @function
	 * @private
	 *
	 * @param {String} callbackUID The user ID of the user receiving the callback.
	 * @param {Array} args An array of parameters for the callback function.
	 */		
	sendCallbackToRemote: function(callbackUID, args){		
		args = Dispatcher.convertArgumentsArrayToJSON(args || []);
		
		var cmd = {
			apiURL: "US.Dispatcher.receiveCallbackFromRemote",
			callbackUID: callbackUID,
			arguments: args,
			zone: GSGlobals.getRouterInstance().zone
		};

		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},
	
	/**
	 * Receives a callback from a remote interpreter and provides the arguments to the local callback function.
	 *	 
	 * @name Social.US.Dispatcher.receiveCallbackFromRemote
	 * @function
	 * @private
	 *
	 * @param {Type} command A JSON object containing the user ID of the user receiving the callback and the callback arguments array.
	 */			
	receiveCallbackFromRemote: function(command){
		var callback = Dispatcher.callbacks[GSGlobals.getRouterInstance().zone][command.callbackUID]; //Dispatcher.convertFunctionFromJSON(command);
		if(!callback){
			return;
		}

		var args = Dispatcher.convertArgumentsArrayFromJSON(command.arguments || []);
		
		callback.apply(callback, args);
	},
	

	// convenience functions to facilitate communication of all objects
	
	/**
	 * Parses a JSON array of function parameters and returns an array of function parameters.
	 *	 
	 * @name Social.US.Dispatcher.convertArgumentsArrayFromJSON
	 * @function
	 * @private
	 * 
	 * @param {Array} args An array of function parameters in JSON format.
	 * @return {Array} Returns an array of function parameters.
	 */	
	convertArgumentsArrayFromJSON: function(args){		
		var newArgs = [];
		for(var idx=0; idx < args.length; idx++){
			var arg = args[idx];
			
			if(arg && ((arg.recordID && arg.classname) || arg instanceof Array)){
				newArgs[idx] = Dispatcher.convertModelObjectFromJSON(arg);
			}else if(arg && arg.callbackUID){
				newArgs[idx] = Dispatcher.convertFunctionFromJSON(arg);
			}else{
				newArgs[idx] = arg;
			}
		}
		return newArgs;
	},

	/**
	 * Parses an array of function parameters and returns the array in JSON format.	 
	 * @name Social.US.Dispatcher.convertArgumentsArrayToJSON
	 * @function
	 * @private
	 *
	 * @param {Array} args An array of function parameters.
	 * 
	 * @returns {JSON} An array of function parameters in JSON format.
	 */
	convertArgumentsArrayToJSON: function(args){		
		var newArgs = [];
		for(var idx=0; idx < args.length; idx++){
			var arg = args[idx];
			if(arg && (arg.recordID && arg._classname && typeof arg._classname == "function" && arg._classname())){
				Dispatcher.sendObjectImmediately(arg);

				arg = Dispatcher.convertModelObjectToJSON(arg);
				newArgs[idx] = arg;
			}else if(arg && arg instanceof Array){
				arg = Dispatcher.convertArgumentsArrayToJSON(arg);
				newArgs[idx] = arg;
			}else if(arg && typeof arg == "function"){
				newArgs[idx] = Dispatcher.convertFunctionToJSON(arg);
			}else{
				newArgs[idx] = arg;
			}
		}
		return newArgs;
	},

	// convenience functions to facilitate communication of DataModel objects
	
	/**
	 * Takes a <code>DataModel</code> object and returns the object in JSON format.
	 *	 
	 * @name Social.US.Dispatcher.convertModelObjectToJSON
	 * @function
	 * @private
	 * 
	 * @param {Social.Models.DataModel} object A reference to a <code>DataModel</code> object (i.e., typically a subclass of <code>Models.DataModel</code>).
	 *
	 * @return {JSON} A <code>DataModel</code> object in JSON format.
	 */		
	convertModelObjectToJSON: function(object){		
		if(object && object.recordID && object._classname()){
			object = {
				classname: object._classname(),
				recordID:  object.recordID
			};
		}
		return object;
	},


	/**
	 * Takes a <code>DataModel</code> object in JSON format and returns the object.
	 *	 
	 * @name Social.US.Dispatcher.convertModelObjectFromJSON
 	 * @function
 	 * @private
 	 *
	 * @param {JSON} json A <code>DataModel</code> object in JSON format.
	 * 
	 * @return {Social.US.DataModel} A <code>DataModel</code> object.
	 */		
	convertModelObjectFromJSON: function(json){		
		var object = json;
		if(json.recordID && json.classname){
			var obj = Dispatcher.cache().getObjectWithRecordID(json.classname, json.recordID);
			if(obj){
				object = obj;
				if(json.data){
					object._deserializeFromHash(json.data);
				}
			}
		}else if(json instanceof Array){
			for(var idx=0; idx < json.length; idx++){
				var arg = json[idx];
				json[idx] = Dispatcher.convertModelObjectFromJSON(arg);
			}
		}
		return object;
	},

	// convenience functions to facilitate communication of functions
	
	/**
	 * Takes a function and returns the function in JSON format.
	 *	 
	 * @name Social.US.Dispatcher.convertFunctionToJSON
	 * @function
	 * @private	 
	 * 
	 * @param {function} The function to conver to JSON format.
	 * 
	 * @return {JSON} Returns a function in JSON format.
	 */		
	convertFunctionToJSON: function(fn){		
		if(fn && typeof fn == "function"){
			
			var callbackUID = ++Dispatcher.callbackUIDCounter;
			var zone = GSGlobals.getRouterInstance().zone;
			Dispatcher.callbacks[zone][callbackUID] = fn;

			fn = {
				callbackUID: callbackUID,
				zone: zone
			};
		}
		return fn;
	},


	
	/**
 	 * Takes a function expressed in JSON format and returns the function.
	 * @name Social.US.Dispatcher.convertFunctionFromJSON
	 * @function
	 * @private
	 * 
	 * @param {JSON} A function in JSON format.
	 * 
	 * @return {Function} Returns a function.
	 */	
	convertFunctionFromJSON: function(json){		
		var fn = json;
		var callbackUID = fn.callbackUID;
		var zone = fn.zone;
		
		if(callbackUID){
			var callback = Dispatcher.callbacks[zone][callbackUID];
			if(callback){
				fn = callback;
				delete Dispatcher.callbacks[zone][callbackUID];
			}else{
				fn = Dispatcher.generateCallbackForUID(callbackUID);
			}
		}
		return fn;
	},


	
	/**
	 * Takes a user ID and sends the callback to the remote interpreter.
	 *
	 * @name Social.US.Dispatcher.generateCallbackForUID
	 * @function
	 * @private
	 *	 
	 * @param {Number} The user ID.
	 * @return {Function} Returns a callback to the remote interpreter.
	 */	
	generateCallbackForUID: function(uid){		
		if(uid.callbackUID){
			uid = uid.callbackUID;
		}
		
		return function(){
			Dispatcher.sendCallbackToRemote(uid, arguments);
		};
	},
	
	
	// object sending and batching
	_batchCount: 0,
	_queuedObjects: [],
	
	/**
	 * <code>beginBatching()</code> increments the batch count.
	 * 
	 * @name Social.US.Dispatcher.
	 * @function
	 * @private
	 */	
	beginBatching: function(){		
		++Dispatcher._batchCount;
	},

	/**
	 * Decrements the batch count.
	 * Decrements the batch count and sends any objects remaining in the queue immediately.
	 *
	 * @name Social.US.Dispatcher.endBatching
	 * @function
	 * @private
	 */	
	endBatching: function(){		
		if((--Dispatcher._batchCount) === 0){
			for(var objKey in Dispatcher._queuedObjects){
				var obj = Dispatcher._queuedObjects[objKey];
				Dispatcher._queuedObjects[objKey] = undefined;
				Dispatcher.sendObjectImmediately(obj);
			}
		}
	},

	/**
	 * Takes an object and adds it to a queue, which pushes the object to the remote interpreter.
	 *
	 * @name Social.US.Dispatcher.sendObject
	 * @function
	 * @private
	 */
	sendObject: function(obj){		
		if(Dispatcher._queuedObjects.indexOf(obj) == -1){
			Dispatcher.beginBatching();
			
			var key = "" + obj.classname + "---" + obj.recordID;
			Dispatcher._queuedObjects[key] = obj;
			
			Dispatcher.endBatching();
		}
	},

	/**
	 * Takes an object and pushes it to the remote interpreter immediately (i.e., bypassing the queue).
	 *
	 * @name Social.US.Dispatcher.sendObjectImmediately
	 * @function
	 * @private
	 */
	sendObjectImmediately: function(obj){		
		if(!obj){
			return;
		}
		
		var cmd = {
			apiURL: "US.Dispatcher.receiveObject",
			data:   obj._serializedHash()
		};
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},

	/**
	 * Receives a serialized object from the remote interpreter, retrieves the local version of the same object from the cache, and deserializes the received object to the local object.
	 * If there is no local version of the received object, <code>receiveObject()</code> creates a local version and adds it to the cache; then, it deserializes the received object to the newly created local object.
	 *
	 * @name Social.US.Dispatcher.receiveObject
	 * @function
	 * @private
	 */
	receiveObject: function(command){		
		var data = command.data;
		var theRecordID  = data.recordID;
		var theClassname = data.classname;
		var theData      = data.data;
		
		if(theRecordID && theClassname && Dispatcher.cache()){
			var obj = Dispatcher.cache().getObjectWithRecordID(theClassname, theRecordID);
			if(!obj){
				var theClass = SocialR.Social.US[theClassname];
				obj = new theClass(theRecordID);
				
				Dispatcher.cache().addObject(obj);
			}

			// TODO disable emitting somehow
			if(theData){
				obj._deserializeFromHash(theData);
			}
		}
	}
};