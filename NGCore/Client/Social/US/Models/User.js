var DataModelR  = require("./DataModel");
var Dispatcher  = require("../Data/Dispatcher").Dispatcher;
var OrderedList = require("./OrderedList").OrderedList;
var Social      = require("../../../../Client/Social").Social;

/**
* <code>User</code> constructs objects that provide a service interface for the current user. 
* <code>User</code> objects enable the current user to retrieve:
* <ul>
* <li>user details</li>
* <li>a list of friends</li>
* <li>games</li>
* </ul>
* @class
* @name Social.US.User
* @augments Social.US.DataModel
*/
var User = exports.User = DataModelR.DataModel.subclass({
		
    /**
    * @constructs
    * @ignore
    */
	classname: "User",

	 /**
	 * The user's gamer tag. Read-only.
	 * @name Social.US.User.gamertag
	 * @field
	 * @public
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */

	 /**
	 * The user's avatar ID. Read-only.
	 * @name Social.US.User.avatarId
	 * @field
	 * @public
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 
	 /**
	 * The user's motto. Read-only.
	 * @name Social.US.User.motto
	 * @field
	 * @public
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 
	 /**
	 * The relation to this user. Read-only.
	 * @name Social.US.User.relation
	 * @field
	 * @public
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */

	 /**
	 * Sparse limits attributes in search results. Read-only.
	 * @name Social.US.User.sparse
	 * @field
	 * @public
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 

	 /**
	 * The user's photo ID. Read-only.
	 * @name Social.US.User.photoId
	 * @field
	 * @public
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 
	 /**
	 * The user's email address. Read-only.
	 * @name Social.US.User.emailAddress
	 * @field
	 * @private
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 

	 /**
	 * A hash of the user's email address. Read-only.
	 * @name Social.US.User.emailHash
	 * @field
	 * @public
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 

	 /**
	 * The user's phone number. Read-only.
	 * @name Social.US.User.phoneNumber
	 * @field
	 * @private
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */


	 /**
	 * The user's password. Read-only.
	 * @name Social.US.User.password
	 * @field
	 * @private
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 

	 /**
	 * The user's first name. Read-only.
	 * @name Social.US.User.firstName
	 * @field
	 * @private
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */


	 /**
	 * The user's last name. Read-only.
	 * @name Social.US.User.lastName
	 * @field
	 * @private
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 

	 /**
	 * Whether to hide the user's full name. Read-only.
	 * @name Social.US.User.hideFullName
	 * @field
	 * @private
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 
	 /**
	 * Whether the user is age restricted. Read-only.
	 * @name Social.US.User.ageRestricted
	 * @field
	 * @public
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */

	 /**
	 * Whether the relationship to the user is new. Read-only.
	 * @name Social.US.User.isNewRelationship
	 * @field
	 * @private
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */

	 /**
	 * Whether the user is a mutual friend. Read-only.
	 * @name Social.US.User.isMutualFriend
	 * @field
	 * @public
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */

	 /**
	 * Whether the user shows his/her presence. Read-only.
	 * @name Social.US.User.showsPresence
	 * @field
	 * @private
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 
	 /**
	 * Whether the user only shows friend notifications. Read-only.
	 * @name Social.US.User.setOnlyShowFriendNotifications
	 * @field
	 * @private
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */	 

	 /**
	 * The user's capabilities. Read-only.
	 * @name Social.US.User.capabilities
	 * @field
	 * @private
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 
	 /**
	 * The user's gamer score. Read-only.
	 * @name Social.US.User.gamerscore
	 * @field
	 * @private
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */	 

	 /**
	 * The user's gamer level. Read-only.
	 * @name Social.US.User.gamerLevel
	 * @field
	 * @private
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */	 

	 /**
	 * The user's gamer level name. Read-only.
	 * @name Social.US.User.gamerLevelName
	 * @field
	 * @private
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 
	 /**
	 * The gamer level score. Read-only.
	 * @name Social.US.User.gamerLevelScore
	 * @field
	 * @private
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 
	 /**
	 * The gamer score for the next level. Read-only.
	 * @name Social.US.User.gamerNextLevelScore
	 * @field
	 * @private
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 
	 /**
	 * The user's games. Read-only.
	 * @name Social.US.User.games
	 * @field
	 * @private
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */

	properties: [
		// public
		"gamertag",
		"avatarId",
		"motto",
		"relation",
		"sparse",
		"photoId",
		"emailHash",
		"ageRestricted",
		"isMutualFriend",
		
		// private
		"phoneNumber",
		"password",
		"firstName",
		"lastName",
		"hideFullName",
		"emailAddress",
		"isNewRelationship",
		"showsPresence",
		"onlyShowFriendNotifications",
        "allowFriendPostsOnly",
		"capabilities",
		"gamerscore",
		"gamerLevel",
		"gamerLevelName",
		"gamerLevelScore",
		"gamerNextLevelScore",
		"games"
	],
	
	/**
	 * @constructs The default constructor constructs <code>User</code> objects.
	 * @name Social.US.User.initialize 
	 * @private
	 */
	initialize: function($super, recordID){
		$super(recordID);
		NgLogD("User Public! " + recordID + " " + this.recordID);
	},
	
	
	/**
	* Adds a user to the buddies list and ensures the added user is not on the blocked users list.
	* @name Social.US.User.addBuddy
	* @function
	* @private
	*
	* @param {Social.US.User} buddy The user to add to the buddies list. If not a user, the callback error is "No user."
	* @param {Function} cb The callback function.
	* <br/> 
	* <b>Callback Example:</b><br/>
	* <pre class="code">function(error, data){
    * &nbsp;&nbsp;  if (error){
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;    var errorCode = error.errorCode;
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;    var errorDesc = error.description;
    * &nbsp;&nbsp;  } else {
    * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;    var buddyData = data;
    * &nbsp;&nbsp;  }
	* }
	* </pre>
	* @returns {void}
	*/	
	addBuddy: function(buddy, cb){
		Dispatcher.callMethodOnRemoteObject(this, "addBuddy", [buddy, cb]);
	},
	
	
	/**
	* Removes a user from the buddies list.
	* @name Social.US.User.removeBuddy
	* @function
	* @private
	*
	* @param {User} buddy The user to remove from the buddies list. If not a user, the callback error is "No user."
	* @param {Function} cb The callback function.
	* <br/> 
	* <b>Callback Example:</b>
	* <pre class="code">function(error, data){
    * &nbsp;&nbsp;  if (error){
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;    var errorCode = error.errorCode;
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;    var errorDesc = error.description;
    * &nbsp;&nbsp;  } else {
    * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;    var buddyData = data;
    * &nbsp;&nbsp;  }
	* }
	* </pre>
	* @returns {void}
	*/		
	removeBuddy: function(buddy, cb){
		Dispatcher.callMethodOnRemoteObject(this, "deleteBuddy", [buddy, cb]);
	},
	ignoreBuddy: function(buddy, cb){
		Dispatcher.callMethodOnRemoteObject(this, "ignoreBuddy", [buddy, cb]);
	},
	/**
	 * Retrieves a user object with all of the user's details.
	 *
	 * @name Social.US.User.getUserDetails
	 * @function
	 * 
	 * @cb {Function} cb The function to call after retrieving the user's details.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.description] A description of the error.
 	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {Social.US.User} user Detailed information about the user.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */			
	getUserDetails: function(cb){
		Dispatcher.callMethodOnRemoteObject(this, "getUserDetails", [cb]);		
	},
	
	/**
	* Retrieves an ordered list of the user's friend requests on Mobage.
	* @name Social.US.User.getMobageFriendRequestLists
	* @function
	*
	* @returns {Social.US.OrderedList} A list of the user's friend requests.
    * @example
    * var myMobageFriendRequests = userA.getMobageFriendRequestsList();
    * @see Social.US.OrderedList
	*/			
	getMobageFriendRequestsList: function(){
		return OrderedList.getObjectPublicInterface(this, "getInvitesList", "_followersListInterface");
	},
	
	/**
	* Returns the user's friends list on Mobage.
	* @name Social.US.User.getMobageFriendsList
	* @function
	*
	* @returns {Social.US.OrderedList} The user's friend list on Mobage.
    * @example
    * var myMobageFriendsList = userA.getMobageFriendsList();
    * @see Social.US.OrderedList
    * @status iOS, Android, Test, iOSTested, AndroidTested
	*/
	getMobageFriendsList: function(){
		return OrderedList.getObjectPublicInterface(this, "getFriendsList", "_friendsListInterface");
	},
	
	/**
	* Returns the user's blocked user list.
	* @name Social.US.User.getMobageBlockedUserList
	* @function
	*
	* @returns {Social.US.OrderedList} The user's blocked user list on Mobage.
	* @see Social.US.OrderedList
	* @status iOS, Android, Test, iOSTested, AndroidTested
	*/
	getMobageBlockedUserList: function(){
		return OrderedList.getObjectPublicInterface(this, "getBlockedUserList", "_enemyListInterface");
	},
	
	/**
	* Returns the user's games list.
	* @name Social.US.User.getOwnedGamesList
	* @function
	*
	* @returns {Social.US.OrderedList} The user's Mobage game list.
    * @example
    * var myGamesList = userA.getOwnedGamesList();
    * @see Social.US.OrderedList
    * @status iOS, Android, Test, iOSTested, AndroidTested
	*/			
	getOwnedGamesList: function(){
		return OrderedList.getObjectPublicInterface(this, "getOwnedGamesList", "_ownedGamesListInterface");
	},
	
	/**
	* MAX: TODO: DOCUMENT
	* returns achievements list for current game for this user
	*/			
	getAchievementsList: function(){
		return OrderedList.getObjectPublicInterface(this, "getAchievementsList", "_achievementsListInterface");
	},

	/**
	* Returns the list of "featured" users.
	* @name Social.US.User.getFeaturedUsersList
	* @function
	*
	* @returns {Social.US.OrderedList} The list of "featured" users.
    * @example
    * var mobageFeaturedUsers = userA.getFeaturedUsersList();
    * @see Social.US.OrderedList
    * @status iOS, Android, Test, iOSTested, AndroidTested
	*/	
	getFeaturedUsersList: function(){
		return OrderedList.getObjectPublicInterface(this, "getFeaturedUsersList", "_featuredUsersListInterface");
	},

	/**
	* Invites the user to the current game.
	* @name Social.US.User.inviteToCurrentGame
	* @function
	* @cb {Function} cb The function to call after inviting the user to the current game.
	* @cb-param {Object} error Information about the error, if any.
 	* @cb-param {String} [error.description] A description of the error.
 	* @cb-param {String} [error.errorCode] A code identifying the error type.
	* @cb-returns {void}
 	* @returns {void}
	* @status iOS, Android, Test, iOSTested, AndroidTested
	*/
	inviteToCurrentGame: function(cb){
		var user = this;
		Dispatcher.callMethodOnRemoteObject(this, "inviteToCurrentGame", [function(err){
			if(!err){
				Social.Common.Service.invitedUserEmitter.emit({userId: user.recordID});
				Social.US.Service.Friends.invitedUserEmitter.emit({user: user});
			}
			cb.apply(this, Array.apply(null, arguments));
		}]);		
	},
	
	/**
	 * Send a Push notification to this user through the GameService back end.
	 * @name Social.US.User.sendNotificationToUser
	 * @function
	 *
	 * @param {Alert Text} alertText The displayed message when the push is received.
	 * @param {Badge ID} badgeId Badge displayed on the push.
	 * @param {Sound} sound Sound played when push is received.
	 * @param {Extra Data} extraData Additional payload.
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */	
	sendNotificationToUser: function(alertText, badgeId, sound, extraData) {
		Dispatcher.callMethodOnRemoteObject(this, "sendNotificationToUser", [alertText, badgeId, sound, extraData]);
	},

    /**
     * Adds a user to the current user's friend list for the current game. Implies a one-directional relationship or "follower" model.
     * Takes an optional group parameter to add the user to a particular group. Current user can only 
     * add the user to one group. If the current user adds the user to a second group in the friend list, 
     * the user is moved from the first group.
     *
     * A group is an arbitrary classification of friends. The <code>group</code> parameter is a string, which 
     * takes the name of the group. You may allow users to manage their own groups, create game-level groups, 
     * or omit groups altogether. A user may only reside in one group of another user's friend list.<br /><br />
     * <b>Note:</b> This is part of the Game Graph API. 
     *
     * @example
     * //Retrieve a user and set up a follower relationship.
     * var userA = Social.US.User; 
     * Social.US.User.getUserWithGamertag("chuck", function(error, user){
     *   if(!user) {
     *       var errorCode = error.errorCode;
     *       var errorDesc = error.description;
     *   } else {
     *        userA = user;
     *   }
     * });
     * var userB = Social.US.Session.getCurrentSession().user();
     * userB.addFriend(userA, callback);
     * //...
     * @example
     * //To make the relationship bi-directional, 
     * //you must make the same call for the other user.
     * userA.addFriend(userB, callback);
     *
     * @name Social.US.User.addFriend
     * @function
     *
     * @param {Social.US.User} user The user to add to the current user's friend list. If <code>null</code>, <code>undefined</code> or not a 
     * <code>Social.US.User</code> object, the callback error is "No user."
     * @param {String} [group] An optional parameter for adding the friend into a group within the friend list.
     * @cb {Function} cb The function to call after adding a user to the current user's friend list.
 	 * @cb-param {Object} error Information about the error, if any.
 	 * @cb-param {String} [error.description] A description of the error.
 	 * @cb-param {String} [error.errorCode] A code identifying the error type.
     * @cb-param {Object} data Information about the user.
     * @cb-returns {void}
     * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
     */	
	addFriend: function(user, group, cb){
		if(typeof arguments[1] == "function" && !arguments[2]){
			cb = arguments[1];
			group = undefined;
		}
		Dispatcher.callMethodOnRemoteObject(this, "addGameFriend", [user, group, cb]);
	},

    /**
     * Removes a user from the current user's friend list for the current game.<br /><br />
     * Does not require a group parameter, friends are only associated to one group in a friend list.
     * @name Social.US.User.removeFriend
     * @function
     *
     * @param {Social.US.User} user The user to remove from the current user's friend list. If <code>null</code>, <code>undefined</code> or not a 
     * <code>Social.US.User</code> object, the callback error is "No user."
     * @cb {Function} cb The function to call after removing a user from the current user's
     *                   friend list.
 	 * @cb-param {Object} error Information about the error, if any.
 	 * @cb-param {String} error.description A description of the error.
 	 * @cb-param {String} error.errorCode A code identifying the error type.
     * @cb-param {Object} data Information about the user.
     * @cb-returns {void}
     * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
     */		
	removeFriend: function(user, cb){
		Dispatcher.callMethodOnRemoteObject(this, "removeGameFriend", [user, cb]);
	},
	
	report: function(reason, cb){
		Dispatcher.callMethodOnRemoteObject(this, "report", [reason, cb]);
	},

    /**
	 * Returns the user's friend list for the current game. If you specify the <code>group</code>
	 * parameter, this call only returns friends within the group.<br /><br />
	 * <b>Note:</b> This is part of the Game Graph API.
	 * @name Social.US.User.getFriendsList
	 * @function
	 *
	 * @param {String} group If specified, returns only friends in the group.
	 * @returns {Social.US.OrderedList} The user's friend list for the current game.
	 * @example
	 * var myFriendsList = userA.getFriendsList ("Best Buddies");
	 * @see Social.US.OrderedList
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */	
	getFriendsList: function(group){
		return OrderedList.getObjectPublicInterface(this, "getGameFriendsList", (group ? ("_gameFriendsList-friends-" + group ) : "_gameFriendsList-friends"), "friends", group);
	},


    /**
    * Returns the user's mutual friends.
    * Mutual friends result when two users add each other to their respective friend list.<br /><br />
    * <b>Note:</b> This is part of the game graph API.
    * @name Social.US.User.getMutualFriendsList
    * @function
    *
    * @param {String} group The group within the friend list. If specified, returns only mutual friends within the group.
    * @returns {Social.US.OrderedList} The user's mutual friend list.
    * @example
    * userA.addFriend(userB);
    * userB.addFriend(userA);
    * var myMutualFriends = userA.getMutualFriendsList();
    * //userA appears in userB's mutual friends list, 
    * //because they are in each other's friend lists.
    * @see Social.US.OrderedList
    * @status iOS, Android, Test, iOSTested, AndroidTested    
    */	
	getMutualFriendsList: function(group){
		return OrderedList.getObjectPublicInterface(this, "getGameFriendsList", (group ? ("_gameFriendsList-mutual-" + group) : "_gameFriendsList-mutual"), "mutual", group);
	},


    /**
    * Returns the user's friend requests list. If the <code>group</code> parameter is specified, returns
    * only friends within the group.
    * @name Social.US.User.getFriendRequestsList
    * @function
    *
    * @param {String} group The group within the friend request list.
    * @returns {Social.US.OrderedList} The user's friend requests list.
    * @example
    * var myFriendRequestsList = userA.getFriendRequestsList ();
    * @see Social.US.OrderedList
    * @status iOS, Android, Test, iOSTested, AndroidTested
    */	
	getFriendRequestsList: function(group){
		return OrderedList.getObjectPublicInterface(this, "getGameFriendsList", (group ? ("_gameFriendsList-invitation-" + group) : "_gameFriendsList-invitation"), "invitation", group);
	},

	/**
	* Updates the email address for the current user.
	* @name Social.US.User.setEmailAddress
	* @function
	* @private
	*
	* @param {String} newAddress The email address for the current user.
	* @param {Function} cb The callback function if an error occurs (for example, invalid email address format).
	* <br/> 
	* <b>Callback Example:</b><br/>
	* <code>function(error){<br/>
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorCode = error.errorCode;<br/>
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorDesc = error.description;<br/>
	* &nbsp;&nbsp;   }<br/>
	* </code>
    * @status iOS, Android, Test, iOSTested, AndroidTested	
	*/	
	setEmailAddress:function(newAddress,cb) {
		Dispatcher.callMethodOnRemoteObject(this, "setEmailAddress", [newAddress, cb]);
	},
	
	/**
	* Sets whether the current user will receive notifications from other Mobage users or just from Mobage friends.
	* @name Social.US.User.setOnlyShowFriendNotifications
	* @function
	* @private
	*
	* @param {Boolean} isFriendsOnly Set to <code>true</code> if the current user will only receive notifications from Mobage users who are also Mobage friends. 
    * If set to <code>false</code>, the user receives notifications from all Mobage users. 
	* @param {Function} cb The callback function if an error occurs.
	* <br/> 
	* <b>Callback Example:</b><br/>
	* <code>function(error){<br/>
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorCode = error.errorCode;<br/>
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorDesc = error.description;<br/>
	* &nbsp;&nbsp;   }<br/>
	* </code>
    * @status iOS, Android, Test, iOSTested, AndroidTested	
	*/	
	setOnlyShowFriendNotifications:function(isFriendsOnly,cb) {
		Dispatcher.callMethodOnRemoteObject(this, "setOnlyShowFriendNotifications", [isFriendsOnly, cb]);
	},
	
	/**
	* Sets whether the current user will receive game news and updates from Mobage.
	* @name Social.US.User.setOptsIn
	* @function
	* @private
	*
	* @param {Boolean} optIn Set to <code>true</code> if the current user will receive news and updates from Mobage. 
    * If set to <code>false</code>, the user will not receive news or updates from Mobage. 
	* @param {Function} cb The callback function if an error occurs.
	* <br/> 
	* <b>Callback Example:</b><br/>
	* <code>function(error){<br/>
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorCode = error.errorCode;<br/>
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorDesc = error.description;<br/>
	* &nbsp;&nbsp;   }<br/>
	* </code>
    * @status iOS, Android, Test, iOSTested, AndroidTested	
	*/
	setOptsIn:function(optIn,cb) {
		Dispatcher.callMethodOnRemoteObject(this, "setOptsIn", [optIn, cb]);
	},

    /**
	* Sets whether the current user can receive wall post messages from other Mobage users or just from Mobage friends.
	* @name Social.US.User.setAllowFriendPostsOnly
	* @function
	* @private
	*
	* @param {Boolean} isFriendsOnly Set to <code>true</code> if the current user can only receive wall post messages from Mobage users who are also Mobage friends.
    * If set to <code>false</code>, the user can receive wall post messages from all Mobage users.
	* @param {Function} cb The callback function if an error occurs.
	* <br/>
	* <b>Callback Example:</b><br/>
	* <code>function(error){<br/>
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorCode = error.errorCode;<br/>
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorDesc = error.description;<br/>
	* &nbsp;&nbsp;   }<br/>
	* </code>
    * @status ?
	*/
	setAllowFriendPostsOnly:function(isFriendsOnly,cb) {
		Dispatcher.callMethodOnRemoteObject(this, "setAllowFriendPostsOnly", [isFriendsOnly, cb]);
	},

	/**
	* Sets a motto for the current user. In other words, the user's "about me" text string.
	* @name Social.US.User.setMotto
	* @function
	* @private
	*
	* @param {String} motto The motto for the current user.
	* @param {Function} cb The callback function if an error occurs.
	* <br/> 
	* <b>Callback Example:</b><br/>
	* <code>function(error){<br/>
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorCode = error.errorCode;<br/>
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorDesc = error.description;<br/>
	* &nbsp;&nbsp;   }<br/>
	* </code>
    * @status iOS, Android, Test, iOSTested, AndroidTested	
	*/	
	setMotto:function(motto,cb) {
		Dispatcher.callMethodOnRemoteObject(this, "setMotto", [motto, cb]);
	},
	
	/**
	* Updates the first name for the current user.
	* @name Social.US.User.setFirstName
	* @function
	* @private
	*
	* @param {String} firstName The first name for the current user.
	* @param {Function} cb The callback function if an error occurs.
	* <br/> 
	* <b>Callback Example:</b><br/>
	* <code>function(error){<br/>
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorCode = error.errorCode;<br/>
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorDesc = error.description;<br/>
	* &nbsp;&nbsp;   }<br/>
	* </code>
    * @status iOS, Android, Test, iOSTested, AndroidTested	
	*/	
	setFirstName:function(firstName,cb) {
		Dispatcher.callMethodOnRemoteObject(this, "setFirstName", [firstName, cb]);
	},
	
	/**
	* Updates the last name for the current user.
	* @name Social.US.User.setLastName
	* @function
	* @private
	*
	* @param {String} lastName The last name for the current user.
	* @param {Function} cb The callback function if an error occurs.
	* <br/> 
	* <b>Callback Example:</b><br/>
	* <code>function(error){<br/>
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorCode = error.errorCode;<br/>
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorDesc = error.description;<br/>
	* &nbsp;&nbsp;   }<br/>
	* </code>
    * @status iOS, Android, Test, iOSTested, AndroidTested	
	*/
	setLastName:function(lastName,cb) {
		Dispatcher.callMethodOnRemoteObject(this, "setLastName", [lastName, cb]);
	},
	

	/**
	* Sets a password for the current user.
	* @name Social.US.User.setPassword
	* @function
	* @private
	*
	* @param {String} password The password for the current user.
    * @param {String} confirmation The password confirmation for the current user.
	* @param {Function} cb The callback function if an error occurs. For example, password does not meet requirements; password and confirmation do not match, and so on.
	* <br/> 
	* <b>Callback Example:</b><br/>
	* <code>function(error){<br/>
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorCode = error.errorCode;<br/>
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorDesc = error.description;<br/>
	* &nbsp;&nbsp;   }<br/>
	* </code>
    * @status iOS, Android, Test, iOSTested, AndroidTested	
	*/
	setPassword:function(password,confirmation, cb) {
		Dispatcher.callMethodOnRemoteObject(this, "setPassword", [password, confirmation, cb]);
	},

	/**
	* Sets whether the target user is in the logged-in user's blocked user list.
	* @name Social.US.User.setBlocked
	* @function
	* @private
	*
	* @param {Social.US.User} user The user that is the subject of blocking or unblocking.
    * @param {Boolean} blocked Whether the current user blocks the specified user. If <code>true</code>, the specified user is blocked.
    	* @param {Function} cb The callback function if an error occurs.
	* <br/> 
	* <b>Callback Example:</b><br/>
	* <code>function(error){<br/>
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorCode = error.errorCode;<br/>
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorDesc = error.description;<br/>
	* &nbsp;&nbsp;   }<br/>
	* </code>
    * @status iOS, Android, Test, iOSTested, AndroidTested	
	*/	
	setBlocked:function(blocked, cb){
		Dispatcher.callMethodOnRemoteObject(this, "setBlocked", [blocked, cb]);
	},
	
	/**
	 * Gets the origin of the user's registration.
	 * Mobage records the origin of a user's registration. The "origin" may be the name of an alliance partner.
	 * The origin is typically used as a means of tracking revenue sharing events, such as the promotional activity 
	 * of an alliance partner that attracts new users to Mobage and thereby entitles the alliance partner 
	 * to share in revenue generated by the application.  
	 *
	 * @name Social.US.User.getOriginOfRegistration
	 * @private
	 * @static
	 * @function
	 *
	 * @param {Function} cb The callback function returns the origin of registration, or an error code and description.
	 * <br/> 
	 * <b>Callback Example:</b><br/>
	 * <pre class="code">function(error, originOfRegistration){
	 *     if(!originOfRegistration) {
	 *          var errorCode = error.errorCode;
	 *          var errorDesc = error.description;
	 *     } else {
	 *          var origin = originOfRegistration;
	 *     }
	 * }
	 * </pre>
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	getOriginOfRegistration: function(cb) {
		Dispatcher.callMethodOnRemoteObject(this, "getOriginOfRegistration", [cb]);
	}
});

User.GamertagKey = "gamertag";
User.AvatarKey = "badge_id";
User.MottoKey = "motto";
User.RelationKey = "relation";
User.FirstNameKey = "first_name";
User.LastNameKey = "last_name";
User.BirthdateKey = "birth_date";
User.GenderKey = "gender";
User.PrivacyKey = "fullname_privacy";
User.PhotoKey = "photo_url";
User.EmailAddressKey = "email";
User.EmailHashKey = "email_hash";
User.PhoneNumberKey = "phone_number";
User.AgeRangeKey = "age_restricted";
User.SpamKey = "opt_in";

User.PasswordKey = "password";
User.PasswordConfirmKey = "password_confirmation";
User.GamesKey = "games";
User.CapabilitiesKey = "capabilities";
User.NewBuddyKey = "new_buddy";
User.IsMutualFriendKey = "mutual_friends";
User.HidePresenceKey = "hide_presence";
User.OnlyShowFriendNotificationsKey = "friend_only_notification";
User.AllowFriendPostsOnly = "friend_only_wallpost";

User.GamerScoreKey = "gamerscore";
User.LevelNumberKey = "level_position";
User.LevelNameKey = "level_name";
User.CurrentLevelScoreKey = "level_points";
User.NextLevelScoreKey = "level_next_points";

// properties that are not returned in sparse search results
User.NonSparseKeys = [User.PhotoKey, User.EmailAddressKey,
User.EmailHashKey, User.PhoneNumberKey, User.PasswordKey,
User.FirstNameKey, User.LastNameKey, User.PrivacyKey,
User.NewBuddyKey, User.CapabilitiesKey, User.HidePresenceKey,
User.OnlyShowFriendNotificationsKey, User.AllowFriendPostsOnly, User.GamerScoreKey,
User.LevelNumberKey, User.LevelNameKey, User.CurrentLevelScoreKey,
User.NextLevelScoreKey, User.GamesKey];


/**
 * Retrieves the user corresponding to the <code>userID</code> parameter.
 * @name Social.US.User.getUserWithID
 * @static
 * @function
 * 
 * @param {String} userID The ID for the user.
 * @cb {Function} cb The function to call after retrieving the user.
 * @cb-param {Object} error Information about the error, if any.
 * @cb-param {String} [error.description] A description of the error.
 * @cb-param {String} [error.errorCode] A code identifying the error type.
 * @cb-param {Social.US.User} user Detailed information about the user.
 * @cb-returns {void}
 * @returns {void}
 * @status iOS, Android, Test, iOSTested, AndroidTested
 */	
User.getUserWithID = function(userID, cb){
	Dispatcher.callClassMethodOnRemoteObject(User, "getUserWithID", [userID, cb]);
};

/**
 * Retrieves the user corresponding to the <code>gamertag</code> parameter.
 * @name Social.US.User.getUserWithGamertag
 * @static
 * @function
 * 
 * @param {String} gamertag The user's gamertag.
 * @cb {Function} cb The function to call after retrieving the user.
 * @cb-param {Object} error Information about the error, if any.
 * @cb-param {String} [error.description] A description of the error.
 * @cb-param {String} [error.errorCode] A code identifying the error type.
 * @cb-param {Social.US.User} user Detailed information about the user.
 * @cb-returns {void}
 * @returns {void}
 * @status iOS, Android, Test, iOSTested, AndroidTested
 */	
User.getUserWithGamertag = function(gamertag, cb){
	Dispatcher.callClassMethodOnRemoteObject(User, "getUserWithGamertag", [gamertag, cb]);
};
