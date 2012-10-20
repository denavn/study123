var RouterInited = require("../../_Internal/RouterInit");
var GSGlobals = require("../../_Internal/GSGlobals");

var MessageEmitter = require("../../../Core/MessageEmitter").MessageEmitter;

var ButtonOverlays = require("../Service/ButtonOverlays").ButtonOverlays;
var Friends = require("../Service/Friends").Friends;
var Leaderboards = require("../Service/Leaderboards").Leaderboards;
var Profile = require("../Service/Profile").Profile;
var User    = require("../Models/User").User;

/**
 * This interface provides the following social game services:
 * <ul>
 * <li>Balance Button</li>
 * <li>Community Button</li>
 * <li>Friend Picker</li>
 * <li>User Finder</li>
 * <li>User Profile</li>
 * <li>Leaderboard</li>
 * </ul>
 * @class 
 * @name Social.Common.Service
 */
exports.Service = {

	/**
	* Opens the leaderboard screen.
	* Launches stand alone leaderboards over the game service with the games leaderboard data
	* @name Social.Common.Service.showLeaderboards
	* @function
	* @public
	* @returns {void}
	* @status not tested
    */
	showLeaderboards: function() {
		Leaderboards.showLeaderboards();
	},

	
	/**
	* Opens the user finder screen.
	* The user finder provides a way for users to find other users using the following filters:
	* <ul>
	* <li>Suggested Friends</li>
	* <li>Contacts</li> 
	* <li>Requests</li>
	* <li>Search</li>
	* </ul>
	*
	* @name Social.Common.Service.openUserFinder 
	* @function
	* @public
	* @returns {void}
	* @status iOS, Android, Test, iOSTested, AndroidTested
    */		
	openUserFinder: function() {
		Friends.showFindFriends(undefined);
	},

	
	/**
	 * Opens the friend picker.
	 *
	 * @name Social.Common.Service.openFriendPicker 
	 * @function
	 * @public 
	 * 
	 * @param {Number} maxFriendsToSelect The maximum number of friends the user may select.
	 * @cb {Function} callback The function to call after opening the friend picker.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {String[]} friendUserIds The user IDs of the friends that were chosen.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	openFriendPicker: function(maxFriendsToSelect, callback) {
		Friends.showFriendPicker(maxFriendsToSelect, function(err, friends){
			var userIDs = [];
			friends = friends || [];
			for(var idx = 0; idx < friends.length; idx++){
				userIDs.push(friends[idx].recordID);
			}
			callback( userIDs );
		});
	},

	
	/**
	 * Opens the specified profile page.
	 *
	 * @name Social.Common.Service.openUserProfile 
	 * @function
	 * @public 
	 * 
	 * @param {String} userId The user ID or gamer name of the profile page to open.
	 * @cb {Function} callback The function to call after opening the profile page.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-returns {void}	 
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	openUserProfile: function(userId, callback) {
		if(typeof userId == "string"){
			// if the userId string contains no non-numeral characters:
			//   parse it into a number
			// else null it out, because it's not a valid userId
			if(userId.match(/[^0-9]/) === null){
				userId = parseInt(userId, 10);
			}else{
				userId = null;
			}
		}
		
		if( !userId ){
			callback({errorCode: 400, description: "userid is invalid"});
		}
		else{
			User.getUserWithID(userId, function(err, user){
				if(err){
					if( err==="Sorry, we can't find anyone with that name." ){
						callback({errorCode: 404, description: err});
					} else {
						callback({errorCode: 500, description: err});
					}
				}else if(!user){
					callback({errorCode: 404, description: "User not found"});
				}else{
					Profile.showUserProfile(user, undefined);
				}
			});
	}
	},


	/**
	 * Displays the <b>Mobage Community</b> button.
	 *	
	 * @name Social.Common.Service.showCommunityButton
	 * @function
	 * @public 
	 * 
	 * @param {UI.ViewGeometry.Gravity} gravity Displays the button in the specified corner. 
	 * <b>Note:</b> Only supported for the US. Japan uses the top-left corner only.
	 * @param {String} theme Displays the theme for the button (for example, "default", "dark", "light"). 
	 * <b>Note:</b> Only supported for Japan. You can specify <code>null</code> for the US region.
	 * @cb {Function} callback The function to call after displaying the Mobage Community button.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-returns {void}
	 * @see UI.ViewGeometry.Gravity
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */           
	showCommunityButton: function(gravity, theme, callback) {
		ButtonOverlays.showCommunityButton(gravity, callback);
	},

	/**
	 * Hides the <b>Mobage Community</b> button.
	 *
	 * @name Social.Common.Service.hideCommunityButton
	 * @function
	 * @public 
	 *	
	 * @cb {Function} callback The function to call after hiding the Mobage Community button.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */		
	hideCommunityButton: function(callback) {
		ButtonOverlays.hideCommunityButton(callback);
	},

	
	/**
	* A message emitter object for adding a message emitter when inviting a user.
	*
	* @name Social.Common.Service.invitedUserEmitter
	* @field
	* @public
	* @example 
	* Social.Common.Service. ...
	* ... invitedUserEmitter.addListener(
	*			new Core.MessageListener(), 
	*			function(userId){
	*				NgLogD("New Emitter! " + userId);
	*			}
	*		);
	* @returns {void}
    * @status iOS, Android, Test, iOSTested, AndroidTested	
	*/
	invitedUserEmitter : new MessageEmitter(),

	
	/**
	 * Shows the balance button where the <code>rect</code> parameter 
	 * determines the size and position of the button.
     * The minimum size of the button is:<br/>
     * <ul>
     * <li>10% of height in Landscape, and the absolute minimum size is 150 x 50.</li>
     * <li>6% of height in Portrait, and the absolute minimum size is 150 x 50.</li>
	 * </ul>
	 *
	 * @name Social.Common.Service.showBalanceButton
	 * @function
	 * @public
	 *	 
	 * @param {UI.ViewGeometry.Rect} rect Determines the size and position of the balance button.
	 * @cb {Function} callback The function to call after showing the balance button.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-returns {void}
	 * @param {String} sourcePage The originating page for the transaction. This value will be
	 *		displayed in your Analytics data.
	 * @see UI.ViewGeometry.Rect
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	showBalanceButton: function(rect, callback, sourcePage) {		
		ButtonOverlays.showBalanceButton(rect, callback, sourcePage);
	},
	
	/**
	 * Hides the balance button.	
	 * @name Social.Common.Service.hideBalanceButton
	 * @function
	 * @public 
	 * 
	 * @cb {Function} callback The function to call after hiding the balance button.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */		
	hideBalanceButton: function(callback) {
		ButtonOverlays.hideBalanceButton(callback);
	}
};