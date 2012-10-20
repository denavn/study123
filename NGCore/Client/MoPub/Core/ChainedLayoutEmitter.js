var Core = require('../../Core').Core;
var Device = require('../../Device').Device;

var Utils = require('./Utils').Utils;

exports.ChainedLayoutEmitter = Core.MessageEmitter.singleton(
{
	classname: 'ChainedLayoutEmitter',
	
	initialize: function() {
		var self = this;
		this.chainedLayoutListener = Utils.createGenericListener();
		Device.LayoutEmitter.addListener(this.chainedLayoutListener, function(event) {
			var orientation = Device.OrientationEmitter.getInterfaceOrientation();
			self.chain({
				orientation: orientation,
				screenWidth: event.width,
				screenHeight: event.height
			});
		});
	}
});
