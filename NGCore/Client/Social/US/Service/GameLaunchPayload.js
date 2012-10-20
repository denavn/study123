var RouterInited = require("../../_Internal/RouterInit");
var GSGlobals = require("../../_Internal/GSGlobals");

var MessageEmitter = require("../../../Core/MessageEmitter").MessageEmitter;

/**
* Provides an interface for retrieving a game's last payload from the game service. The game
* payload is returned as a string.
* @name Social.US.Service.GameLaunchPayload
*/

var GameLaunchPayload = exports.GameLaunchPayload = {


	/**
	 * @name Social.US.Service.GameLaunchPayload.getLastPayload
	 * @function
	 * @public
	 * 
	 * @param {Function} callback Retrieves the last payload generated by the game client from the game service 
     * as a string (e.g., JSON) and/or any error code and description.
	 * <br/>
	 * <b>Callback Example:</b><br/>
	 * <pre class="code">function(error, payload){
     *      if(error) {
	 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorCode = error.errorCode;
	 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorDesc = error.description;
     *      } else {
     * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var pl = payload;     
     *      }
	 * }
	 * </pre>
	 * @status iOS, Android, Test, iOSTested, AndroidTested
     */
	getLastPayload:function(callback)
	{
        if(callback != undefined && typeof callback == "function")
		{
			var cmd = {
				apiURL:"US.Service.GameLaunchPayload.getLastPayload"
			};

            cmd["callbackFunc"] = callback;

			GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
		}
	},
	
	// MAX: NEEDS DOCUMENTATION!
	// use this to reference the emitter so that you can get push events as they are acted on by the user
	// Example usage code:
	
	//	listen for game push
	//	var GamePayloadListener = Core.MessageListener.subclass({
	//		_onNewGamePayload:function(payload) {
	//			TODO: act on game payload somehow :)
	//		},
	//
	//		destroy:function() {
	// 			Social.US.Service.GameLaunchPayload.getNewPayloadEmitter().removeListener(this);
	// 		}
	//	});
	//	var gamePayloadListenerInstance = new GamePayloadListener();
	//	Social.US.Service.GameLaunchPayload.getNewPayloadEmitter().addListener(gamePayloadListenerInstance,gamePayloadListenerInstance._onNewGamePayload);
	
	
	getNewPayloadEmitter:function() {
		if(!GameLaunchPayload.newGamePayloadEmitter) {
			NgLogD("Creating new payload emitter...");
			
			GameLaunchPayload.newGamePayloadEmitter = new MessageEmitter();
		}
		
		return GameLaunchPayload.newGamePayloadEmitter;
	},
	
	// private, automatically called when new payload arrives. Do not call.
	onGameLaunchPayload:function(event)
	{
		GameLaunchPayload.getNewPayloadEmitter().emit(event.data.payload);
	}
};