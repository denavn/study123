var DataModelReq = require("./DataModel");
var Dispatcher = require("../Data/Dispatcher").Dispatcher;

/**
 * <code>AppData</code> constructs objects that get and set a user's properties, 
 * and provides permissions for sharing the user's properties with other users.
 * <br /><br />
 * To use the <code>AppData</code> API, you must indicate on the Mobage Developer Portal that your
 * application uses this API. To do this, follow these steps:
 * <ol>
 * <li>Log into the Developer Portal at
 * <a href="https://developer-sandbox.mobage.com/en/portal/dashboard">https://developer-sandbox.mobage.com/en/portal/dashboard</a>.</li>
 * <li>Click the Apps tab at the top of the page, then click the name of your application.</li>
 * <li>Scroll to the bottom of the page and click Edit Product Details, then scroll
 * to the bottom of the page and ensure that the "Use userdata api" box is selected.</li>
 * <li>Click Save to save your changes.</li>
 * </ol>
 * <br /><br />
 * <strong>Note</strong>: You can also use ngCore's <code>{@link Storage.KeyValue}</code> and
 * <code>{@link Storage.FileSystem}</code> classes to store application data on the user's device.
 * @class 
 * @name Social.US.AppData
 * @see Social.Common.Appdata
 * @see Storage.KeyValue
 * @see Storage.FileSystem
 */
var AppData = exports.AppData = DataModelReq.DataModel.subclass({
/** @lends Social.US.AppData.prototype */
		
	classname: "AppData",
	properties: [
		"data",
		"key",
		"user",
		"permissions"
	],
	
	/**
	 * The application data for the user. Limited to 1024 bytes.
	 * 
	 * @name data
	 * @fieldOf Social.US.AppData#
	 * @public
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	
	/**
	 * The key describing the application data. Limited to 32 bytes.
	 * 
	 * @name key
	 * @fieldOf Social.US.AppData#
	 * @public
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	
	/**
	 * The name of the user who owns the data.
	 * 
	 * @name name
	 * @fieldOf Social.US.AppData#
	 * @public
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	 
	/**
	 * The permissions for the application data.
	 * 
	 * @name permissions
	 * @fieldOf Social.US.AppData#
	 * @public
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	
    /**
     * The default constructor.
     * @constructs 
     * @name Social.US.AppData.initialize
     * @private
     *
     * @param recordID A unique ID for the <code>AppData</code> object.
     *
     * @augments Social.US.DataModel
     * @status iOS, Android, Test, iOSTested, AndroidTested
     */	
    initialize: function($super, recordID) {
        $super(recordID);
    }
});

/**
 * Takes a user reference and returns key/value pairs of the user for the current game.
 * @name Social.US.AppData.getKeysForUser
 * @function
 * @static
 *
 * @param {Social.US.User} user A reference to the user.
 * @cb {Function} cb The function to call after retrieving key/value pairs.
 * @cb-param {Object} error Information about the error, if any.
 * @cb-param {String} error.description A description of the error.
 * @cb-param {String} error.errorCode A code identifying the error type.
 * @cb-param {Object} entries The key/value pairs for the user. The properties of the object
 *		represent keys. The value of each property represents the value of the corresponding key.
 * @cb-returns {void}
 * @example
 * var user = Social.US.Session.getCurrentSession().user();
 * var AppData = Social.US.AppData;
 * var retrievedEntries = null;
 * AppData.getKeysForUser(user, function(error, entries){
 *     retrievedEntries = entries;
 * });
 * @returns {void}
 * @status iOS, Android, Test, iOSTested, AndroidTested
 */
AppData.getKeysForUser = function(user, cb){
	Dispatcher.callClassMethodOnRemoteObject(AppData, "getKeysForUser", [user, cb]);
};

