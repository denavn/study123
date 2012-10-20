var GSGlobals = require("../../_Internal/GSGlobals");

/**
 * @class 
 * @name Social.Common.Blacklist
 * @description
 * Provides an interface for checking the user's blacklist.
 */
exports.Blacklist = {

	/**
	 * Checks whether the specified user's blacklist contains a targeted user ID.
	 * If the target user ID parameter is <code>null</code>, this call retrieves the entire blacklist. The callback function also receives the total number of 
	 * target user IDs, the starting index, and the number of target IDs returned for paging the results.
	 *
	 * @name Social.Common.Blacklist.checkBlacklist
	 * @function
	 * @public
	 *
	 * @param {String} userId The user ID for the user who owns the blacklist. 
	 * @param {String} targetUserId The target user ID to check in the blacklist. <br/>If <code>null</code>, it checks the entire blacklist.
	 * @param {Object} opt The start index and count for pagination. <br/>E.g., <code>{'start': 1, 'count': 100}</code> 
     * Requires start index and count. The minimum start index is 1. 
     * If <code>null</code>, undefined or an empty array, the start index is 1 and the count is 50.
	 * @cb {Function} callback The function to call after checking the blacklist for the specified
	 *		user.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {Array} listedUsers The users that appear on the blacklist.
	 * @cb-param {Object} result Information about the results that were returned.
	 * @cb-param {Number} result.total The total number of users on the blacklist.
	 * @cb-param {Number} result.start The starting index for this group of users within the user's 
	 *		entire blacklist.
	 * @cb-param {Number} result.count The number of users that were returned.
	 * @cb-returns {void}
  	 * @returns {void}
  	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */			
	checkBlacklist: function(userId, targetUserId, opt, callback) {
		var cmd = {apiURL:"Common.Blacklist.checkBlacklist", userId:userId, targetUserId:targetUserId, opt:opt, callbackFunc: function(error, args) {
			callback(error, args.users, args.result);
		}};
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);		
	}
};