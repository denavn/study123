var Dispatcher = require("../Data/Dispatcher").Dispatcher;

/**
 * @class 
 * @name Social.US.OrderedList
 * @description
 * Do not instantiate <code>OrderedList</code> objects directly. This description is for information purposes only. 
 * <code>DataModel</code> subclasses that return <code>OrderedList</code> interfaces include:<br/><br/>
 * <ul>
 * <li>{@link Social.US.User}</li>
 * <li>{@link Social.US.Leaderboard}</li>
 * </ul><br/>
 * Some <code>DataModel</code> subclasses can return an <code>OrderedList</code>,
 * which is an interface for iterating over a range of values. You determine the iteration range by
 * selecting one of three common functions: <br/><br/>
 * <ul>
 * <li><code>forAll(iterCb, doneCb):</code> Iterates over all values.</li>
 * <li><code>forRange(start, count, iterCb, doneCb):</code> Iterates from the starting index to the count.</li>
 * <li><code>forItem(index, iterCb, doneCb):</code> Iterates over a particular item given by its index.</li>
 * </ul>
 * Each of the functions calls an iteration callback (iterCb) for every available item. 
 * When the function iterates over all items or an error occurs, it calls the done callback (doneCb). You <b>MUST</b> provide both callbacks.
 * <br/><br/>
 * <b>Note:</b> The <code>OrderedList</code> interface invokes an iterator on the server. Do NOT assume it will execute your callback functions immediately.
 *
 * @example
 * //NOTE: You MUST provide both callback functions.
 * userBuddiesList.forAll( 
 *      function(error, details){//per item cb body}, 
 *      function(error, details){//done cb body}
 * );
 *
 * @example
 * //Callback examples
 * var done = false;
 * var err = null;
 *
 * currentUser.getFriendsList().forAll(
 *          function(continueCb, user, index){
 *				if(user == otherUser){
 *					foundBuddy = true;
 *					continueCb(false);
 *				}else{
 *					continueCb(true);
 *				}
 *			}, 
 *          function(error){
 *                  if (!error){
 *                      done = true;
 *                   } else {
 *                      err = error;
 *                   }
 *          }
 * );
 * @status iOS, Android, Test, iOSTested, AndroidTested
 */
var OrderedList = {

    /**
    * Returns a public interface for an object.
    * 
    * To expose a privelegee ordered list of a <code>DataModel</code> object in the public interface, 
    * add a function to the object of the corresponding <code>DataModel</code>
    * subclass in the public interface.
    * @example
    * getFollowersList: function(cb){
 	* 	return OrderedList.getObjectPublicInterface(this, "getFollowersList", "_followersListInterface");
	* },
    *
    * @name Social.US.OrderedList.getObjectPublicInterface
    * @function    
    * @private
    *
    * @param {Object} ownerObject The object that will "own" the public interface.
    * @param {Function} getListFn The function that returns a list of values to the <code>OrderedList</code>.
    * @param interfaceName The name of the interface.
    *
    * @return {Social.US.OrderedList} The public interface.
    * @status iOS, Android, Test, iOSTested, AndroidTested
    */
    getObjectPublicInterface: function(ownerObject, getListFn, interfaceName) {
		if(ownerObject[interfaceName]) {
			return ownerObject[interfaceName];
		}
		
		var args = Array.apply(null, arguments);
		if(args && args.length > 3){
			args.splice(0, 3);
		}else{
			args = [];
		}
		
		var newInterface = {
			forAll: function(perItemCb, doneCb) {
				Dispatcher.callMethodOnRemoteObject(ownerObject, [getListFn, "forAll"], [args,[perItemCb, doneCb]]);		
			},
			forRange: function(start, count, perItemCb, doneCb) {
				Dispatcher.callMethodOnRemoteObject(ownerObject, [getListFn, "forRange"], [args,[start, count, perItemCb, doneCb]]);
			},
			forItem: function(index, perItemCb, doneCb) {
				Dispatcher.callMethodOnRemoteObject(ownerObject, [getListFn, "forItem"], [args,[index, perItemCb, doneCb]]);
			}
		};
		
		ownerObject[interfaceName] = newInterface;
		
		return newInterface;
	},

    /**
    * Returns a public interface for a class.
    * To expose a priveleged ordered list of a <code>DataModel</code> subclass in the public interface, 
    * add a function to the subclass of the corresponding <code>DataModel</code>
    * subclass in the public interface.
    * @example
    * getFollowersList: function(cb){
 	* 	return OrderedList.getClassPublicInterface(this, "getFollowersList", "_followersListInterface");
	* },    
    *
    * @name Social.US.OrderedList.getClassPublicInterface
    * @function
    * @private
    *
    * @param {Object} owner The owner of the the public interface.
    * @param {Function} getListFn The function to call on each iteration.
    * @param interfaceName The name of the interface.
    * 
    * @return {Social.US.OrderedList} The public interface.
    * @status iOS, Android, Test, iOSTested, AndroidTested
    */
    getClassPublicInterface: function(owner, getListFn, interfaceName) {
		if(owner[interfaceName]) {
			return owner[interfaceName];
		}
		
		var newInterface = {
			forAll: function(perItemCb, doneCb) {
				Dispatcher.callClassMethodOnRemoteObject(owner, [getListFn, "forAll"], [[],[perItemCb, doneCb]]);
			},
			forRange: function(start, count, perItemCb, doneCb) {
				Dispatcher.callClassMethodOnRemoteObject(owner, [getListFn, "forRange"], [[],[start, count, perItemCb, doneCb]]);
			},
			forItem: function(index, perItemCb, doneCb) {
				Dispatcher.callClassMethodOnRemoteObject(owner, [getListFn, "forItem"], [[],[index, perItemCb, doneCb]]);
			}
		};
		
		owner[interfaceName] = newInterface;
		
		return newInterface;
	}
};

exports.OrderedList = OrderedList;
