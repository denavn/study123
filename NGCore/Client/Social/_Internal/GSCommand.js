/**
 * GSCommand.js
 * GameService Command Helper
 *
 * @summary Converts hashes for sending across the interpreter bounds, specifically:
 *		- Takes a hash with a callbackFunc
 * 			- Takes callbackFunc and converts to callbackId
 *		- Takes a hash with a callbackId
 *			- Takes the callbackId and looks up a callbackFunc from the local cache
 */
 
var GameServiceCommandCallbackStore = {};
GameServiceCommandCallbackStore.uidGenerator = 0;

/** @private */
var storeCallbackIdForFunc = function(callbackFunc) {
	var uid = GameServiceCommandCallbackStore.uidGenerator++;
	GameServiceCommandCallbackStore[uid] = callbackFunc;
	return uid;
};
/** @private */
var extractFuncForCallbackId = function(callbackId) {
	if(GameServiceCommandCallbackStore.hasOwnProperty(callbackId)){
		var callbackFunc = GameServiceCommandCallbackStore[callbackId];
		delete GameServiceCommandCallbackStore[callbackId];
		return callbackFunc;
	}
	return null;
};

var blindConvert = function(hash) {
	if ( typeof hash == "object" ) {
		// Case we have a hash
		if ( hash.hasOwnProperty("callbackFunc") ) {
			//	with a callback func to convert
			hash["callbackId"] = storeCallbackIdForFunc(hash["callbackFunc"]);
			
			delete hash["callbackFunc"];
		}
		else if (hash.hasOwnProperty("callbackId")) {
			hash["callbackFunc"] = extractFuncForCallbackId(hash["callbackId"]);
			delete hash["callbackId"];
		}
		return hash;
	}
	
	NgLogD("Error: invalid or non-object passed to gsCmdConvert.");
	return null;
};
exports.makeSafe = function(hash) {
	if (hash && typeof hash == "object" && hash.hasOwnProperty("callbackFunc"))
	{
		return blindConvert(hash);
	}
	return hash;
};
exports.makeExecutable = function(hash) {
	if (hash && typeof hash == "object" && hash.hasOwnProperty("callbackId"))
	{
		return blindConvert(hash);
	}
	return hash;
};

