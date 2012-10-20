/**
 * @author sonnn
 */
var ScreenManager = require('../../../../NGGo/Service/Display/ScreenManager').ScreenManager;
var GUIBuilder = require('../../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Scene = require('../../../../NGGo/Framework/Scene/Scene').Scene;
var GL2 = require('../../../../NGCore/Client/GL2').GL2;
var TagOneController = require('../../../controller/TagOneController').TagOneController;
var PreferenceManager = require('../../../../NGGo/Service/Data/PreferenceManager').PreferenceManager;
var AssetManager = require('../../../../NGGo/Service/Data/AssetManager').AssetManager;
var Core = require('../../../../NGCore/Client/Core').Core;
var SceneDirector = require('../../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var GLUI = require('../../../../NGGo/GLUI').GLUI;
var HScroller = require('../../../utils/HScroller').HScroller;
var TagStatus = require('./TagStatus').TagStatus;

var MoveListener = Core.MessageListener.subclass({
	initialize: function(h1, h2) {
		this._h1 = h1;
		this._h2 = h2;
		this._x1 = this._h1.getPosition().getX();
		this._x2 = this._h2.getPosition().getX();
		this._y = this._h1.getPosition().getY();
	},
	
	onUpdate: function() {
		if (this._x1 < 12) {
			this._x1 += 5;
			if (this._x1 > 16) {
				this._x1 = 16;
			}
			this._h1.setPosition(this._x1, this._y);
		}
		
		if (this._x2 > 155) {
			this._x2 -= 5;
			if (this._x2 < 155) {
				this._x2 = 155;
			}
			this._h2.setPosition(this._x2, this._y);
		}
	}
});

var tagOne = {
	initialize: function() {
		this.controller = new TagOneController();
		
		var spriteLeft = new GL2.Sprite();
		spriteLeft.setImage('/Content/tag/c11.png', [160, 400], [0, 0], [0, 0, 1, 1]);
		
		this.heroLeft = {};
		this.heroLeft.sprite = spriteLeft; 
		this.heroLeft.style = "";
		this.heroLeft.rarity = "";
		this.heroLeft.name = "Superman 1";
		this.heroLeft.status = {};
		this.heroLeft.status.level = 999;
		this.heroLeft.status.special_move = "Special move";
		this.heroLeft.status.offence = 2000;
		this.heroLeft.status.defence = 10000;
		this.heroLeft.status.exp_rate = 90;
		this.heroLeft.status.level_up_exp = 100;
		
		var spriteRight = new GL2.Sprite();
		spriteRight.setImage('/Content/tag/c55.png', [160, 400], [0, 0], [0, 0, 1, 1]);
		
		this.heroRight = {};
		this.heroRight.sprite = spriteRight; 
		this.heroRight.style = "";
		this.heroRight.rarity = "";
		this.heroRight.name = "Superman 2";
		this.heroRight.status = {};
		this.heroRight.status.level = 999;
		this.heroRight.status.special_move = "Special move";
		this.heroRight.status.offence = 1000;
		this.heroRight.status.defence = 20000;
		this.heroRight.status.exp_rate = 70;
		this.heroRight.status.level_up_exp = 200;
		
		// PreferenceManager.loadConfigFromFile('Config/preference.json', function(err) {
			// if (err) {
				// console.log("ERROR load preference.json: " + err);
			// }
		// });
// 		
		// AssetManager.loadConfigFromFile('Config/assetmap.json', function(err) {
			// if (err) {
				// console.log("ERROR load assetmap.json: " + err);
			// }
		// });
	},
	
	onEnter: function(preScene, option) {
		this.node = new GL2.Node();
	    GUIBuilder.loadConfigFromFile("Config/Scene/TagScene.json", this.controller, function ()
	    {
	    	this.node.addChild(this.controller.TagOne);
	        ScreenManager.getRootNode().addChild(this.node);
	        var tagStatus = new TagStatus(this.heroLeft, this.heroRight);
	        tagStatus.setDepth(100);
	        tagStatus.setPosition(0, 329)
	        this.controller.TagOne.addChild(tagStatus);
	        
	        this.controller.Tag.setDepth(100);
	        this.controller.Tag1.setDepth(100);
	        this.controller.Tag2.setDepth(100);
	        
	        this.heroLeft.sprite.setDepth(1);
	        this.controller.TagOne.addChild(this.heroLeft.sprite);
	        this.heroLeft.sprite.setPosition(-165, 50);
	        
	        this.heroRight.sprite.setDepth(1);
	        this.controller.TagOne.addChild(this.heroRight.sprite);
	        this.heroRight.sprite.setPosition(365, 50);
	        
	        var l = new MoveListener(this.heroLeft.sprite, this.heroRight.sprite);
	        Core.UpdateEmitter.addListener(l, l.onUpdate);
	        
	        // console.log(this.controller.c1);
	        // this.controller.c1.assetKey = "c1";
	        // this.controller.c2.assetKey = "c2";
	        
	        // if (option) {
		    	// console.log(option);
		    	// var h = option[1] == "c1" ? this.controller.c1 : this.controller.c2;
		    	// console.log(h); 
		    	// var size = AssetManager.getInfoForKey(option[0]).size;
		    	// h.gluiobj.setImage(AssetManager.getAssetForKey(option[0]), GLUI.State.Normal, size);
		    	// h.assetKey = option[0];
	    	// }
	        
	        // this.buildHeros(this.controller.TagOne);
	    }.bind(this));

	},
	
	buildHeros: function(parentNode) {
		var herosSize = PreferenceManager.get("Scene/TagOne/HerosSize");
		var herosKey = PreferenceManager.get("Scene/TagOne/Heros");
		var pos = [-(herosSize[0] + (herosKey.length * 5) - 320), 280];
		
		var heros = [];
        for (var i = 0; i < herosKey.length; i++) {
        	size = AssetManager.getInfoForKey(herosKey[i]).size;
        	image = AssetManager.getAssetForKey(herosKey[i]);
        	heros.push({"name": herosKey[i], "img": image, "size": size});
        }
        
        var onHeroClick = function(heroName) {
        	SceneDirector.transition("TAG_TWO_SCENE", [heroName, this.controller.c1.assetKey, this.controller.c2.assetKey]);
        }.bind(this);
        parentNode.addChild(HScroller.create(herosSize, pos, heros, onHeroClick));
	},
	
	onExit: function(nextScene, option) {
		this.node.destroy();
	}
};

exports.TagScene = Scene.subclass(tagOne);