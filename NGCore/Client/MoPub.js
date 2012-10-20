/**
 * Classes and objects contained by the MoPub module.
 * @name MoPub
 * @namespace Display ads from the MoPub service.
 * @description
 * <ul>
 * <li><code>{@link MoPub.BannerView}</code>: Constructs a user-defined container which houses MoPub
 * banner ads and provides callbacks when ad events occur.</li>
 * <li><code>{@link MoPub.Interstitial}</code>: Constructs a user-defined container which houses
 * MoPub interstitial ads and provides callbacks when ad events occur.</li>
 * </ul>
 * <br /><br />
 * <strong>Note</strong>: The MoPub service is available only on the US/worldwide platform.
 */

exports.MoPub = {
	BannerView: require('./MoPub/BannerView').BannerView,
	Interstitial: require('./MoPub/Interstitial').Interstitial,
	
	/**
	 * Toggle logging for MoPub objects.
	 * @name MoPub#setLoggingEnabled
	 * @function
	 * @param	{Boolean}	enabled	<code>true</code> to enable logging
	 * @since 1.4.1
	 */
	setLoggingEnabled: function(enabled) {
		var Utils = require('./MoPub/Core/Utils').Utils;
		Utils.setMpLogEnabled(enabled);
	}
};
