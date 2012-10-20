var GLUI = require("../../../NGGo/GLUI").GLUI;
var AbstractView = require("../../../NGGo/GLUI/AbstractView").AbstractView;
var GL2 = require("../../../NGCore/Client/GL2").GL2;
var ImageBarGauge = require('../../GLUI/ImageBarGauge').ImageBarGauge;
var Core = require('../../../NGCore/Client/Core').Core;

var Listener = Core.MessageListener.subclass({
	initialize : function(view, pos, size){
		this._view = view;
		this._pos = pos;
		this._size = size;
		this._moveView = false;
	},
	
	onUpdateView : function(){
		var x = this._pos[0] - this._size[0];
		var y = this._pos[1];
		//reset position for view
		this._view.setPosition(x,y);
		
		this._moveView = true;
	},
	
	moveView : function(){
		if(this._moveView){
			var x = this._view.getPosition().getX();
			var y = this._view.getPosition().getY();
			
			if(x < this._pos[0]){
				x += 10;
				this._view.setPosition(x, y);
			}
			else{
				if(x > this._pos[0]){
					this._view.setPosition(this._pos[0], y);
				}
				this._moveView = false;
			}
		}
	},
	
	destroy: function($super) {
		this._pos = null;
		this._size = null;
		this._moveView = null;
		if (this._view) {
			this._view.destroy();
			this._view = null;
		}
		$super();
	}
});

