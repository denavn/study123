var DataModel 	  = require("./DataModel").DataModel;

/**
 * <code>Score</code> constructs objects that reflect a user's score for the current game.
 * @class 
 * @name Social.US.Score
 * @augments Social.US.DataModel
 */
var Score = exports.Score = DataModel.subclass({
	
    classname: "Score",
    	
	 /**
	 * A user's score. Read-only.
	 * @name Social.US.Score.score
	 * @field
	 * @public
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 

	 /**
	 * The score as formatted for display. Read-only.
	 * @name Social.US.Score.displayScore
	 * @field
	 * @public
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 
	
	 /**
	 * The user's rank. Read-only.
	 * @name Social.US.Score.rank
	 * @field
	 * @public
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 
	
	 /**
	 * The user's level in the current game. Read-only.
	 * @name Social.US.Score.level
	 * @field
	 * @public
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	
    
	 /**
	 * A <code>Social.US.User</code> reference to the user associated to the score. Read-only.
	 * @name Social.US.Score.user
	 * @field
	 * @public
     * @see Social.US.User
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */    
	 
    properties: [
	"points",
	"displayScore",
	"rank",
	"level",
	"user"
	]
});
