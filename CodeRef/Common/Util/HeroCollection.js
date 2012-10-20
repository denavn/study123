
/********************************************************************************************
 * Class Name: HeroCollection 
 * @param hero: Hero Object
 * @param pos: position of hero
 * @param scale
 * @Description: This class contains Hero object and other information which need for adding 
 * Hero object on MapCollection such as: x, y, scale, etc...
 * 
 *******************************************************************************************/


var Core		= require('../../../NGCore/Client/Core').Core;
var GL2			= require('../../../NGCore/Client/GL2').GL2;
var Constant	= require('./Constant').Constant;
var Hero 		= require('../../Model/Hero').Hero;

exports.HeroCollection = GL2.Node.subclass({
	classname : "HeroCollection",
	
	initialize : function(hero, pos, scale){
		this._hero = hero;
		this._pos = pos;		
		this._nodScale = scale;		
		this.setPosition(pos);
		
		var heroSprite = this._hero.getFullSprite([this._nodScale * Constant.HERO_SIZE, this._nodScale * Constant.HERO_SIZE], [0.5,1]);
		this.addChild(heroSprite);
		//set color and question mark for invalid hero
		if(!this.isCollected()){			
			heroSprite.setColor([0, 0, 0]);
			var _view = new GL2.Sprite();			
			_view.setImage("Content/image/collection_new/qa.png", [Constant.QUESTION_MARK_SIZE, Constant.QUESTION_MARK_SIZE], [0, 0], [0, 0, 1, 1]);
			_view.setPosition(-5,-(this._nodScale * Constant.HERO_SIZE/2 + Constant.QUESTION_MARK_SIZE + 14));
			this.addChild(_view);
		}		
		//add target
		this._mTarget = new GL2.TouchTarget();
		this._mTarget.setAnchor(0.5 + 0.06, 1);
		this._mTarget.setSize(this._nodScale * Constant.HERO_SIZE - 2* Constant.BLANK_BOUND_EACH_SIDE, this._nodScale * Constant.HERO_SIZE);	 

		this.addChild(this._mTarget);

	},
	/**
	 * Get name sprite of Hero
	 * @returns {GL2.Sprite}
	 */
	getHeroName: function() {
		var _heroName = this._hero.getNameSprite([100, 24], [0, 0]);
		_heroName.setPosition(145, 170);
		_heroName.setColor(0, 0, 0);
		return _heroName;
	},
	/**
	 * Get rarity sprite of Hero
	 * @returns {GL2.Sprite}
	 */
	getRarity: function() {
		var _heroRarity = this._hero.getRaritySprite([20, 15], [0, 0]);
    	_heroRarity.setPosition(218, 198);
    	return _heroRarity;
	},
	/**
	 * Get category name
	 * @returns {GL2.Text}
	 */
	getCategoryName: function() {
		var _categoryName;
		if(this._hero.category_id === 1) {
			_categoryName = "Friend";    		
    	} else if(this._hero.category_id === 2){
    		_categoryName = "Foe";
    	} else {
    		_categoryName = "Other";
    	}    	
		return _categoryName;
	},
	/**
	 * Get style
	 * @returns {GL2.Text}
	 */
	getStyle: function() {
		return this._hero.style;
	},
	/**
	 * Get max level
	 * @returns {GL2.Text}
	 */
	getMaxLevel: function() {
	return this._hero.max_level || "0";
	},
	/**
	 * Get max offence
	 * @returns {GL2.Text}
	 */
	getMaxOffence: function() {
		return this._hero.max_offence;
	},
	/**
	 * Get max Defence
	 * @return {GL2.Text}
	 */
	getMaxDefence: function() {
		return this._hero.max_defence;
	},
	/**
	 * Get height
	 * @returns height
	 */
	getHeight: function() {
		return this._hero.height;
	},
	/**
	 * Get weight
	 * @returns weight
	 */
	getWeight: function() {
		return this._hero.weight; 
	},
	/**
	 * Get power in commic
	 * @returns power
	 */
	getPower: function() {
		return this._hero.power || "0";
	},
	/**
	 * Get skill
	 * @returns skill
	 */
	getSkill: function() {
		return this._hero.special_move || "0";
	},
	/**
	 * Get description
	 * @returns description
	 */
	getDescription: function() {
		return this._hero.description || "Description";
	},
	/**
	 * Get hero full sprite
	 * @return {GL2.Sprite}
	 */
	getHeroFullSprite: function() {
		var _heroFullSprite = this._hero.getFullSprite([Constant.HERO_SIZE* Constant.HERO_SCALE,Constant.HERO_SIZE* Constant.HERO_SCALE],[0,0]); 
		_heroFullSprite.setPosition(-20,65);
		return _heroFullSprite;
	},
	/**
	 * Get hero face sprite
	 * @return {GL2.Sprite}
	 */
	getHeroFaceSprite: function() {
		var _heroFaceSprite = this._hero.getFaceSprite([Constant.HERO_SIZE* 0.2,Constant.HERO_SIZE* 0.2],[0,0]);
		_heroFaceSprite.setPosition(145,70);
		return _heroFaceSprite;
	},
	/**
	 * Check hero is collected
	 */
	isCollected:function(){
		return (this._hero.style != 3);
	}	
});