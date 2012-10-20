var GSGlobals = require("../../_Internal/GSGlobals");	

/**
 * @class 
 * @name Social.Common.Profanity
 * @description
 * Provides an interface to check games for profanity.
 */
exports.Profanity = {
	
	/**
	 * Checks a text string to determine if it contains profanity.
	 * This call only conducts a check and does not attempt to cleanup the string.<br /><br />
	 * <b>Note:</b> The server handles locale and language automatically.
	 *
	 * @name Social.Common.Profanity.checkProfanity
	 * @function
	 * @public
	 * 
	 * @param {String} text The string to check for profanity.
	 * @cb {Function} callback The function to call after checking the string for profanity.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {Boolean} valid Set to <code>false</code> if the string contains profanity.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */		
	checkProfanity: function(text, callback) {
		var cmd = {apiURL:"Common.Profanity.checkProfanity", text:text, callbackFunc:function(error, args) {
			callback(error, args.profanity);
		}};
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);		
	}	
};
