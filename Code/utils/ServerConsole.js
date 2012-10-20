var HTTPRequest   = require("../../NGGo/Service/Network/HTTPRequest").HTTPRequest;
var Core = require('../../NGCore/Client/Core').Core;
var host = "http://10.0.0.12:8080";

exports.ServerConsole = Core.Class.singleton({	
	log: function(path)
	{
	    var req = new HTTPRequest();
	    req.get(host+path, function() {});
	}
});