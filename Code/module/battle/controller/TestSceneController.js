/**
 * @author sonnn
 */

var Core 				= require('../../../../NGCore/Client/Core').Core;
var GL2  				= require('../../../../NGCore/Client/GL2').GL2;
var SceneDirector 		= require('../../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var SceneFactory 		= require('../../../../NGGo/Framework/Scene/SceneFactory').SceneFactory;
var ParticleEmitter 	= require('../../../../NGGo/Service/Graphics/ParticleEmitter').ParticleEmitter;
var AnimationManager 	= require('../../../../NGGo/Framework/AnimationManager').AnimationManager;
var Logger 				= require('../../../utils/Logger').Logger;

var MoveListener = Core.MessageListener.subclass({
	initialize: function(ctl, target, min, max) {
		this.ctl = ctl;
		this.target = target;
		this.dir = 1;
		this.x = min;
		this.y = target.getPosition().getY();
		this.min = min;
		this.max = max;
		this.counter = 0;
	},
	
	onUpdate: function() {
		this.x += 5 * this.dir;
		 
		if (this.x < this.max) {
			this.target.setPosition(this.x, this.y);
		} else {
			this.dir *= -1;
		}
		
		if (this.x <= this.min) {
			this.dir *= -1;
			this.counter++;
		}
			
		if (this.counter == 1) {
			this.ctl.check();
		}
		
		if (this.counter == 2) {
			this.ctl.check2();
		}
	}
});

var testSceneController = 
{
	
	initialize: function() {
	},
	
	action_click: function (elem, buttnName) {
        console.log('You clicked ' + buttnName + '!');
        
        if (buttnName === "Home") {
        	SceneDirector.transition("PRE_BATTLE_SCENE");
        }
   },
   
   setup: function() {
   		this.sprite = new GL2.Sprite();
		
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
		
		// sprite.setAnimation(AnimationManager.getAnimationGL2("lighting", "line", fRate));
// 		
		// sprite.setScale(-1, 1);
		this.sprite.setPosition(10, 50);
		this.sprite.setImage("Content/battle/Test/card1.png", new Core.Size(50, 100), new Core.Point(0,0));
		this.MainGame.addChild(this.sprite);
		
		this._mvListener = new MoveListener(this, this.sprite, 10, 400);
    	Core.UpdateEmitter.addListener(this._mvListener, this._mvListener.onUpdate);
    	
    	for (var x = 0; x < 1000; x ++) {
    		Logger.log(x);
    	}
    	
    	Logger.log("DONE");
   },
   
   check: function() {
   		this.sprite.setImage("Content/battle/Test/card2.png", new Core.Size(50, 100), new Core.Point(0,0));
   },
   
   check2: function() {
   		for (var x = 0; x < 5000; x ++) {
    		Logger.log(x);
    	}
   }
};

exports.TestSceneController = Core.Class.subclass(testSceneController);
