var Class= require('../../NGCore/Shared/Class').Class;
var GlobalTouchEmitter= require('./GlobalTouchEmitter').GlobalTouchEmitter;

exports.TouchManager= Class.singleton(
{
	classname:"TouchManager",
	
	initialize:function()
	{
		this._touchEmitter= new GlobalTouchEmitter();
	},

	instance:function()
	{
		return this._touchEmitter;
	}
}		
); 


