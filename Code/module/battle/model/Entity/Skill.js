var ModelBase 			= require('../../../../model/Entity/ModelBase').ModelBase;
var GL2		  			= require('../../../../../NGCore/Client/GL2').GL2;
var AnimationManager 	= require('../../../../../NGGo/Framework/AnimationManager').AnimationManager;
var VFX 				= require('../../../../../NGGo/Service/Graphics/VFX/VFX').VFX;
var Logger 				= require('../../../../utils/Logger').Logger;

var skillObj = {
    classname: "Skill",

    _setParams: function (d) {
        d = d || {};
        
        this.type = d.type || "";
        this.damage = d.damage || 0;
        this.avatar = d.avatar || "";
        this.position = d.position ||{};
        this._direction = 1;
        
        this._frameDuration = 150;          
        this._sprite = new GL2.Sprite();
        this._sprite.setAnimation(AnimationManager.getAnimationGL2("fire", "begin", this._frameDuration));
        
        this.isFinished = false;
    },
    
    present: function(skillType, d) {
    	this._direction = d;
    	
    	if (skillType == 2) {
    		this.fire();
    	} else if(skillType == 3) {
    		this.lighting();
    	}
    },
    
    setPosition: function(x, y) {
    	this._sprite.setPosition(x, y);
    },
    
    getPosition: function() {
    	return this._sprite.getPosition();
    },
    
    setScale: function(sx, sy) {
    	this._sprite.setScale(sx, sy);
    },
    
    setRotation: function(d) {
    	this._sprite.setRotation(d);
    },
    
    getAnim: function() {
    	return this._sprite;
    },
    
    setAnim: function(name, state, frameRate) {
    	frameRate = frameRate || this._frameDuration;
    	var anim = AnimationManager.getAnimationGL2(name, state, frameRate);
    	anim.setLoopingEnabled(false);
    	this._sprite.setAnimation(anim);
    	
    	Logger.log("Anim state = " + state);
    },
    
    reset: function() {
    	this.setAnim("fire", "begin");
    	this.setScale(1, 1);
    },
    
    destroy: function() {
    	this._sprite.destroy();
    },
    
    bigFire: function() {
    	Logger.log("Skill-->Bigfire");
    	var p = this._sprite.getPosition();
    	this._sprite.setPosition(p.getX() - 330 * this._direction, p.getY());
    	this.setAnim("fire", "end");
    	
    	this.isFinished = true;
    },
    
    fire: function() {
    	Logger.log("Skill-->fire");
    	
    	this.setAnim("fire", "begin");
    	var self = this;
    	var task = VFX.enchant(this._sprite).move2(self, this.bigFire, 0.08, 200 * this._direction, 0);
    },
    
    lighting: function() {
    	var p = this._sprite.getPosition();
    	this._sprite.setPosition(p.getX() - 110 * this._direction, p.getY() - 10);
    	this.setAnim("lighting", "line");
    	this.isFinished = true;
    }
};

exports.Skill = ModelBase.subclass(skillObj);
