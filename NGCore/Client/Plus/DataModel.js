var ClassReq = require("./../Core/Class");
var MessageEmitterReq = require("../../Shared/MessageEmitter");
var FileSystemReq = require("../Storage/FileSystem");

/**
 * DataModel is super class for data that can be fetched from Plus+ API.
 *
 * Mutability Property:  instances of DataModel are "mutable".  This means
 * that:
 *
 * - request for same object will return the same pointer
 *
 * - when an action results in an updated object, all existing pointer(s)
 *   to that object will see the updated values (beacuse those pointers
 *   point to the same instance)
 *
 * This design means this restriction: never use 'new' method to get
 * a data model object.  Instead, always use the public API methods.  Note
 * also that this design takes advantage of the fact that JavaScript
 * is single-threaded and event-driven.  This design will break if
 * somehow the JavaScript application is no longer single-threaded.
 *
 * This design gives this advantage:  UI code holding onto object pointers can
 * simply render the values from those objects, and they are the most
 * up-to-date value that client library currently keeps.  This simplicity makes
 * it easier for developers.
 *
 * @class DataModel
 */
var DataModel = MessageEmitterReq.MessageEmitter.subclass({
/** @lends Plus.DataModel.prototype */
	classname: "DataModel",
	entityTag: null,
	initialize: function($super, recordID){
		$super();
		this.recordID = recordID;
	},
//  cache utils
	_classname: function(){
		var classname = this.classname;
		return classname;
	},
	_registerWithLocalCache: function(){
		var classname = this._classname();
		var category = DataModel._localCache[classname];
		if(!category){
			category = {};
			DataModel._localCache[classname] = category;
		}

		var object = category[this.recordID];
		if(object){
			return object;
		}else{
			category[this.recordID] = this;
			return this;
		}
	},
	_deregisterWithLocalCache: function(){
		var classname = this._classname();
		var category = DataModel._localCache[classname];
		if(category){
			category[this.recordID] = undefined;
		}
	},
	_existsInLocalCache: function(){
		var classname = this._classname();
		var category = DataModel._localCache[classname];
		return (category && (category[this.recordID] == this));
	},
	_serializedHash: function(){
		var theClass = this.constructor;
		var hash = {classname: theClass.classname, recordID: this.recordID,  data: {}};
		
		var properties = this.constructor._serializableProperties || [];
		for(var idx = 0; idx < properties.length; idx++){
			var propertyName = properties[idx];
			var propertyValue = this[propertyName];
			
			if(propertyValue instanceof(DataModel)){
				propertyValue = propertyValue._serializedHash();
			}
			
			hash.data[propertyName] = propertyValue;
		}
		
		return hash;
	},
	_deserializeFromHash: function(hash){
		var classname = hash.classname;
		var data = hash.data;
		for(var key in data){
			var value = data[key];
			if(value && value.hasOwnProperty && value.hasOwnProperty("classname") && value.hasOwnProperty("data") && value.hasOwnProperty("recordID")){
				var theClassname = value.classname;
				var theClass = DataModel._subclasses[theClassname];
				var theRecordID = value.recordID;
				if(theClass && theRecordID){
					var theInstance = DataModel.getObjectWithRecordID(theClassname, theRecordID);
					if(!theInstance){
						theInstance = new theClass(theRecordID);
					}
					
					theInstance._deserializeFromHash(value.data);
					theInstance._registerWithLocalCache();

					value = theInstance;
				}
			}
			this[key] = value;
		}
	}
});

DataModel._subclasses = {};

var oldSubclass = DataModel.subclass;
DataModel.subclass = function(hash){
	var name = hash.classname;
	
	var theClass = oldSubclass.call(DataModel, hash);
	
	DataModel._subclasses[name] = theClass;
	return theClass;
};

DataModel.defineSetterCallbacks = function(theClass, names){
	for(var idx=0; idx<names.length; idx++){
		var idxName = names[idx];
		
		(function(name){
			theClass.prototype.__defineSetter__(name, function(value){
				this["___" + name] = value;
				this.emit({name: value});
			});
			theClass.prototype.__defineGetter__(name, function(value){
				return this["___" + name];
			});
		})(idxName);
	}
	
	theClass._serializableProperties = names;
};

DataModel._localCache = {};

DataModel.getObjectWithRecordID = function(classname, recordID){
	var category = DataModel._localCache[classname];
	if(category){
		return category[recordID] || null;
	}else{
		return null;
	}
};

DataModel._saveCachedObjects = function(path, cb){
	var hashes = [];
	for(var theClassname in DataModel._localCache){
		var category = DataModel._localCache[theClassname];
		for(var recordID in category){
			var object = category[recordID];
			var hash = object._serializedHash();
			hashes.push(hash);
		}
	}
	
	var data = JSON.stringify(hashes);
	FileSystemReq.FileSystem.writeFile(path, data, false, function(err){
		if(err){
			NgLogD("Plus.DataModel: Couldn't save cache " + JSON.stringify(err));
 		}
		cb(err);
	});
};

DataModel._loadCachedObjects = function(path, cb){
	FileSystemReq.FileSystem.readFile(path, {}, function(err, data){
		if(err){
			NgLogD("Plus.DataModel: Couldn't load cache " + JSON.stringify(err));
			cb(err);
			return;
		}
		
//		NgLogD("Loading cached objects from " + path + ": " + data);
		
		var hashes = JSON.parse(data);
		var objects = [];
		
		for(var idx = 0; idx < hashes.length; idx++){
			var hash = hashes[idx];
//			NgLogD("Loading cached object from hash: " + JSON.stringify(hash));
			if(hash.hasOwnProperty("classname") && hash.hasOwnProperty("data") && hash.hasOwnProperty("recordID")){
				var theClassname = hash.classname;
				var theClass = DataModel._subclasses[theClassname];
				var theRecordID = hash.recordID;
//				NgLogD("Loading cached class " + theClassname + " with record ID " + theRecordID + "(" + theClass + ")");
				if(theClass && theRecordID){
					var theInstance = DataModel.getObjectWithRecordID(theClassname, theRecordID);
					if(!theInstance){
//						NgLogD("Generating new " + theClassname + " instance with record ID " + theRecordID);
						theInstance = new theClass(theRecordID, {});
					}

					theInstance._deserializeFromHash(hash);
					theInstance._registerWithLocalCache();
				}
			}
		}
		
		cb(null);
	});
};

exports.DataModel = DataModel;
