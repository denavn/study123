/**
 * 
 */
var GLUI = require('../../../NGGo/GLUI').GLUI;
var GL2 = require('../../../NGCore/Client/GL2').GL2;

exports.HeroAvatar = GLUI.View.subclass({
	classname: "HeroAvatar",
	/**
	 * Initialize function
	 * @param properties {Object}
	 * */
	initialize : function($super, properties){
		properties = properties || {};
        this._initializeProcess = true;
        $super(properties);
        this._internalGLObject = new GL2.Node();
        this._backgroundImage = null;
        this._borderImage = null;
        this._heroImage = null;
        this._onClickCallback = function() {};
        
        this._backgroundImageUrl = properties.backgroundImageUrl || "Content/image/combine/tag_choice_red.png";
        this._borderImageUrl = properties.borderImageUrl || "Content/image/combine/btn_basehero_bg.png";
        this._hero 				= properties.hero || null;
        
        this._borderTopWidth = 20;
        this._borderRightWidth = 13;
        this._borderBottomWidth = 10;
        this._borderLeftWidth = 2;
        
        //this.setAttributes(properties);
        this.setFrame(properties.frame || [0, 0, 0, 0]);
        this._initializeProcess =false;
        
        this._gabageCollector = [];
        this._gabageCollector.push(this._internalGLObject);
        
        this._updateView();
	},
	
	_updateView : function(properties){
		if (this._initializeProcess
		        || this._backgroundImageUrl === null
		        || this._borderImageUrl === null) {
		            return;
        }

        var frame = this.getFrame(),
            sizeX = frame[2],
            sizeY = frame[3];
        
        if (!this._backgroundImage) {
            this._backgroundImage = new GL2.Sprite();
            var backgroundWidth = sizeX - this._borderLeftWidth - this._borderRightWidth;
            var backgroundHeight = sizeY - this._borderTopWidth - this._borderBottomWidth;
            console.log("Create background image:");
            console.log("sizeX: " + backgroundWidth + ", sizeY: " + backgroundHeight);
            console.log("imageUrl: " + this._backgroundImageUrl);
            this._backgroundImage.setImage(this._backgroundImageUrl, [backgroundWidth, backgroundHeight], [0, 0]);
            this._backgroundImage.setPosition(this._borderLeftWidth, this._borderTopWidth);
            this._internalGLObject.addChild(this._backgroundImage);
            this._gabageCollector.push(this._backgroundImage);
        }
        
        if (!this._heroImage) {
            this._heroImage = new GL2.Sprite();
            this._heroImage.setPosition(this._borderLeftWidth, this._borderTopWidth);
            this._internalGLObject.addChild(this._heroImage);
            this._gabageCollector.push(this._heroImage);
        }
        
        if (!this._borderImage) {
            this._borderImage = new GL2.Sprite();
            console.log("Create border image:");
            console.log("sizeX: " + sizeX + ", sizeY: " + sizeY);
            console.log("imageUrl: " + this._backgroundImageUrl);
            this._borderImage.setImage(this._borderImageUrl, [sizeX, sizeY], [0, 0]);
            this._borderImage.setPosition(0, 0);
            this._internalGLObject.addChild(this._borderImage);
            this._gabageCollector.push(this._borderImage);
        }
        if (!this._touchTarget) {
        	this._touchTarget = new GL2.TouchTarget();
        	this._touchTarget.setSize(sizeX, sizeY);
        	this._touchTarget.setPosition(0, 0);
        	var l = new Core.MessageListener();
        	this._touchTarget.getTouchEmitter().addListener(l, this._onClickCallback);
        	this._internalGLObject.addChild(this._touchTarget);
        	this._gabageCollector.push(this._touchTarget);
        	this._gabageCollector.push(l);
        }
        if (this._hero) {
        	if (this._heroSprite) {
        		this._heroImage.removeChild(this._heroSprite);
        		this._heroSprite.destroy();
        	}
        	var width = sizeX - this._borderLeftWidth - this._borderRightWidth;
        	var height = sizeY - this._borderTopWidth - this._borderBottomWidth;
        	this._heroSprite = this._hero.getFaceSprite([width, height], [0, 0]);
        	this._heroImage.addChild(this._heroSprite);
        }
	},
	/**
	 * set hero object for avatar
	 * @param v {Hero}
	 * */
    setHero: function (v) {
        if (this._hero === v) {
            return;
        }
        if (v) {
            this._hero = v;
            this._updateView();
        }
        else {
            throw new Error("Cannot set a null or undefined value to hero object");
        }
    },
	
    /**
     * @return {Hero}
     * */
	getHero : function(){
		return this._hero;
	},
	/**
	 * @override destroy
	 * */
	destroy : function($super){
		for(var i = 0 ; i < this._gabageCollector.length ; i++){
			this._gabageCollector[i].destroy();
			this._gabageCollector[i] = null;
		}
		this._gabageCollector = null;
		if(this._heroSprite){
			this._heroSprite.destroy();
		}
		$super();
	}
});