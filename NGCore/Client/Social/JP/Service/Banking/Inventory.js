///////// DO NOT CHANGE FOLLOWING GSGLOBALS REQUIRE!!!! 
// if you do this instead by (../../../_Internal/GSGlobals)
// new GSGlobals object would be created as  NGCore/Client/Bank/_Internal/GSGlobals
// and NGCore/Client/Social/_Internal/GSGlobals would lose it's router

var GSGlobals = require("../../../../Social/_Internal/GSGlobals");

exports.Inventory = {
	
	getItem: function(itemId,callback) {

		var data = {
			itemId: itemId
		};


		var _callback = function(error,result) {


			if (callback) { 
				callback(result.error,result.itemId);
			}
		};

		this._sendCommand('JP.Service.Banking.Inventory.getItem',data,_callback);

	},

	_sendCommand: function(apiURL, data, callback) {
		var cmd = {
			apiURL: apiURL,
			data: data
		};

		if(callback !== undefined && typeof callback === "function") {
			cmd["callbackFunc"] = callback;
		}
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	}

};

