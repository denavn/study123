var Session = require("../Data/Session").Session;

/**
 * @class 
 * @name Social.Common.Config
 * @description
 * An API to determine whether the social server is a sandbox server or a production server. 
 */
exports.Config = {
/** @lends Social.Common.Config.prototype */

    /**
     * Determine whether the server is a sandbox server or a production server.
     * @name getServerEnvironment
     * @memberOf Social.Common.Config#
     * @public
     * @function
     * @returns {String} One of the following values:
     * <ul>
     *     <li><code>production</code>: Production server.</li>
     *     <li><code>sandbox</code>: Sandbox server.</li>
     *     <li><code>unknown</code>: The current session cannot be retrieved, or  the server mode is
     *     neither <code>sandbox</code> nor <code>production</code>.</li>
     * </ul>
     * @see Social.US.Session#serverMode
     * @status iOS, Android, Test, iOSTested, AndroidTested
     */
	getServerEnvironment: function(){
		var session = Session.getCurrentSession();
		if(!session){
			return "unknown";
		}
		
		var serverMode = Session.getCurrentSession().serverMode();
		if(serverMode == Session.serverModes.production){
			return "production";
		}else if(serverMode == Session.serverModes.sandbox){
			return "sandbox";
		}else{
			return "unknown";
		}
	}
};