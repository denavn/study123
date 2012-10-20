/**
 * @author sonnn
 */
var ScreenManager = require('../../../../NGGo/Service/Display/ScreenManager').ScreenManager;
var GUIBuilder = require('../../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Scene = require('../../../../NGGo/Framework/Scene/Scene').Scene;
var GL2 = require('../../../../NGCore/Client/GL2').GL2;
var TagTwoController = require('../../../controller/TagTwoController').TagTwoController;
var PreferenceManager = require('../../../../NGGo/Service/Data/PreferenceManager').PreferenceManager;
var AssetManager = require('../../../../NGGo/Service/Data/AssetManager').AssetManager;
var Core = require('../../../../NGCore/Client/Core').Core;
var GLUI = require('../../../../NGGo/GLUI').GLUI;

var tagTwo = {
	initialize: function() {
		this.controller = new TagTwoController();
	},
	
	onEnter: function(preScene, option) {
		this.node = new GL2.Node();
	    GUIBuilder.loadConfigFromFile("Config/Scene/TagTwoScene.json", this.controller, function ()
	    {
	    	this.node.addChild(this.controller.TagTwo);
	        ScreenManager.getRootNode().addChild(this.node);
	        
	        if (option) {
		    	console.log(option);
				var size = AssetManager.getInfoForKey(option[1]).size;
				console.log(size);
				console.log(this.controller.c1.gluiobj);	    	
		    	this.controller.c1.gluiobj.setImage(AssetManager.getAssetForKey(option[1]), GLUI.State.Normal, size);
		    	this.controller.c2.gluiobj.setImage(AssetManager.getAssetForKey(option[2]), GLUI.State.Normal, size);
	    	}
	        
	        this.buildHeros(option[0]);
	    }.bind(this));
	},
	
	buildHeros: function(heroName) {
		// var herosSize = PreferenceManager.get("Scene/TagTwo/HerosSize");
		var heros = PreferenceManager.get("Scene/TagTwo/" + heroName);
		// var herosNode = new GL2.Node();
		// herosNode.setPosition(-(herosSize[0] + (heros.length * 5) - 320), 350);

		var h = null;
		var h2 = null;
		var size = null;
        for (var i = 0; i < heros.length; i++) {
        	size = AssetManager.getInfoForKey(heros[i]).size;
        	
        	h = new GL2.Sprite();
        	h.name = heros[i];
        	h.setImage(AssetManager.getAssetForKey(heros[i]), size, [0, 0], [0, 0, 1, 1]);
        	h.setPosition(i * (size[0] + 5) == 0 ? 5 : i * (size[0] + 5), 280);
        	this.controller.TagTwo.addChild(h);
        	if (i == 1) {
        		h2 = new GL2.Sprite();
	        	h2.name = heros[i];
	        	h2.setImage(AssetManager.getAssetForKey(heros[i]), size, [0, 0], [0, 0, 1, 1]);
	        	h2.setPosition(i * (size[0] + 5), 280);
        		this.controller.TagTwo.addChild(h2);
        		h2.setColor(0.5, 06, 0.7);
        		this.controller.TagTwo.mainHero = h2;
        	}
        }
	},
	
	onExit: function(nextScene, option) {
		this.node.destroy();
	}
};

exports.TagTwoScene = Scene.subclass(tagTwo);