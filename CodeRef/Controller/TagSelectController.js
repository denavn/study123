var Core 		= require('../../NGCore/Client/Core').Core;
var FileSystem 	= require('../../NGCore/Client/Storage/FileSystem').FileSystem;
var GameAPI  	= require('../GameAPI').GameAPI;
var Pool     	= require('../Pool').Pool;
var GL2      	= require('../../NGCore/Client/GL2').GL2;
var GLUI     	= require('../../NGGo/GLUI').GLUI;
var DnButton 	= require('../../DnLib/Dn/GLUI/Button').Button;
var HScroller 	= require('../Common/HScroller').HScroller;
var TagStatus 	= require('../Common/TagStatus').TagStatus;
var Hero 		= require('../Model/Hero').Hero;
var Constant 	= require('../Common/Util/Constant').Constant;
var HeroScrollList = require('../Common/HeroScrollList').HeroScrollList;

var ButtonListener = Core.MessageListener.subclass({
	classname : "ButtonListener",
	/**
	 * Initialize function
	 * @param controller	{}
	 * @param index			{Number}
	 * @param buttons		{GL2.Sprite}
	 * */
	initialize: function(controller, index, buttons) {
		this._controller = controller;
		this._index = index;
		this._buttons = buttons;
	},
	
	_getHerosByStyle: function(heros, style) {
		if (0 == style) {
			return heros;
		}
		
		var heroArray = [];
		for (var i = 0; i < heros.length; i++) {
			if (heros[i].style == style) {
				heroArray.push(heros[i]);
			}
		}
		
		return heroArray;
	},
	
	onTouch: function(touch) {
		switch(touch.getAction()) {
			case touch.Action.Start:
				return true;
			case touch.Action.End:
				this._buttons.setImage('./Content/image/tag/tag_choice_close_tab' + this._index + '.png', [320, 36], [0, 0], [0, 0, 1, 1]);
				var heros = [];
				if (this._index == 1) {
					heros = this._getHerosByStyle(this._controller._heros, 0);
				} else if (this._index == 2) {
					heros = this._getHerosByStyle(this._controller._heros, 1);
				} else if (this._index == 3) {
					heros = this._getHerosByStyle(this._controller._heros, 2);
				} else if (this._index == 4) {
					heros = this._getHerosByStyle(this._controller._heros, 3);
				}
				
				var herosSize = [heros.length * 90, 135];
				var pos = [1, 345];
				this._controller.parentNode.removeChild(this._controller.scrollArea);
				this._controller.scrollArea = HScroller.create(herosSize, pos, heros, this._controller._onHeroClick.bind(this._controller));
        		this._controller.scrollArea.setDepth(100);
        		this._controller.parentNode.addChild(this._controller.scrollArea);
		}
	},
	destroy : function($super){
		if(this._controller.scrollArea){
			HScroller.destroy();
			this._controller.scrollArea = null;
		}
		this._controller = null;
		this._index = null;
		this._buttons = null;
		$super();
	}
});

var StatusListener = Core.MessageListener.subclass({
	classname : "StatusListener",
	/**
	 * Initialize function
	 * @param direction {String}
	 * @param button	{GL2.Sprite}
	 * @param status	{TagStatus}
	 * */
	initialize: function(direction, button, status) {
		this._direction = direction;
		this._button = button;
		this._status = status;
		this._x = status.getPosition().getX();
		this._y = status.getPosition().getY();
	},
	
	onTouch: function(touch) {
		switch(touch.getAction()) {
			case touch.Action.Start:
				return true;
			case touch.Action.End:
				this._button.setImage('./Content/image/tag/tag_choice_close_' + this._direction + '.png', [98, 27], [0, 0], [0, 0, 1, 1]);
				this._direction = (this._direction === 'down') ? 'up' : 'down';
				this._button.direction = this._direction;
				console.log(this._direction);
		}
	},
	
	onUpdate: function(delta) {
		if (this._y == 150) {
			this._y = 156;
			this._status.setPosition(this._x, this._y);
		} else if (this._y == 251) {
			this._y = 247;
			this._status.setPosition(this._x, this._y);
		}
		
		if (this._direction === 'up' && this._y > 156) {
			this._y -= 25;
			if (this._y < 156) {
				this._y = 150;
			}
			
			this._status.setPosition(this._x, this._y);
		} else if (this._direction === 'down' && this._y < 247) {
			this._y += 25;
			if (this._y > 247) {
				this._y = 251;
			}
			
			this._status.setPosition(this._x, this._y);
		}
	}
});

