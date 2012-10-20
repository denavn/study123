var Core = require('../../NGCore/Client/Core').Core;
var FileSystem = require('../../NGCore/Client/Storage/FileSystem').FileSystem;
var GameAPI  = require('../GameAPI').GameAPI;
var Pool     = require('../Pool').Pool;
var GL2      = require('../../NGCore/Client/GL2').GL2;
var GLUI     = require('../../NGGo/GLUI').GLUI;
var HScroller = require('../Common/HScroller').HScroller;
var HeroScrollList = require('../Common/HeroScrollList').HeroScrollList;
var TagStatus = require('../Common/TagStatus').TagStatus;
var Hero = require('../Model/Hero').Hero;

var GameListener = Core.MessageListener.subclass({
	initialize : function(node, controller){
		this._node = node;
		this._controller = controller;
		
		this._prevSpeed = 2;
		this._infoSpeed = 1.2;
		this._previewSection = node.PreviewSection;
		this._prevOrinX = this._previewSection.getPosition().getX();
		this._infoSection = node.InfoSection;
		this._infoOrinX = this._infoSection.getPosition().getX();
		this._isMovingInfo = false;
		this._isMovingPreview = false;
	},
	destroy: function($super) {
		this._prevSpeed = null;
		this._infoSpeed = null;
		this._prevOrinX = null;
		this._infoOrinX = null;
		this._infoSection = null;
		this._isMovingInfo = null;
		this._isMovingPreview = null;
		this._previewSection = null;
		this._controller = null;
		this._node = null;
		
		$super();
	},
	/**
	 * Move preview sprite from outside to inside of screen
	 * @param delta delta time of onUpdate listener
	 */
	movePreviewSection: function(delta) {
		if (this._isMovingPreview) {
			var speed = this._prevSpeed * delta;
			var p = this._previewSection.getPosition();
			var x = p.getX() - speed;
			if (x < this._prevOrinX) {
				x = this._prevOrinX;
				this._isMovingPreview = false;
			}
			this._previewSection.setPosition(x, p.getY());
		}
	},
	/**
	 * Move information section from outside to inside of screen
	 * @param delta delta time of onUpdate listener
	 */
	moveInfo: function(delta) {
		if (this._isMovingInfo) {
			var speed = this._infoSpeed * delta;
			var p = this._infoSection.getPosition();
			var x = p.getX() + speed;
			if (x > this._infoOrinX) {
				x = this._infoOrinX;
				this._isMovingInfo = false;
			}
			this._infoSection.setPosition(x, p.getY());
		}
	},
	onUpdate: function(delta) {
		this.movePreviewSection(delta);
		this.moveInfo(delta);
	},
	/**
	 * Display hero's statistic
	 * @param hero Hero object
	 */
	showStat: function(hero) {
		this._infoSection.gluiobj.setHero(hero);
	},
	/**
	 * Display hero's preview sprite
	 * @param hero Hero object
	 */
	showPreview: function(hero) {
		if (this._currentSprite) {
			this._previewSection.removeChild(this._currentSprite);
			this._currentSprite.destroy();
		}
		this._currentSprite = hero.getFullSprite([512, 512], [0.5, 0.5]);
		this._currentSprite.setPosition(0,0);
		this._previewSection.addChild(this._currentSprite);
	},
	/**
	 * Change the current selected hero
	 * @param hero Hero object
	 */
	changeHero: function(hero) {
		// Move preview section
		this.showPreview(hero);
		var p = this._previewSection.getPosition();
		this._previewSection.setPosition(p.getX() + 200, p.getY());
		this._isMovingPreview = true;
		
		// Move info section
		p = this._infoSection.getPosition();
		this._infoSection.setPosition(p.getX() - 160, p.getY());
		this._isMovingInfo = true;
		this.showStat(hero);
		
		this._hero = hero;
	}
});

