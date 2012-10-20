var Core			 = require('../../NGCore/Client/Core').Core;
var GL2				 = require('../../NGCore/Client/GL2').GL2;
var SceneDirector	 = require('../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var GLUI			 = require('../../NGGo/GLUI').GLUI;
var Constant	 	 = require('../Common/Util/Constant').Constant;
var VFX				 = require('../../DnLib/Dn/GL2/VFX').VFX;
exports.HeroShowController = Core.Class.subclass({
    classname: "HeroShowController",
    TEXT_SIZE: 12,
    initialize: function() {
    },

    action_close: function(elem, param) {
    	console.log("Close action");
    	//VFX.enchant(this.HeroShowView).move(0.8, 0, -460);
    	SceneDirector.pop();    	
    },

    action_click: function(elem, param) {
    },    
    
    deactive: function() {
        
    },

    active: function() {
        
    },
    updateHero : function(heroCollection) {
    	var _heroSprite = new GL2.Sprite();
    	
    	//hero name
    	_heroSprite.addChild(heroCollection.getHeroName());
    	//hero rarity    	
    	_heroSprite.addChild(heroCollection.getRarity());
    	
    	//comic Category    	
    	var _comicCategory = new GL2.Text();
    	_comicCategory.setFontSize(this.TEXT_SIZE);
    	_comicCategory.setVerticalAlign(GL2.Text.VerticalAlign.Top);
    	_comicCategory.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
    	_comicCategory.setText(heroCollection.getCategoryName());
    	_comicCategory.setAnchor(0, 0);
    	_comicCategory.setPosition(218, 218);    	
    	_heroSprite.addChild(_comicCategory);
    	
    	//style
    	var _style = new GL2.Text();
    	_style.setFontSize(this.TEXT_SIZE);
    	_style.setVerticalAlign(GL2.Text.VerticalAlign.Top);
    	_style.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
    	_style.setText(heroCollection.getStyle());
    	_style.setAnchor(0, 0);
    	_style.setPosition(218, 236);    	
    	_heroSprite.addChild(_style);
    	
    	//max level
    	var _maxLevel = new GL2.Text();
    	_maxLevel.setFontSize(this.TEXT_SIZE);
    	_maxLevel.setVerticalAlign(GL2.Text.VerticalAlign.Top);
    	_maxLevel.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
    	_maxLevel.setText(heroCollection.getMaxLevel());
    	_maxLevel.setAnchor(0, 0);
    	_maxLevel.setPosition(218, 250);    	
    	_heroSprite.addChild(_maxLevel);
    	
    	//offence
    	var _offence = new GL2.Text();
    	_offence.setFontSize(this.TEXT_SIZE);
    	_offence.setVerticalAlign(GL2.Text.VerticalAlign.Top);
    	_offence.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
    	_offence.setText(heroCollection.getMaxOffence());
    	_offence.setAnchor(0, 0);
    	_offence.setPosition(218, 269);    	
    	_heroSprite.addChild(_offence);
    	
    	//defence
    	var _defence = new GL2.Text();
    	_defence.setFontSize(this.TEXT_SIZE);
    	_defence.setVerticalAlign(GL2.Text.VerticalAlign.Top);
    	_defence.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
    	_defence.setText(heroCollection.getMaxDefence());
    	_defence.setAnchor(0, 0);
    	_defence.setPosition(218, 284);    	
    	_heroSprite.addChild(_defence);
    	
    	//height
    	var _height = new GL2.Text();
    	_height.setFontSize(this.TEXT_SIZE);
    	_height.setVerticalAlign(GL2.Text.VerticalAlign.Top);
    	_height.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
    	_height.setText(heroCollection.getHeight() + "cm");
    	_height.setAnchor(0, 0);
    	_height.setPosition(70, 308);    	
    	_heroSprite.addChild(_height);
    	
    	//weight
    	var _weight = new GL2.Text();
    	_weight.setFontSize(this.TEXT_SIZE);
    	_weight.setVerticalAlign(GL2.Text.VerticalAlign.Top);
    	_weight.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
    	_weight.setText(heroCollection.getWeight() + "kg");
    	_weight.setAnchor(0, 0);
    	_weight.setPosition(163, 310);    	
    	_heroSprite.addChild(_weight);
    	
    	//skill
    	var _skill = new GL2.Text();
    	_skill.setFontSize(this.TEXT_SIZE);
    	_skill.setVerticalAlign(GL2.Text.VerticalAlign.Top);
    	_skill.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);    	
    	_skill.setText(heroCollection.getSkill());    	
    	_skill.setAnchor(0, 0);
    	_skill.setPosition(70, 325);    	
    	_heroSprite.addChild(_skill);
    	
    	//power
    	var _power = new GL2.Text();
    	_power.setFontSize(this.TEXT_SIZE);
    	_power.setVerticalAlign(GL2.Text.VerticalAlign.Top);
    	_power.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
    	_power.setText(heroCollection.getPower());
    	_power.setAnchor(0, 0);
    	_power.setPosition(70, 342);
    	_heroSprite.addChild(_power);
    	
    	//description
    	var _description = new GL2.Text();
    	_description.setFontSize(this.TEXT_SIZE);
    	_description.setVerticalAlign(GL2.Text.VerticalAlign.Top);
    	_description.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
    	_description.setText(heroCollection.getDescription());
    	_description.setAnchor(0, 0);
    	_description.setPosition(70, 358);
    	_heroSprite.addChild(_description); 
    	
    	//Full Hero
    	_heroSprite.addChild(heroCollection.getHeroFullSprite());
    	
    	//Face Hero
    	_heroSprite.addChild(heroCollection.getHeroFaceSprite());

    	this.HeroShowView.addChild(_heroSprite);
    	
    }
});