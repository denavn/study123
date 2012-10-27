var ModelBase = require('../../../../model/Entity/ModelBase').ModelBase;
var GL2		  = require('../../../../../NGCore/Client/GL2').GL2;
var SumoUtil = require('../../../../utils/SumoUtil').SumoUtil;
var AnimationManager = require('../../../../../NGGo/Framework/AnimationManager').AnimationManager;
var TouchManager = require('../../../../utils/TouchManager').TouchManager;

exports.Hero = ModelBase.subclass({
    classname: "Hero",

    _setParams: function (d) {
        d = d || {};
        
        this.hero_id = d.hero_id || "";
        this.name = d.name || "";
        this.type = d.type || "";
        this.hp = d.hp || 0;
        this.attack = d.attack || 0;
        this.attackInterval = d.attackInterval || 0;
        this.defense = d.defense || 0;
        this.speed = d.speed || 0;
        
        this._node = new GL2.Node();
        this._sprite = new GL2.Sprite();
        this._node.addChild(this._sprite);
        
        // this._standAnimation = SumoUtil.createAnimation(this.testData.animation.stand.img, this.testData.animation.stand.frameCount, 
        //        this.testData.animation.stand.duration, this.testData.animation.stand.frameWidth, this.testData.animation.stand.frameHeight);

		this._frameDuration = 300;          
        this._sprite = new GL2.Sprite();
        this._sprite.setAnimation(AnimationManager.getAnimationGL2("dragon", "stand", this._frameDuration));
		
		// this._sprite.setAnimation(this._standAnimation);
		
		// add touch target
		//----- create touch target
		
		//this.touch = new GL2.TouchTarget();
		//this.touch.setAnchor( [0.5, 0.5] );
		//this.touch.setSize(
		//	this._sprite._animation.getFrame(0).getSize().getWidth(),
		//	this._sprite._animation.getFrame(0).getSize().getHeight()
		//);
		//TouchManager.instance().addListener(this, this.touch, this.onTouch);
		//console.log("NDL:Sumo this._sprite.getSize()="+this._sprite._animation.getFrame(0).getSize().getWidth());
		//this._sprite.addChild(this.touch);
    },
    
    onTouch: function(touch) {
    	if (touch.getAction() === touch.Action.Start) {
			return true;
		}
		else if (touch.getAction() === touch.Action.End) {
			console.log("NDL:>>> onTouch Hero");
			return true;
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
    	this._sprite.setAnimation(AnimationManager.getAnimationGL2(this.name, sumoState, this._frameDuration));;
    },
    
    getPosition: function(x,y) {
    	return this._sprite.getPosition();
    },
    
    setPosition: function(x,y) {
    	this._node.setPosition(x,y);
    	this._sprite.setPosition(x,y);
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
      "name" : "evil",
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
