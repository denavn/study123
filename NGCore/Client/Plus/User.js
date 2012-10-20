var PlusRequestReq = require("././PlusRequest");
var DataModelReq = require("././DataModel");
var UserListReq = require('././UserList');
var MessageEmitterReq = require('../../Shared/MessageEmitter');
var sha1 = require('././sha1');

var CurrentUserAuthTokenDefaultsKey = "com.ngmoco.authentication.auth_key";
var CurrentUserUsernameDefaultsKey = "com.ngmoco.authentication.username";
var CurrentUserAvatarDefaultsKey = "com.ngmoco.authentication.avatar_id";
var UserCacheDefaultsKey = "com.ngmoco.authentication.lastUserObject";
var PlatformCacheDBCurrentUserInstanceKey = "CurrentUser";
var PlatformCacheDBCurrentFriendsInstanceKey = "CurrentUserFriends";
var PlatformCacheDBCurrentFollowersInstanceKey = "CurrentUserFollowers";
//var PlatformCacheDBCurrentGamesInstanceKey = "CurrentGames";
var kUserKey = "user";
var kErrorKey = "error";
var kListKey = "list";
var kTargetKey = "target";
var kActionKey = "action";

var UserRecordIdKey = "user_id";

var User = DataModelReq.DataModel.subclass({
/** @lends Plus.User.prototype */
    classname: "User",
    initialize: function($super, recordID, dict) {
        $super(recordID);

		/*
		 * Email_hash is only returned in some cases. For example,
		 * when doing a search based on email hashes.  This code
		 * takes care not to overwrite any existing email_hash value.
		 */
		if ((typeof dict[User.EmailHashKey]) != 'undefined') {
			this.emailHash = dict[User.EmailHashKey];
        	if (this.emailHash) {
            	this.emailHash = this.emailHash.toLowerCase();
        	}
		}
        this.gamertag = dict[User.GamertagKey];
        this.avatarId = dict[User.AvatarKey];
        this.motto = dict[User.MottoKey];
        if (!this.motto || this.motto === null) {
            this.motto = "";
        }
        this.relation = dict[User.RelationKey];
        this.sparse = true;
    },
    addBuddy: function(buddyUser, cb) {
        var myUser = this;
        var request = new PlusRequestReq.PlusRequest();
        request.setApiMethod("users/" + myUser.recordID + "/buddies");
        request.setHttpMethod("POST");
        request.setPostBody({
            id: buddyUser.recordID,
            enemy: "false"
        });
        request.send(function(err, data) {
            cb(err, data);
        });
    },
    deleteBuddy: function(buddyUser, cb) {
        var myUser = this;
        var request = new PlusRequestReq.PlusRequest();
        request.setApiMethod("users/" + myUser.recordID + "/buddies/" +
        buddyUser.recordID);
        request.setHttpMethod("DELETE");
        request.send(function(err, data) {
            cb(err, data);
        });
    },
    getUserDetails: function(cb) {
        var myUser = this;
        var cachedUser = DataModelReq.DataModel.getObjectWithRecordID(User.classname, myUser.recordID);
        if ((cachedUser !== null) && (typeof cachedUser.sparse != 'undefined') &&
        (cachedUser.sparse === false)) {
            cb(undefined, cachedUser);
            return;
        }
        var request = new PlusRequestReq.PlusRequest();
        request.setApiMethod("users/" + myUser.recordID);
        request.setHttpMethod("GET");
		request.setEntityTag(this.entityTag);
        request.send(function(err, data, status, headers) {
            var user = null;
            if (!err) {
                if (status == 304) {
                    user = User.getUserWithRecordID(myUser.recordID);
                } else {
                    // Call getUserDataWithData to fetch any previously returned object
                    // instance, so "mutability property" can be maintained
                    user = User.getUserWithData(data);
                    user.photoId = data[User.PhotoKey];
                    if ((typeof user.photoId == "undefined") ||
                    (0 === user.photoId.length)) {
                        user.photoId = null;
                    }

                    // If any of these fields are empty, just set them to empty strings.
                    user.emailAddress = data[User.EmailAddressKey];
                    if (!user.emailAddress || null === user.emailAddress) {
                        user.emailAddress = "";
                    }

					/*
					 * Email_hash is only returned in some cases. For example,
					 * when doing a search based on email hashes.  This code
					 * takes care not to overwrite any existing email_hash value.
					 */
					if ((typeof data[User.EmailHashKey]) != 'undefined') {
						user.emailHash = data[User.EmailHashKey];
			        	if (user.emailHash) {
			            	user.emailHash = user.emailHash.toLowerCase();
			        	}
					}

                    user.phoneNumber = data[User.PhoneNumberKey];
                    if (!user.phoneNumber || null === user.phoneNumber) {
                        user.phoneNumber = "";
                    }

                    user.password = data[User.PasswordKey];

                    user.firstName = data[User.FirstNameKey];
                    user.lastName = data[User.LastNameKey];

                    user.hideFullName = data[User.PrivacyKey];
                    user.ageRestricted = data[User.AgeRangeKey];
                    user.isNewRelationship = data[User.NewBuddyKey];
                    user.isMutualFriend = data[User.IsMutualFriendKey];

                    //		        user.capabilities = [UserCapabilities objectFromCacheRepresentation:data[User.CapabilitiesKey]];
                    user.showsPresence = !data[User.HidePresenceKey];
                    user.onlyShowFriendNotifications = data[User.OnlyShowFriendNotificationsKey];

                    // gamerscore/level
                    user.gamerscore = data[User.GamerScoreKey] || 0;
                    user.gamerLevel = data[User.LevelNumberKey] || 0;
                    user.gamerLevelName = data[User.LevelNameKey];
                    user.gamerLevelScore = data[User.CurrentLevelScoreKey] || 0;
                    user.gamerNextLevelScore = data[User.NextLevelScoreKey] || 0;

                    // load games
                    if (data[User.GamesKey]) {
                        var thegames = [];
                        for (var gameDict in data[User.GamesKey]) {
                            if (data[User.GamesKey].hasOwnProperty(gameDict)) {
                                //						var game = new NGCore(gameDict);
                                //						thegames.push(game);
                                NgLogD("TODO: not implemented. would have loaded game" +
                                " at: " + gameDict);
                            }
                        }
                        user.games = thegames;
                    }
                    else {
                        user.games = [];
                    }

					user.entityTag = headers.etag;

                    user.sparse = false;
                    cb(undefined, user);
                }
            }
        });
    },
    getFollowersList: function(pageSize) {
        // Call getUserList to fetch any previously returned object
        // instance, so "mutability property" can be maintained
        var list = UserListReq.UserList.getUserList(this.recordID, "followers", pageSize);
        return list;
    },
    getBuddiesList: function(pageSize) {
        // Call getUserList to fetch any previously returned object
        // instance, so "mutability property" can be maintained
        var list = UserListReq.UserList.getUserList(this.recordID, "buddies", pageSize);
        return list;
    }
});

