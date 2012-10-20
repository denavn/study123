var RouterInited = require("../_Internal/RouterInit");
var GSGlobals = require("../_Internal/GSGlobals");
var OrientationEmitter = require('../../Device/OrientationEmitter').OrientationEmitter;

/**
 * @name Social.JP.Service
 * @class <code>Service</code> is a singleton providing ServiceAPI including UI on JP-Platform.
 * @constructs The default constructor.
 * @augments Core.Class
 * @status iOS, Android, Test, iOSTested, AndroidTested
 */
exports.Service = {
	/**
	 * Open UI to send Minimail.
	 *
	 * @function
	 * @name Social.JP.Service.openMinimailSender
	 * @param {User-Id} userId User id who is recipient.
	 * @param {String} subject Subject in the Minimail.
	 * @param {String} body Body text in the Minimail.
	 * @param {Function} callback The callback function that handles close status and errors.
	 * @example
	 *
	 *  var userId = "someUserId";
	 *  var subject = "Hello";
	 *  var body = "How are you today?";
	 *  var callback = function(isSent){
	 *    if(isSent){
	 *      // ...
	 *    }else{
	 *      // ...
	 *    }
	 *  };
	 *
	 *  Social.JP.Service.openMinimailSender(userId, subject, body, callback);
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	openMinimailSender: function(userId,subject,body,callback) {
		var data = {
			userId: userId,
			subject: subject,
			body: body
		};


		this._sendCommandToGameService("JP.Service.Posting.openMinimailSender",data,callback);
	},
	/**
	 * Open UI to write Diary.
	 *
	 * @function
	 * @name Social.JP.Service.openDiaryWriter
	 * @param {String} subject Subject in the Diary.
	 * @param {String} body Body text in the Diary.
	 * @param {String} imageUrl Image URL attached to the Diary.
	 * @param {Function} callback The callback function that handles close status and errors.
	 * @example
	 *
	 *  var subject = "Today";
	 *  var body = "What a great day!!";
	 *  var imageUrl = "http://server/image.png";
	 *  var callback = function(isWrote){
	 *    if(isWrote){
	 *      // ...
	 *    }else{
	 *      // ...
	 *    }
	 *  };
	 *
	 *  Social.JP.Service.openDiaryWriter(subject, body, imageUrl, callback);
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	openDiaryWriter: function(subject,body,imageUrl,callback) {
		var data = {
			subject: subject,
			body: body,
			imageUrl: imageUrl
		};

		this._sendCommandToGameService("JP.Service.Posting.openDiaryWriter",data,callback);
	},

	/**
	 * Open WebView showing terms and conditions for JP Platform.<br>
	 *
	 * <b>note</b><br>
	 * Here is a list of pages and its path.<br>
	 * <table border="1" style="border: 1px solid;">
	 * <tr><th> page </th><th> path </th></tr> 
	 * <tr><td> Agreement for usage of 3rd party service</td><td> /thisgame/agreement </td></tr>
	 * <tr><td> Act on Specified Commercial Transactions (Japanese "Tokushoho") </td><td> /thisgame/tokushoho </td></tr>
	 * <tr><td> Agreement for usage of digital contents </td><td> /thisgame/digital_contents_term </td></tr>
	 * <tr><td> Inquiry form </td><td> /thisgame/inquiry </td></tr>
	 * <tr><td> All pages </td><td> /thisgame/agreement_list </td></tr>
	 * </table><br>
	 * This function must be called from some kind of button on purchase screen of the application to display "Act on Specified Commercial Transactions" to the user.
	 *
	 * @function
	 * @name Social.JP.Service.openCommunityFunction
	 * @param {String} path Path to function. (see description)
	 * @param {Function} callback The callback function that handles the page has been opened.
	 * @example
	 *
	 * var path = "/thisgame/tokushoho";
	 * var callback = function(){
	 *    // ...
	 *  };
	 *
	 * Social.JP.Service.openCommunityFunction(path, callback);
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	openCommunityFunction: function(path,callback) {

		var data = {
			path : path
		};
		this._sendCommandToGameService("JP.Service.Misc.openCommunityFunction",data,callback);
	},

	_requireLogin : function (type, callback) {

		var data = {
			type : type
		};
		this._sendCommandToGameService("JP.Service.Misc.requireLogin", data, callback);
		// This Is Private Function that should not be used by developers
	},


	_sendGameOrientationChange: function (orientation) {
		if (orientation.type===OrientationEmitter.OrientationType.Interface) {

			var data = {
				orientation:orientation
			};
		
			this._sendCommandToGameService("JP.Service._GameEvent.receiveGameOrientation",data);

		}
	},

	_sendCommandToGameService: function(apiURL, data , callback){
		var cmd = {
			apiURL: apiURL,
			data: data
		};
	
		if(callback !== undefined && typeof callback === "function") {
			cmd.callbackFunc = function(error, result){
				callback(error,result);
			};
		}	
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},

	_Misc: require('./Service/_Misc')._Misc,
	_Tests: require('./Service/_Tests')._Tests
};

