var Core     = require('../../NGCore/Client/Core').Core;
var GameAPI  = require('../GameAPI').GameAPI;
var Pool     = require('../Pool').Pool;
var GL2      = require('../../NGCore/Client/GL2').GL2;
var GLUI     = require('../../NGGo/GLUI').GLUI;
var DnButton = require('../../DnLib/Dn/GLUI/Button').Button;
var CombineHeroScroller = require('../Common/Util/CombineHeroScroller').CombineHeroScroller;

exports.CombineBaseSelectController = Core.Class.subclass({
    classname: "CombineBaseSelectController",

    initialize: function() {
    	this._heroScroller = null;
    	this._heroList = null;
    },

    action_close: function(elem, param) {
        if (SceneDirector.currentScene.sceneName === 'CombineBaseSelectScene') {
            SceneDirector.pop();
        }
    },

    action_select: function(elem, param) {
        GameAPI.Combine.getElementList(param.hero.status.seq_id, GameAPI.Combine.SELECT_STYLE.ALL, false, function(ret) {
            SceneDirector.transition('CombineSingleSelectScene', ret);
        });
    },

    action_click : function(elem, btnName){
    	if(btnName == "SellectButton"){
    		if (this._isDeactived) {
    			return;
    		}
    		var baseHeroId = this._heroScroller.getCurrentItem();
    		var baseHero = this._heroList[baseHeroId];
    		GameAPI.Combine.getElementList(baseHero.status.seq_id, GameAPI.Combine.SELECT_STYLE.ALL, false, function(result){
    			console.log("--------------element lis: " + result);
    			SceneDirector.push("CombineSingleSelectScene", {basehero: baseHero, list: result.list || this._heroList });	
    		});
    	}
    },
    deactive: function() {
    	this._isDeactived = true;
        this.CombineBaseSelectView.setTouchable(false);
    },

    active: function() {
    	this._isDeactived = false;
        this.CombineBaseSelectView.setTouchable(true);
    },

    update: function(style) {
        GameAPI.Combine.getBaseList(style, function(list) {
        	this._heroList = list;
        	this.List.scroll.setItems(list);
        	this._heroScroller = this.List.scroll; 
        }.bind(this));
    },
    
    /**
     * Show hero's statistic
     * @param hero {Hero} object
     */
    showStat: function(hero) {
		this.InfoSection.gluiobj.setHero(hero);
		this.InfoSection.gluiobj.appearFromLeft();
	},
	
	/**
	 * @override destroyAll
	 * */
	destroyAll : function($super){
		if(this._heroScroller){
			this._heroScroller.destroy();
			delete this._heroScroller;
		}
		if(this._heroList){
			delete this._heroList;
		}
		if(this.InfoSection.gluiobj){
			this.InfoSection.gluiobj.destroy();
			delete this.InfoSection.gluiobj;
		}
		$super();
	}
});
