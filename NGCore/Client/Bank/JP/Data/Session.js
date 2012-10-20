var GSGlobals = require("../../_Internal/GSGlobals");

var Session = exports.Session = Core.MessageEmitter.singleton({
	classname: "Session",
	    
    _userInfo: {
        recordID:0, 
        gamertag:""
    },
    
    platformVersion: function(){
		var config = Core.Capabilities.getConfigs();
		var platformVersion = "unknown";
		if(config && config.hasOwnProperty("platformVersion")){
			platformVersion = config.platformVersion;
		}
		return platformVersion;
	},
    
    user: function() {
        this._recvUserIdInfo();
        return Session._userInfo;
    },
    
    updateUserId: function(userId, callback){
		var data = {
			userId: userId
		};
		this._sendWriteCommand("JP.Session.updateUserId", data, callback);
	},
    
    getCurrentSession: function() {
        return this;
    },
    
    _recvUserIdInfo: function(params) {               
       var entries = {
				'userId': 0
			};
       this.updateUserId(entries, function(error, keys) {
            Session._userInfo.recordID = keys.userId;
       });
    },
    
	_sendWriteCommand: function(apiURL, data, callback) {
		var cmd = {
			apiURL: apiURL,
			data: data
		};
		if(callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = function(error, keys){
				if(!error){error = undefined;}
				callback(error, keys)
			};
		}
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	}
});
