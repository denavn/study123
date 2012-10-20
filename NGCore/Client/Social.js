/**
 * Public API for GameService
 * 
 * Access this file as NGCore/Client/Social.js
 */

// Note the proper require path for our public interface files is: "./Social/US/[filename]"

/**
 * @namespace Manage user data, connect to friends, and more.
 * @name Social
 * @description
 * The <code>Social</code> namespace provides interfaces for the Mobage Social APIs.
 */
exports.Social = {
};

/**
 * @namespace
 * @name Social.Common
 * @description
 * The <code>Social.Common</code> namespace provides APIs for functionality that is shared by the
 * Japan (JP) and United States/worldwide (US) submodules. The features provided by this namespace
 * include Auth, People, Appdata, Blacklist, Profanity and Service.<br /><br />
 * <strong>Important</strong>: You are strongly encouraged to use the <code>Social.Common</code> 
 * APIs wherever possible. If your application uses the <code>Social.US</code> APIs, you must
 * rewrite portions of your application in order to release it in Japan. The same issue applies to
 * the <code>Social.JP<code> APIs.
 */
exports.Social.Common = new (require("./Social/US/_Internal/_RequireLoader").RequireLoader)({
	"Appdata": function() { return require("./Social/US/Common/Appdata").Appdata; },
	"Auth": function() { return require("./Social/US/Common/Auth").Auth; },
	"Blacklist": function() { return require("./Social/US/Common/Blacklist").Blacklist; },
	"Config": function() { return require("./Social/US/Common/Config").Config; },
	"People": function() { return require("./Social/US/Common/People").People; },
	"Profanity": function() { return require("./Social/US/Common/Profanity").Profanity; },
	"Request": function() { return require("./Social/US/Common/Request").Request; },
	"RemoteNotification": function() { return require("./Social/US/Common/RemoteNotification").RemoteNotification; },
	"Service": function() { return require("./Social/US/Common/Service").Service; },
	"Analytics": function() { return require("./Social/US/Common/Analytics").Analytics; },
	"Leaderboard": function() { return require("./Social/US/Common/Leaderboard").Leaderboard; }
});

/**
 * @namespace
 * @name Social.US
 * @description
 * The <code>Social.US</code> namespace provides APIs for the United States (US) submodule. The
 * features provided by this namespace include User, Game, Leaderboard, Score, Ordered List, and
 * AppData.<br /><br />
 * <strong>Important</strong>: You are strongly encouraged to use the <code>Social.Common</code>
 * APIs wherever possible. If your application uses the <code>Social.US</code> APIs, you must
 * rewrite portions of your application in order to release it in Japan.
 */
exports.Social.US = new (require("./Social/US/_Internal/_RequireLoader").RequireLoader)({
	// Data Models
	"DataModel": function() { return require("./Social/US/Models/DataModel").DataModel; },
	"User": function() { return require("./Social/US/Models/User").User; },
	"Game": function() { return require("./Social/US/Models/Game").Game; },
	"FullGamercard": function() { return require("./Social/US/Models/FullGamercard").FullGamercard; },
	"Leaderboard": function() { return require("./Social/US/Models/Leaderboard").Leaderboard; },
	"Achievement": function() { return require("./Social/US/Models/Achievement").Achievement; },
	"Score": function() { return require("./Social/US/Models/Score").Score; },
	
	"AppData": function() { return require("./Social/US/Models/AppData").AppData; },
	
	// Data Cache
	"Cache": function() { return require("./Social/US/Models/Cache").Cache; },

	// Data APIs
	"Session": function() { return require("./Social/US/Data/Session").Session; },
	"Dispatcher": function() { return require("./Social/US/Data/Dispatcher").Dispatcher; }
});

/**
 * @namespace
 * @name Social.US.Service
 * @description
 * Service APIs include the Community button, the Balance button, the Friend Picker, the User Finder, and the User Profile.
 */
exports.Social.US.Service = new (require("./Social/US/_Internal/_RequireLoader").RequireLoader)({
	"Leaderboards": function() { return require("./Social/US/Service/Leaderboards").Leaderboards; },
	"Friends": function() { return require("./Social/US/Service/Friends").Friends; },
	"Profile": function() { return require("./Social/US/Service/Profile").Profile; },
	"ButtonOverlays": function() { return require("./Social/US/Service/ButtonOverlays").ButtonOverlays; },
	"GameLaunchPayload": function() { return require("./Social/US/Service/GameLaunchPayload").GameLaunchPayload; },
	"Achievements": function() { return require("./Social/US/Service/Achievements").Achievements; }
});

/**
 * @namespace Enable in-game purchasing using MobaCoin on Android or your own in-game currency on iOS.
 * @name Bank
 * @description
 * The <code>Bank</code> namespace provides interfaces for the Mobage Bank APIs.
 */
exports.Bank = require("./Social/US/Service/Bank").Bank;