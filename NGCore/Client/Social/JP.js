/**
 * Public API for GameService
 * 
 * Access this file as NGCore/Client/Social.js
 */

// Note the proper require path for our public interface files is: "./Social/JP/[filename]"




exports.Social = {
};

exports.Social.Common = new (require("./Social/JP/_RequireLoader").RequireLoader)({
	"Appdata": function() { return require("./Social/JP/Common/Appdata").Appdata; },
	"Blacklist": function() { return require("./Social/JP/Common/Blacklist").Blacklist; },
	"People": function() { return require("./Social/JP/Common/People").People; },
	"Profanity": function() { return require("./Social/JP/Common/Profanity").Profanity; },
	"Service": function() { return require("./Social/JP/Common/Service").Service; },
	"Auth": function() { return require("./Social/JP/Common/Auth").Auth; },
	"Config": function() { return require("./Social/JP/Common/Config").Config; },
	"Analytics": function() { return require('./Social/JP/Common/Analytics').Analytics; },
	"RemoteNotification": function() { return require('./Social/JP/Common/RemoteNotification').RemoteNotification; },
	"Leaderboard": function() { return require('./Social/JP/Common/Leaderboard').Leaderboard; }
});


exports.Social.JP = new (require("./Social/JP/_RequireLoader").RequireLoader)({
	"Avatar": function() { return require("./Social/JP/Data/Avatar").Avatar; },
	"Textdata": function() { return require("./Social/JP/Data/Textdata").Textdata; },
	"Service": function() { return require('./Social/JP/Service').Service; }
});




var GameEventSender = require('./Social/JP/Service/_GameEventSender')._GameEventSender;
GameEventSender.ping();



