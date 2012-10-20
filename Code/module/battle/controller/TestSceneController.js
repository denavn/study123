/**
 * @author sonnn
 */

var Core 				= require('../../NGCore/Client/Core').Core;
var GL2  				= require('../../NGCore/Client/GL2').GL2;
var SceneDirector 		= require('../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var SceneFactory 		= require('../../NGGo/Framework/Scene/SceneFactory').SceneFactory;
var ParticleEmitter 	= require('../../NGGo/Service/Graphics/ParticleEmitter').ParticleEmitter;
var AnimationManager 	= require('../../NGGo/Framework/AnimationManager').AnimationManager;
var Logger 				= require('../utils/Logger').Logger;

var testSceneController = 
{
	
	initialize: function() {
	},
	
	action_click: function (elem, buttnName) {
        console.log('You clicked ' + buttnName + '!');
        
        if (buttnName === "Home") {
        	SceneDirector.transition("DEBUG_SCENE");
        }
   },
   
   setup: function() {
   		var sprite = new GL2.Sprite();
		
		// var a = new GL2.Animation();
		// var dimension = [1952, 845];
		var fRate = 100;
		// var offset = [0, 0.5];
		// a.pushFrame(new GL2.Animation.Frame('Content/test/lighting/lighting-1.png', fRate, dimension, offset, [0, 0, 1, 1]));
		// a.pushFrame(new GL2.Animation.Frame('Content/test/lighting/lighting-2.png', fRate, dimension, offset, [0, 0, 1, 1]));
		// a.pushFrame(new GL2.Animation.Frame('Content/test/lighting/lighting-3.png', fRate, dimension, offset, [0, 0, 1, 1]));
		// a.pushFrame(new GL2.Animation.Frame('Content/test/lighting/lighting-4.png', fRate, dimension, offset, [0, 0, 1, 1]));
// 		
		// sprite.setAnimation(a);
		
		sprite.setAnimation(AnimationManager.getAnimationGL2("lighting", "line", fRate));
		
		sprite.setScale(-1, 1);
		sprite.setPosition(220, 100);
		this.MainGame.addChild(sprite);
   }
};

exports.TestSceneController = Core.Class.subclass(testSceneController);
