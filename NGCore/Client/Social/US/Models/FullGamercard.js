
var DataModelR  = require("./DataModel");
var Dispatcher  = require("../Data/Dispatcher").Dispatcher;

/**
 * @class {FullGamercard} Full gamercard.
 */
var FullGamercard = exports.FullGamercard = DataModelR.DataModel.subclass({
	classname: "FullGamercard",
	 /**
	 * The show state of the gamercard. Read-only.
	 * @name visible
	 */
	properties: [
		// public
		"visible"
	],
	
	/**
	 * Show the gamercard.
	 * 
	 * An exception will be thrown if no valid user is set when attempting
	 * to show the gamercard.
	 */
	show: function() {
		Dispatcher.callMethodOnRemoteObject(this, "show");
	},
	
	/**
	 * Hide the gamercard.
	 */
	hide: function() {
		Dispatcher.callMethodOnRemoteObject(this, "hide");
	},
	
	/**
	 * Set gamercard data.
	 * 
	 * This may be called on-the-fly to update the gamercard after it has been
	 * displayed.
	 * 
	 * Set the <code>gameModule</code> entry to <code>null</code> to remove/disable it.
	 * 
	 * Up to two buttons can be set on the game module. Click events for these buttons
	 * will come into <code>actionCB</code> with <code>action.buttonClick</code>. The
	 * presence of the <code>buttonClick</code> block indicates the click occurred and
	 * its contents provides more context: the <code>id</code> of the button in question.
	 * (Note that if the button doesn't have an ID, the index into the button array is
	 * used instead.)
	 * 
	 * @example
	 *    card.set(
	 *       {
	 *          user: 'gahtje3',
	 *          gameModule: {
	 *             basic: {
	 *                text: 'blah blah blah',
	 *                icon: 'http://ngmoco.com/we-rule/wp-content/themes/werule/images/game/logo-small.png'
	 *             },
	 *             buttons: [
	 *                { id: 'foo', label: 'Foo' },
	 *                { id: 'bar', label: 'Bar' }
	 *             ]
	 *          }
	 *       },
	 *       function(err) {
	 *          if(err) {
	 *             NgLogD("Something went horribly, horribly wrong: " + err);
	 *          }
	 *          else {
	 *             card.show();			// show once complete, after user has been loaded
	 *          }
	 *       },
	 *       function(action) {
	 *          if(action.hasOwnProperty('buttonClick')) {
	 *             NgLogD("Clicked button with ID '" + action.buttonClick.id + "'");
	 *          }
	 *       }
	 *    );
	 * 
	 * @example
	 *    card.set(
	 *       {
	 *          user: 'gahtje7',
	 *          gameModule: {
	 *             dynamicImage: {
	 *                image: 'http://media.tumblr.com/tumblr_lok12fhmJi1qhmqze.jpg?size={width}x{height}',
	 *                placeholder: {
	 *                   width: "{width}",
	 *                   height: "{height}"
	 *                }
	 *             }
	 *          }
	 *       },
	 *       null, null
	 *    );
	 * 
	 * @param conf Data to configure.
	 * @config {String|User} [user] User object or gamertag.
	 * @config [gameModule] Game module data. Adding this will cause the game module
	 *                      to be added to the gamercard automatically.
	 * @param {Function} [completeCB] Completion callback, with <code>error</code> parameters (<code>null</code> if no error).
	 * @param {Function} [actionCB] Action callback, with <code>data</code> parameter.
	 */
	set: function(conf, completeCB, actionCB) {
		Dispatcher.callMethodOnRemoteObject(this, "set", [conf, completeCB, actionCB]);
	}
});

/**
 * Gets the full gamercard.
 * 
 * Only one full gamercard is maintained and its settings can be changed on-the-fly
 * with calls to {@link FullGamercard#set}.
 * 
 * @function
 * @static
 * @example
 *    Gamercard.getFullGamercard(function(card) {
 *       card.set({
 *          user: 'gahtje3'
 *       });
 *       card.show();
 *    });
 * 
 * @param {Function} cb Callback. This function will be passed the gamercard.
 */
FullGamercard.getFullGamercard = function(cb) {
	Dispatcher.callClassMethodOnRemoteObject(FullGamercard, "getFullGamercard", [cb]);
};

/**
 * Gets the full gamercard and sets the user.
 * 
 * @function
 * @static
 * @example
 *    Gamercard.getFullGamercardAndSetUser('gahtje3', function(err, card) {
 *       if(!err) {
 *          card.show();
 *       }
 *    });
 * 
 * @param {String|User} userOrGamertag User object or gamertag of user.
 * @param {Function} cb Callback. This function will be passed arguments: error string
 *                   (<code>null<</code> on success) and the gamercard (if no error).
 */
FullGamercard.getFullGamercardAndSetUser = function(userOrGamertag, cb) {
	Dispatcher.callClassMethodOnRemoteObject(FullGamercard, "getFullGamercardAndSetUser", [userOrGamertag, cb]);
};

/**
 * Gets the full gamercard and sets the user as the currently logged-in user.
 * 
 * @function
 * @static
 * @example
 *    Gamercard.getFullGamercardAndSetCurrentUser(function(err, card) {
 *       if(!err) {
 *          card.show();
 *       }
 *    });
 * 
 * @param {Function} cb Callback. This function will be passed arguments: error string
 *                   (<code>null</code> on success) and the gamercard (if no error).
 */
FullGamercard.getFullGamercardAndSetCurrentUser = function(cb) {
	Dispatcher.callClassMethodOnRemoteObject(FullGamercard, "getFullGamercardAndSetCurrentUser", [cb]);
};
