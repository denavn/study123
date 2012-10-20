/**
 * Public Social.Common.People
 */

var GSGlobals = require("../../_Internal/GSGlobals");

/** @lends Social.Common.People.prototype */
exports.People = {
	/*
	 * 
	 *
	 */

	/*
	 * Gets information about the currently logged in user.
	 * @param {Array<string>} fields See fields section below 
	 * @param {function} callback 
	 *
	 * Callback function format
	 * <code>
	 * function(error, user){
	 *   var errorCode = error.errorCode;
	 *   var errorDesc = error.description;
	 * }
	 * </code>
	 *
	 */
	getCurrentUser: function(fields, callback){
		var data = {
			fields: fields
		};
		this._sendSingleUserCommand("JP.People.getCurrentUser", data, callback);
	},

	/*
	 * Gets information about the specified user.
	 * @param {User-Id} userID 
	 * @param {Array<string>} fields See fields section below 
	 * @param {function} callback 
	 *
	 * Callback function format
	 * <code>
	 * function(error, user){
	 *   var errorCode = error.errorCode;
	 *   var errorDesc = error.description;
	 * }
	 * </code>
	 */
	getUser: function(userId, fields, callback){ 
		var data = {
			userId: userId,
			fields: fields
		};
		this._sendSingleUserCommand("JP.People.getUser", data, callback);
	},


	/**
	 * Gets information about the specified user.
	 * @param {User-Id} userId 
	 * @param {Array<string>} fields See fields section below 
	 * @param {PluralField} opt key should be "count" as the number of record in collection, "start" as start index of collection 
	 * @param {function} callback 
	 *
	 * Callback function format
	 * <code>
	 * function(error, users, result){
	 *     var errorCode = error.errorCode;
	 *     var errorDesc = error.description;
	 *     var total = result.total;
	 *     var start = result.start;
	 *     var count = result.count;
	 * }
	 * <code>
	 */
	getUsers: function(userIds, fields, callback){ 
		var data = {
			userIds: userIds,
			fields: fields,
			start: null,
			count: null
		};
		this._sendMultipleUsersCommand("JP.People.getUsers", data, callback);
	},

	/*
	 * Gets the list of friends for the specified user
	 *
	 * @param {User-Id} userId 
	 * @param {Array<string>} fields See fields section below 
	 * @param {PluralField} opt key should be "count" as the number of record in collection, "start" as start index of collection 
	 * @param {function} callback 
	 *
	 * Callback function format
	 * <code>
	 * function(error, users, result){
	 *     var errorCode = error.errorCode;
	 *     var errorDesc = error.description;
	 *     var total = result.total;
	 *     var start = result.start;
	 *     var count = result.count;
	 * }
	 * <code>
	 */
	getFriends: function(userId, fields, opt, callback){ 
		var start = (opt && opt.start) ? opt.start : null;
		var count = (opt && opt.count) ? opt.count : null;
		var data = {
			userId: userId,
			fields: fields,
			start: start,
			count: count
		};
		this._sendMultipleUsersCommand("JP.People.getFriends", data, callback);
	},

	/*
	 * Gets the list of friends for the specified user that have the current game installed
	 *
	 * @param {User-Id} userId 
	 * @param {Array<string>} fields See fields section below 
	 * @param {PluralField} opt key should be "count" as the number of record in collection, "start" as start index of collection 
	 * @param {function} callback 
	 *
	 * Callback function format
	 * <code>
	 * function(error, users, result){
	 *     var errorCode = error.errorCode;
	 *     var errorDesc = error.description;
	 *     var total = result.total;
	 *     var start = result.start;
	 *     var count = result.count;
	 * }
	 * <code>
	 */
	getFriendsWithGame: function(userId, fields, opt, callback){ 
		var start = (opt && opt.start) ? opt.start : null;
		var count = (opt && opt.count) ? opt.count : null;
		var data = {
			userId: userId,
			fields: fields,
			start: start,
			count: count
		};
		this._sendMultipleUsersCommand("JP.People.getFriendsWithGame", data, callback);
	},

	// private methods to handle Router Command
	_sendSingleUserCommand: function(apiURL, data, callback) {
		var cmd = {
			apiURL: apiURL,
			data: data
		};
		if(callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = function(error, user){
				if(!user){user = undefined;}
				if(!error){error = undefined;}
				callback(error, user)
			};
		}
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},
	_sendMultipleUsersCommand: function(apiURL, data, callback) {
		var cmd = {
			apiURL: apiURL,
			data: data
		};
		if(callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = function(error, result){
				var newResult = {
					total: result.total,
					start: result.start,
					count: result.count
				};
				if(!error){error = undefined;}
				callback(error, result.users, newResult)
			};
		}
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	}
};
