var ImageListView		 = require('../../../NGGo1.3/Service/Graphics/ImageListView').ImageListView;
var GL2					 = require('../../../NGCore/Client/GL2').GL2;
var Core				 = require('../../../NGCore/Client/Core').Core;
var UI 					 = require('../../../NGCore/Client/UI').UI;
var Scene				 = require('../../../NGGo/Framework/Scene/Scene').Scene;
var GUIBuilder			 = require('../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var VFX					 = require('../../../NGGo1.3/Service/Graphics/VFX').VFX;
var VFXActions			 = require('../../../NGGo1.3/Service/Graphics/VFXActions').VFXActions;
var Ops 				 = require('../../../NGGo1.3/Foundation/Math/Ops').Ops;
var Observable           = require("../../../NGGo/Foundation/Observable").Observable;
var GLUI				 = require('../../../NGGo1.3/GLUI').GLUI;
var ListNode             = require('../../utils/ListNode').ListNode;
var Builder				 = require('../../utils/Builder').Builder;
var DebugView            = require('../../utils/DebugView').DebugView;
var VietScene            = require('./VietScene').VietScene;


ListSceneListener = Core.MessageListener.subclass({
   initialize: function(master) {
       this.master = master;
   },
   handle: function() {
       Log("ListSceneListener onUpdate");
       
       
   } 
});
exports.ListScene = VietScene.subclass({
	classname: "ListScene",
	sceneName: "ListScene",
	initialize: function($super, style) {
		$super();
		//this.listener = new ListSceneListener(this);
		//Core.updateEmitter.addListener(this.listener, this.listener.onUpdate.bind(this));
	},
	onSuccessConfig: function() {
	 //   Core.updateEmitter.addListener
	    var imgs = [];
            for (var i = 1; i < 10; i++) {
                imgs.push("Content/viet/avatar/00" + i + "_attack.png");
            }
	    this.listNode = new ListNode(0,this.getItems(imgs, [200,200],[0,0]));
        this.node.addChild(this.listNode);
        this._addNextButton();
        this.effect();
        this.performSeq();
	},
	performSeq: function() {
	    Log("call performSeq function");
	    setTimeout(function() {
	        this.listNode.performNextNode();
	        this.performSeq();
	    }.bind(this), 4000);
	},
	defineConfig: function(controller,def){
            var conf = {};
            conf.description = def.attrs.description;
            conf.debug = def.attrs.debug || false;
            conf.debugAttrs = def.attrs.debugAttrs || [];
            return conf;
    },
	/*
	 * @imgs: array that contains full path to images
	 */
	getItems: function(imgs, size, anchor) {
		Log("call setItems");
		var items = [];
		for (var i = 0; i < imgs.length; i++) {
			var item = new GL2.Sprite();
			item.setImage(imgs[i], size, anchor);
			items.push(item);
		}
		return items;
	},
	onExit: function($super) {
		if(this.nextButton)
			this.nextButton.destroy();
			$super();
	},
	effect: function() {
		Log("call Effect before transit to new scene");
		this.bSprite = Builder.makeSprite(this.node, 'Content/black.png', [480,320],[0,0]);
		this.bar1 = Builder.makeNode(this.node, [[100,20],[150,30],[250,200],[190,250]]);
	},
	
	_addNextButton: function() {
		this.nextButton = new UI.Button({
		frame: [210, 290, 60, 30],
		text: "Next",
		disabledTextColor: "FFFF",
		textSize: 14,
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
		// if the back button is pressed, then launch /Samples/Launcher
		onClick: function(event) {
			Log("Next button onclicked");
			this.listNode.nextNode();
		}.bind(this)
	});
	
	UI.Window.document.addChild(this.nextButton);
	}
},[Observable]);