var HeroTouchListener = Core.MessageListener.subclass({
	UPPER_LAYER_DEPTH: 20,
	LOWER_LAYER_DEPTH: 10,
	classname : "HeroTouchListener",
	/**
	 * Initialize function
	 * @param controller 	{TagSelectController}
	 * @param heroLeft		{GL2.Node}
	 * @param heroRight		{GL2.Node}
	 * @param sprite		{GL2.Sprite}
	 * */
	initialize: function(controller, heroLeft, heroRight, sprite) {
		this._controller = controller;
		this._sprite = sprite;
		this._heroLeft = heroLeft;
		this._heroRight = heroRight;
	},
	
	onTouch: function(touch) {
		if (this._controller.moveButton.direction == 'up') {
			return;
		}
		
		var selectedHero = touch.getTouchTargets()[0].name;
		if (this._controller._selectedHero == selectedHero) {
			return;
		}
		
		if (selectedHero === 'heroLeft') {
			this._heroRight.setColor(Constant.COLOR_DARK);
			this._heroLeft.setColor(1, 1, 1);
			this._controller._selectedHero = 'heroLeft';
			this._sprite.setPosition(208, 178);
			this._heroLeft.setDepth(this.UPPER_LAYER_DEPTH);
			this._heroRight.setDepth(this.LOWER_LAYER_DEPTH);
			this._controller.changeButton.setDepth(this.UPPER_LAYER_DEPTH);
			this._controller.changeButton.setPosition(208, 178);
		} else {
			this._heroLeft.setColor(Constant.COLOR_DARK);
			this._heroRight.setColor(1, 1, 1);
			this._controller._selectedHero = 'heroRight';
			this._sprite.setPosition(64, 178);
			this._heroRight.setDepth(this.UPPER_LAYER_DEPTH);
			this._heroLeft.setDepth(this.LOWER_LAYER_DEPTH);
			this._controller.changeButton.setDepth(this.UPPER_LAYER_DEPTH);
			this._controller.changeButton.setPosition(64, 178);
		}
		
		this._controller.updateList();
		
//		this._controller.heroSection.removeChild(this._sprite);
//		this._controller.heroSection.addChild(this._sprite);
		
//		var heros = this._controller._heros;
//		var herosSize = [heros.length * 90, 135];
//		var pos = [1, 345];
//		this._controller.parentNode.removeChild(this._controller.scrollArea);
//		this._controller.scrollArea = HScroller.create(herosSize, pos, heros, this._controller._onHeroClick.bind(this._controller));
//		this._controller.scrollArea.setDepth(100);
//		this._controller.parentNode.addChild(this._controller.scrollArea);
	}
});

var MoveListener = Core.MessageListener.subclass({
	classname : "MoveListener",
	/**
	 * Initialize funtion
	 * @param h1 {GL2.Sprite}
	 * @param h2 {GL2.Sprite}
	 * */
	initialize: function(h1, h2) {
		this._h1 = h1;
		this._h2 = h2;
		this._y = this._h1.getPosition().getY();
	},
	
	onUpdate: function(delta) {
		this._x1 = this._h1.getPosition().getX();
		this._x2 = this._h2.getPosition().getX();
		if (this._x1 < -176) {
			this._x1 += 50;
			if (this._x1 > -176) {
				this._x1 = -176;
			}
			this._h1.setPosition(this._x1, this._y);
		}
		
		if (this._x2 > -26) {
			this._x2 -= 50;
			if (this._x2 < -26) {
				this._x2 = -26;
			}
			this._h2.setPosition(this._x2, this._y);
		}
	}
});

