var GSGlobals = require("../../_Internal/GSGlobals");

/**
 * @class
 * @name Social.Common.RemoteNotification
 * @description
 * Mobage provides a Common API for the sending of remote notifications to others within the Mobage Service.
 * The messages are sent and received by games using ngCore's network-based notification capabilities.
 * The Mobage platform service acts an intermediary to enqueue and send remote messages, while local notification
 * support is provided elsewhere in the ngCore SDK.
 * <br />
 * <code>RemoteNotification</code> Sends a remote notification (push message) to a user's device.
 * This API can be used to send a message to a single user within a given application.  Broadcast notifications
 * can be sent via the server's HTTP REST endpoints, but only when game server's OAuth tokens.
 * @since 1.7
 */
exports.RemoteNotification = {

    /**
     * Sends a remote notification to another user who is also playing a Mobage-enabled game. This API covers only
     * the "user to user" remote notification. This API is not currently rate limited, but Mobage reserves the
     * right to throttle or suspend accounts sending excessive remote notifications.
     *
     * @name Social.Common.RemoteNotification.send
     * @function
     * @public
     *
     * @param {String} recipientId Recipient user's identifier.  This can be either a user's gamertag or user ID.
     * @param {Object} payload Additional parameters passed to the device.
     * @param {String} [payload.message] (required) UTF-8 message body
     * @param {Integer} [payload.badge] (optional) If the notification is sent to an iOS device, this number is used
     *      to badge the application icon.  If no badge is included, no numeric badge will be sent.  Including this
     *      field for target Android devices has no affect and does not count toward payload size constraints.
     * @param {String} [payload.sound] (reserved for future use) (optional) If the notification is sent to an iOS device,
     *      this is the name of the sound file in the application bundle.  If the sound file doesn't exist, or "default"
     *      is specified as the value, the default alert sound is played.  Including this field for target Android
     *      devices has no affect and does not count toward payload size constraints.
     * @param {String} [payload.collapseKey] (optional) If the notification is sent to an Android device, this is
     *      the collapse key to coalesce multiple messages into a single group, so that only the last received
     *      notification is visible.  If no key is specified, all notifications will use the same collapseKey.
     *      Including this field for target iOS devices has no affect and doesn't count toward payload size constraints.
     * @param {String} [payload.style] (optional) If the notification is sent to an Android device, this is a hint
     *      containing the preferred layout style for the system notification tray.  If no style is given, or the
     *      provided style is not available, the default Mobage style will be used.  Valid styles are "normal" and
     *      "largeIcon".  Including this field for target iOS devices has no affect and does not count toward payload
     *      size constraints.
     * @param {String} [payload.iconUrl] (optional) If the notification is sent to an Android device, and the
     *      notification payload includes a style attribute, this icon URL is used to determine the image shown in the
     *      Android notification bar.  If this field is not specified, the default Mobage icon image will be shown.
     *      Including this field for target iOS devices has no affect and doesn't count toward payload size constraints.
     * @param {Object} [payload.extras] (optional) Custom 1 level hash of key/value parameters defined by the developer.
     *      Note; the string key for each item in this section cannot contain any of the payload's defined key values.
     * @cb {Function} callback The function to call after sending the remote notification.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {Object} remoteNotification Sent notification after successful enqueuing on the Mobage server.
     * @cb-param {String} [remoteNotification.id] Unique identifier for the remote notification.
	 * @cb-param {Object} [remoteNotification.payload] payload value specified in the send() method.
	 * @cb-param {String} [remoteNotification.published] ISO 8601 Timestamp when the Mobage API server received the request.
	 *
	 * @cb-returns {void}
	 * @see Device.NotificationEmitter
	 * @example
	 * var recipientId = 10028;
     * var payload     = {
     *   "message": "Simon! Come join my quest.",
     *   "extras": {
     *      "foo": 1,
     *      "bar": "twenty one!"
     *   }
     * };
     *
     * Social.Common.RemoteNotification.send(recipientId, payload, function(error, remoteNotification) {
     *   if (error) {
     *     // error handling code is here
     *   } else {
     *     // successful queueing of the remote notification
     *   }
     * });
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 * @since 1.7
	 */
	send: function(recipientId, payload, callback) {
		var cmd = {apiURL:"Common.RemoteNotification.send", recipientId:recipientId, payload:payload, callbackFunc:callback};
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
    },

    /**
     * Returns true if the current logged in user can receive remote notifications for the current running application.
     * This can be called from within each application to determine if the current user is capable of receiving remote
     * notifications.
     *
     * @name Social.Common.RemoteNotification.getRemoteNotificationsEnabled
     * @function
     * @public
     *
     * @param {Function} callback The function to call after determining if the current user can be notified.
     * @cb {Function} callback The function to call after determining if the current user can be notified.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {Boolean} canBeNotified True if the current logged in user is capable of receiving remote notifications.
     *
	 * @cb-returns {void}
	 * @see Device.NotificationEmitter
	 * @example
	 * Social.Common.RemoteNotification.getRemoteNotificationsEnabled(function(error, canBeNotified) {
     *   if (error) {
     *     // error handling code is here
     *   }
     *   if (canBeNotified) {
     *     // User in the current application can receive remote notifications
     *   }
     * });
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 * @since 1.7
	 */
    getRemoteNotificationsEnabled: function(callback) {
        var cmd = {apiURL:"Common.RemoteNotification.getRemoteNotificationsEnabled", callbackFunc:callback};
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},

    /**
     * Boolean setter value for whether or not the current logged in user may receive remote notifications for the
     * current running application.  This can be called from within each application to set the remote notification
     * receipt capability.
     *
     * @name Social.Common.RemoteNotification.setRemoteNotificationsEnabled
     * @function
     * @public
     *
     * @param {Boolean} enabled The enabled or disabled state of the current user's remote notifications.
     * @param {Function} callback The function to call after setting if the current user can be notified.
     * @cb {Function} callback The function to call after setting if the current user can be notified.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {Boolean} canBeNotified True if the current logged in user is capable of receiving remote notifications.
     *
	 * @cb-returns {void}
	 * @see Device.NotificationEmitter
	 * @example
	 * Social.Common.RemoteNotification.setRemoteNotificationsEnabled(true, function(error) {
     *   if (error) {
     *     // error handling code is here
     *   }
     *   // User is configured to receive remote notifications
     * });
	 * @returns {void}
     * @status iOS, Android, Test, iOSTested, AndroidTested
     * @since 1.7
     */
    setRemoteNotificationsEnabled: function(enabled, callback) {
        var cmd = {apiURL:"Common.RemoteNotification.setRemoteNotificationsEnabled", enabled:enabled, callbackFunc:callback};
        GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
    }
};