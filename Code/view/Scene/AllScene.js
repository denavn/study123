var GL2					 = require('../../../NGCore/Client/GL2').GL2;
var Core				 = require('../../../NGCore/Client/Core').Core;
var UI 					 = require('../../../NGCore/Client/UI').UI;
var Scene				 = require('../../../NGGo/Framework/Scene/Scene').Scene;
var SceneDirector 		 = require('../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var GUIBuilder			 = require('../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var VFX					 = require('../../../NGGo1.3/Service/Graphics/VFX').VFX;
var VFXActions			 = require('../../../NGGo1.3/Service/Graphics/VFXActions').VFXActions;
var Ops 				 = require('../../../NGGo1.3/Foundation/Math/Ops').Ops;
var VietScene 			 = require('./VietScene').VietScene;

exports.AllScene = VietScene.subclass({
 	classname: "AllScene",  // must be unique
 	sceneName: "ALL_SCENE",
 	initialize: function($super) {
 		$super();
 		this.btns = [];
 		this.ui = new UI.View();
 		this.ui.setFrame(0,0,450,320); 
 		UI.Window.document.addChild(this.ui);
 	},
 	defineConfig: function(controller,def){
 			var conf = {};
			conf.buttons = def.attrs.buttons; 
			conf.btnSize = def.attrs.btnSize;
    		return conf;
	},
 	onSuccessConfig: function($super) {
 		$super();
 		this.make_buttons(this.CONF.buttons, this.CONF.btnSize);
 		this.ui.setVisible(true);
 	},
 	make_buttons: function(btns, btnSize) {
 		
 		Log("function make_button");
 		var x = 10;
 		var y = 10;
 		for (var i = 0; i < btns.length; i++) {
 			var sceneButton = new UI.Button({
				disabledText: "Returning...",
				disabledTextColor: "FFFF",
				textSize: 10,
				textGravity: UI.ViewGeometry.Gravity.Center,
				gradient: {
					corners: '8 8 8 8',
					outerLine: "00 1.5",
				gradient: [ "FF9bd6f4 0.0", "FF0077BC 1.0" ]
				},
				highlightedGradient: {
					corners: '8 8 8 8',
					outerLine: "00 1.5",
					gradient: [ "FF0077BC 0.0", "FF9bd6f4 1.0" ]
				},
				disabledGradient: {
					corners: '0 8 8 8',
					gradient: [ "FF55 0.0", "FF00 1.0"],
				},
				text : btns[i].text,
				frame: [x, y, btnSize[0], btnSize[1]],
	 		});
	 		sceneButton.setOnClick(function() {
	 			this.getParent().setVisible(false);
	 			if(this.getText() == 'TUTOR_SCENE')
	 			   SceneDirector.push(this.getText(), "OPP pa pa gangnam style");
	 			else SceneDirector.push(this.getText());
	 		});
	 		this.ui.addChild(sceneButton);
	 		x += btnSize[0] + 10;
	 		if ( x > 480 - btnSize[0]) {
	 			x = 10;
	 			y += btnSize[1] + 20;
	 		}
	 		if( y > 320 - btnSize[1])
	 			Log("Too much sceneButton, Please reduce size of button");
 		}
 	},
	
	
	
	onEnter: function($super) {
		$super();
	},
	onExit: function($super) {
		this.ui.removeFromParent();
		$super();
	},
	onPause: function($super) {
		Log(this.sceneName + " paused");
		this.ui.setVisible(false);
		this.node.setVisible(false);
		$super();
	},
	onResume: function($super) {
		Log(this.sceneName + " resumed");
		this.ui.setVisible(true);
		this.node.setVisible(true);
		$super();
	}
	
});
