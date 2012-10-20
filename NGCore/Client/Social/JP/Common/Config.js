/**
 * Public Social.Common.Config
 */

var GSGlobals = require("../../_Internal/GSGlobals");

exports.Config = {
	getServerEnvironment: function() {
		var configs = Core.Capabilities.getConfigs();
		if(configs.hasOwnProperty("platformEnv")){
			if(configs.platformEnv == "sandbox"){
				return "sandbox";
			}else if(configs.platformEnv == "production"){
				return "production";
			}else{
				return "unknown";
			}
		}else{
			return "sandbox";
		}
	}
};
