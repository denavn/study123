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

var tagOne = {
	initialize: function() {
		this.controller = new TagOneController();
		PreferenceManager.loadConfigFromFile('Config/preference.json', function(err) {
			if (err) {
				console.log("ERROR load preference.json: " + err);
			}
		});
		
		AssetManager.loadConfigFromFile('Config/assetmap.json', function(err) {
			if (err) {
				console.log("ERROR load assetmap.json: " + err);
			}
		});
	},
	
	onEnter: function(preScene, option) {
		this.node = new GL2.Node();
	    GUIBuilder.loadConfigFromFile("Config/Scene/TagOneScene.json", this.controller, function ()
	    {
	    	this.node.addChild(this.controller.TagOne);
	        ScreenManager.getRootNode().addChild(this.node);
	        console.log(this.controller.c1);
	        this.controller.c1.assetKey = "c1";
	        this.controller.c2.assetKey = "c2";
	        
	        if (option) {
		    	console.log(option);
		    	var h = option[1] == "c1" ? this.controller.c1 : this.controller.c2;
		    	console.log(h); 
		    	var size = AssetManager.getInfoForKey(option[0]).size;
		    	h.gluiobj.setImage(AssetManager.getAssetForKey(option[0]), GLUI.State.Normal, size);
		    	h.assetKey = option[0];
	    	}
	        
	        this.buildHeros(this.controller.TagOne);
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

exports.TagOneScene = Scene.subclass(tagOne);