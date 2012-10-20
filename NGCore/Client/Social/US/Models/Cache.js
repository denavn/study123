var Class = require("../../../../Client/Core/Class").Class;
var SocialR = require("../../../../Client/Social");

/**
 * <code>Cache</code> provides caching for a user's objects residing in the local interpreter.
 * @class 
 * @name Social.US.Cache
 * @private
 */
var Cache = exports.Cache = Class.subclass({


	classname: "Cache",
	inMemoryObjects: {},
	caches: {},
	
	/**
	 * Initializes a cache object upon instantiation. 
	 * @name Social.US.Cache.initialize
	 * @constructs
	 * @private
	 */			
	initialize: function(){
	},

	
	/**
	* Takes a classname and a unique record ID and returns the object or <code>null</code> if it doesn't find the object.
	*
	* @name Social.US.Cache.getObjectWithRecordID
	* @function
	* @private
	*
	* @param {String} classname The name of the class.
	* @param {Number} recordID The object ID.
	*
	* @return Returns the object corresponding to the <code>recordID</code> parameter or <code>null</code> if it doesn't find the object.
	*/
	getObjectWithRecordID: function(classname, recordID){
		var category = this.inMemoryObjects[classname];
		if(category){
			return category[recordID] || null;
		}else{
			return null;
		}
	},
	
	/**
	* Takes an object and adds it to the cache.
	* <code>addObject()</code> takes an object, ensures that it is not already in the cache, and adds it to the cache.
	*
	* @name Social.US.Cache.addObject
	* @function
	* @private
	*	
	* @param {Object} obj The object to add to the cache.
	* @return Returns the record ID of the object added to the cache.
	*/	
	addObject: function(obj){
		var classname = obj._classname();
		var category = this.inMemoryObjects[classname];
		if(!category){
			category = {};
			this.inMemoryObjects[classname] = category;
		}

		var object = category[obj.recordID];
		if(object){
			return object;
		}else{
			category[obj.recordID] = obj;
			return obj;
		}
	},
	
	/**
	* Takes an object reference and removes the object from the cache.
	* 
	* @name Social.US.Cache.removeObject
	* @function
	* @private
	*	
	* @param {Object} obj The object to remove from the cache.
	*/	
	removeObject: function(obj){
		var classname = obj._classname();
		var category = this.inMemoryObjects[classname];
		if(category){
			delete category[obj.recordID]; // ZOMG THE DELETE OPERATOR
		}
	},
	
	/**
	* Takes an object reference and returns whether the object is in the cache.
	* 
	* @name Social.US.Cache.isObjectCached
	* @function
	* @private
	*	
	* @param {Object} obj The object to select in the cache.
	*
	* @return Returns <code>true</true> if the object is in the cache; otherwise, it returns <code>false</code>.
	*/		
	isObjectCached: function(obj){
		var classname = obj._classname();
		var category = this.inMemoryObjects[classname];
		return (category && (category[obj.recordID] == obj));
	},
	
	
	saveCache: function(){
		
	},
	
	
	loadCache: function(){
		
	},
	
	/**
	* Takes a JSON array of objects and loads them into the cache.
	*
	* @name Social.US.Cache.loadCacheFromJSONArray
	* @function
	* @private
	*
	* @param {JSON} jsonArray The JSON object array to load into the cache.
	* @param {function} cb <code>loadCacheFromJSONArray()</code> takes an optional callback function.
	* <br/> 
	* <b>Callback Example:</b><br/>
	* <code>function(error){<br/>
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorCode = error.errorCode;<br/>
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorDesc = error.description;<br/>
	* &nbsp;&nbsp;   }<br/>
	* </code>
	*/			
	loadCacheFromJSONArray: function(jsonArray, cb){
		var objects = [];
        
		for(var idx = 0; idx < jsonArray.length; idx++){
			var hash = jsonArray[idx];
			if(hash && hash.hasOwnProperty("classname") && hash.hasOwnProperty("recordID")){
				var theClassname = hash.classname;
				var theClass = SocialR.Social.US[theClassname];
				var theRecordID = hash.recordID;
				if(theClass && theRecordID){
					var theInstance = this.getObjectWithRecordID(theClassname, theRecordID);
					if(!theInstance){
						theInstance = new theClass(theRecordID, {});
					}
        
					theInstance._deserializeFromHash(hash);
					this.addObject(theInstance);
				}
			}
		}
        
		cb(null, this);
	}
});