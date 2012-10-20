var GL2		  			= require('../../../../../NGCore/Client/GL2').GL2;
var AnimationManager 	= require('../../../../../NGGo/Framework/AnimationManager').AnimationManager;
var ModelBase 			= require('../../../../model/Entity/ModelBase').ModelBase;

exports.Sumo = ModelBase.subclass({
    classname: "Sumo",

    _setParams: function (d) {
        d = d || {};
        
        this.name = d.name || "";
        this.type = d.type || "";
        this.hp = d.hp || 0;
        this.attack = d.attack || 0;
        this.attackInterval = d.attackInterval || 0;
        this.defense = d.defense || 0;
        this.speed = d.speed || 0;
        this._skill = null;
        
        this._node = new GL2.Node();
        this._sprite = new GL2.Sprite();
        this._node.addChild(this._sprite);
        
		this._frameDuration = 300;          
        this._sprite = new GL2.Sprite();
        this._sprite.setAnimation(AnimationManager.getAnimationGL2("dragon", "stand", this._frameDuration));
    },
    
    fight: function(skillType, target) {
    	var p = this.getPosition();
    	var d = target == "ENEMY" ? 1 : -1; 
    	this._skill.setPosition(p.getX() + 270 * d, p.getY() - 15);
    	this._skill.present(skillType, d);
    },
    
    getFightStatus: function() {
    	return this._skill.isFinished; 
    },
    
    resetFightStatus: function() {
    	this._skill.isFinished = false;
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
    
    setSkill: function(skill) {
    	this._skill = skill;
    },
    
    setAnim: function(sumoName, sumoState) {
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
    
    getScale: function() {
    	return this._sprite.getScale();
    },
    
    setScale: function(scaleX, scaleY) {
    	this._node.setScale(scaleX, scaleY);
    	this._sprite.setScale(scaleX, scaleY);
    },
    
    getAlpha: function(value) {
    	return this._sprite.getAlpha();
    },
    
    setAlpha: function(value) {
    	this._sprite.setAlpha(value);
    },
    
    setVisible: function(value) {
    	this._sprite.setVisible(value);
    },
    
    testData: {
      "name" : "Sumoning 1",
      "type" : "sumo",
      "hp" : 500,
      "attack" : 25,
      "attackInterval" : 1000,
      "defense" : 10,
      "speed" : 50,
      "move_type" : {
      	"type":"small_jump",
      	"step":1
      },
      "avatar" : "avatar.png",
      "animation" : {
       "stand" : {
          "duration" : 50,
          "frameCount" : 1,
          "frameHeight" : 200,
          "frameWidth" : 200,
          "img" : "Content/Sumo/Dragon_1.png"
        },
        "move" : {
          "duration" : 50,
          "frameCount" : 5,
          "frameHeight" : 50,
          "frameWidth" : 50,
          "img" : "image.png"
        },
        "damage" : {
          "duration" : 50,
          "frameCount" : 5,
          "frameHeight" : 50,
          "frameWidth" : 50,
          "img" : "image.png"
        },
        "attack" : {
          "duration" : 50,
          "frameCount" : 5,
          "frameHeight" : 50,
          "frameWidth" : 50,
          "img" : "image.img"
        },
        "dead" : {
          "duration" : 50,
          "frameCount" : 5,
          "frameHeight" : 50,
          "frameWidth" : 90,
          "img" : "image.png"
        },
        "additional" : {
          "duration" : 50,
          "frameCount" : 5,
          "frameHeight" : 50,
          "frameWidth" : 90,
          "img" : "image.png"
        }
      }
    }
});
