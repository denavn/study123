var Core			 = require('../../NGCore/Client/Core').Core;
var GLUI			 = require('../../NGGo/GLUI').GLUI;
var GL2  			 = require('../../NGCore/Client/GL2').GL2;
var FileSystem 	   	 = require('../../NGCore/Client/Storage/FileSystem').FileSystem;
var GameAPI		 	 = require('../GameAPI').GameAPI;
var Pool			 = require('../Pool').Pool;
var Hero 		     = require('../Model/Hero').Hero;
var Fade			 = require('../../DnLib/Dn/GL2/Fade').Fade;
var VFX			 	 = require('../../DnLib/Dn/GL2/VFX').VFX;
var HeroCollection	 = require('../Common/Util/HeroCollection').HeroCollection;
var Util			 = require('../../NGGo/GLUI/Util').Util;
var Constant		 = require('../Common/Util/Constant').Constant;
var FontUtil		 = require('../Common/Util/FontUtil').FontUtil;

exports.HeroCollectionController = Core.Class.subclass({
    classname: "HeroCollectionController",    
    MAX_PAGE: 2,    
    initialize: function() {
    	this._heros = null;
    	this._fadeFinished = true;
    	this._raritySprite=null;
    },
    action_close: function(elem, param) {
       
    },
    action_click: function(elem, param) {
    	
    },
    action_next: function(elem, param) {
    	if (this._currentPage == this.MAX_PAGE || !this._fadeFinished) {
    		return;
    	}    	
		this._makeEffect();
		this._currentPage += 1;
		this._loadPage(this._currentPage);
		
		this.ButtonPrev.setColor(Constant.COLOR_WHITE);
		if (this._currentPage == 2) {
    		this.ButtonNext.setColor(Constant.COLOR_DARK);
    	}
		//reset camera when next page if camera is zooming
		this.resetCamera();
    },    
    action_prev: function(elem, param) {
    	if (this._currentPage == 1 || !this._fadeFinished) {
    		return;
    	}   	
    	this._makeEffect();
		this._currentPage -= 1;
		this._loadPage(this._currentPage);
		
		this.ButtonNext.setColor(Constant.COLOR_WHITE);
		if (this._currentPage == 1) {
    		this.ButtonPrev.setColor(Constant.COLOR_DARK);
    	}
		this.resetCamera();
		
    },
    resetCamera: function() {
    	if(this._myCamera.getScale()>1) {
			this._myCamera.setScale(1);
		}
    },
    action_return: function(elem, param) {
    	console.log("Return Scene");
    },
    
    action_headerClicked: function(elem, param) {
    	console.log("Only for purpose avoid clicking on hero");
    },
    action_maskClicked: function(elem, param) {
    	
    },
    deactive: function() {
        this.HeroCollectionView.setTouchable(false);
        this.ButtonReturn.setTouchable(false);
        this.ButtonPrev.setTouchable(false);
        this.ButtonNext.setTouchable(false);
    },

    active: function() {
        this.HeroCollectionView.setTouchable(true);
        this.ButtonReturn.setTouchable(true);
        this.ButtonPrev.setTouchable(true);
        this.ButtonNext.setTouchable(true);
    },
    
    updateList: function() {
    	this._loadPage(1);
    	
    	this._currentPage = 1;
    	this.ButtonPrev.setColor(Constant.COLOR_DARK);
    },
    
    _makeEffect: function() {
    	this._fadeFinished = false;
    	Fade.instantiate();
    	Fade.portrait = true;
		this._fade = Fade.getFadeIn([1, 1, 1], 1, 0, this, function() { this._fade.destroy(); this._fadeFinished = true;});
		this.HeroCollectionView.getParent().getParent().addChild(this._fade.getNode());
		
		VFX.enchant(this.Header).move(0.1, -50, 0).wait(0.1).move(0.1, 50, 0);
    },
    
    _createPostion: function(data) {
    	this._positions = data.pos;
    	this._nodeScale = data.scale;
    	this._bg = data.image;
    	
    	this._loadHeroCollection();    	
    },
    
    _loadHeroCollection: function() {
    	var heroList;    	
    	
		GameAPI.User.getHeroCollection(1, 1, function(data) {
        	heroList = data;
        	this.totalCollectedHero = 0;
        	this.totalHero = 0;
        	// Create hero list
    		this._heros = [];

    		for (var i = 0; i < heroList.length; i++) {
    			var h = new HeroCollection(heroList[i], this._positions[i], this._nodeScale);
    			h.index = i;
    			
    			this._heros.push(h);
    			this.HeroCollectionView.addChild(h);
    			//total Hero on map
    			this.totalHero++;    			
    			//total Hero is collected
    			if(h.isCollected()) {
    				this.totalCollectedHero++;
    			}
    		}
    		this.updateHeaderInfo();
	    }.bind(this));
	    
		var bg = new GL2.Sprite();
		bg.setImage(this._bg, [Constant.BG_IMAGE_W, Constant.BG_IMAGE_H], [0, 0], [0, 0, 1, 1]);
		bg.setPosition(0,0);
		this.HeroCollectionView.addChild(bg);
		
		//center view 
		this.HeroCollectionView.setPosition(-(Constant.BG_IMAGE_W- 320)/2, -(Constant.BG_IMAGE_H - 480)/2);
    },
    
    updateHeaderInfo: function() {    	
		
    	if(this._curPage){	
    		this.Header.TextCurrentPage.removeChild(this._curPage);
    		this._curPage.destroy();
    	}
    	if(this._collectedHero){
    		this.Header.TextCollectedCount.removeChild(this._collectedHero);	
    		this._collectedHero.destroy();
    	}
    	FontUtil.clear();
    	
    	this._collectedHero = FontUtil.create(Constant.FONT_SILVER, this.totalCollectedHero + "/" + this.totalHero);
       	this.Header.TextCollectedCount.addChild(this._collectedHero);
    	
    	this._curPage = FontUtil.create(Constant.FONT_RED, this._currentPage + '/' + this.MAX_PAGE);
       	this.Header.TextCurrentPage.addChild(this._curPage);
	
		this.updateRarityInfo(this._currentPage);
    },
    
    updateRarityInfo:function(aRarity){
    	
    	if(this._raritySprite != null){
    		this.Header.removeChild(this._raritySprite);
    		
    	}
    	
    	//update new rarity
		this._raritySprite= this.getRaritySprite(aRarity);
		this._raritySprite.setPosition(81,30);
		this.Header.addChild(this._raritySprite);
    },
    
    /**
     * Get rariry sprite of user
     * @param aRarity: rarity number
     * @returns {GL2.Sprite}
     */
    getRaritySprite:function(aRarity) {
    	var imgName;
    	switch (aRarity) {
		case 1:
			imgName= "c";
			break;
		case 2:
			imgName= "l";
			break;	
		case 3:
			imgName="r";
			break;
		default:
			imgName= "sr";
			break;
		}
    	
    	var imgSprite= new GL2.Sprite();
    	imgSprite.setImage("Content/image/collection_new/rank/" + imgName + ".png" , [59,22], [0,0], [0,0,1,1]);
    	
    	return imgSprite;
    },
    
    /*
     * Load a new page
     */
    _loadPage:function(pageNumber) {
    	
    	//Clear page before loading newly
    	this._clearMap();
    		
    	this._loadJSON("./Content/heroes/collection/" + pageNumber + ".json", this, this._createPostion);
    },
    
    /**
     * clear map before loading a new page
     */
    _clearMap:function() {
    	if (!this._heros) {
    		return;
    	}
    	
    	for (var i = 0; i < this._heros.length; i++) {
    		this.HeroCollectionView.removeChild(this._heros[i]);
    	}
    },
    
    _loadJSON: function( path, listener, onLoadHandler ) {
    	FileSystem.readFile( path, false, function( err, data ) {
	   	if( err ){
	    	NgLogD( "Error: can't read JSON file: " + path );
	   	} else {
	    	var result = JSON.parse( data );
	    	onLoadHandler.call( listener, result );
	   	}
	  });
	}
});