var Core		= require("../../../../Client/Core").Core;
var Device		= require("../../../../Client/Device").Device;

var DataModelR	= require("./DataModel");
var OrderedList	= require("./OrderedList").OrderedList;
var Dispatcher	= require("../Data/Dispatcher").Dispatcher;

/**
 * <code>Game</code> objects identify a game and its properties.
 * Game properties include: 
 * <ul>
 * <li><code>name</code></li>
 * <li><code>publisher</code></li>
 * <li><code>category</code></li>
 * <li><code>featured</code></li>
 * <li><code>numberOfLeaderboards</code></li> 
 * <li><code>numberOfAchievements</code></li>
 * <li><code>masterProductID</code></li>
 * <li><code>iconURL</code></li>
 * <li><code>AppStoreURL</code></li>
 * <li><code>feedURL</code></li>
 * <li><code>catalogURL</code></li>
 * </ul>
 * <code>Game</code> objects provide static functions to return all games in a catalog or games associated to a user profile.
 * 
 * @class 
 * @name Social.US.Game
 * @augments Social.US.DataModel
 */
var Game = exports.Game = DataModelR.DataModel.subclass({
	classname: "Game",
	
	
	 //Game is a subclass of data model, and the getter/setter methods are generated by defineSetterCallbacks. The following
	 //comments document the generated methods.
	 /**
	 * The game name. Read-only.
	 * @name Social.US.Game.name
	 * @field
	 * @public
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */

	 /**
	 * The publisher name. Read-only.
	 * @name Social.US.Game.publisher
	 * @field
	 * @public
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 

	 /**
	 * The game category name. Read-only.
	 * @name Social.US.Game.category
	 * @field
	 * @public
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 

	 /**
	 * Whether the game is featured. Read-only.
	 * @name Social.US.Game.featured
	 * @field
	 * @private
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 

	 /**
	 * The number of leaderboards for the game. Read-only.
	 * @name Social.US.Game.numberOfLeaderboards
	 * @field
	 * @public
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */

	 /**
	 * The number of achievements. Read-only.
	 * @name Social.US.Game.numberOfAchievements
	 * @field
	 * @private
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 

	 /**
	 * The master product ID. Read-only.
	 * @name Social.US.Game.masterProductID
	 * @field
	 * @private
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 

	 /**
	 * A URL to the icon for a game. Read-only.
	 * @name Social.US.Game.iconURL
	 * @field
	 * @public
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 

	 /**
	 * A URL to the store or marketplace for a game. Read-only.
	 * @name Social.US.Game.appStoreURL
	 * @field
	 * @private
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 

	 /**
	 * A URL to the RSS feed for a game. Read-only.
	 * @name Social.US.Game.feedURL
	 * @field
	 * @private
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 

	 /**
	 * Sets a catalog URL for the catalog of game items. Read-only.
	 * @name Social.US.Game.catalogURL
	 * @field
	 * @private
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 

	properties: [
		// public
		"name",
		"publisher",
		"category",
		"numberOfLeaderboards",
		"iconURL",
		
		// private
		"numberOfAchievements",
		"featured",
		"masterProductID",
		"appStoreURL",
		"feedURL",
		"catalogURL",
		"description",
		"phone_screenshot_urls",
		"ngcore_url",
		"androidMarketIntentURL"
	],
	
	/**
	 * @public
	 * Sends the user to the app store for this Game
	 */
	goToAppStore: function() {
		if (Core.Capabilities.getPlatformOS().toLowerCase() === "iphone os") {
			Device.IPCEmitter.launch(this.appStoreURL);
		} else {
			Device.IPCEmitter.launchIntent(this.androidMarketIntentURL);
		}
	}
});

/**
 * Returns an ordered list interface to the Mobage game catalog.
 * 
 * @name Social.US.Game.getAllGamesList
 * @function
 * @private 
 * @static
 *
 * @returns {Social.US.OrderedList} An ordered list interface to the catalog of games.
 * @see Social.US.OrderedList
 * @status iOS, Android, Test, iOSTested, AndroidTested
 */
Game.getAllGamesList = function(){
		
	return OrderedList.getClassPublicInterface(Game, "getAllGamesList", "_allGamesInterface");
};

/**
 * Returns the current game. 
 *
 * @name Social.US.Game.getCurrentGame
 * @function
 * @static
 *
 * @cb {Function} cb The function to call after retrieving the current game.
 * @cb-param {Object} error Information about the error, if any.
 * @cb-param {String} [error.description] A description of the error.
 * @cb-param {String} [error.errorCode] A code identifying the error type.
 * @cb-param {String} game An identifier for the game.
 * @cb-returns {void}
 * @returns {void}
 * @status iOS, Android, Test, iOSTested, AndroidTested
 */
Game.getCurrentGame = function(cb){
	Dispatcher.callClassMethodOnRemoteObject(Game, "getCurrentGame", [cb]);
};