var GSGlobals = require("../../_Internal/GSGlobals");

/**
 * @class 
    * @name Social.Common.Leaderboard
 * @description
 * Mobage provides a Common API for updating and retrieving leaderboard information.
 * <br />
 * <code>Leaderboard</code> allows game to configure a collection of leaderboards through the
 * Developer Portal or via HTTP REST endpoints which are then subsequently accessed via this API.
 */
exports.Leaderboard = {

    /**
     * Retrieves information about the specified leaderboard. By default, only a limited amount of
     * information is retrieved. Use the <code>fields</code> parameter to retrieve additional
     * information.
     *
     * @name Social.Common.Leaderboard.getLeaderboard
     * @function
     * @public
     *
     * @param {String} leaderboardId The leaderboard ID of the leaderboard to retrieve.
     * @param {String[]} fields Additional fields to retrieve. For a complete list of available
     *		fields, see the properties of the callback function's <code>Leaderboard</code> parameter. The
     *		required properties of the <code>Leaderboard</code> parameter are retrieved by default.
     * @cb {Function} callback The function to call after retrieving information about the specified leaderboard.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {Object} Leaderboard Information about the requested object.
	 * @cb-param {String} [leaderboard.id] Leaderboard identifier.
	 * @cb-param {String} [leaderboard.appId] The application ID associated with this Leaderboard.
	 * @cb-param {String} [leaderboard.title] The title of the leaderboard.
	 * @cb-param {String} [leaderboard.scoreFormat] The format of the <code>displayValue</code> in this leaderboard.
	 * @cb-param {Number} [leaderboard.scorePrecision] The decimal place value for the <code>displayValue</code> in this leaderboard.
	 * @cb-param {String} [leaderboard.iconUrl] The URL of the leaderboard icon.
	 * @cb-param {Boolean} [leaderboard.allowLowerScore] If true, the leaderboard will allow a user to post
     *      a lower score to this leaderboard.  If false, a user's preexisting higher score will NOT be replaced
     *      by an attempt to post a lower score.  This flag allows the developer to avoid "get and set if lower" logic.
	 * @cb-param {Boolean} [leaderboard.reverse] If true, lower scores are treated as more desirable.
     *      For example, in golf a lower score is more desirable.
	 * @cb-param {Boolean} [leaderboard.archived] Future enhancement field to archive a leaderboard.  Archived
     *      leaderboards will be readable but not writeable.  Currently this field always returns false.
	 * @cb-param {Number} [leaderboard.defaultScore] Default score value given to a user if no score attribute is
     *      specified in previous calls to <code>updateCurrentUserScore</code>.
	 * @cb-param {Date} [leaderboard.published] The date and time when this leaderboard was created.
     *      Uses the date format YYYY-MM-DDThh:mm:ss.
	 * @cb-param {Date} [leaderboard.updated] The date and time when this leaderboard was updated.
     *      Uses the date format YYYY-MM-DDThh:mm:ss.
	 *
	 * @cb-returns {void}
	 * @see Social.Common.Leaderboard.getLeaderboards
	 * @see Social.Common.Leaderboard.getAllLeaderboards
	 * @see Social.Common.Leaderboard.getScore
	 * @see Social.Common.Leaderboard.updateCurrentUserScore
	 * @example
	 * Social.Common.Leaderboard.getLeaderboard("SanFranciscoGiants",
	 *                              ['id','title','scoreFormat', 'iconUrl'],
	 *                              function(error, leaderboard) {
     *                                  if (error) {
     *                                      // something went wrong
     *                                  }
     *                                  if (leaderboard) {
     *                                      console.log(leaderboard.title);
     *                                  }
     *                              });
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	getLeaderboard: function(leaderboardId, fields, callback) {
		var cmd = {apiURL:"Common.Leaderboard.getLeaderboard", leaderboardIds:leaderboardId, fields:fields, callbackFunc:callback};
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},

    /**
	 * Retrieves information about the specified leaderboards. By default, only a limited amount of
	 * information is retrieved about each leaderboard. Use the <code>fields</code> parameter to retrieve additional
	 * information.
	 *
	 * @name Social.Common.Leaderboard.getLeaderboards
	 * @function
	 * @public
	 *
	 * @param {String[]} leaderboardIds The leaderboard IDs of the leaderboards to retrieve.  This is provided as an
     *      an array of leaderboard IDs.
	 * @param {String[]} fields Additional fields to retrieve. For a complete list of available
	 *		fields, see the properties of the callback function's <code>Leaderboard</code> parameter. The
	 *		required properties of the <code>Leaderboard</code> parameter are retrieved by default.
	 * @cb {Function} callback The function to call after retrieving information about the specified leaderboards.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {Object} Leaderboards Information about the requested leaderboard object or array of objects.
	 * @cb-param {String} [leaderboard.id] Leaderboard identifier.
	 * @cb-param {String} [leaderboard.appId] The application ID associated with this Leaderboard.
	 * @cb-param {String} [leaderboard.title] The title of the leaderboard.
	 * @cb-param {String} [leaderboard.scoreFormat] The format of the <code>displayValue</code> in this leaderboard.
	 * @cb-param {Number} [leaderboard.scorePrecision] The decimal place value for the <code>displayValue</code> in this leaderboard.
	 * @cb-param {String} [leaderboard.iconUrl] The URL of the leaderboard icon.
	 * @cb-param {Boolean} [leaderboard.allowLowerScore] If true, the leaderboard will allow a user to post
     *      a lower score to this leaderboard.  If false, a user's preexisting higher score will NOT be replaced
     *      by an attempt to post a lower score.  This flag allows the developer to avoid "get and set if lower" logic.
	 * @cb-param {Boolean} [leaderboard.reverse] If true, lower scores are treated as more desirable.
     *      For example, in golf a lower score is more desirable.
	 * @cb-param {Boolean} [leaderboard.archived] Future enhancement field to archive a leaderboard.  Archived
     *      leaderboards will be readable but not writeable.  Currently this field always returns false.
	 * @cb-param {Number} [leaderboard.defaultScore] Default score value given to a user if no score attribute is
     *      specified in previous calls to <code>updateCurrentUserScore</code>.
	 * @cb-param {Date} [leaderboard.published] The date and time when this leaderboard was created.
     *      Uses the date format YYYY-MM-DDThh:mm:ss.
	 * @cb-param {Date} [leaderboard.updated] The date and time when this leaderboard was updated.
     *      Uses the date format YYYY-MM-DDThh:mm:ss.
	 *
	 * @cb-returns {void}
	 * @see Social.Common.Leaderboard.getLeaderboard
	 * @see Social.Common.Leaderboard.getAllLeaderboards
	 * @see Social.Common.Leaderboard.getScore
	 * @see Social.Common.Leaderboard.updateCurrentUserScore
	 * @example
	 * Social.Common.Leaderboard.getLeaderboards(["SanFranciscoGiants","TopPlayers"],
	 *                              ['id','title','scoreFormat', 'scorePrecision', 'reverse'],
	 *                              function(error, leaderboards) {
     *                                  if (error) {
     *                                      // error handling code is here
     *                                  }
     *                                  for (var i in leaderboards) with ({leaderboard: leaderboards[i]}) {
     *                                      // stuff each item into leaderboard local variable
     *                                  }
     *                              });
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
    getLeaderboards: function(leaderboardIds, fields, callback) {
		var cmd = {apiURL:"Common.Leaderboard.getLeaderboards", leaderboardIds:leaderboardIds, fields:fields, callbackFunc:callback};
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},

    /**
	 * Retrieves information about all of the current user's game leaderboards. By default, only a limited amount of
	 * information about each leaderboard is retrieved. Use the <code>fields</code> parameter to retrieve additional
	 * information.
	 *
	 * @name Social.Common.Leaderboard.getAllLeaderboards
	 * @function
	 * @public
	 *
	 * @param {String[]} fields Additional fields to retrieve. For a complete list of available
	 *		fields, see the properties of the callback function's <code>Leaderboard</code> parameter. The
	 *		required properties of the <code>Leaderboard</code> parameter are retrieved by default.
	 * @cb {Function} callback The function to call after retrieving information about the specified leaderboards.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {Object} Leaderboards Information about the requested leaderboard object or array of objects.
	 * @cb-param {String} [leaderboard.id] Leaderboard identifier.
	 * @cb-param {String} [leaderboard.appId] The application ID associated with this Leaderboard.
	 * @cb-param {String} [leaderboard.title] The title of the leaderboard.
	 * @cb-param {String} [leaderboard.scoreFormat] The format of the <code>displayValue</code> in this leaderboard.
	 * @cb-param {Number} [leaderboard.scorePrecision] The decimal place value for the <code>displayValue</code> in this leaderboard.
	 * @cb-param {String} [leaderboard.iconUrl] The URL of the leaderboard icon.
	 * @cb-param {Boolean} [leaderboard.allowLowerScore] If true, the leaderboard will allow a user to post
     *      a lower score to this leaderboard.  If false, a user's preexisting higher score will NOT be replaced
     *      by an attempt to post a lower score.  This flag allows the developer to avoid "get and set if lower" logic.
	 * @cb-param {Boolean} [leaderboard.reverse] If true, lower scores are treated as more desirable.
     *      For example, in golf a lower score is more desirable.
	 * @cb-param {Boolean} [leaderboard.archived] Future enhancement field to archive a leaderboard.  Archived
     *      leaderboards will be readable but not writeable.  Currently this field always returns false.
	 * @cb-param {Number} [leaderboard.defaultScore] Default score value given to a user if no score attribute is
     *      specified in previous calls to <code>updateCurrentUserScore</code>.
	 * @cb-param {Date} [leaderboard.published] The date and time when this leaderboard was created.
     *      Uses the date format YYYY-MM-DDThh:mm:ss.
	 * @cb-param {Date} [leaderboard.updated] The date and time when this leaderboard was updated.
     *      Uses the date format YYYY-MM-DDThh:mm:ss.
	 *
	 * @cb-returns {void}
	 * @see Social.Common.Leaderboard.getLeaderboard
	 * @see Social.Common.Leaderboard.getLeaderboards
	 * @see Social.Common.Leaderboard.getScore
	 * @see Social.Common.Leaderboard.updateCurrentUserScore
	 * @example
	 * Social.Common.Leaderboard.getAllLeaderboards(['id','title','appId', 'defaultScore'],
	 *                              function(error, leaderboards) {
     *                                  if (error) {
     *                                      // error handling code is here
     *                                  }
     *                                  for (var i in leaderboards) with ({leaderboard: leaderboards[i]}) {
     *                                      // stuff each item into leaderboard local variable
     *                                  }
     *                              });
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
    getAllLeaderboards: function(fields, callback) {
		var cmd = {apiURL:"Common.Leaderboard.getAllLeaderboards", fields:fields, callbackFunc:callback};
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},

    /**
	 * Retrieves information about the top users of a given leaderboard.  An array of <code>Score</code> objects
     * are returned. By default, only a limited amount of information about each user's <code>Score</code>
     * is retrieved. Use the <code>fields</code> parameter to retrieve additional information.
	 *
	 * @name Social.Common.Leaderboard.getTopScoresList
	 * @function
	 * @public
	 *
     * @param {String} leaderboardId The leaderboard ID to fetch top scores from.
	 * @param {String[]} fields Additional fields to retrieve. For a complete list of available
	 *		fields, see the properties of the callback function's <code>Score</code> parameter. The
	 *		required properties of the <code>Score</code> parameter are retrieved by default.
     * @param {Object} opts Additional request options for the scores to fetch.  Permitted options are:
     *      <code>count</code> The number of records to return.  If no count variable is provided, 50 scores will be fetched.
     *      <code>startIndex</code> The record offset when striding through the leaderboard's records.  Default value is 1
     *      and should be treated as an offset value.
	 * @cb {Function} callback The function to call after retrieving information about the specified scores.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {Object} [Scores] Information about the requested leaderboard's user scores as an array of Score objects.
	 * @cb-param {String} [Score[].userId] User ID for this score record.
	 * @cb-param {Number} [Score[].value] Raw score value for this user.
	 * @cb-param {String} [Score[].displayValue] Formatted score value based upon the formatting rules for the
     *      requested leaderboard.
	 * @cb-param {Number} [Score[].rank] User's numerical rank for their placement in this leaderboard.
	 * @cb-param {Date} [Score[].updated] The date and time when this score was last updated.
     *      Uses the date format YYYY-MM-DDThh:mm:ss.
	 *
	 * @cb-returns {void}
	 * @see Social.Common.Leaderboard.getLeaderboard
	 * @see Social.Common.Leaderboard.getLeaderboards
	 * @see Social.Common.Leaderboard.getAllLeaderboards
	 * @see Social.Common.Leaderboard.getFriendsScoresList
	 * @see Social.Common.Leaderboard.getScore
	 * @see Social.Common.Leaderboard.updateCurrentUserScore
	 * @example
	 * Social.Common.Leaderboard.getTopScoresList("Top Patriot Fans",
     *                              ['userId','value','displayValue', 'rank'],
     *                              { startIndex:1, count:50 },
	 *                              function(error, scores) {
     *                                  if (error) {
     *                                      // error handling code is here
     *                                  }
     *                                  var userIds = [];
     *                                  var scoreMap = {};
     *                                  scores.forEach(function(i, score) {
     *                                      userIds.push(score.userId);
     *                                      scoreMap[score.userId] = score;
     *                                  });
     *
     *                                  Social.Common.People.getUsers(userIds, ["id", "nickname", "thumbnailUrl"], function(error, users) {
     *                                      users.forEach(function(i, user) {
     *                                          scoreMap[user.id]["nickname"] = user.nickname;
     *                                          scoreMap[user.id]["thumbnailUrl"] = user.thumbnailUrl;
     *                                      });
     *
     *                                      for (var i in scores) with ({score: scores[i]}) {
     *                                          // insert each score into a local variable
     *                                      }
     *                                  });
     *                              });
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	getTopScoresList: function(leaderboardId, fields, opts, callback) {
		var cmd = {apiURL:"Common.Leaderboard.getTopScoresList", leaderboardIds:leaderboardId, fields:fields, opts:opts, callbackFunc:callback};
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},

    /**
	 * Retrieves information about the top scores for the specified user's leaderboards.  Said in another way, this API
     * gets the scores for the given user's specified leaderboard.  An array of <code>Score</code> objects
     * are returned. By default, only a limited amount of information about each user's <code>Score</code>
     * is retrieved. Use the <code>fields</code> parameter to retrieve additional information.
	 *
	 * @name Social.Common.Leaderboard.getFriendsScoresList
	 * @function
	 * @public
	 *
     * @param {String} leaderboardId The leaderboard ID to fetch top scores from.
     * @param {String} userId The user whose leaderboards you're fetching.
	 * @param {String[]} fields Additional fields to retrieve. For a complete list of available
	 *		fields, see the properties of the callback function's <code>Score</code> parameter. The
	 *		required properties of the <code>Score</code> parameter are retrieved by default.
     * @param {Object} opts Additional request options for the scores to fetch.  Permitted options are:
     *      <code>count</code> The number of records to return.  If no count variable is provided, 50 scores will be fetched.
     *      <code>startIndex</code> The record offset when striding through the leaderboard's records.  Default value is 1
     *      and should be treated as an offset value.
	 * @cb {Function} callback The function to call after retrieving information about the specified scores.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {Object} [Scores] Information about the requested leaderboard's user scores as an array of Score objects.
	 * @cb-param {String} [Score[].userId] User ID for this score record.
	 * @cb-param {Number} [Score[].value] Raw score value for this user.
	 * @cb-param {String} [Score[].displayValue] Formatted score value based upon the formatting rules for the
     *      requested leaderboard.
	 * @cb-param {Number} [Score[].rank] User's numerical rank for their placement in this leaderboard.
	 * @cb-param {Date} [Score[].updated] The date and time when this score was last updated.
     *      Uses the date format YYYY-MM-DDThh:mm:ss.
	 *
	 * @cb-returns {void}
	 * @see Social.Common.Leaderboard.getLeaderboard
	 * @see Social.Common.Leaderboard.getLeaderboards
	 * @see Social.Common.Leaderboard.getAllLeaderboards
	 * @see Social.Common.Leaderboard.getTopScoresList
	 * @see Social.Common.Leaderboard.getScore
	 * @see Social.Common.Leaderboard.updateCurrentUserScore
	 * @example
	 * Social.Common.Leaderboard.getFriendsScoresList("Top Patriot Fans",
     *                              "coolGamerDude",
     *                              ['userId','value','displayValue', 'rank', 'updated'],
     *                              { startIndex:1, count:50 },
	 *                              function(error, scores) {
     *                                  if (error) {
     *                                      // error handling code is here
     *                                  }
     *                                  var userIds = [];
     *                                  var scoreMap = {};
     *                                  scores.forEach(function(i, score) {
     *                                      userIds.push(score.userId);
     *                                      scoreMap[score.userId] = score;
     *                                  });
     *
     *                                  Social.Common.People.getUsers(userIds, ["id", "nickname", "thumbnailUrl"], function(error, users) {
     *                                      users.forEach(function(i, user) {
     *                                          scoreMap[user.id]["nickname"] = user.nickname;
     *                                          scoreMap[user.id]["thumbnailUrl"] = user.thumbnailUrl;
     *                                      });
     *
     *                                      for (var i in scores) with ({score: scores[i]}) {
     *                                          // insert each score into a local variable
     *                                      }
     *                                  });
     *                              });
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
    getFriendsScoresList: function(leaderboardId, userId, fields, opts, callback) {
		var cmd = {apiURL:"Common.Leaderboard.getFriendsScoresList", leaderboardIds:leaderboardId, userId:userId, fields:fields, opts:opts, callbackFunc:callback};
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},

    /**
	 * Retrieves top score for the specified user's specified leaderboard.  A single <code>Score</code> object
     * is returned. By default, only a limited amount of information the user's <code>Score</code>
     * is retrieved. Use the <code>fields</code> parameter to retrieve additional information.
	 *
	 * @name Social.Common.Leaderboard.getScore
	 * @function
	 * @public
	 *
     * @param {String} leaderboardId The leaderboard ID to fetch the top score from.
     * @param {String} userId The user whose scores you're fetching.
	 * @param {String[]} fields Additional fields to retrieve. For a complete list of available
	 *		fields, see the properties of the callback function's <code>Score</code> parameter. The
	 *		required properties of the <code>Score</code> parameter are retrieved by default.
	 * @cb {Function} callback The function to call after retrieving information about the specified score.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {Object} [Score] Information about the requested leaderboard's user score as a single JSON Object.
	 * @cb-param {String} [Score.userId] User ID for this score record.
	 * @cb-param {Number} [Score.value] Raw score value for this user.
	 * @cb-param {String} [Score.displayValue] Formatted score value based upon the formatting rules for the
     *      requested leaderboard.
	 * @cb-param {Number} [Score.rank] User's numerical rank for their placement in this leaderboard.
	 * @cb-param {Date} [Score.updated] The date and time when this score was last updated.
     *      Uses the date format YYYY-MM-DDThh:mm:ss.
	 *
	 * @cb-returns {void}
	 * @see Social.Common.Leaderboard.getLeaderboard
	 * @see Social.Common.Leaderboard.getLeaderboards
	 * @see Social.Common.Leaderboard.getAllLeaderboards
	 * @see Social.Common.Leaderboard.getTopScoresList
	 * @see Social.Common.Leaderboard.getFriendsScoresList
	 * @see Social.Common.Leaderboard.updateCurrentUserScore
	 * @example
	 * Social.Common.Leaderboard.getScore("Boston Red Socks Top Fans",
     *                              "myFriend42",
     *                              ['userId','value','displayValue', 'updated'],
	 *                              function(error, score) {
     *                                  if (error) {
     *                                      // error handling code is here
     *                                  }
     *                                  if (score) {
     *                                      console.log("user score is: "+score.value);
     *                                  }
     *                              });
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
    getScore: function(leaderboardId, userId, fields, callback) {
		var cmd = {apiURL:"Common.Leaderboard.getScore", leaderboardIds:leaderboardId, userId:userId, fields:fields, callbackFunc:callback};
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},

    /**
	 * Updates the current user's score in the specified leaderboard.  No additional information is returned.
	 *
	 * @name Social.Common.Leaderboard.updateCurrentUserScore
	 * @function
	 * @public
	 *
     * @param {String} leaderboardId The leaderboard ID in which to update the given user's score.
	 * @param {Number} value Numerical score value to assign to this user.
	 * @cb {Function} callback The function to call after updating information about the specified user.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
     * @cb-param {Object} [Score] The user's updated score object as a single JSON Object.
	 * @cb-param {String} [Score.userId] User ID for this score record.
	 * @cb-param {Number} [Score.value] Raw score value for this user.
	 * @cb-param {String} [Score.displayValue] Formatted score value based upon the formatting rules for the
     *      requested leaderboard.
	 * @cb-param {Number} [Score.rank] User's numerical rank for their placement in this leaderboard.
	 * @cb-param {Date} [Score.updated] The date and time when this score was last updated.
     *      Uses the date format YYYY-MM-DDThh:mm:ss.
	 *
	 * @cb-returns {void}
	 * @see Social.Common.Leaderboard.getScore
	 * @see Social.Common.Leaderboard.deleteCurrentUserScore
	 * @example
	 * Social.Common.Leaderboard.updateCurrentUserScore("BiggestFish", 42, function(error, score) {
     *                                  if (error) {
     *                                      // error handling code is here
     *                                  } else {
     *                                      // score updated successfully
     *                                  }
     *                              });
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
    updateCurrentUserScore: function(leaderboardId, value, callback) {
		var cmd = {apiURL:"Common.Leaderboard.updateCurrentUserScore", leaderboardId:leaderboardId, value:value, callbackFunc:callback};
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},

    /**
	 * Deletes the current user's score in the specified leaderboard.
	 *
	 * @name Social.Common.Leaderboard.deleteCurrentUserScore
	 * @function
	 * @public
	 *
     * @param {String} leaderboardId The leaderboard ID in which to delete the given user's score.
	 * @cb {Function} callback The function to call after updating information about the specified user.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 *
	 * @cb-returns {void}
	 * @see Social.Common.Leaderboard.getScore
	 * @see Social.Common.Leaderboard.updateCurrentUserScore
	 * @example
	 * Social.Common.Leaderboard.deleteCurrentUserScore("BiggestFish", function(error) {
     *                                  if (error) {
     *                                      // error handling code is here
     *                                  } else {
     *                                      // score deleted successfully
     *                                  }
     *                              });
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
    deleteCurrentUserScore: function(leaderboardId, callback) {
		var cmd = {apiURL:"Common.Leaderboard.deleteCurrentUserScore", leaderboardIds:leaderboardId, callbackFunc:callback};
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	}
};