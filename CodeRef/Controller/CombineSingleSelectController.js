var Core = require('../../NGCore/Client/Core').Core;
var GameAPI  = require('../GameAPI').GameAPI;
var Pool     = require('../Pool').Pool;
var GL2      = require('../../NGCore/Client/GL2').GL2;
var GLUI     = require('../../NGGo/GLUI').GLUI;
var DnButton = require('../../DnLib/Dn/GLUI/Button').Button;
var CombineHeroScroller = require('../Common/Util/CombineHeroScroller').CombineHeroScroller;

exports.CombineSingleSelectController = Core.Class.subclass({
    classname: "CombineSingleSelectController",

    initialize: function() {
        this._hero = null;
        this._heroScroller = null;
        this._heroList = null;
    },

    action_close: function(elem, param) {
        if (SceneDirector.currentScene.sceneName === 'CombineSingleSelectScene') {
            SceneDirector.pop();
        }
    },

    action_select: function(elem, param) {
        var _self       = this,
            baseHero    = _self._hero,
            elementHero = param.hero;
        GameAPI.Combine.process(baseHero.status.seq_id, [elementHero.status.seq_id], function(process){
            SceneDirector.push("CombineReadyScene", {process: process, base: baseHero, elements: [elementHero]});
        });
    },
    
    action_click : function(elem, btnName){
    	if(btnName == "CombineButton"){
	    	var _self       = this,
	    	selectedHeroId = this._heroScroller.getCurrentItem(),
	        baseHero    = _self._hero,
	        elementHero = this._heroList[selectedHeroId];
	        GameAPI.Combine.process(baseHero.status.seq_id, [elementHero.status.seq_id], function(process){
	            SceneDirector.push("CombineReadyScene", {process: process, base: baseHero, elements: [elementHero]});
	        });
    	}else if(btnName == "MultiCombineButton"){
    		SceneDirector.transition("CombineMultiSelectScene", this._hero);
    	}else if(btnName == "BackButton"){
    		SceneDirector.pop();
    	}
    },

    onClickBaseHero : function(){
    	SceneDirector.pop();
    },
    
    deactive: function() {
        this.CombineSingleSelectView.setTouchable(false);
    },

    active: function() {
        this.CombineSingleSelectView.setTouchable(true);
    },

    /**
     * Set base hero
     * @param hero {Hero} object
     */
    setBaseHero: function(hero) {
    	this._hero = hero;
    	this.BaseHero.gluiobj.setHero(hero);
    	this.BaseHero.gluiobj.setOnClick(this.onClickBaseHero);
    },
    
    /**
     * Show list of heros
     * @param list List of {Hero} object
     */
    updateList: function(list) {
        this._heroList = list;
    	this.List.scroll.setItems(list);
    	this._heroScroller = this.List.scroll;
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
		if(this._hero){
			delete this._hero;
		}
		if(this.InfoSection.gluiobj){
			this.InfoSection.gluiobj.destroy();
			delete this.InfoSection.gluiobj;
		}
		$super();
	}
});