exports.TagSelectController = Core.Class.subclass({
    classname: "TagSelectController",
    /**
     * Initialize function
     * */
    initialize: function() {
        NgLogD(this.classname+"::initialize");
        this._tagController = null;
        this._position      = null;
        this._selectedHero  = null;
        this.heroScrollList = null;
        this._currentTab = 0;
        this._gabageCollector = [];
    },

    action_commit: function(elem, param) {
    	//Plz Uncomment these statement when doing integration.
//    	var changeHeroId = this._tagController[this._selectedHero].status.seq_id;
//    	GameAPI.User.changeTagHero(changeHeroId, this._lastCheckedHero.status.seq_id, function(res){
//    		if(res == true){
//    			SceneDirector.pop();	
//    		}else{
//    			throw new Error("Can not commit change hero");
//    		}
//    			
//    	});
    	
    	//remove this command when doing integration
    	SceneDirector.pop();
        
    },

    deactive: function() {
        NgLogD("TagSelectController#deactive");
        this.TagSelectView.setTouchable(false);
    },

    active: function() {
        NgLogD("TagSelectController#active");
        this.TagSelectView.setTouchable(true);
    },

    setTagController: function(tagController) {
        this._tagController = tagController;
    },

    setPosition: function(position) {
        this._position = position;
        this._selectedHero = position;
    },
    
    /**
	 * Set up two tags the left tag and the right tag.
	 * The left tag and the right tag are got from TagController.
	 */
    setupTags: function() {
    	this.Commit.setDepth(100);
    	
    	this.heroLeft = new GL2.Node();
    	this.heroRight = new GL2.Node();
    	this.heroSection = new GL2.Node();
    	
    	var leftTarget = new GL2.TouchTarget();
    	leftTarget.name = "heroLeft";
    	this.changeButton = new GL2.Sprite();
    	this.changeButton.setImage('./Content/image/tag/tag_choice_close_next.png', [64, 38], [0, 0], [0, 0, 1, 1]);
    	var l = new HeroTouchListener(this, this.heroLeft, this.heroRight, this.changeButton);
    	
    	leftTarget.setAnchor(0, 0);
    	leftTarget.setSize(160, 180);
    	leftTarget.setPosition(0, 60);
    	leftTarget.getTouchEmitter().addListener(l, l.onTouch);
    	
    	this.heroLeft.addChild(this._tagController.heroLeft.getFullSprite([512, 512], [0, 0]));
    	this.heroLeft.setPosition(-176, 80);
    	
    	var rightTarget = new GL2.TouchTarget();
    	rightTarget.name = "heroRight";
    	rightTarget.setAnchor(0, 0);
    	rightTarget.setSize(160, 180);
    	rightTarget.setPosition(160, 60);
    	rightTarget.getTouchEmitter().addListener(l, l.onTouch);
    	
    	this.heroRight.addChild(this._tagController.heroRight.getFullSprite([512, 512], [0, 0]));
    	this.heroRight.setPosition(-26, 80);
    	
    	if (this._position === 'heroLeft') {
    		this.heroRight.setColor(Constant.COLOR_DARK);
    		this.changeButton.setDepth(HeroTouchListener.UPPER_LAYER_DEPTH);
    		this.changeButton.setPosition(208, 178);
    		this.heroLeft.setDepth(HeroTouchListener.UPPER_LAYER_DEPTH);
    		this.heroRight.setDepth(HeroTouchListener.LOWER_LAYER_DEPTH);
    	} else if (this._position === 'heroRight') {
			this.heroLeft.setColor(Constant.COLOR_DARK);
    		this.changeButton.setDepth(HeroTouchListener.UPPER_LAYER_DEPTH);
			this.changeButton.setPosition(64, 178);
    		this.heroLeft.setDepth(HeroTouchListener.LOWER_LAYER_DEPTH);
    		this.heroRight.setDepth(HeroTouchListener.UPPER_LAYER_DEPTH);
    	}
    	
    	this.heroSection.addChild(this.heroLeft);
    	this.heroSection.addChild(leftTarget);
    	
    	this.heroSection.addChild(this.heroRight);
    	this.heroSection.addChild(rightTarget);
    	
    	this.heroSection.addChild(this.changeButton);
    	
    	this.TagSelectView.addChild(this.heroSection);
    	
    	var mvListener = new MoveListener(this.heroLeft, this.heroRight);
    	Core.UpdateEmitter.addListener(mvListener, mvListener.onUpdate);
    	
    	this._gabageCollector.push(leftTarget);
    	this._gabageCollector.push(l);
    	this._gabageCollector.push(this.changeButton);
    	this._gabageCollector.push(this.heroLeft);
    	this._gabageCollector.push(this.heroRight);
    	this._gabageCollector.push(this.heroSection);
    	this._gabageCollector.push(rightTarget);
    	this._gabageCollector.push(mvListener);
    },

    /**
     * Update Hero scroll list UI 
     * */
    updateList: function() {
    	if(!this.heroScrollList){
    		this._makeHeroList();
    	}
    	//remove this command when doing integration
        this._loadJSON('./Stab/ja/tag_list.json', this, this._updateHeroList);
        
    	//Uncomment the line bellow when doing integration. 
        //Now we have to read input data from JSON file because GameAPI.User.getTagHeroList return error. 
//        var changeHeroId = this._tagController[this._selectedHero].status.seq_id;
//    	GameAPI.User.getTagHeroList(changeHeroId, Hero.SELECT_STYLE.ALL, this._makeHeroList);
    },
    
    /**
     * load input data from JSON file
     * */
    _loadJSON: function( path, listener, onLoadHandler ) {
    	FileSystem.readFile( path, false, function( err, data ) {
	   	if( err ){
	    	NgLogD( "Error: can't read JSON file: " + path );
	   	} else {
	    	var result = JSON.parse( data );
	    	var heroes = result.list.map(function (v) {
                return new Hero(v);
            });
	    	onLoadHandler.call( listener, heroes );
	   	}
	  });
	},
	
	/**
	 * handler event click on an item in hero scroll list.
	 * @param item {CheckableItem} an item 
	 * */
    _onItemClick: function(item) {
    	console.log("onItemClick");
    	if (this.heroScrollList instanceof HeroScrollList) {
    		var index = item.getIndex();
			var hero = this.heroScrollList.getHeroByIndex(index);
			this._tagController[this._selectedHero] = hero;
			
			this[this._selectedHero].removeChild(this[this._selectedHero].getChildren()[0]);
	    	this[this._selectedHero].addChild(this._tagController[this._selectedHero].getFullSprite([512, 512], [0, 0]));
	    	
	    	var x = (this._selectedHero == "heroLeft") ? -517 : 325;
	    	console.log("SonNN: x = " + x);
	    	this[this._selectedHero].setPosition(x, 0);
	    	
	    	this.tagStatus.update(this._tagController.heroLeft, this._tagController.heroRight);
	    	
	    	var heroList = this.heroScrollList.getHeros();
	    	if (this._lastCheckedHero) {
	    		for (var i = 0; i < heroList.length; i++) {
	    			if (heroList[i] == this._lastCheckedHero) {
	    				this.heroScrollList.unSelectItem(i);
	    			}
	    		}
	    	}
    		this._lastCheckedHero = hero;
    		this.heroScrollList.selectItem(index);
    	}
    },
    
    /**
     * Return hero list filted by stype
     * @param style {Number} a style
     * @return {Array Herro} 
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
     * click on filter tab handler
     * @param index {Number} index of filter tab
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
		this.heroScrollList.setHeros(heros);
		this._currentTab = index;
        
		// Set state of hero whom was already checked
		for (var i = 0; i < heros.length; i++) {
			if (heros[i] == this._tagController[this._selectedHero]) {
				this.heroScrollList.selectItem(i);
				break;
			}
		}
    },
	
	/**
	 * Make hero list that can be scrolled.
	 */
	_makeHeroList: function() {
		this.parentNode = new GL2.Node();
		this.parentNode.setDepth(10);
		this.TagSelectView.addChild(this.parentNode);
        // Create hero status
        this.tagStatus = new TagStatus(this._tagController.heroLeft, this._tagController.heroRight);
        this.tagStatus.setDepth(99);
        this.tagStatus.setPosition(0, 247);
        
        this.moveButton = new GL2.Sprite();
        this.moveButton.setImage('./Content/image/tag/tag_choice_close_up.png', [98, 27], [0, 0], [0, 0, 1, 1]);
        this.moveButton.setPosition(111, 0);
        var moveTarget = new GL2.TouchTarget();
        moveTarget.setAnchor(0, 0);
        moveTarget.setSize(98, 27);
        
        var satusListener = new StatusListener('down', this.moveButton, this.tagStatus);
        moveTarget.getTouchEmitter().addListener(satusListener, satusListener.onTouch);
        this.moveButton.addChild(moveTarget);
        
        this.tagStatus.addChild(this.moveButton);
        this.parentNode.addChild(this.tagStatus);
        Core.UpdateEmitter.addListener(satusListener, satusListener.onUpdate);
        
        // Create hero list
        this.heroScrollList = new HeroScrollList({
        	"frame": [0, 308, 320, 172]
        });
		this.heroScrollList.setOnItemClick(this._onItemClick.bind(this));
		this.heroScrollList.setOnFilterClick(this._onFilterClick.bind(this));
        this.heroScrollList.getGLObject().setDepth(100);
        this.parentNode.addChild(this.heroScrollList.getGLObject());
        
        this._gabageCollector.push(this.tagStatus);
        this._gabageCollector.push(this.moveButton);
        this._gabageCollector.push(moveTarget);
        this._gabageCollector.push(this.parentNode);
        this._gabageCollector.push(this.heroScrollList);
        this._gabageCollector.push(satusListener);
        
        return;
	},
	/**
	 * set heros for current tab and update view for hero scroll list.
	 * */
	_updateHeroList : function(data){
		this._heros = data;
		this._onFilterClick(this._currentTab);
	},
	destroyAll : function($super){
		this._tagController.destroy();
		this._tagController = null;
        this._position      = null;
        this._selectedHero  = null;
        for(var i = 0 ; i < this._gabageCollector.length ; i++){
        	this._gabageCollector[i].destroy();
        	this._gabageCollector[i] = null;
        }
        this._gabageCollector = null;
    	$super();
    }
});