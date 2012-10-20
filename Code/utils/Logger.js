var Core = require('../../NGCore/Client/Core').Core; 
exports.Logger = Core.Class.singleton({
	log: function(obj, title) {
		var t = title || "study123:";
		console.log(t + obj);
	},
	
	log1: function(obj, title){
		var _title = title || "";
		if(typeof(obj) == "object" && obj != null && obj != undefined){
			if(Core.Capabilities.getPlatformOS() == 'flash'){
				console.log("Logger.log>>===========Start logging========" + _title + "====================");
				console.log(obj);
				console.log("Logger.log>>===========End logging==========" + _title + "====================");
			}else{
				console.log("Logger.log>>===========Start logging========" + _title + "====================");
				for(var k in obj){
					console.log("Logger.log>>"+k+": " + obj[k]);
				}
				console.log("Logger.log>>===========End logging==========" + _title + "====================");
			}
		}else{
			console.log("Logger.log>>" + _title + ": " + obj);
		}		
	}
});