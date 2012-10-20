/**
 * Public Social.JP.Textdata
 */

var GSGlobals = require("../../_Internal/GSGlobals");

/**
 * @class <code>Textdata</code> is an API to receive the text data that the users input.
 * The input texts are saved to the server and watched by the server. <br>
 * <br>
 * Workflow<br><ol>
 * <li> Creates a new TextDataGroup (REST APIs only) </li>
 * <li> The following two functions are available after the TextDataGroup creation (REST APIs only) <ol>
 * <li> Getting TextDataGroup </li>
 * <li> Deleting TextDataGroup </li></ol></li>
 * <li> Creates a new TextData entry that belongs to the TextDataGroup (Both REST APIs and This JS APIs) </li>
 * <li> The following three functions are available after the TextData entry creation (Both REST APIs and This JS APIs) </li><ol>
 * <li> Getting TextData </li>
 * <li> Updating TextData </li>
 * <li> Deleting TextData </li></ol>
 * </ol>
 * <br>
 * Note that users are required at first to create TextDataGroup objects for the grouping of
 * TextData objects by using REST APIs (OAuth Consumer Request). <br>
 * <br>
 * [Notes] <br>
 * <ul>
 * <li>TextData#parentId are required to represent parent-child relationship. It is always required for the server to watch these parent-child structures. </li>
 * <li> Input only the strings that are interpretable as sentences into TextData#data field. If the input strings aren't interpretable as sentences, then operators may delete them. </li>
 * <li> If TextData#data includes NG words that are against Mobage Service Policy, additions and updates of TextData entries cause "400 Bad Request". </li></ul>
 * <br>
 * [TextData Object Fields]
 * <table><tbody> <tr>
 * <th> value </th>
 * <th> description </th>
 * <th> type </th>
 * <th> note </th> </tr> <tr>
 * <td> id </td>
 * <td> the id of the TextData object </td>
 * <td> String </td>
 * <td> &#8211; </td> </tr> <tr>
 * <td> groupName </td>
 * <td> the name of the TextDataGroup object </td>
 * <td> String </td>
 * <td> &#8211; </td> </tr> <tr>
 * <td> parentId </td>
 * <td> the id of the parent TextData object </td>
 * <td> String </td>
 * <td> &#8211; </td> </tr> <tr>
 * <td> writerId </td>
 * <td> the id of the writer</td>
 * <td> String </td>
 * <td> &#8211;</td> </tr> <tr>
 * <td> ownerId </td>
 * <td> the id of the owner</td>
 * <td> String </td>
 * <td> &#8211;</td> </tr> <tr>
 * <td> data </td>
 * <td> the input text data </td>
 * <td> String </td>
 * <td> up to 2048bytes </td> </tr> <tr>
 * <td> status </td>
 * <td> the logical status value </td>
 * <td> Int </td>
 * <td> &#8211; </td> </tr> <tr>
 * <td> published </td>
 * <td> the date that the text was published </td>
 * <td> Date </td>
 * <td> GMT </td> </tr> <tr>
 * <td> updated </td>
 * <td> the date that the text was updated </td>
 * <td> Date </td>
 * <td> GMT </td> </tr>
 * </tbody></table>
 * <br>
 * [Error Code]
 * <table><tbody> <tr>
 * <th> Error Code </th>
 * <th> Description </th> </tr> <tr>
 * <td> 400 (Bad Request)</td>
 * <td> Illegal client request that is uncategorizable </td> </tr>
 * <td> 401 (Unauthorized) </td>
 * <td> Authentication error </td> </tr>
 * <td> 403 (Forbidden) </td>
 * <td> Access forbidden due to other than authentication (the resource exists)  </td> </tr>
 * <td> 404 (Not Found) </td>
 * <td> Non-existent resource </td> </tr>
 * </tbody></table>
 */

