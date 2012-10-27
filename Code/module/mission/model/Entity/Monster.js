var ModelBase = require('../../../../model/Entity/ModelBase').ModelBase;
var GL2		  = require('../../../../../NGCore/Client/GL2').GL2;
var SumoUtil = require('../../../../utils/SumoUtil').SumoUtil;
var AnimationManager = require('../../../../../NGGo/Framework/AnimationManager').AnimationManager;
var TouchManager = require('../../../../utils/TouchManager').TouchManager;
var SceneDirector = require('../../../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;

exports.Monster = ModelBase.subclass({
    classname: "Monster",

    _setParams: function (d) {
        d = d || {};
        
        this.monster_id = d.monster_id || "";
        this.name = d.name || "";
        this.type = d.type || "";
        this.hp = d.hp || 0;
        this.attack = d.attack || 0;
        this.attackInterval = d.attackInterval || 0;
        this.defense = d.defense || 0;
        this.speed = d.speed || 0;
        
        this._node = new GL2.Node();
        this._frameDuration = 300;   
        
        this._sprite = new GL2.Sprite();
        this._sprite.setAnimation(AnimationManager.getAnimationGL2("evil", "stand", this._frameDuration));
		this._node.addChild(this._sprite);
		
		
		//this._node.addChild(this._slashSprite);
		
		// add touch target
		//----- create touch target
		
		this.touch = new GL2.TouchTarget();
		this.touch.setAnchor( [0.5, 0.5] );
		this.touch.setSize(
			this._sprite._animation.getFrame(0).getSize().getWidth(),
			this._sprite._animation.getFrame(0).getSize().getHeight()
		);
		TouchManager.instance().addListener(this, this.touch, this.onTouch);
		console.log("NDL:Sumo this._sprite.getSize()="+this._sprite._animation.getFrame(0).getSize().getWidth());
		this._sprite.addChild(this.touch);
		
		this._isTouched = false;
		this._isDamaged = false;
    },
    
    onTouch: function(touch) {
    	if (touch.getAction() === touch.Action.Start) {
    		console.log("NDL:>>> onTouch Monster -- start");
    		this.setAnim("evil", "damage");
    		this._isTouched = true;
    		//this._isDamaged = true;
    		this._slashSprite = new GL2.Sprite();
			this._slashSprite.setAnimation(AnimationManager.getAnimationGL2("slash", "default", this._frameDuration/3));
    		this._slashSprite.getAnimation().setLoopingEnabled(false);
    		this._node.addChild(this._slashSprite);
    		var controller = SceneDirector.currentScene.controller;
    		this._slashSprite.getAnimationCompleteEmitter().addListener(this, this.destroySlash);
    		//this._slashSprite.getAnimationCompleteEmitter().addListener(controller, controller.test("111"));
		}
		else if (touch.getAction() === touch.Action.Move) {
    		console.log("NDL:>>> onTouch Monster -- Move");
    		//if(!this._isTouched){
    			//if(!this._isDamaged) {
    				//this.setAnim("evil", "damage");
    				//this._isTouched = true;
    				//this._isDamaged = true;
    			//}    			
    		//}
    		//else {
    			//this.setAnim("evil", "stand");
    			//this._isTouched = false;
    		//}
    		
    		//this._node.addChild(this._slashSprite);
		}
		else if (touch.getAction() === touch.Action.End) {
			console.log("NDL:>>> onTouch Monster -- end");
			this.setAnim("evil", "stand");
			this._isTouched = false;
		}
    },
    
    destroySlash: function() {
    	console.log("NDL:---destroySlash");
    	if(this._slashSprite) {
    		this._slashSprite.destroy();
    	}
    	if(this._sprite) {
    		this._sprite.destroy();
    	}
    },
    
    updateHp: function(hp) {
    	this.hp += hp;
    },
    
    getHp: function() {
    	return this.hp || 0;
    },
    
    getNode:function() {
    	return this._node;
    },
    
    getAnim:function() {
    	return this._sprite;
    },
    
    setAnim:function(sumoName, sumoState) {
    	this.name = sumoName || this.name; 
    	this._sprite.setAnimation(AnimationManager.getAnimationGL2(this.name, sumoState, this._frameDuration));
    },
    
    getPosition: function(x,y) {
    	return this._node.getPosition();
    },
    
    setPosition: function(x,y) {
    	this._node.setPosition(x,y);
    	//this._sprite.setPosition(x,y);
    },
    
    setRotation: function(degrees) {
    	this._node.setRotation();
    	this._sprite.setRotation(degrees);
    },
    
    setColor: function(r,g,b) {
    	this._node.setColor(r,g,b);
    	this._sprite.setColor(r,g,b);
    },
    
    setScale: function(scaleX, scaleY) {
    	this._node.setScale(scaleX, scaleY);
    	this._sprite.setScale(scaleX, scaleY);
    },
    
    setVisible: function(value) {
    	this._sprite.setVisible(value);
    },
    
    testData: {
      "name" : "dragon",
      "type" : "sumo",
      "hp" : 500,
      "attack" : 25,
      "attackInterval" : 1000,
      "defense" : 10,
      "speed" : 50,
      "move_type" : {
      	"type":"small_jump",
      	"step":1
      }
     }
});