/**
 * Takes a user, a key (the name of the key for a name/value pair) and returns the key/value pair
 * for the user for the current game.
 * @name Social.US.AppData.getDataForUserWithKey
 * @function
 * @static
 *
 * @param {Social.US.User} user A reference to the user.
 * @param {String} key The name of the key.
 * @cb {Function} cb The function to call after retrieving the specified value.
 * @cb-param {Object} error Information about the error, if any.
 * @cb-param {String} error.description A description of the error.
 * @cb-param {String} error.errorCode A code identifying the error type.
 * @cb-param {Object} response Information about the key.
 * @cb-param {String} response.data The value of the key.
 * @cb-returns {void}
 * @example
 * var user = Social.US.Session.getCurrentSession().user();
 * var AData = Social.US.AppData;
 * var errorCode = null;
 * var errorDesc = null;
 * var fetchedData = null;
 * AData.getDataForUserWithKey( user, 
 *                              key, 
 *                              function(error, response){
 *                                   errorCode = error.errorCode;
 *                                   errorDesc = error.description;
 *                                   fetchedData = response.data;
 *                              }
 *                            );
 * @returns {void}
 * @status iOS, Android, Test, iOSTested, AndroidTested
 */
AppData.getDataForUserWithKey = function(user, key, cb){
	Dispatcher.callClassMethodOnRemoteObject(AppData, "getDataForUserWithKey", [user, key, cb]);
};


/**
 * Takes data, a user, a key (the name of the key for a name/value pair) and permissions for the
 * data and sets the application data for the user.
 * <b>Note:</b> Limited to 30 key/value pairs per user, per game. 
 * Maximum key name limited to 32 bytes. Maximum value limited to 1,024 bytes.
 * To use key/value pairs without the foregoing constraints, use ngCore's
 * <code>{@link Storage.KeyValue}</code> class.
 * @name Social.US.AppData.setDataForUserWithKeyAndPermissions
 * @function
 * @static 
 *
 * @param {String} data The data to set.
 * @param {Social.US.User} user A reference to the user.
 * @param {String} key The name of the key.
 * @param {Social.US.AppData.Permissions} permission The permissions for the data.
 * @cb {Function} cb The function to call after setting the value.
 * @cb-param {Object} error Information about the error, if any.
 * @cb-param {String} error.description A description of the error.
 * @cb-param {String} error.errorCode A code identifying the error type.
 * @cb-returns {void}
 * @example
 * var user = Social.US.Session.getCurrentSession().user();
 * var data = "some data";
 * var key = "some key";
 * var errorCode = null;
 * var errorDesc = null;
 * var result = null; 
 *
 * var AData = Social.US.AppData;
 * 
 * AData.setDataForUserWithKeyAndPermissions(data, 
 *                                           user, 
 *                                           key, 
 *                                           AppData.Permissions.Private, 
 *                                           function(error, response){
 *                                             errorCode = error.errorCode;
 *                                             errorDesc = error.description;
 *                                             result = response;
 *                                           }
 *                                         );
 * @returns {void}
 * @status iOS, Android, Test, iOSTested, AndroidTested
 * @see Social.US.AppData.Permissions
 * @see Social.Common.Appdata
 * @see Storage.KeyValue
 * @see Storage.FileSystem
 */
AppData.setDataForUserWithKeyAndPermissions = function(data, user, key, permissions, cb){
	Dispatcher.callClassMethodOnRemoteObject(AppData, "setDataForUserWithKeyAndPermissions", [data, user, key, permissions, cb]);
};



/**
 * Enumeration to define permissions for viewing user data.
 * @name Permissions
 * @fieldOf Social.US.AppData#
 * @status iOS, Android, Test, iOSTested, AndroidTested
 */

/**
 * Only the user can read and write the user data.
 * @name Permissions.Private
 * @fieldOf Social.US.AppData#
 * @constant
 */

/**
 * Friends can read the user data but cannot write it.
 * @name Permissions.FriendsReadOnly
 * @fieldOf Social.US.AppData#
 * @constant
 */

/**
 * All users can read the user data but cannot write it.
 * @name Permissions.PublicReadOnly
 * @fieldOf Social.US.AppData#
 * @constant
 */

/** @ignore */
AppData.Permissions = {
	Private: 0,
	FriendsReadOnly: 1,
	PublicReadOnly: 2
};