DataModelReq.DataModel.defineSetterCallbacks(User, [
	"gamertag",
	"avatarId",
	"motto",
	"relation",
	"sparse",
	"photoId",
	"emailAddress",
	"emailHash",
	"phoneNumber",
	"password",
	"firstName",
	"lastName",
	"hideFullName",
	"ageRestricted",
	"isNewRelationship",
	"isMutualFriend",
	"showsPresence",
	"onlyShowFriendNotifications",
	"capabilities",
	"gamerscore",
	"gamerLevel",
	"gamerLevelName",
	"gamerLevelScore",
	"gamerNextLevelScore",
	"games"
]);

User._loopUsersDetails = function(cb, err, total, offset, pagesize, users, retlist) {
    if (users.length <= 0) {
        cb(err, retlist, total, offset, pagesize);
        return;
    }
    var myUser = users.pop();
    if (myUser.sparse) {
        var loopUsersCl = function(err2, user) {
            if (!err2) {
                retlist.unshift(user);
                User._loopUsersDetails(cb, err, total, offset, pagesize, users, retlist);
            } else {
                // NOTE: currently system returns last error, previous errors
                // are simply not available
                retlist.unshift(myUser);
                User._loopUsersDetails(cb, err2, total, offset, pagesize, users, retlist);
            }
        };
        myUser.getUserDetails(loopUsersCl);
    } else {
        retlist.unshift(myUser);
        User._loopUsersDetails(cb, err, total, offset, pagesize, users, retlist);
    }
};

User.findUsersWithEmailHashes = function(hashes, cb){
	var batches = [];
	while(hashes.length > 0){
		if(hashes.length > 100){
			batches.push(hashes.splice(0,100));
		}else{
			batches.push(hashes.splice(0, hashes.length));
		}
	}
	
	var requests = 0;
	var results = [];
	var requestCallback = function(err, users){
		requests--;
		for(var idx=0; idx<users.length; idx++){
			results[users.offset + idx] = users[idx];
		}
		
		if(requests === 0){
			cb(err, results);
		}
	};
	
	for(var idx=0; idx < batches.length; idx++){
		var batch = batches[idx];
		var batchString = batch.join(",");
		requests++;

		User.findUsersWithEmail(batchString, requestCallback);
	}
};

