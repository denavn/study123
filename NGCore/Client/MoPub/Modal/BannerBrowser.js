var Browser = require('./Browser').Browser;
var ChainedLayoutEmitter = require('../Core/ChainedLayoutEmitter').ChainedLayoutEmitter;
var Utils = require('../Core/Utils').Utils;

var BannerBrowser = exports.BannerBrowser = Browser.subclass({
	classname: 'BannerBrowser',
	
	initialize: function($super) {
		$super();
		
		// Browsers from banner clicks are never locked into any particular orientation.
		this.setLockedOrientation(null);
	},

	// Override ViewController's listener to ChainedLayoutEmitter.
	_initializeLayoutListener: function() {
		var self = this;
		this.chainedLayoutListener = Utils.createGenericListener();
		
		ChainedLayoutEmitter.addListener(this.chainedLayoutListener, function(event) {
			Utils.mpLog('Printing the ChainedLayoutEmitter event, ', JSON.stringify(event));
			
			self.screenSize.width = event.screenWidth;
			self.screenSize.height = event.screenHeight;
			self._updateFramesForScreenSize(self.screenSize);

			if (!self.isVisible()) {
				self.setFrame(self.startFrame);
			} else {
				self.setFrame(self.finalFrame);
			}
			
			self.layoutSubviews();
		});
	},
	
	destroy: function($super) {
		ChainedLayoutEmitter.removeListener(this.chainedLayoutListener);
		$super();
	}
});