exports.HeroStat = GLUI.View.subclass({

    classname: "HeroStat",

    initialize: function($super, properties) {
        properties = properties || {};
        this._initializeProcess = true;
        $super(properties);
        this._internalGLObject = new GL2.Node();
        this._backgroundImage = null;
        this._backgroundImageUrl = properties.backgroundImageUrl || "Content/image/combine/bg_powerparam.png";
        this._hero 				= properties.hero || null;
        this._nameLabel 			= null;
        this._levelLabel			= null;
        this._maxLevelLabel			= null;
        this._defenceLabel			= null;
        this._offenceLabel			= null;
        this._powerBar				= null;
        this._catImage				= null;
        this._levelUpExpLabel		= null;
        this._rarityImage 			= null;

        //this.setAttributes(properties);
        this.setFrame(properties.frame || [0, 0, 0, 0]);
        this._initializeProcess =false;
        
        var p = [properties.frame[0], properties.frame[1]];
        var s = [properties.frame[2], properties.frame[3]];
        this._listener = new Listener(this.getGLObject(), p, s);
        Core.UpdateEmitter.addListener(this._listener, this._listener.moveView);
        
        this._updateView();
    },
    destroy: function($super) {
    	console.log("Call destroy in HeroStat");
        if (this._listener) {
        	Core.UpdateEmitter.removeListener(this._listener);
        	this._listener.destroy();
        }
    	if (this._nameLabel) {
    		this._nameLabel.destroy();
    		this._nameLabel = null;
    	}
        if (this._levelLabel) {
        	this._levelLabel.destroy();
        	this._levelLabel = null;
        }
        if (this._maxLevelLabel) {
        	this._maxLevelLabel.destroy();
        	this._maxLevelLabel = null;
        }
        if (this._defenceLabel) {
        	this._defenceLabel.destroy();
        	this._defenceLabel = null;
        }
        if (this._offenceLabel) {
        	this._offenceLabel.destroy();
        	this._offenceLabel = null;
        }
        if (this._powerBar) {
        	this._powerBar.destroy();
        	this._powerBar = null;
        }
        if (this._catImage) {
        	this._catImage.destroy();
        	this._catImage = null;
        }
        if (this._levelUpExpLabel) {
        	this._levelUpExpLabel.destroy();
        	this._levelUpExpLabel = null;
        }
        if (this._rarityImage) {
        	this._rarityImage.destroy();
        	this._rarityImage = null;
        }
        if (this._internalGLObject) {
        	this._internalGLObject.destroy();
        	this._internalGLObject = null;
        }
        if(this._backgroundImage){
        	this._backgroundImage.destroy();
        	this._backgroundImage = null;
        }
        $super();
    },
    /**
     * setImageに相当する画像
     * frameにフィットするサイズで配置されます
     *
     * @return {String} imageUrl
     */
    getBackgoundImageUrl: function () {
        return this._backgroundImageUrl;
    },

    /**
     * setImageに相当する画像
     * frameにフィットするサイズで配置されます
     *
     * @param {String} imageUrl
     */
    setBackgoundImageUrl: function (v) {
        if (this._backgroundImageUrl === v) {
            return;
        }
        this._backgroundImageUrl = v;
    },

    /**
     * Get hero object
     *
     * @return {Hero} hero 
     */
    getHero: function () {
        return this._hero;
    },

    /**
     * ゲージの割合を表す数字 0〜1
     *
     * @param {Number} 0-1 
     */
    setHero: function (v) {
        if (this._hero === v) {
            return;
        }
        if (v) {
            this._hero = v;
            console.log("Set hero:");
            console.log(v);
            this._updateView();
        }
        else {
            throw new Error("Cannot set a null or undefined value to hero object");
        }
    },
    appearFromLeft: function() {
    	this._listener.onUpdateView();
    },
    _updateView: function() {
        if (this._initializeProcess
        || this._backgroundImageUrl === null) {
            return;
        }
        
        if(this._hero == null){
        	return;
        }
        	
        var frame = this.getFrame(),
            sizeX = frame[2],
            sizeY = frame[3];
        
        if (!this._backgroundImage) {
            this._backgroundImage = new GLUI.View();
            this._backgroundImage.setImage(this._backgroundImageUrl, null, [sizeX, sizeY]);
            this._backgroundImage.setFrame([0, 0, sizeX, sizeY]);
            this._internalGLObject.addChild(this._backgroundImage.getGLObject());
        }
        
        if (!this._catImage) {
            this._catImage = new GL2.Sprite();
            this._catImage.setPosition(0, 5);
            this._internalGLObject.addChild(this._catImage);
        }
        
        if (!this._nameLabel) {
            this._nameLabel = new GLUI.Label({
            	"frame": [8, 42, 150, 20],
				"textColor": "FFFFFF",
				"textSize": 13,
				"textGravity": [0.1, 0.5]
            });
            this._internalGLObject.addChild(this._nameLabel.getGLObject());
        }
        
        if (!this._levelLabel) {
            this._levelLabel = new GLUI.Label({
            	"frame": [18, 64, 50, 20],
				"textColor": "FFFFFF",
				"textSize": 12
            });
            this._internalGLObject.addChild(this._levelLabel.getGLObject());
        }

        if (!this._maxLevelLabel) {
            this._maxLevelLabel = new GLUI.Label({
            	"frame": [70, 64, 80, 20],
				"textColor": "FFFFFF",
				"textSize": 12
            });
            this._internalGLObject.addChild(this._maxLevelLabel.getGLObject());
        }

        if (!this._offenceLabel) {
            this._offenceLabel = new GLUI.Label({
            	"frame": [10, 82, 60, 20],
				"textColor": "FFFFFF",
				"textSize": 12
            });
            this._internalGLObject.addChild(this._offenceLabel.getGLObject());
        }
        
        if (!this._defenceLabel) {
            this._defenceLabel = new GLUI.Label({
            	"frame": [80, 82, 60, 20],
				"textColor": "FFFFFF",
				"textSize": 12
            });
            this._internalGLObject.addChild(this._defenceLabel.getGLObject());
        }
        
        if (!this._powerBar) {
        	this._powerBar = new ImageBarGauge({
                frame:             [45, 105, 40, 12],
                backgoundImageUrl: "Content/image/combine/gauge_back.png",
                validImageUrl:     "Content/image/combine/gauge_line.png",
                invalidImageUrl:   "Content/image/combine/gauge_back.png",
                value:             0.5
            });
        	this._internalGLObject.addChild(this._powerBar.getGLObject());
        }
        
        if (!this._levelUpExpLabel) {
            this._levelUpExpLabel = new GLUI.Label({
            	"frame": [100, 100, 60, 20],
				"textColor": "FFFFFF",
				"textSize": 12
            });
            this._internalGLObject.addChild(this._levelUpExpLabel.getGLObject());
        }
        
        if (this._hero) {
        	var hero = this._hero;
        	this._nameLabel.setText("" + hero.name);
    		this._levelLabel.setText("" + hero.status.level);
    		this._maxLevelLabel.setText("最大" + hero.max_level);
    		this._defenceLabel.setText("" + hero.status.defence);
    		this._offenceLabel.setText("" + hero.status.offence);
    		this._levelUpExpLabel.setText("" + hero.status.level_up_exp);
    		if (hero.status != undefined && hero.status.exp_rate > 0) {
        		this._powerBar.setValue(hero.status.exp_rate / 100);
    		}

        	// Add category image
    		if (this._catImage) {
    			if(this._catImage.getParent() === this._internalGLObject){//fixed bug: WTL-49
    				this._internalGLObject.removeChild(this._catImage);
    			}
    			this._catImage.destroy();
    			this._catImage = null;
    		}
    		this._catImage = hero.getStyleSprite([40, 30], [0, 0]);
    		this._catImage.setPosition(1, 4);
        	this._internalGLObject.addChild(this._catImage);
        	
        	// Rank
        	if (this._rarityImage) {
    			if(this._rarityImage.getParent() === this._internalGLObject){//fixed bug: WTL-40
    				this._internalGLObject.removeChild(this._rarityImage);
    			}
    			this._rarityImage.destroy();
    			this._rarityImage = null;
    		}
    		this._rarityImage = hero.getRaritySprite([33, 14], [0, 0]);
    		this._rarityImage.setPosition(45, 15);
    		this._internalGLObject.addChild(this._rarityImage);
    		
        }
    }
});
