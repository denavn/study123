/*
 * Author TuNG
 */
var Core = require('../../NGCore/Client/Core').Core;
var GL2 = require('../../NGCore/Client/GL2').GL2;
var AbstractView = require("../../NGGo/GLUI/AbstractView").AbstractView;
var GLUI = require("../../NGGo/GLUI").GLUI;
var CheckableScrollItem = require("./CheckableScrollItem").CheckableScrollItem;
var CheckableScroller = require("./CheckableScroller").CheckableScroller;

/**
 * Listener for handling filter buttons
 */
var ButtonListener = Core.MessageListener.subclass({
	classname : "ButtonListener",
	/**
	 * Initialize function
	 * @param filterBar {GL2.Sprite} a sprite contains filter bar
	 * @param index {Number} index of filter button
	 * @param callback {Function} a callback function
	 * */
	initialize: function(filterBar, index, callback) {
		this._callback = callback;
		this._filterBar = filterBar;
		this._index = index;
	},
	/**
	 * on touch event listener
	 * */
	onTouch: function(touch) {
		switch(touch.getAction()) {
			case touch.Action.Start:
				return true;
			case touch.Action.End:
				this._filterBar.setImage('./Content/image/tag/tag_choice_close_tab' + this._index + '.png', [320, 36], [0, 0], [0, 0, 1, 1]);
				console.log("On filter click!");
				console.log(this._callback);
				this._callback(this._index);
		}
	},
	/**
	 * set callback function for event click on a filter button
	 * @param v {Function} a callback function
	 * */
	setOnFilterClick: function(v) {
		this._callback = v;
	},
	/**
	 * @override destroy function.
	 * */
	destroy : function($super){
		this._callback = null;
		this._filterBar = null;
		this._index = null;
		$super();
	}
});

