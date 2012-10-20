
///////// DO NOT CHANGE FOLLOWING GSGLOBALS REQUIRE!!!! 
// if you do this instead by (../../../_Internal/GSGlobals)
// new GSGlobals object would be created as  NGCore/Client/Bank/_Internal/GSGlobals
// and NGCore/Client/Social/_Internal/GSGlobals would lose it's router

var GSGlobals = require("../../../../Social/_Internal/GSGlobals");
exports.Debit = {

	createTransaction: function(billingItems,comment,callback) {

		var data = {
			billingItems: billingItems,
			comment: comment
		};
		this._sendCommand('JP.Service.Banking.Debit.createTransaction',data,callback);

	},

	
	openTransaction: function(transactionId,callback) {

		var data = {
			transactionId: transactionId
		};
		this._sendCommand('JP.Service.Banking.Debit.openTransaction',data,callback);

	},
	
	closeTransaction: function(transactionId,callback) {

		var data = {
			transactionId: transactionId
		};
		this._sendCommand('JP.Service.Banking.Debit.closeTransaction',data,callback);

	},

	getTransaction: function(transactionId,callback) {

		var data = {
			transactionId: transactionId
		};
		this._sendCommand('JP.Service.Banking.Debit.getTransaction',data,callback);

	},

	cancelTransaction: function(transactionId,callback) {

		var data = {
			transactionId: transactionId
		};
		this._sendCommand('JP.Service.Banking.Debit.cancelTransaction',data,callback);

	},

	continueTransaction: function(transactionId,callback) {

		var data = {
			transactionId: transactionId
		};
		this._sendCommand('JP.Service.Banking.Debit.continueTransaction',data,callback);

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
