var GSGlobals = require("../../_Internal/GSGlobals");

/**
 * @class 
 * @name Social.Common.Appdata
 * @description
 * Mobage provides a common API for application data, which you can use for both Japan and the US. 
 * <code>Appdata</code> is consistent with the Open Social <code>osapi.appdata</code> interface 
 * and enables the application to store name/value pairs for arbitrary application data.
 * To add or update application data, call <code>updateEntries()</code>. To retrieve entries, call
 * <code>getEntries()</code>. To delete entries, call <code>deleteEntries()</code>.
 * <br /><br />
 * To use the <code>Appdata</code> API, you must indicate on the Mobage Developer Portal that your
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
 * In addition, you can use the <code>{@link Social.US.AppData}</code> class to store application
 * data; however, if you use this class, you must rewrite portions of your application before
 * releasing it in Japan.
 * @see Social.US.AppData
 * @see Storage.KeyValue
 * @see Storage.FileSystem
 */
exports.Appdata = {
/** @lends Social.Common.Appdata.prototype */
		
	/**
	 * Retrieves a hash of one or more key/value pairs.
	 * If the <code>keys</code> parameter is <code>null</code>, <code>undefined</code> or an empty array, <code>getEntries()</code> 
	 * returns all key/value pairs to the callback function.
	 *
	 * @name Social.Common.Appdata.getEntries
	 * @function
	 * @public
	 * 
	 * @param {Array} keys Set as an array of key names. For example, <code>['key1', 'key2']</code>.
	 * @cb {Function} callback The function to call after retrieving the key-value pairs.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {Object} keys The key/value pairs that were retrieved. The object's properties 
	 *		represent keys, and the value of each property represents the value of the 
	 *		corresponding key.
	 * @cb-returns {void}
	 * @see Social.Common.Appdata.updateEntries
	 * @example 
	 * Appdata.getEntries(['key1', 'key2'], callback );
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */	
	getEntries: function(keys, callback) {
		var cmd = {apiURL:"Common.Appdata.getEntries", keys:keys, callbackFunc:callback};
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);		
	},
	
	/**
	 * Inserts or updates the submitted key/value pairs. 
	 * <b>Note:</b> Limited to 30 key/value pairs per user, per game. 
	 * Maximum key name limited to 32 bytes. Maximum value limited to 1,024 bytes.
	 * To use key/value pairs without the foregoing constraints, use ngCore's
	 * <code>{@link Storage.KeyValue}</code> class.
	 *
	 * @name Social.Common.Appdata.updateEntries
	 * @function
	 * @public
	 * 
	 * @param {Object} entries The key/value pairs to insert or update. The object's properties 
	 *		represent keys, and the value of each property represents the value of the 
	 *		corresponding key.
	 * @cb {Function} callback The function to call after inserting or updating the key/value pairs.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {Object} keys The key/value pairs that were inserted or updated. The object's 
	 *		properties represent keys, and the value of each property represents the value of the 
	 *		corresponding key.
	 * @cb-returns {void}
	 * @see Social.Common.Appdata.getEntries
	 * @example
	 * Appdata.updateEntries(
	 *              {   'favoriteMovie':'Pulp Fiction',    
	 *                  'petName':'Rover' }, 
	 *              callback );
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */		
	updateEntries: function(entries, callback) {
		if(entries) {
			var cmd = {apiURL:"Common.Appdata.updateEntries", entries:entries, callbackFunc:callback};
			GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
		} else {
			if(typeof callback === 'function') {
				callback({ 
						errorCode: 400,
						description: "Entries to update are a required parameter"
					}, null);
			}
		}
	},
	
	
	/**
	 * Deletes one or more key/value pairs.
	 *
	 * @name Social.Common.Appdata.deleteEntries
	 * @function
	 * @public
	 * 
	 * @param {Array} keys An array of key names to delete. For example, <code>['petName']</code>.
	 * @cb {Function} callback The function to call after deleting the key/value pairs.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {Object} keys The key/value pairs that were deleted. The object's properties 
	 *		represent keys, and the value of each property represents the value of the corresponding
	 *		key.
	 * @cb-returns {void}
	 * @example
	 * Appdata.deleteEntries(['petName'], callback );
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */		
	deleteEntries: function(keys, callback) {
		if(keys && keys.length > 0) {
			var cmd = {apiURL:"Common.Appdata.deleteEntries", keys:keys, callbackFunc:callback};
			GSGlobals.getRouterInstance().sendCommandToGameService(cmd);		
		} else {
			if(typeof callback === 'function') {
				callback({ 
						errorCode: 400,
						description: "Keys to delete are a required parameter"
					}, null);
			}
		}
	}
};