exports.Textdata = { 
	/**
	 * Retrieves the specified entries from the server.
	 *
	 * @function
	 * @name Social.JP.TextData.getEntries
	 * @param {String} groupName The group name of the TextDataGroup.
	 * @param {Array} ids The string array of the ids.
	 * @param {Function} callback The callback function that uses the TextData entries.
	 * @example
	 *  var groupName = "group1";
	 *  var ids = ["1107", "1108", "1109"];
	 *  var callback = function(error, entries){
	 *    if(error){
	 *      var code = error.errorCode;
	 *      var desc = error.description;
	 *      // handle errors
	 *      // ...
	 *      return;
	 *    }
	 *
	 *    for (var i = 0; i < entries.length; i++) {
	 *      var id = entries[i].id; // the id of the TextData object
	 *      var groupName = entries[i].groupName; // the name of the TextDataGroup object
	 *      var parentId = entries[i].parentId; // the id of the parent TextData object
	 *      var writerId = entries[i].writerId; // the guid of who wrote the text
	 *      var ownerId = entries[i].ownerId; // the guid of the owner of the text
	 *      var data = entries[i].data; // the input text data
	 *      var status = entries[i].status; // the logical status value
	 *      var published = entries[i].published; // the date that the text was published
	 *      var updated = entries[i].updated; // the date that the text was updated
	 *    }
	 *  };
	 *  Social.JP.Textdata.getEntries(groupName, ids, callback);
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	getEntries: function(groupName, ids, callback){
		var data = {
			groupName: groupName,
			ids: ids
		};
		this._sendWriteCommand("JP.Textdata.getEntries", data, callback);
	},

	/**
	 * Creates a new entry.
	 * If the entry data has an invalid word, the errorCode 400 will be returned.
	 *
	 * @function
	 * @name Social.JP.Textdata.createEntry
	 * @param {String} groupName The group name of the TextDataGroup.
	 * @param {Object} entry New TextData entry.
	 * @param {Function} callback The callback function that handles errors.
	 * @example
	 *  var groupName = "group1";
	 *  var entry = {
	 *                 "parentId": "123", // optional
	 *                 "data" : "This is my first TextData entry!" // required
	 *              };
	 *  var callback = function(error, entry){
	 *    if(error){
	 *      var code = error.errorCode;
	 *      var desc = error.description;
	 *      // handle errors
	 *      // ...
	 *      return;
	 *    }
	 *    var id = entry.id; // the id of the TextData object
	 *    var groupName = entry.groupName; // the name of the TextDataGroup object
	 *    var parentId = entry.parentId; // the id of the parent TextData object
	 *    var writerId = entry.writerId; // the guid of who wrote the text
	 *    var ownerId = entry.ownerId; // the guid of the owner of the text
	 *    var data = entry.data; // the input text data
	 *    var status = entry.status; // the logical status value
	 *    var published = entry.published; // the date that the text was published
	 *    var updated = entry.updated; // the date that the text was updated
	 *
	 *  };
	 *  Social.JP.Textdata.createEntry(groupName, entry, callback);
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	createEntry: function(groupName, entry, callback){
		var data = {
			groupName: groupName,
			entry: entry
		};
		this._sendWriteCommand("JP.Textdata.createEntry", data, callback);
	},

	/**
	 * Updates an entry.
	 *
	 * @function
	 * @name Social.JP.Textdata.updateEntry
	 * @param {String} groupName The group name of the TextDataGroup.
	 * @param {String} id the id of the TextData object.
	 * @param {Object} entry The TextData entry to be updated.
	 * @param {Function} callback The callback function that handles errors.
	 * @example
	 *  var groupName = "group1";
	 *  var id = "1108";
	 *  var entry = {
	 *                 "data" : "This is my first TextData entry!" // required
	 *              };
	 *  var callback = function(error){
	 *    if(error){
	 *      var code = error.errorCode;
	 *      var desc = error.description;
	 *      // handle errors
	 *      // ...
	 *      return;
	 *    }
	 *  };
	 *  Social.JP.Textdata.updateEntry(groupName, id, entry, callback);
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	updateEntry: function(groupName, id, entry, callback){
		var data = {
			groupName: groupName,
			id: id,
			entry: entry
		};
		this._sendWriteCommand("JP.Textdata.updateEntry", data, callback);
	},

	/**
	 * Deletes an entry.
	 *
	 * @function
	 * @name Social.JP.Textdata.deleteEntry
	 * @param {String} groupName The group name of the TextDataGroup.
	 * @param {String} id The id of the TextData object.
	 * @param {Function} callback The callback function that handles errors.
	 * @example
	 *  var groupName = "group1";
	 *  var id = "1108";
	 *  var callback = function(error){
	 *    if(error){
	 *      var code = error.errorCode;
	 *      var desc = error.description;
	 *      // handle errors
	 *      // ...
	 *      return;
	 *    }
	 *  };
	 *  Social.JP.Textdata.deleteEntry(groupName, id, callback);
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	deleteEntry: function(groupName, id, callback) {
		var data = {
			groupName: groupName,
			id: id
		};
		this._sendWriteCommand("JP.Textdata.deleteEntry", data, callback);
	},

	_sendReadCommand: function(apiURL, data, callback) {
		var cmd = {
			apiURL: apiURL,
			data: data
		};
		if(callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = function(error, result){
				if(!error){error = undefined;}
				callback(error, result.entries)
			};
		}
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},

	_sendWriteCommand: function(apiURL, data, callback) {
		var cmd = {
			apiURL: apiURL,
			data: data
		};
		if(callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = function(error, ids){
				if(!error){error = undefined;}
				callback(error, ids)
			};
		}
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	}
};