exports.HeroScrollList = AbstractView.subclass({
	classname: "HeroScrollList",
	NUMBER_OF_FILTER: 4,
	/**
	 * Initialize function
	 * @param properties {Object}
	 * */
	initialize: function($super, properties) {
        properties = properties || {};
        this._initializeProcess = true;
        $super(properties);
        
        this._internalGLObject = new GL2.Node();
        this._heros 		= [];
		this._onFilterClick = function(){};
		this._gabageCollector = [];
        
        // Controls
        this._checkableList = null;
        this._listener 		= null;
        this._filterBar		= null;

        this.setFrame(properties.frame || [0, 0, 0, 0]);
        this._initializeProcess =false;
        this._updateView();
        
        this._gabageCollector.push(this._internalGLObject);
	},
	/**
	 * @override destroy function.
	 * */
	destroy: function($super) {
		console.log("Call destroy in HeroScrollList");
		for (var i = this._gabageCollector.length - 1; i >= 0; i--) {
			console.log(this._gabageCollector[i]);
			this._gabageCollector[i].destroy();
			this._gabageCollector[i] = null;
		}
		this._gabageCollector = null;
		this._heros = null;
		this._listener = null;
		this._onFilterClick = null;
		$super();
	},
	/**
	 * get a hero in scroll list
	 * @param index {Number} an index in hero scroll list
	 * @return {Hero} a hero  
	 * */
	getHeroByIndex: function(index) {
		if (this._heros.length > index) {
			return this._heros[index];
		}
		else {
			return undefined;
		}
	},
	/**
	 * get hero list
	 * @return {Array} a hero array.
	 * */
	getHeros: function() {
		return this._heros;
	},
	/**
	 * set hero list
	 * @param v {Array} a hero array.
	 * */
	setHeros: function(v) {
		if (this._heros === v) {
			return;
		}
		else if (v) {
			this._heros = v;
			this._updateView();
		}
	},
	/**
	 * set callback function for event click on item
	 * @param v {Function} a callback function.
	 * */
	setOnItemClick: function(v) {
		if (this._checkableList instanceof CheckableScroller) {
			this._checkableList.setOnItemClick(v);
		}
	},
	/**
	 * select an item
	 * @param index {Number} index of the item in CheckableScrollList
	 * */
	selectItem: function(index) {
		this._checkableList.selectItem(index);
	},
	/**
	 * unselect an item
	 * @param index {Number} index of the item in CheckableScrollList
	 * */
	unSelectItem: function(index) {
		this._checkableList.unSelectItem(index);
	},
	/**
	 * set callback function for event click on filter button.
	 * @param v {Function} callback function.
	 * */
	setOnFilterClick: function(v) {
		console.log("setOnFilterClick");
		this._onFilterClick = v;
		for (var j = 0; j < this._listeners.length; j++) {
			this._listeners[j].setOnFilterClick(v);
		}
	},
	/**
	 * update view for scroll list.
	 * */
	_updateView: function() {
        if (this._initializeProcess) {
            return;
        }

		var frame = this.getFrame(),
	        sizeX = frame[2],
	        sizeY = frame[3];
		var heros = this._heros;
		
		if (!this._checkableList) {
			this._checkableList = new CheckableScroller({
				"frame": [0, 35, sizeX, sizeY - 35]
			});
			this._checkableList.setCheckedSpriteImageUrl("./Content/image/combine/label_checked.png");
			this._internalGLObject.addChild(this._checkableList.getGLObject());
			this._gabageCollector.push(this._checkableList);
		}
		if (!this._filterBar) {
			this._filterBar = new GL2.Sprite();
	        var btn = null;
	        var target = null;
	        this._listeners = [];
	        this._filterBar.setImage('./Content/image/tag/tag_choice_close_tab1.png', [320, 36], [0, 0], [0, 0, 1, 1]);
	        this._filterBar.setDepth(100);
	        this._filterBar.setPosition(0, 0);
	        for (var j = 1; j <= this.NUMBER_OF_FILTER; j++) {
	        	btn = new GL2.Sprite();
	        	btn.setImage('./Content/image/tag/tag_choice_close_BT' + j + '.png', [66, 25], [0, 0], [0, 0, 1, 1]);
	        	btn.setPosition((j - 1) * 78 + 10, 5);
	        	target = new GL2.TouchTarget();
	        	target.setAnchor(0, 0);
	        	target.setSize(66, 25);
	        	this._listeners[j-1] = new ButtonListener(this._filterBar, j, this._onFilterClick);
	        	target.getTouchEmitter().addListener(this._listeners[j-1], this._listeners[j-1].onTouch);
	        	btn.addChild(target);
	        	this._filterBar.addChild(btn);
	        	//gabage collection.
	        	this._gabageCollector.push(btn);
	        	this._gabageCollector.push(this._listeners[j-1]);
	        	this._gabageCollector.push(target);
	        }
	        this._internalGLObject.addChild(this._filterBar);
			this._gabageCollector.push(this._filterBar);
		}
		
		var listItems = [];
		for (var i = 0; i < heros.length; i++) {
			var sprite = this._createHeroItem(heros[i]);
			var item = new CheckableScrollItem();
			item.setContentNode(sprite);
			listItems.push(item);
		}
		this._checkableList.setItems(listItems);
	},
	
	/**
	 * Create list item from hero object
	 * @param h {Hero}
	 * @returns {GL2.Sprite}
	 */
	_createHeroItem: function(h) {
		var s = new GL2.Node();
        
		heroSprite = h.getBgSprite([90, 135], [0, 0]);
		var faceSprite = h.getFaceSprite([89, 67], [0, 0]);
		s.addChild(heroSprite);
		
		faceSprite.setPosition(0.5, 0.5);
		s.addChild(faceSprite);
		
		var nameSprite = h.getNameSprite([80, 24], [0, 0]);
		nameSprite.setPosition(5, 43);
		s.addChild(nameSprite);
		
		var styleSprite = h.getStyleSprite([38, 27], [0, 0]);
		styleSprite.setPosition(90 - 38, 135 - 28);
		s.addChild(styleSprite);
		
		// Level
		levelLabel = new GLUI.Label({
        	"frame": [0, 68, 40, 20],
			"textColor": "FFFFFF",
			"textSize": 12
        });
		levelLabel.setText('Lv.' + h.status.level);
        s.addChild(levelLabel.getGLObject());
        // MaxLevel
		maxLevelLabel = new GLUI.Label({
        	"frame": [40, 68, 50, 20],
			"textColor": "FFFFFF",
			"textSize": 12
        });
		maxLevelLabel.setText('"最大"' + h.max_level);
        s.addChild(maxLevelLabel.getGLObject());
        // Rarity
        rarityLabel = new GLUI.Label({
        	"frame": [2, 85, 50, 20],
			"textColor": "FFFFFF",
			"textSize": 12
        });
        rarityLabel.setText('こんにちは');
        s.addChild(rarityLabel.getGLObject());
		// Offense
        offenceLabel = new GLUI.Label({
        	"frame": [2, 95, 50, 20],
			"textColor": "FFFFFF",
			"textSize": 12
        });
        offenceLabel.setText('攻: ' + h.status.offence);
        s.addChild(offenceLabel.getGLObject());
        // Defense
        defenceLabel = new GLUI.Label({
        	"frame": [2, 107, 50, 20],
			"textColor": "FFFFFF",
			"textSize": 12
        });
        defenceLabel.setText('防: ' + h.status.defence);
        s.addChild(defenceLabel.getGLObject());
		
		return s;
	}
});