var DataModelR = require("./DataModel");
var Dispatcher = require("../Data/Dispatcher").Dispatcher;
var OrderedList = require("./OrderedList").OrderedList;

/**
 * <code>Leaderboard</code> objects enable the current user to get friend scores, top scores, and submit a score.
 * To return a leaderboard, you must set up at least one leaderboard for your game in the Mobage Sandbox or Production environment.
 * @class 
 * @name Social.US.Leaderboard
 * @augments Social.US.DataModel
 */
var Leaderboard = exports.Leaderboard = DataModelR.DataModel.subclass({

	 
	classname: "Leaderboard",
	properties: [
	"level",
	"title",
	"game",
	"iconURL"
	],

	
	/** 
	 * @constructs Constructs a <code>Leaderboard</code> object identified by the record ID. 
	 * @private
	 *
	 * @param {Type} $super A reference to the DataModel superclass.
	 * @param {String} recordId The record ID of the object.
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */	
	initialize: function($super, recordID){
		$super(recordID);
		NgLogD("Leaderboard Public! " + recordID + " " + this.recordID);
	},
	
	
	/**
	 * Submits a score to the leaderboard.
	 *
	 * @name Social.US.Leaderboard.submitScore
	 * @function
	 *
	 * @param {Numeric} points The score points. If <code>null</code> or <code>undefined</code>, the callback error is "No score."
	 * @cb {Function} cb The function to call after submitting a score to the leaderboard.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {Number} score The score.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	submitScore: function(points, cb){
		Dispatcher.callMethodOnRemoteObject(this, "submitScoreWithPoints", [points, cb]);
	},	
	
	/**
	 * Returns an <code>OrderedList</code> with the user's score and the highest scores.
	 * 
	 * @name Social.US.Leaderboard.getTopScoresList
	 * @function
	 *
	 * @returns {Social.US.OrderedList} The list of highest scores.
	 * @see Social.US.OrderedList
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */		
	getTopScoresList: function(){
		return OrderedList.getObjectPublicInterface(this, "getTopScoresList", "_leaderboardTopScoresInterface");
	},
	
	/**
	 * Returns an <code>OrderedList</code> of scores for the user's friends.
	 * 
	 * @name Social.US.Leaderboard.getFriendsScoresList
	 * @function
	 *
	 * @returns {Social.US.OrderedList} The list of scores for the user's friends.
	 * @see Social.US.OrderedList
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */		
	getFriendsScoresList: function(){
		return OrderedList.getObjectPublicInterface(this, "getFriendsScoresList", "_leaderboardFriendsScoresInterface");
	}

	 /**
	  * The user's level in the game. Read-only.
	  * @name Social.US.Leaderboard.level
	  * @field
	  * @status iOS, Android, Test, iOSTested, AndroidTested
	  */
	 
	 /**
	  * The leaderboard title. Read-only.
	  * @name Social.US.Leaderboard.title
	  * @field
	  * @status iOS, Android, Test, iOSTested, AndroidTested
	  */

	 /**
	  * The game name. Read-only.
	  * @name Social.US.Leaderboard.game
	  * @field
	  * @status iOS, Android, Test, iOSTested, AndroidTested
	  */
	 
	 /**
	  * A URL to the leaderboard icon. Read-only.
	  * @name Social.US.Leaderboard.iconURL
	  * @field
	  * @status iOS, Android, Test, iOSTested, AndroidTested
	  */
		 
});

/**
 * Returns the leaderboard(s) for the current game.
 * To return a leaderboard, you must set up at least one leaderboard for your game in the Mobage Sandbox or Production environment.
 *
 * @name Social.US.Leaderboard.getLeaderboards
 * @function
 * @static
 *
 * @cb {Function} cb The function to call after retrieving the leaderboard(s) for the current game.
 * @cb-param {Object} error Information about the error, if any.
 * @cb-param {String} error.description A description of the error.
 * @cb-param {String} error.errorCode A code identifying the error type.
 * @cb-param {Social.US.Leaderboard[]} leaderboards An array of leaderboards for the current game.
 * @cb-returns {void}
 * @returns {void}
 * @status iOS, Android, Test, iOSTested, AndroidTested
 */
Leaderboard.getLeaderboards = function(cb){
	Dispatcher.callClassMethodOnRemoteObject(Leaderboard, "getLeaderboards", [cb]);
};