var GSGlobals = require("../../_Internal/GSGlobals");

/**
 * @class
 * @name Social.Common.Auth
 * @description
 * Retrieves a verification code.
 * Games call <code>Auth.authorizeToken()</code> if the game server is using the Mobage REST API.
 * For more information, refer to the Mobage RESTful API documentation on the
 * <a href="https://developer.mobage.com/">Developer Portal</a>.
 */
exports.Auth = {
		
		
	/**
	 * Authorizes a temporary credential and returns a verification code.
	 *
	 * 
	 * @name Social.Common.Auth.authorizeToken
	 * @function
	 * @public
	 *
	 * @param {String} token The temporary credential identifier. 
	 * @cb {Function} callback The function to call after authorizing the temporary credential.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {String} verifier The verification code.
	 * @cb-returns {void}
	 * @example
	 * var token = "abcdefghi";
     * ...
	 * Social.Common.Auth.authorizeToken (token, callback);
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */		
	authorizeToken: function(token, callback) {
		var cmd = {apiURL:"Common.Auth.authorizeToken", token:token, callbackFunc: callback };
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);		
		//callback(error, verifier)
	}
};
