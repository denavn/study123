var Scene = require('../../../../NGGo/Framework/Scene/Scene').Scene;
var GL2 = require('../../../../NGCore/Client/GL2').GL2;
var GUIBuilder = require('../../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var ScreenManager = require('../../../../NGGo/Service/Display/ScreenManager').ScreenManager;
var SceneViewCardController = require('../../../controller/SceneViewCardController').SceneViewCardController;

var ViewCardListener =  Core.MessageListener.subclass({
	initialize : function(node, scrollList, itemsObj){
		this._node = node;
		this._scrollList = scrollList;
		this._curItem = 0;
		this._vList = [];
		this._maxLength = 20;
	},
	
	onTouch : function (touch){
		console.log("SceneViewCard.onTouch");
		
		var scale = 320 / Core.Capabilities.getScreenWidth();
		var x = touch.getPosition().getX() * scale;
		var y = touch.getPosition().getY() * scale;
		
		
		switch(touch.getAction()){
			case touch.Action.Start:
				console.log("start touch...");
				this._vList = [ {
					x : x,
					y : y
				} ];
				
				return true;
				break;
			case touch.Action.End:
				console.log("end touch...");
				this._vList = [];
				break;
			case touch.Action.Move:
				console.log("move touch...");
				this._vList.unshift({
					x : x,
					y : y
				});
				
				console.log("currentItem: " + this._curItem);
				
				this._prevPos = this._vList[0];
				if(this._prevPos.x < this._vList[1].x || this._prevPos.y > this._vList[1].y){
					//move forward
					if(this._curItem != this._scrollList.length - 1){
						for(var i = 0 ; i < this._scrollList.length ; i++){
							var item = this._scrollList[i].item;
							var nX = item.getPosition().getX() - 10;
							var nY = item.getPosition().getY() + 5;
							var a = item.getAlpha();
							var s = item.getScale().getX() + 0.05;
							console.log("item: " + i + ", " + a + ", " + s);
							item.setPosition(nX, nY);
							
							if(this._curItem == i){
								item.setAlpha(a - 0.02);
							}
							else{
								item.setAlpha(a + 0.02);
								item.setScale(s , s);
							}
							
							var size = this._scrollList[i].size;
							if(nX < s * size[0]/2){
								this._curItem = i;
							}
						}
					}
				}
				else if(this._prevPos.x > this._vList[1].x || this._prevPos.y < this._vList[1].y){
					//move backward
					if(this._curItem != 0){
						for(var i = 0 ; i < this._scrollList.length ; i++){
							var item = this._scrollList[i].item;
							var nX = item.getPosition().getX() + 10;
							var nY = item.getPosition().getY() - 5;
							var a = item.getAlpha();
							var s = (item.getScale().getX() - 0.05) < 0 ? 0 : (item.getScale().getX() - 0.05);
							console.log("item: " + i + ", " + a + ", " + s);
							item.setPosition(nX, nY);
							
							if(this._curItem == i){
								item.setAlpha(a + 0.02);
							}
							else{
								item.setAlpha(a - 0.02);
								item.setScale(s , s);
							}
							
							var size = this._scrollList[i].size;
							if(nX < s * size[0]/2){
								this._curItem = i;
							}
						}
					}
				}
				break;
		}
		while ( this._maxLength < this._vList.length ) {
			this._vList.pop();
		}
	},
	
	destroy : function(){
		if(this._node)
			this._node.destroy();
	}
});

exports.SceneViewCard = Scene.subclass({
		classname: "SceneViewCard",
		
		initialize: function (){			
			this._controller = new SceneViewCardController();
			this._touchTarget = new GL2.TouchTarget();
			this._touchTarget.setAnchor(0,0);
			this._touchTarget.setSize(Core.Capabilities.getScreenWidth(),Core.Capabilities.getScreenHeight());
		},	
	    
	    onEnter: function (){
	    	this._node = new GL2.Node();
	    	this._scrollList = [];
	    	
	    	var scrollType = function(controller, def){
	    		console.log("define scroll type");
	    		var itemsObj = def.children;
	    		var scroll = new GL2.Sprite();
	    		
	    		console.log("items: " + itemsObj.length);
	    		for(var i = 0 ; i <itemsObj.length ; i++){
		            var url = itemsObj[i].attrs.normalImage.url;
		            var anchor = itemsObj[i].attrs.normalImage.anchor;
		            var size = itemsObj[i].attrs.normalImage.size;
		            var uvs = itemsObj[i].attrs.normalImage.uvs;
		            var scale = 2/(i+1);
		            var img = new GL2.Sprite();
		            
		            img.setImage(GUIBuilder.basePath + url, size, anchor, uvs);
		            img.setPosition(size[0]*scale/2 + i*100, size[1]*scale/2 + i*20);
		            img.setScale(scale, scale);
		            img.setDepth(1/(i+1));
		            img.setAlpha(1/(i+1) + 0.2);
		            console.log("alpha: " + img.getAlpha());
		            this._scrollList.push({
		            	item: img,
		            	size: size
		            });
		            scroll.addChild(img);
		        }
	    		
				return scroll;
			}.bind(this);
			
			GUIBuilder.registerTypeMethod("ScrollType", scrollType);
			
	    	GUIBuilder.loadConfigFromFile("Config/Scene/SceneViewCard.json", this._controller, function (){
	    		this._node.addChild(this._controller.ViewCard);
			    ScreenManager.getRootNode().addChild(this._node);
			}.bind(this));
	    	
	    	var listener = new ViewCardListener(this._node, this._scrollList);
	    	this._touchTarget.getTouchEmitter().addListener(listener, listener.onTouch);
	    	this._node.addChild(this._touchTarget);
		},
	   
	    onExit: function () {
	    	 this.destroy();
	    },
	    /**
	     * Destroys object and releases memory.
	     */
	    /**
	     * 
	     */
	    destroy: function () {
	    	this._node.destroy();
	    	
	    	if (this._controller.ViewCard) {
	    		 this._controller.ViewCard.destroy();
	    	 }
	    	
	    	if(this._touchTarget)
	    		this._touchTarget.destroy();
	    	
	    }
});