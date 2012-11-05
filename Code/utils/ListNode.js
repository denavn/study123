var ImageListView		 = require('../../NGGo1.3/Service/Graphics/ImageListView').ImageListView;
var GL2					 = require('../../NGCore/Client/GL2').GL2;
var Core				 = require('../../NGCore/Client/Core').Core;
var UI 					 = require('../../NGCore/Client/UI').UI;
var GUIBuilder			 = require('../../NGGo/Framework/GUIBuilder').GUIBuilder;
var GLUI				 = require('../../NGGo1.3/GLUI').GLUI;
var VFX                  = require('../../NGGo1.3/Service/Graphics/VFX').VFX;
var VFXActions           = require('../../NGGo1.3/Service/Graphics/VFXActions').VFXActions;
var Ops                  = require('../../NGGo1.3/Foundation/Math/Ops').Ops;
//var VietScene            = require('./VietScene').VietScene;
//var Builder              = require('./VietLib/Builder').Builder;
//var eff                  = require('./VietLib/eff').eff;
/*
 * 
 * List Node se cho phep xem cac view duoi dang mot list, co the
 * truot list theo chieu ngang, doc, vv...
 * moi list item la 1 GL2.Node, xu ly event tren do se do dinh nghia o ben ngoai. ListNode chi quan tam den style va items[]
 * 
 */


exports.ListNode = GL2.Node.subclass({
 	classname: "ListNode",  // must be unique
 	/*
 	 * @param items: array of gl2 sprite
 	 */
 	initialize: function(style, items) {
 		Log(this.classname + " initialized");
 		this.controller = {};
 		this.CONF = {};
 		this.node = new GL2.Node();
 		//this._addBackground();
 		

		this.items = items || [];
		this.style = style || 0;
		this.listview = new ImageListView();
		this._currentPos = this.listview.getScrollPosition(); Log('this._currentPo11s = ' + this._currentPos);
		this.currentIdx = 0;
		this.addChild(this.listview);
		this.onEnter();
 	},
 	onEnter: function() {
 		var config = function(controller, def){
			var conf = {};
   		 	conf.style0 = def.attrs.style0;
   		 	conf.style1 = def.attrs.style1;
    		return conf;
		};
		GUIBuilder.registerTypeMethod(this.classname, config);
		GUIBuilder.loadConfigFromFile("Config/VietConfig/ListNode.json", this.controller, function(err) {
			if(this.controller.CONF!= undefined) {
				this.CONF = this.controller.CONF;
				//this._debugAttrs = [".....", "......", "........", "........", "......", "....."];
				//this._debugView = new DebugView(this, this._debugAttrs, [0,40,480,30]);
 				this.onSuccessConfig();
 			}
 		}.bind(this));
 		GL2.Root.addChild(this.node);
 	},
 	onSuccessConfig: function() {
 		Log("call onSuccessConfig");
 		this.setStyle(this.listview,this._getStyle());
			for(var i = 0; i < this.items.length; i++) {
				this.listview.addItem(this.items[i], i);
			}
 	},
 	
	_getStyle: function(){
		switch(this.style) {
			case 0:
				return this.CONF.style0;
			case 1:
				return this.CONF.style1;	
		}
	},
	
	/*
	 * set orientation, frame, itemSize... for list view
	 * @param listview: ImageListView object
	 * @param CONFI		object that defines styles
	 */
	setStyle: function(listview, CONFI){
		Log("SetStyle function +++ frame: " + CONFI.frame);
		
		listview.setItemSize(CONFI.itemSize);
		listview.setSnap(CONFI.isSnap);
		listview.setFrame(CONFI.frame);
		listview.setScrollDirection(CONFI.orientation);
		listview._scrollbar.setVisible(CONFI.hasScrollbar);
		listview.setScrollFeeling({
			touchSensitivity: CONFI.touchSensitivity,
			flickSpeed: CONFI.flickSpeed,
			rangeFactor: CONFI.rangeFactor,
			stretchDecay: CONFI.stretchDecay,
			smoothingFactor: CONFI.smoothingFactor,
			friction: CONFI.friction
		});
	},
	/*
	 * Perform node i, default is current node, example, a boss ninja attack
	 */
	performNode: function(i) {
	    Log("calee performNode");
	    var nodeIndex = i || this.getIndexOfCurrentNode();
	    if(nodeIndex >= this.items.length || nodeIndex < 0)
	       Log("Big error occure: node index is not in range");
	    var t = 1;
	    var seq = VFX.spawn().scaleTo(t,[1.2, 1.2]).move(t,[20,20]);
	    seq.play(this.items[nodeIndex]);
	    var that = this;
	    //after 1 second, ninja go back
	    setTimeout(function() {   
	          seq = VFX.spawn().scaleTo(t,[1, 1]).move(t,[-20,-20]);
	          seq.play(that.items[nodeIndex]);
	    },t *1100);
	    // after go back, move to Next Node
	    setTimeout(function() {that.nextNode()}, t*3000);
	},
	performNextNode: function() {
	    this.performNode(this.currentIdx);
	},
	/*
	 * Implement more here for getIndexOfCurrentNode function
	 */
	getIndexOfCurrentNode: function() {
	    return this.currentIdx;
	},
	nextNode: function() {
		Log("call nextNode: current Pos = " + this._currentPos);
		var style = this._getStyle();
		if(this.currentIdx >= this.items.length) {
            this.currentIdx = 0;
            this._currentPos = [0,0];
        } else if(style.orientation == 1)
			this._currentPos = [style.itemSize[0] + this.listview.getScrollPosition()[0],0];
		else this._currentPos = [0, style.itemSize[0] + this.listview.getScrollPosition()[1]];
		//Log('this._currentPos = ' + this._currentPos);
		this.listview.setScrollPosition(this._currentPos[style.orientation-1]);
		this.currentIdx += 1;
	},
 	onExit: function() {
 		this.node.destroy();
 		if(this._debugView)
 			this._debugView.destroy();
 	},
 	onPause: function() {
 		
 	},
 	onResume: function() {
 		
 	},
 	_addBackground: function() {
		var bg = new GL2.Sprite();
		bg.setImage("Content/white.png", new Core.Size(1024,1024), new Core.Point(0,0));
		this.node.addChild(bg);
	}
 });