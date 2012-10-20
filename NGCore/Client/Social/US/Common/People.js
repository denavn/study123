var GSGlobals = require("../../_Internal/GSGlobals");

/**
 * @class 
 * @name Social.Common.People
 * @description
 * Provides access to information about users, including their personal information and their 
 * friends. A user's network of friends is sometimes referred to as the user's "social graph."
 * <br /><br />
 * The data that is available for each user varies between the Japan and US/worldwide platforms. On
 * both platforms, you can retrieve a user's ID and display name, as well as a URL for the user's
 * thumbnail image. You can also determine whether the user has installed the application that is
 * currently running. See the individual methods in this class for more details about which fields
 * are available on each platform.
 */
exports.People = {

	/**
	 * Retrieves information about the specified user. By default, only a limited amount of 
	 * information is retrieved. Use the <code>fields</code> parameter to retrieve additional 
	 * information.
	 *
	 * @name Social.Common.People.getUser
	 * @function 
	 * @public 
	 *
	 * @param {String} userId The user ID of the user to retrieve.
	 * @param {String[]} fields Additional fields to retrieve. For a complete list of available
	 *		fields, see the properties of the callback function's <code>user</code> parameter. The
	 *		required properties of the <code>user</code> parameter are retrieved by default.
	 * @cb {Function} callback The function to call after retrieving information about the specified
	 *		user.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {Object} user Information about the user.
	 * @cb-param {String} [user.aboutMe] Brief introductory text for the user. Available only on the
	 *		Japan platform.
	 * @cb-param {String} [user.addresses] The prefecture where the user lives. Available only on 
	 *		the Japan platform.
	 * @cb-param {Number} [user.age] The user's age.
	 * @cb-param {Boolean} [user.ageRestricted] Set to <code>true</code> if the user has been 
	 *		restricted based on their age. Not available on the Japan platform.
	 * @cb-param {String} [user.birthday] The user's birthday. Uses the format
	 *		<code><em>YYYY</em>-<em>MM</em>-<em>DD</em></code>, where <code><em>YYYY</em></code> is
	 *		the four-digit year, <code><em>MM</em></code> is the two-digit month, and
	 *		<code><em>DD</em></code> is the two-digit day. Available only on the Japan platform.
	 * @cb-param {String} [user.bloodType] The user's blood type. Available only on the Japan 
	 *		platform.
	 * @cb-param {String} user.displayName The name displayed for the user.  Matches the user's 
	 *		nickname.
	 * @cb-param {String} [user.gender] The user's gender. Available only on the Japan platform.
	 * @cb-param {Boolean} user.hasApp Set to <code>true</code> if the user has installed the 
	 *		current application.
	 * @cb-param {String} user.id The user's ID.
	 * @cb-param {String} [user.interests] A list of the user's interests. Available only on the 
	 *		Japan platform.
	 * @cb-param {String} [user.jobType] The user's job type. Available only on the Japan platform.
	 * @cb-param {String} [user.nickname] The user's nickname.
	 * @cb-param {String} user.thumbnailUrl The URL for the user's thumbnail image.
	 * @cb-returns {void}
	 * @see Social.Common.People.getCurrentUser
	 * @example
	 * var recordID = 2;
	 *
	 * Social.Common.People.getUser(recordID, 
	 *                              ['id','nickname','thumbnailUrl'], 
	 *                              callback
	 *		});
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */						
	getUser: function(userId, fields, callback) {
		var cmd = {apiURL:"Common.People.getUser", userId:userId, fields:fields, callbackFunc:callback};
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},

	/**
	 * Retrieves information about as many as 100 users. By default, only a limited amount of 
	 * information is retrieved. Use the <code>fields</code> parameter to retrieve additional
	 * information.
	 *	 
	 * @name Social.Common.People.getUsers
	 * @function 
	 * @public
	 * 
	 * @param {String[]} userIds The user IDs of the users to retrieve. The array must contain
	 *		between 1 and 100 user IDs.
	 * @param {String[]} fields Additional fields to retrieve. For a complete list of available 
	 *		fields, see the properties of the callback function's <code>users</code> parameter. The
	 *		required properties of the <code>users</code> parameter are retrieved by default.
	 * @cb {Function} callback The function to call after retrieving information about the specified
	 *		users.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {Object[]} users Information about individual users.
	 * @cb-param {String} [users[].aboutMe] Brief introductory text for the user. Available only on 
	 *		the Japan platform.
	 * @cb-param {String} [users[].addresses] The prefecture where the user lives. Available only on
	 *		the Japan platform.
	 * @cb-param {Number} [users[].age] The user's age.
	 * @cb-param {Boolean} [users[].ageRestricted] Set to <code>true</code> if the user has been 
	 *		restricted based on their age. Not available on the Japan platform.
	 * @cb-param {String} [users[].birthday] The user's birthday. Uses the format
	 *		<code><em>YYYY</em>-<em>MM</em>-<em>DD</em></code>, where <code><em>YYYY</em></code> is
	 *		the four-digit year, <code><em>MM</em></code> is the two-digit month, and
	 *		<code><em>DD</em></code> is the two-digit day. Available only on the Japan platform.
	 * @cb-param {String} [users[].bloodType] The user's blood type. Available only on the Japan
	 *		platform.
	 * @cb-param {String} users[].displayName The name displayed for the user. Matches the user's 
	 *		nickname.
	 * @cb-param {String} [users[].gender] The user's gender. Available only on the Japan platform.
	 * @cb-param {Boolean} users[].hasApp Set to <code>true</code> if the user has installed the 
	 *		current application.
	 * @cb-param {String} users[].id The user's ID.
	 * @cb-param {String} [users[].interests] A list of the user's interests. Available only on the
	 *		Japan platform.
	 * @cb-param {String} [users[].jobType] The user's job type. Available only on the Japan 
	 *		platform.
	 * @cb-param {String} [users[].nickname] The user's nickname.
	 * @cb-param {String} users[].thumbnailUrl The URL for the user's thumbnail image.
	 * @cb-param {Object} result Information about the results that were returned.
	 * @cb-param {Number} result.total The total number of users.
	 * @cb-param {Number} result.start The starting index for this group of users within the entire
	 *		list of users.
	 * @cb-param {Number} result.count The number of users that were returned.
	 * @cb-returns {void}
	 * @see Social.Common.People.getUser
	 * @example
	 * People.getUsers([1,2,3],null, callback);
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */				
	getUsers: function(userIds, fields, callback) {
		var cmd = {apiURL:"Common.People.getUsers", userIds:userIds, fields:fields, callbackFunc:function(errors, args) {
			callback(errors, args.users, args.results);
		}};
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},
	
	
	/**
	 * Retrieves information about the current user. By default, only a limited amount of 
	 * information is retrieved. Use the <code>fields</code> parameter to retrieve additional
	 * information.
	 *
	 * @name Social.Common.People.getCurrentUser
	 * @function
	 * @public
	 *
	 * @param {String[]} fields Additional fields to retrieve. For a complete list of available 
	 *		fields, see the properties of the callback function's <code>user</code> parameter. The
	 *		required properties of the <code>user</code> parameter are retrieved by default.
	 * @cb {Function} callback The function to call after retrieving information about the current
	 *		user.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {Object} user Information about the user.
	 * @cb-param {String} [user.aboutMe] Brief introductory text for the user. Available only on the
	 *		Japan platform.
	 * @cb-param {String} [user.addresses] The prefecture where the user lives. Available only on 
	 *		the Japan platform.
	 * @cb-param {Number} [user.age] The user's age.
	 * @cb-param {Boolean} [user.ageRestricted] Set to <code>true</code> if the user has been 
	 *		restricted based on their age. Not available on the Japan platform.
	 * @cb-param {String} [user.birthday] The user's birthday. Uses the format
	 *		<code><em>YYYY</em>-<em>MM</em>-<em>DD</em></code>, where <code><em>YYYY</em></code> is
	 *		the four-digit year, <code><em>MM</em></code> is the two-digit month, and
	 *		<code><em>DD</em></code> is the two-digit day. Available only on the Japan platform.
	 * @cb-param {String} [user.bloodType] The user's blood type. Available only on the Japan
	 *		platform.
	 * @cb-param {String} user.displayName The name displayed for the user. Matches the user's
	 *		nickname.
	 * @cb-param {String} [user.gender] The user's gender. Available only on the Japan platform.
	 * @cb-param {Boolean} user.hasApp Set to <code>true</code> if the user has installed the 
	 *		current application.
	 * @cb-param {String} user.id The user's ID.
	 * @cb-param {String} [user.interests] A list of the user's interests. Available only on the 
	 *		Japan platform.
	 * @cb-param {String} [user.jobType] The user's job type. Available only on the Japan platform.
	 * @cb-param {String} [user.nickname] The user's nickname.
	 * @cb-param {String} user.thumbnailUrl The URL for the user's thumbnail image.
	 * @cb-returns {void}
	 * @see Social.Common.People.getUser
	 * @example
	 * People.getCurrentUser(null, callback);
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */				
	getCurrentUser: function(fields, callback) {
		var cmd = {apiURL:"Common.People.getCurrentUser", fields:fields, callbackFunc:callback};
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},
	
	
	/**
	 * Retrieves information about a user's friends. By default, only a limited amount of 
	 * information is retrieved. Use the <code>fields</code> parameter to retrieve additional
	 * information.
	 *
	 * @name Social.Common.People.getFriends
	 * @function
	 * @public
	 * 
	 * @param {String[]} userId The user ID of the user whose friends will be retrieved.
	 * @param {String[]} fields Additional fields to retrieve. For a complete list of available
	 *		fields, see the properties of the callback function's <code>users</code> parameter. The
	 *		required properties of the <code>users</code> parameter are retrieved by default.
	 * @param {Object} opt Options for the number of users to retrieve. Used to support
	 *                     pagination.
	 * @param {Number} [opt.start] The index of the first user to retrieve. For example, if the user
	 *		has 50 friends, and you have already retrieved 10 friends, set this parameter to
	 *		<code>11</code> to retrieve the next group of friends.
	 * @param {Number} [opt.count] The number of friends to retrieve. For example, if you want to
	 *		display 10 friends per page, set this parameter to <code>10</code>.
	 * @cb {Function} callback The function to call after retrieving information about the specified
	 *		user's friends.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {Object[]} users Information about individual users.
	 * @cb-param {String} [users[].aboutMe] Brief introductory text for the user. Available only on 
	 *		the Japan platform.
	 * @cb-param {String} [users[].addresses] The prefecture where the user lives. Available only on
	 *		the Japan platform.
	 * @cb-param {Number} [users[].age] The user's age.
	 * @cb-param {Boolean} [users[].ageRestricted] Set to <code>true</code> if the user has been 
	 *		restricted based on their age. Not available on the Japan platform.
	 * @cb-param {String} [users[].birthday] The user's birthday. Uses the format
	 *		<code><em>YYYY</em>-<em>MM</em>-<em>DD</em></code>,  where <code><em>YYYY</em></code> is
	 *		the four-digit year, <code><em>MM</em></code> is the two-digit month, and
	 *		<code><em>DD</em></code> is the two-digit day. Available only on the Japan platform.
	 * @cb-param {String} [users[].bloodType] The user's blood type. Available only on the Japan
	 *		platform.
	 * @cb-param {String} users[].displayName The name displayed for the user. Matches the user's 
	 *		nickname.
	 * @cb-param {String} [users[].gender] The user's gender. Available only on the Japan platform.
	 * @cb-param {Boolean} users[].hasApp Set to <code>true</code> if the user has installed the 
	 *		current application.
	 * @cb-param {String} users[].id The user's ID.
	 * @cb-param {String} [users[].interests] A list of the user's interests. Available only on the
	 *		Japan platform.
	 * @cb-param {String} [users[].jobType] The user's job type. Available only on the Japan
	 *		platform.
	 * @cb-param {String} [users[].nickname] The user's nickname.
	 * @cb-param {String} users[].thumbnailUrl The URL for the user's thumbnail image.
	 * @cb-param {Object} result Information about the results that were returned.
	 * @cb-param {Number} result.total The total number of this user's friends.
	 * @cb-param {Number} result.start The starting index for this group of users within the user's
	 *		entire list of friends.
	 * @cb-param {Number} result.count The number of users that were returned.
	 * @cb-returns {void}
	 * @see Social.Common.People.getFriendsWithGame
	 * @example
	 * People.getFriends(4, null, {'start': 2}, callback);
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */					
	getFriends: function(userId, fields, opt, callback) {
		var cmd = {apiURL:"Common.People.getFriends", userId:userId, fields:fields, opt:opt, callbackFunc: function(errors, args) {
			callback(errors, args.users, args.results);
		}};
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},
	
	
	/**
	 * Retrieves a list of a user's friends who are playing the current game.
	 *
	 * @name Social.Common.People.getFriendsWithGame
	 * @function
	 * @public
	 *
	 * @param {String} userId The user ID of the user whose friends are playing the current game.
	 * @param {String[]} fields Additional fields to retrieve. For a complete list of available
	 *		fields, see the properties of the callback function's <code>users</code> parameter. The
	 *		required properties of the <code>users</code> parameter are retrieved by default.
	 * @param {Object} opt Options for the number of users to retrieve. Used to support pagination.
	 * @param {Number} [opt.start] The index of the first user to retrieve. For example, if the 
	 *		user has 50 friends, and you have already retrieved 10 friends, set this parameter to
	 *		<code>11</code> to retrieve the next group of friends.
	 * @param {Number} [opt.count] The number of friends to retrieve. For example, if you want to 
	 *		display 10 friends per page, set this parameter to <code>10</code>.
	 * @cb {Function} callback The function to call after retrieving a list of the user's friends 
	 *		who are playing the current game.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {Object[]} users Information about individual users.
	 * @cb-param {String} [users[].aboutMe] Brief introductory text for the user. Available only on
	 *		the Japan platform.
	 * @cb-param {String} [users[].addresses] The prefecture where the user lives. Available only on
	 *		the Japan platform.
	 * @cb-param {Number} [users[].age] The user's age.
	 * @cb-param {Boolean} [users[].ageRestricted] Set to <code>true</code> if the user has been
	 *		restricted based on their age. Not available on the Japan platform.
	 * @cb-param {String} [users[].birthday] The user's birthday. Uses the format
	 *		<code><em>YYYY</em>-<em>MM</em>-<em>DD</em></code>, where <code><em>YYYY</em></code> is
	 *		the four-digit year, <code><em>MM</em></code> is the two-digit month, and
	 *		<code><em>DD</em></code> is the two-digit day. Available only on the Japan platform.
	 * @cb-param {String} [users[].bloodType] The user's blood type. Available only on the Japan 
	 *		platform.
	 * @cb-param {String} users[].displayName The name displayed for the user. Matches the user's 
	 *		nickname.
	 * @cb-param {String} [users[].gender] The user's gender. Available only on the Japan platform.
	 * @cb-param {Boolean} users[].hasApp Set to <code>true</code> if the user has installed the
	 *		current application.
	 * @cb-param {String} users[].id The user's ID.
	 * @cb-param {String} [users[].interests] A list of the user's interests. Available only on the
	 *		Japan platform.
	 * @cb-param {String} [users[].jobType] The user's job type. Available only on the Japan
	 *		platform.
	 * @cb-param {String} [users[].nickname] The user's nickname.
	 * @cb-param {String} users[].thumbnailUrl The URL for the user's thumbnail image.
	 * @cb-param {Object} result Information about the results that were returned.
	 * @cb-param {Number} result.total The total number of users who are friends of the user and 
	 *		are playing the current game.
	 * @cb-param {Number} result.start The starting index for this group of users within the 
	 *		entire list of friends playing the current game.
	 * @cb-param {Number} result.count The number of users that were returned.
	 * @cb-returns {void}
	 * @see Social.Common.People.getFriends
	 * @example 
	 * People.getFriendsWithGame(4, null, null, callback);
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */						
	getFriendsWithGame: function(userId, fields, opt, callback) {
		var cmd = {apiURL:"Common.People.getFriendsWithGame", userId:userId, fields:fields, opt:opt, callbackFunc: function(errors, args) {
			callback(errors, args.users, args.results);
		}};
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	}
	
};