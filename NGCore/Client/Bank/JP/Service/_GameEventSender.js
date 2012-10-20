var Core = require('../../../Core').Core;

var ServiceJP = require('../Service').Service;
var OrientationEmitter = require('../../../Device/OrientationEmitter').OrientationEmitter;

exports._GameEventSender = Core.MessageListener.singleton ({
	initialize: function () {

		NgLogD("Game Orientation Sender Initialized");
		OrientationEmitter.addListener(this,this.onOrientationChange);	
		ServiceJP._sendGameOrientationChange(OrientationEmitter.getInterfaceOrientation());
	},

	onOrientationChange: function(orientation) {
		if (orientation.type === OrientationEmitter.OrientationType.Interface) {
			ServiceJP._sendGameOrientationChange(orientation);
		}
	},

	ping: function () {}
});
