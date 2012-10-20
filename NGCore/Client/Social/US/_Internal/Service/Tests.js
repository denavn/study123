/*jsl:ignoreall*/
var RouterInited = require("../../../_Internal/RouterInit");
var GSGlobals = require("../../../_Internal/GSGlobals");

exports.Tests = {
	showPrivilegedToastWithMessage: function(msg,callback) {
		NgLogD("Public call showPrivilegedToastWithMessage");
	
		var cmd = {
			apiURL:"US.Service.Tests.showPrivilegedToastWithMessage",
			data:msg
		};
	
		if(callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = callback;
		}
	
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},
	doGlobalsTest: function(msg,callback) {
		NgLogD("Public call doGlobalsTest");

		var cmd = {
			apiURL:"US.Service.Tests.doGlobalsTest",
			data:msg
		};

		if(callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = callback;
		}

		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},
	doWindowExaminationTest: function(msg,callback) {
		NgLogD("Public call doWindowExaminationTest");

		var cmd = {
			apiURL:"US.Service.Tests.doWindowExaminationTest",
			data:msg
		};

		if(callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = callback;
		}

		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},
	doShowLoginTest: function() {
		NgLogD("Public call doShowLoginTest");
		
		var cmd = {
			apiURL:"US.Service.Tests.doShowLoginTest"
		};
		
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},
	doShowRegistrationTest: function() {
		NgLogD("Public call doShowRegistrationTest");
		
		var cmd = {
			apiURL:"US.Service.Tests.doShowRegistrationTest"
		};
		
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},
    /**
    * Takes game data and sets up a session.
    *
    * @name Tests.setupSession
    * @function
    * @public
    * @ignore    
    *
    * @param {Social.US.Game} gameData Takes a reference with game data.
    * @param {Function} The callback function.
    */    
    setupSession: function(gameData,callback) {
        NgLogD("Tests: public interface for setupSession");
        var cmd = {
            apiURL:"US.Service.Tests.setupSession",
            data:gameData
        };
    
        if(callback != undefined && typeof callback == "function") {
            cmd["callbackFunc"] = callback;
        }

        GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
    },


    bankGetBalance: function(callback) {
        NgLogD("Public call getBalance");

	    var cmd = {
	        apiURL:"US.Service.Tests.bankGetBalance"
	    };

	    if (callback != undefined && typeof callback == "function") {
	        cmd["callbackFunc"] =  function(err, data) {
		        if(err) {
		            callback(err, undefined);
		        } else {
		            callback(err, data.success, data.balance, data.currency, data.currencyIconURL);				
		        }

	        };
	    }

	    GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
    },

    getCreditItems: function(callback) {
        NgLogD("Public call getCreditItems");        
        	   
        var cmd = {
	        apiURL:"US.Service.Tests.getCreditItems"
	    };

	    if (callback != undefined && typeof callback == "function") {
	        cmd["callbackFunc"] =  function(err, data) {
		        if(err) {
		            callback(err, undefined);
		        } else {
		            callback(err, data.items);				
		        }

	        };
	    }

	    GSGlobals.getRouterInstance().sendCommandToGameService(cmd);

    },

    logMissingLocalizationStrings: function() {
    	
    	var cmd = {
    		apiURL:"US.Service.Tests.logMissingLocalizationStrings"
    	};
    	
    	GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
    }
};