exports.CombineMultiSelectController = Core.Class.subclass({
    classname: "CombineMultiSelectController",

    initialize: function(baseHero) {
    	this._baseHero = baseHero;
    	this._selectedHeros = [];
    },
    
    /**
     * Get selected heros
     * @returns {Array} List of Hero object
     */
    getSelectedHeros: function() {
    	return this._selectedHeros;
    },
    
    /**
     * Save the given Hero to the selected heros list
     * @param hero {Hero} object
     */
    selectHero: function(hero) {
    	for (var i=0; i<this._selectedHeros.length; i++) {
    		if (hero == this._selectedHeros[i]) {
    			return;
    		}
    	}
		this._selectedHeros.push(hero);
    },
    
    /**
     * Remove a Hero from the selected heros list
     * @param hero {Hero} object
     */
    unSelectHero: function(hero) {
    	for (var i=0; i<this._selectedHeros.length; i++) {
    		if (hero == this._selectedHeros[i]) {
    			this._selectedHeros.splice(i, 1);
    		}
    	}
    },
    
    /**
     * Get base hero
     * @returns {Hero}
     */
    getBaseHero: function() {
    	return this._baseHero;
    },

    action_close: function(elem, param) {
        if (SceneDirector.currentScene.sceneName === 'CombineMultiSelectScene') {
            SceneDirector.pop();
        }
    },

    action_click: function(elem, param) {
    	console.log('You clicked ' + param + '!');
        if (param === "OkButton") {
        	// Move to CombineReady Scene
        	// Selected heros are saved in array this._selectedHeros
        	//SceneDirector.transition("CombineReadyScene", this._selectedHeros);
        } else if (param === "BackButton") {
//        	SceneDirector.transition("CombineBaseSelectScene");
        }
    },
    
    onClickBaseHero : function(){
    	SceneDirector.pop();
    },

    deactive: function() {
        this.CombineMultiSelectView.setTouchable(false);
    },

    active: function() {
        this.CombineMultiSelectView.setTouchable(true);
    },
    /**
     * create and add a listener for combineMultiSelectView 
     * */
    createGameListener: function() {
    	this._gameListener = new GameListener(this.CombineMultiSelectView, this, null);
    	Core.UpdateEmitter.addListener(this._gameListener, this._gameListener.onUpdate);
    },

    /**
     * Display base hero and list of heros
     */
    updateList: function() {
    	this.BaseHero.gluiobj.setHero(this._baseHero);
    	this.BaseHero.gluiobj.setOnClick(this.onClickBaseHero);
    	GameAPI.Combine.getElementList(this._baseHero.id, 0, true, this._makeHeroList.bind(this));
    },
    /**
     * on hero item click handler
     * @param item: hero item
     * */
    _onItemClick: function(item) {
    	if (this.HeroList.gluiobj instanceof HeroScrollList) {
    		var index = item.getIndex();
			var hero = this.HeroList.gluiobj.getHeroByIndex(index);
    		if (item.isChecked()) {
        		this.unSelectHero(hero);
    			this.HeroList.gluiobj.unSelectItem(index);
    			var prevHero = hero;
    			if (this._selectedHeros.length > 0) {
    				prevHero = this._selectedHeros[this._selectedHeros.length - 1];
    			}
				this._gameListener.changeHero(prevHero);	
    		}
    		else {
        		this.selectHero(hero);
        		this.HeroList.gluiobj.selectItem(index);
        		this._gameListener.changeHero(hero);
    		}
    	}
    },
    /**
     * return Hero list by style
     * @param style: a style to filter
     * @return an array of heros.
     * */
    _getHerosByStyle: function(style) {
    	if (0 == style) {
			return this._heros;
		}
		var heroArray = [];
		for (var i = 0; i < this._heros.length; i++) {
			if (this._heros[i].style == style) {
				heroArray.push(this._heros[i]);
			}
		}
		return heroArray;
    },
    /**
     * on button filter Hero click handler
     * @param index: index of filter button
     * */
    _onFilterClick: function(index) {
    	var heros = [];
    	switch (index) {
    	case 1: 
			heros = this._getHerosByStyle(Hero.SELECT_STYLE.ALL);
    		break;
    	case 2: 
    		heros = this._getHerosByStyle(Hero.SELECT_STYLE.POWER);
    		break;
    	case 3:
    		heros = this._getHerosByStyle(Hero.SELECT_STYLE.GUTS);
    		break;
    	case 4:
    		heros = this._getHerosByStyle(Hero.SELECT_STYLE.TECH);
    		break;
		default:
    		heros = this._getHerosByStyle(Hero.SELECT_STYLE.ALL);
    		break;
    	}
		this.HeroList.gluiobj.setHeros(heros);

		// Set state of heros whom were already checked
		for (var i = 0; i < heros.length; i++) {
			for (var j = 0; j < this._selectedHeros.length; j++) {
				if (heros[i] == this._selectedHeros[j]) {
					this.HeroList.gluiobj.selectItem(i);
				}
			}
		}
    },
    
    /**
     * Display hero on scroll list
     * @param data JSON data returning from GameAPI.Combine.getElementList
     */
	_makeHeroList: function(data) {
		this._heros = data.list;
		
		this.HeroList.gluiobj.setOnItemClick(this._onItemClick.bind(this));
		this.HeroList.gluiobj.setOnFilterClick(this._onFilterClick.bind(this));
		this.HeroList.gluiobj.setHeros(this._heros);

        // Show first hero
        if (this._heros.length > 0) {
        	this._gameListener.showStat(this._heros[0]);
        	this._gameListener.showPreview(this._heros[0]);
        }
	},
	/**
	 * @override destroy
	 * */
//	destroy : function($super) {
//		
//	},
	
	/**
	 * @override destroyAll
	 */
	destroyAll : function($super){
		if (this._baseHero) {
			this._baseHero = null;
		}
	
		for ( var i = 0; i < this._selectedHeros.length; i++) {
			this._selectedHeros[i] = null;
		}
		this._selectedHeros = null;
	
		for ( var i = 0; i < this._heros.length; i++) {
			this._heros[i] = null;
		}
		this._heros = null;
	
		if (this.BaseHero.gluiobj) {
			this.BaseHero.gluiobj.destroy();
			this.BaseHero.gluiobj = null;
		}
	
		if (this.HeroList.gluiobj) {
			this.HeroList.gluiobj.destroy();
			this.HeroList.gluiobj = null;
		}
	
		Core.UpdateEmitter.removeListener(this._gameListener);
	
		this._gameListener.destroy();
		this._gameListener = null;
	
		$super();
	}
});
