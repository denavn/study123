var Class = require('./Class').Class,
NgPipe = require('../../Shared/NgPipe').NgPipe,
NgPipesRemote = require('../../Shared/NgPipesRemote').NgPipesRemote;

var Analytics = Class.singleton(
/** @lends Core.Analytics.prototype */
{
    classname: 'Analytics',

    /**
     * @class The <code>Analytics</code> class serves as the custom messaging channel to the ngCore platform. 
     * The <code>Analytics</code> class provides developers with a way to keep track of game-specific items that require analysis and counting.
     * Use this class when you need your games to send custom elements that require in-game analytics support. 
     * @constructs The default constructor.
     * @augments Core.Class
     * @since 1.0
     */
    initialize: function() {
        if (!this._pipe) {
          this._pipe = new NgPipe();
        }
    },

	/** @private */
	updateGLEXT: function()
	{
		try
		{
			var caps = require("./Capabilities").Capabilities;
			var ext = caps.getOglExtensions();
			if (ext.length > 2)	// > 2 means we got some actual data, not our fake string
			{
				// We need to rip out just one of the four tex compressions we want.
				var list = [];
				var goodies =
				[
					"GL_IMG_texture_compression_pvrtc",
					"GL_AMD_compressed_ATC_texture",
					"GL_OES_compressed_ETC1_RGB8_texture",
					"GL_AMD_compressed_3DC_texture"
				];
				for (var i in goodies)
				{
					var item = goodies[i];
					for (var j in ext)
					{
						if (ext[j] ===  item)
						{
							var rep = {};
							rep[caps.getDeviceName()] = item;
							list.push(rep);
						}
					}
				}

				for (i in list)
				{
					Analytics.reportGameEvent("openglexts", list[i]);
				}
			}
		}
		catch (e)
		{
			NgLogException(e);
		}
	},

    /** @private */
    enable: function() {
        this._pipe.enable();
    },

    /** @private */
    disable: function() {
        this._pipe.disable();
    },

    /** @private */
    setUrl: function(url) {
        this._pipe.setRemoteUrl(url);
    },

    /**
    * Report a navigation event that occurs when users navigate between application pages. 
    * Calling this function will alert the analytics platform that a user has generated a navigation event.
    * This information is used to plot how users move through the game, how long they spend on a page, and what page they navigate to next.
    * @param {String} from The name of the page from which navigation originates. 
    * @param {String} to An analytics name for the destination page.
    * @param {String} btnid The ID of the button that triggered the navigation.
    * @returns {Boolean} Set to <code>false</code> if the <code>from</code> or <code>to</code>
    *		parameter is omitted. Set to <code>true</code> in all other cases.
    * @since 1.0
    */
    reportNavigation : function(from, to, btnid) {
        if (!(from && to)) {
            return false;
        }
        this._pipe.uiEvent('NAV', {to: to, fro: from, btnid: btnid} );
        return true;
    },
    /**
    * Report a custom game event. Call <code>reportGameEvent</code> to record events that do not alter a user's core game statistics.<br /><br />
    * <b>Note:</b> This function serves as a catch-all. Call <code>reportGameEvent</code> to count or analyze events that do not fit into any 
    * other category.
    * @param {String} eventId The ID for the custom event.
    * @param {Object} payload A hash of extra information.
    * @param {Object} playerState A hash of important player states.
    * @returns {Boolean} Set to <code>false</code> if the <code>eventId</code> parameter is omitted.
    *		Set to <code>true</code> in all other cases.
    * @since 1.0
    */
    reportGameEvent : function(eventId, payload, playerState ) {
        if (!eventId) {
            return false;
        }

        this._pipe.gameEvent(eventId, payload, playerState);

        return true;
    },
    /**
    * Report a change to a playerstate. A playerstate is the object representation of the player's core stats. 
    * For example, if a player purchased an in-game item, you would call this to let the analytics system know what happened and how much gold was spent.
    * Everything in the player state is counted and recorded. Make sure to only pass in things for which you want to see the change 
    * (gold, mojo, grow, level, xp, health, lives, and so on).<br /><br />
    * <b>Note:</b> This is only for game state and should not include information that is unique to a user. For example, the user game tag or the user ID.
    * @param {String} action The product ID of a purchased product. This essentially points out when an action is performed.
    * @param {Object} change A hash of currencies spent and/or gained. For example {mojo: 100, gold:-10}
    * @param {Object} playerState A hash of important player states after the purchase.
    * @returns {Boolean} Set to <code>false</code> if the <code>action</code> parameter is omitted.
    *		Set to <code>true</code> in all other cases.
    * @since 1.0
    */
    reportPlayerStateChange : function(action, change,  playerState) {
        if (action) {
            this._pipe.playerEvent(action, 'PLSTCHANGE', change, playerState);
            return true;
        } else {
            return false;
        }
    },

    /**
    * Report when a user reaches a new stage of a funnel. Funnel refers to a set of pages or requirements a user is required to engage in before proceeding. 
    * You can use this call to keep track of progress for all users. For example, keeping track of various stages users engage in for game registration.
    * Funnel stages are ordered by numeric ID. The funnel <code>stageName</code> is used for display. You do not need to define funnels ahead of time.
    * Funnel stages start at 0 and increase as the user proceeds further.<br /><br />
    * <b>Note:</b> Calling <code>reportFunnelStage()</code> multiple times for a single user generates an incorrect count.
    * @param {String} funnelName The name of the funnel that the user has progressed to.
    * @param {Number} funnelStage The integer value of the stage that the user reached.
    * @param {String} stageName The name of the stage that the user reached.
    * @param {Object} playerState A hash of important player states after a funnel stage.
    * @private
    */
    reportFunnelStage : function(funnelName, funnelStage, stageName, playerState) {
        var payload =  {};

        if (!(funnelName)) {
            return false;
        }
        if (funnelStage !== null && funnelStage !== undefined) {
            payload.stage = funnelStage;
        } else {
            return false;
        }

        if (stageName) {
            payload.stageName = stageName;
        }
        this._pipe.funnelEvent(funnelName, payload, playerState);

        return true;
    },
    /**
     * Report an interaction between two users.
     * @param {String} actionId The action that the user is performing to interact with the other user
     * @param {String} friendGamerTag The other user with whom the current user is interacting.
     * @param {Object} payload A hash of extra information.
     * @returns {Boolean} Set to <code>false</code> if the <code>actionId</code> or
     *		<code>friendGamerTag</code> parameter is omitted. Set to <code>true</code> in all other
     *		cases.
     * @since 1.0
     */
    reportSocialEvent: function(actionId, friendGamerTag, payload) {
        if (actionId && actionId.length && friendGamerTag && friendGamerTag.length ) {
            this._pipe.socialEvent(actionId, friendGamerTag, payload);
            return true;
        }
        return false;
    },
    /**
    * Report an error to analytics.
    * @param {String} error_msg The error message to log.
    * @returns {Boolean} Set to <code>false</code> if the <code>error_msg</code> parameter is
    *		omitted. Set to <code>true</code> in all other cases.
    * @since 1.0
    */
    reportError : function(error_msg) {
        if (!error_msg) {
            return false;
        }
        this._pipe.gameOpsEvent("ERR", {err: error_msg } );
        return true;
    },
    /**
     * @private
     */
    addTag: function(tag) {
        if (tag) {
            var evpl = {tag:tag};
            this._pipe.gameEvent('tag', evpl);
            return true;
        }
        return false;
    },
    /** @private */
    _getPipe: function() {
        return this._pipe;
    },
    /**
    * Change the Social Analytic object to be used.  Please see MOBWEST-2300
	* for details
	*
    * @private
    */
	_setNgPipeSocialAnalytics: function(socialAnalyticObj) {
		if (this._pipe) {
			this._pipe._setSocialAnalytics(socialAnalyticObj);
		}
	}
});
exports.Analytics = Analytics;
