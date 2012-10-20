var Class = require('./Class').Class;

exports.ObjectRegistry = Class.singleton(
{
	classname: 'ObjectRegistry',
		
	/** 
	  * @private 
	  * @class 
	  * @status 
	  */
	initialize: function()
	{
		this._currentId = 0;
		this._guardId = 0;
		this._objects = {};
	},
	
	/** 
	  * @status
	  * @since 1.0
	  */
	register: function(obj)
	{
		if(obj.__objectRegistryId)
			throw new Error('ObjectRegistry.register: object already registered');

		var id = ++this._currentId;
		obj.__objectRegistryId = id;
		this._objects[id] = obj;
	},
	
	/** 
	  * @status
	  * @since 1.0
	  */
	unregister: function(obj)
	{
		if(!obj.__objectRegistryId)
			throw new Error('ObjectRegistry.unregister: object not registered');
			
		var id = obj.__objectRegistryId;
		obj.__objectRegistryId = 0;
		delete this._objects[id];
	},
	
	/** 
	  * @status
	  * @since 1.0
	  */
	isObjectRegistered: function(obj)
	{
		if(obj.__objectRegistryId)
			return true;
		else
			return false;
	},
	
	/** 
	  * @status
	  * @since 1.0
	  */
	isIdRegistered: function(id)
	{
		if(this._objects[id])
			return true;
		else
			return false;
	},
	
	/** 
	  * @status
	  * @since 1.0
	  */
	objectToId: function(obj)
	{
		var id = obj.__objectRegistryId;
		
		if(!id)
			throw new Error('ObjectRegistry.objectToId: object not registered');
		
		return id;
	},
	
	/** 
	  * @status
	  * @since 1.0
	  */
	idToObject: function(id)
	{
		return this._objects[id];
	}
});
