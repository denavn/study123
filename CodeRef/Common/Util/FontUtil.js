var Core	= require('../../../NGCore/Client/Core').Core;
var URLSprite = require('../../../NGGo/GLUI/Sprite').URLSprite;
var Constant = require('./Constant').Constant;

exports.FontUtil = Core.Class.singleton({
	classname: "FontUtil",
	initialize : function(){
		this._garbage = [];
	},
	
	create : function(type, str){
		var s = new String(str);
		if(!s || s.length == 0){
			return null;
		}
		
		var node = new GL2.Node();
		var basePath = Constant.FONT_BASE_PATH + type + "/";
		
		for(var i = 0 ; i < s.length ; i++){
			var img = new URLSprite();
			var imgPath;
			console.log("imgPath: " + imgPath + s.charAt(i) + ".png" + "  pos: " + i*20);
			if(s.charAt(i) == "/"){
				imgPath = basePath + "s.png";
			}else{
				imgPath = basePath + s.charAt(i) + ".png";	
			}
			
			img.setImage(imgPath, [20,20], [0,0]);
			img.setPosition(i * 15, 0);
			node.addChild(img);
			this._garbage.push(img);
		}
		
		return node;
	},
	
	clear : function(){
		for(var i = 0 ; i < this._garbage ; i++){
			this._garbage[i].destroy();
			delete this._garbage[i];
		}
		this._garbage = [];
	}
});