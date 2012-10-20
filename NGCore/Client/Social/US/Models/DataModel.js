var MessageEmitter = require("../../../../Client/Core/MessageEmitter").MessageEmitter;
var SocialR = require("../../../../Client/Social");
var SessionR        = require("../Data/Session");
var DispatcherR     = require("../Data/Dispatcher");

/**
 * <code>DataModel</code> constructs objects that emit messages when properties of an object change, and provides automatic caching,
 * serialization and deserialization between interpreters. 
 * <br/><br/>
 * <b>Note:</b> Do not instantiate this class directly. Use classes derived from <code>DataModel</code> for instantiation. These include:
 * <ul>
 * <li>{@link Social.US.User}</li>
 * <li>{@link Social.US.AppData}</li>
 * <li>{@link Social.US.Game}</li>
 * <li>{@link Social.US.Score}</li>
 * <li>{@link Social.US.Leaderboard}</li>
 * </ul>
 * @class 
 * @name Social.US.DataModel
 */
var DataModel = exports.DataModel = MessageEmitter.subclass({
		
	/**
	 * The default constructor.
	 * @constructs
	 * @private
	 */		
	initialize: function(recordID){
		this.recordID = recordID;

		this._cache();
	},
	beginChanges: function(){
		DispatcherR.Dispatcher.beginBatching();
	},
	endChanges: function(){
		DispatcherR.Dispatcher.endBatching();
	},
	_classname: function(){
		var classname = this.classname;
		return classname;
	},
	_cache: function(){
		if(!this._dataCache){
			var session = SessionR.Session.getCurrentSession();
			if(session){
				var cache = session.dataCache();
				if(cache){
					cache.addObject(this);
					this._dataCache = cache;
				}
			}
		}
		return this._dataCache;
	},
	$_serializedDataModel: function(obj){
		if(obj instanceof(DataModel)){
			obj = {
				classname: obj.classname,
				recordID:  obj.recordID
			};
		}
		return obj;
	},
	$_deserializedDataModel: function(value, cache){
		if(value && value.hasOwnProperty && value.hasOwnProperty("classname") && value.hasOwnProperty("recordID")){
			var theClassname = value.classname;
			var theClass = SocialR.Social.US[theClassname];
			var theRecordID = value.recordID;
			if(theClass && theRecordID){
				var theInstance = cache.getObjectWithRecordID(theClassname, theRecordID);
				if(!theInstance){
					theInstance = new theClass(theRecordID);
				}
				
				theInstance._deserializeFromHash(value.data);
				cache.addObject(theInstance);
    
				value = theInstance;
			}
		}
		return value;
	},
	_serializedHash: function(full){
		var theClass = this.constructor;
		var hash = {classname: theClass.classname, recordID: this.recordID};
		if(full === false){
			return hash; // if it's undefined, assume we want all the data
		}
		
		hash.data = {};
		
		var properties = this.constructor.properties || [];
		for(var idx = 0; idx < properties.length; idx++){
			var propertyName = properties[idx];
			var propertyValue = this[propertyName];

			if(propertyValue instanceof(Array)){
				for(var propertyIndex = 0; propertyIndex < propertyValue.length; propertyIndex++){
					propertyValue[propertyIndex] = DataModel._serializedDataModel(propertyValue[propertyIndex]);
				}
			}else{
				propertyValue = DataModel._serializedDataModel(propertyValue);
			}
			
			hash.data[propertyName] = propertyValue;
		}
		
		return hash;
	},
	_deserializeFromHash: function(data){
		if(!data){
			NgLogD("No public hash data for " + this.classname + " " + this.recordID);
			return;
		}
		
		var cache = this._cache();
		for(var key in data){
			var value = data[key];
			if(value instanceof(Array)){
				for(var propertyIndex = 0; propertyIndex < value.length; propertyIndex++){
					value[propertyIndex] = DataModel._deserializedDataModel(value[propertyIndex], cache);
				}
			}else{
				value = DataModel._deserializedDataModel(value, cache);
			}
			this[key] = value;
		}
	}
});

DataModel._oldSubclass = DataModel.subclass;
DataModel.subclass = function(contents){
	var theClass = DataModel._oldSubclass(contents);
	var properties = contents.properties || [];
	for(var idx = 0; idx < properties.length; idx++){
		var propertyName = properties[idx];
		
		(function(name){
			theClass.prototype.__defineSetter__(name, function(value){
				this["___" + name] = value;
				
				var msg = {};
				msg[""+name] = value;
				
				this.emit(msg);
			});
			theClass.prototype.__defineGetter__(name, function(value){
				return this["___" + name];
			});
		})(propertyName);
	}
	return theClass;
};