User.findUsersWithEmail = function(email, cb){
	var request = new PlusRequestReq.PlusRequest();
	request.setHttpMethod("GET");
	request.setApiMethod("users/search");
	request.setPostBody({
		email_hash: User.emailAddressLooksValid(email) ? User.hashForEmail(email) : email
	});

	request.send(function(err, data){
		if(!(data && !err && data.success === true)){
			data = {profiles: [], total: 0, offset: 0};
		}
		var profiles = data.list;
		var users = [];

		for(var idx in profiles){
			var profile = profiles[idx];
			var user = User.getUserWithData(profile);
			users.push(user);
		}

		users.offset = data.offset;
		users.total = data.total;

		cb(err, users);
	});
};

User.findUsersFromContactList = function(contacts, cb){
	var hashes = [];
	var hashesToContacts = {};
	for(var contactIdx in contacts){
		var contact = contacts[contactIdx];
		var emails = contact.lowercaseEmails || [];
		for(var emailIdx=0; emailIdx < emails.length; emailIdx++){
			var email = emails[emailIdx];
			var hash = User.hashForEmail(email);
			
			if(!hashesToContacts[hash]){
				hashesToContacts[hash] = [];
				hashes.push(hash);
			}

			hashesToContacts[hash].push(contact);
		}
	}
	
	User.findUsersWithEmailHashes(hashes, function(err, users){
		for(var idx=0; idx<users.length; idx++){
			var user = users[idx];
			var hash = user.emailHash;
			
			var userContacts = hashesToContacts[hash];
			for(var contactIdx = 0; contactIdx < userContacts.length; contactIdx++){
				var userContact = userContacts[contactIdx];
				user.displayName = userContact.displayName;
				contacts.splice(contacts.indexOf(userContact), 1);
			}
		}
		
		cb(err, contacts, users);
	});
};

User.emailAddressLooksValid = function(email){
	return email.match(/\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/);
};

User.hashForEmail = function(email){
	return sha1.hex_sha1(email);
};

User.sendFriendInviteToEmail = function(email, cb){
	var request = new PlusRequestReq.PlusRequest();
	request.setHttpMethod("POST");
	request.setApiMethod("invitations");
	request.setPostBody({
		email: email
	});

	request.send(cb);
};

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

User.GamerScoreKey = "gamerscore";
User.LevelNumberKey = "level_position";
User.LevelNameKey = "level_name";
User.CurrentLevelScoreKey = "level_points";
User.NextLevelScoreKey = "level_next_points";

// properties that are not returned in sparse search results
User.NonSparseKeys = [User.PhotoKey, User.EmailAddressKey,
User.EmailHashKey, User.PhoneNumberKey, User.PasswordKey,
User.FirstNameKey, User.LastNameKey, User.PrivacyKey,
User.AgeRangeKey, User.NewBuddyKey, User.IsMutualFriendKey,
User.CapabilitiesKey, User.HidePresenceKey,
User.OnlyShowFriendNotificationsKey, User.GamerScoreKey,
User.LevelNumberKey, User.LevelNameKey, User.CurrentLevelScoreKey,
User.NextLevelScoreKey, User.GamesKey];

User._currentUser = null;
User._emitter = null;

User.currentUser = function() {
    return User._currentUser;
};

User.setCurrentUser = function(user) {
    User._currentUser = user;

	if(User._emitter){
		User._emitter.emit({user: user});
	}
};

User.addCurrentUserListener = function(listener, callback, priority){
	if(!User._emitter){
		User._emitter = new MessageEmitterReq.MessageEmitter();
	}
	
	User._emitter.addListener(listener, callback, priority);
};

User.removeCurrentUserListener = function(listener){
	if(User._emitter){
		User._emitter.removeListener(listener);
	}
};

User.getUserWithData = function(data) {
    var recordID = data[UserRecordIdKey];
    var cachedUser = DataModelReq.DataModel.getObjectWithRecordID(User.classname, recordID);
    if (cachedUser !== null) {
        return cachedUser;
    }

    var user = new User(recordID, data);
    // Enter this user object into the cache to maintain 'mutability' property
    cachedUser = user._registerWithLocalCache();
    return cachedUser;
};

exports.User = User;
