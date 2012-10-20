/**
 * Public Social.JP.Avatar
 */

var GSGlobals = require("../../_Internal/GSGlobals");

/**
 * @name Social.JP.Avatar
 * @class <code>Avatar</code> is a singleton for getting Avatar metadata on JP-Platform.
 * @constructs The default constructor.
 * @augments Core.Class
 * @status iOS, Android, Test, iOSTested, AndroidTested
 */
exports.Avatar = { 

	/**
	 * Use the <code>getAvatar</code> function to pass the Avatar metadata associated with the criteria to the callback function.
	 * <br><br>
	 * <b>Note:</b> URL in the metadata points a non-animated PNG file. swf or animated GIF formats are not supported. Specifying "sprite" as type field in Avatar metadata, png can be used for GL2 texture.<br>
	 * Image size(in pixel) will be as follow.<br>
	 * <table border="1" style="border: 1px solid;">
	 * <tr><th> size </th><th> view </th><th> width </th><th> height </th></tr> 
	 * <tr><td> xx_large </td><td> entire </td><td> 240 </td><td> 320 </td></tr>
	 * <tr><td> xx_large </td><td> upper </td><td> 120 </td><td> 160 </td></tr>
	 * <tr><td> large </td><td> entire </td><td> 120 </td><td> 160 </td></tr>
	 * <tr><td> large </td><td> upper </td><td> 60 </td><td> 80 </td></tr>
	 * <tr><td> medium </td><td> entire </td><td> 60 </td><td> 80 </td></tr>
	 * <tr><td> medium </td><td> upper </td><td> 30 </td><td> 40 </td></tr>
	 * <tr><td> small </td><td> entire </td><td> 30 </td><td> 40 </td></tr>
	 * </table>
	 *
	 * @function
	 * @name Social.JP.Avatar.getAvatar
	 * @param {Avatar} avatar Criteria for Avatar metadata. <code>userId</code> in the Avatar metadata is required. <code>url</code> is ignored.
	 * @param {Function} callback The callback function that uses the Avatar metadata.
	 * @example
	 *
	 *  var avatar = {
	 *    "userId":"someUserId", // required.
	 *    "size":"xxlarge",      // optional. "xxlarge", "large" or "medium". default is "xxlarge".
	 *    "view":"entire",       // optional. "entire" or "upper". default is "entire".
	 *    "emotion":"defined",    // optional. "defined", "normal", "smile", "cry", "angry" or "shy". default is "defined".
	 *    "transparent":false,   // optional. true or false. default is false.
	 *    "type":"image",        // optional. "image" or "sprite". default is "image".
	 *    "extension":"png"      // optional. "png" only. default is "png".
	 *  };
	 *
	 *  var callback = function(error, avatar){
	 *    if(error){
	 *      var code = error.errorCode;
	 *      var desc = error.description;
	 *      // handle errors
	 *      // ...
	 *      return;
	 *    }
	 *    var userId = avatar.userId;
	 *    var size = avatar.size;
	 *    var view = avatar.view;
	 *    var emotion = avatar.emotion;
	 *    var transparent = avatar.transparent;
	 *    var type = avatar.type;
	 *    var extension = avatar.extension;
	 *    var url = avatar.url;
	 *    // show avatar using url.
	 *    // ...
	 *  };
	 *  Social.JP.Avatar.getAvatar(avatar, callback);
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 */
	getAvatar: function(avatar, callback){
		var cmd = {
			apiURL: 'JP.Avatar.getAvatar',
			data: avatar
		};
	
		if(callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = function(error, avatar){
				if(!error){ error = undefined; }
				callback(error, avatar);
			};
		}
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	}
};
