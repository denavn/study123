var Core = require('../../NGCore/Client/Core').Core;
var GL2 = require('../../NGCore/Client/GL2').GL2;
var TagStatus = require('../Common/TagStatus').TagStatus;

var MoveListener = Core.MessageListener.subclass({
	classname: "MoveListener",
	/**
	 * Inititalize function
	 * @param h1 {Hero}
	 * @param h2 {Hero}
	 * */
	initialize: function(h1, h2) {
		this._h1 = h1;
		this._h2 = h2;
		this._x1 = this._h1.getPosition().getX();
		this._x2 = this._h2.getPosition().getX();
		this._y = this._h1.getPosition().getY();
	},
	/**
	 * onUpdate function
	 * */
	onUpdate: function() {
		if (this._x1 < -176) {
			this._x1 += 25;
			if (this._x1 > -176) {
				this._x1 = -176;
			}
			this._h1.setPosition(this._x1, this._y);
		}
		
		if (this._x2 > -26) {
			this._x2 -= 25;
			if (this._x2 < -26) {
				this._x2 = -26;
			}
			this._h2.setPosition(this._x2, this._y);
		}
	}
});

exports.TagController = Core.Class.subclass({
    classname: "TagController",

    /**
     * Initialize function
     * */
    initialize: function() {
    	this.heroLeft = null;
    	this.heroRight = null;
        this._heros = [];
        this._canBeTouched = true;
    },

    action_close: function(elem, param) {
        NgLogD(this.classname+"::action_close");
    },

    action_tagChange: function(elem, param) { // @param String: "a" or "b"
        NgLogD(this.classname+"::action_click. param=" + param);
        if (this._canBeTouched) { // http://www.punch-dev.com:8080/browse/WTL-44
        	this._canBeTouched = false;
        	var hero = null;
        	if(param == "heroLeft"){
        		hero = this.heroLeft;
        	}else{
        		hero = this.heroRight;
        	}
            SceneDirector.push("TagSelectScene", {"position": param, "tagController": this});	
        }
        else {
        	this._canBeTouched = true;
        }
    },

    deactive: function() {
        NgLogD("TagController#deactive");
        this.TagView.setTouchable(false);
    },

    active: function() {
        NgLogD("TagController#active");
        this.TagView.setTouchable(true);
        this._canBeTouched = true;
    },

	/**
	 * Set up two tags the left tag and the right tag. 
	 *
	 * @param {Object} The left tag
	 * @param {Object} The right tag
	 */
    setupTags: function(h1, h2) {
    	if (!this.heroLeft && !this.heroRight) {
	    	this.heroLeft = h1;
	    	this.heroRight = h2;
    	}

        if (this._sprite1) {
        	this.TagView.removeChild(this._sprite1);
        	this._sprite1.destroy();
        	this._sprite1 = null;
        	
        	this.TagView.removeChild(this._sprite2);
        	this._sprite2.destroy();
        	this._sprite2 = null;
        }
        
        if (this.tagStatus) {
        	this.tagStatus.update(this.heroLeft, this.heroRight);
        } else {
	        this.tagStatus = new TagStatus(this.heroLeft, this.heroRight);
	        
	        this.tagStatus.setDepth(100);
	        this.tagStatus.setPosition(0, 329);
	        this.TagView.addChild(this.tagStatus);
        }
        
        this.Tag.setDepth(100);
        this.Tag1.setDepth(100);
        this.Tag2.setDepth(100);
        
        this._sprite1 = this.heroLeft.getFullSprite([512, 512], [0, 0]); 
        this._sprite1.setDepth(1);
        this._sprite1.setPosition(-517, 80);
        this.TagView.addChild(this._sprite1);
        
        this._sprite2 = this.heroRight.getFullSprite([512, 512], [0, 0]); 
        this._sprite2.setDepth(1);
        this._sprite2.setPosition(325, 80);
        this.TagView.addChild(this._sprite2);
        
        if(this._listener){
        	Core.UpdateEmitter.removeListener(this._listener);
        	this._listener.destroy();
        	this._listener = null;
        }
        this._listener = new MoveListener(this._sprite1, this._sprite2);
        Core.UpdateEmitter.addListener(this._listener, this._listener.onUpdate);
    },
    /**
     * @override destroyAll
     * */
    destroyAll : function($super){
    	this._sprite1.destroy();
    	this._sprite1 = null;
    	this._sprite2.destroy();
    	this._sprite2 = null;
    	if(this._listener){
        	Core.UpdateEmitter.removeListener(this._listener);
        	this._listener.destroy();
        	this._listener = null;
        }
    	$super();
    }
});