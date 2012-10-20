/**
 * @author TuNG
 */

var Core = require('../../NGCore/Client/Core').Core;
var GL2 = require('../../NGCore/Client/GL2').GL2;
var AbstractView = require("../../NGGo/GLUI/AbstractView").AbstractView;
var CheckableScrollItem = require("./CheckableScrollItem").CheckableScrollItem;
var Dn = require('../../DnLib/Dn').Dn;

var TouchListener = Core.MessageListener.subclass({
	classname : "TouchListener",
	/**
	 * Initialize function
	 * @param node {GL2.Sprite} a sprite emits touch events.
	 * @param lowestX {Number} the lowest x coordinate which CheckableScroller can move to.
	 * @param onItemClick {Function} a callback function
	 * */
	initialize: function(node, lowestX, onItemClick) {
		this._node = node;		
		this._lowestX = lowestX;
		this._highestX = 0;
		this._epsilon = 2;
		this._onItemClick = onItemClick;
		this._touchCount = 0;
		this._oy = this._node.getPosition().getY();
	},
	
	/**
	 * touch on CheckableScroller listener.
	 * */
	onNodeTouch: function(touch) {
//		console.log("EXEC onNodeTouch");
		switch(touch.getAction()) {
			case touch.Action.Start:
				this._ox = this._node.getPosition().getX();
				this._sx = this._node.getParent().screenToLocal(touch.getPosition()).getX();
				this._touchCount = 1;
				
				return true;
			case touch.Action.Move:
				var cX = this._node.getPosition().getX();
				this._cx = this._node.getParent().screenToLocal(touch.getPosition()).getX();
				var newX = this._ox + (this._cx - this._sx);
				
				if (newX <= this._highestX && this._lowestX <= newX) {
					this._node.setPosition(newX, this._oy);
				}else if(newX > this._highestX && cX < this._highestX){//fixed WTL-40
					this._node.setPosition(this._highestX, this._oy);
				}else if(newX < this._lowestX && cX > this._lowestX){
					this._node.setPosition(this._lowestX, this._oy);
				}
				
				this._touchCount++;
				
				break;
			case touch.Action.End:
				if (!this._item instanceof CheckableScrollItem || this._item == null) break;
				if (this._item.getIndex() >= 0) {
					if (this._touchCount <= this._epsilon) {
						console.log(this._touchCount);
						this._item.setColor(0.5, 06, 0.7);
						this._onItemClick(this._item);
						this._item.setColor(1, 1, 1);
					}
				} else {
					this._item.getParent().setPosition(1, this._item.getParent().getPosition().getY());
				}
				break;
		}
	},
	
	/**
	 * touch on an item of CheckableScroller listener.
	 * */
	onItemTouch: function(touch) {
	//	console.log("EXEC onItemTouch");
		switch(touch.getAction()) {
			case touch.Action.Start:
				this._item = touch.getTouchTargets()[0].getParent();
//				this._onItemClick(this._item);
		}
	},
	/**
	 * Handler click on back button event.
	 * */
	onBackButtonClick: function() {
		console.log("OnBackButtonClick!");
		this._node.setPosition(1, this._node.getPosition().getY());
	},
	/**
	 * @override destroy function.
	 * */
	destroy: function($super) {
		this._lowestX = null;
		this._epsilon = null;
		this._onItemClick = null;
		this._node = null;
		
		$super();
	}
});

exports.CheckableScroller = AbstractView.subclass({
	classname : "CheckableScroller",
	/**
	 * Initialize function
	 * */
	initialize: function($super, properties) {
        properties = properties || {};
        this._initializeProcess = true;
        $super(properties);
        
        
        
        this._internalGLObject = new GL2.Node();
        this._items 		= [];
        this._checkedSpriteImageUrl = null;
        this._onItemClick 	= function(){};
        
        // Controls
        this._listener 		= null;
        this._nodeTarget 	= null;
        this._listNode 		= null;

		this._maxWidth 		= 0;
		this._backButtonWidth = 50;

        this.setFrame(properties.frame || [0, 0, 0, 0]);
        this._itemWidth             = properties.itemWidth || 90;
        this._itemHeight 			= (this.getFrame())[3];
        this._initializeProcess =false;
        this._updateView();
        
        this._gabageCollector = [];
        this._gabageCollector.push(this._internalGLObject);
	},
	/**
	 * return items of scroller
	 * @return {Array CheckableScrollItem}
	 * */
	getItems: function() {
		return this._items;
	},
	/**
	 * set items for scroller and update its viewer.
	 * @param v {Array CheckableScrollItem}
	 * */
	setItems: function(v) {
		if (this._items === v) {
			return;
		}
		else if(this._items){
			for (var i = this._items.length - 1; i >= 0; i--) {
				this._items[i].destroy();
				this._items[i] = null;
			}
			this._items = null;
		}
		this._items = v;
		this._updateView();
	},
	/**
	 * set image url for the sprite covers checked item.
	 * @param s {String} a url file path.
	 * */
	setCheckedSpriteImageUrl: function(s) {
		this._checkedSpriteImageUrl = s;
	},
	/**
	 * set callback function for event click on an item.
	 * @param v {Function} a callback function.
	 * */
	setOnItemClick: function(v) {
		this._onItemClick = v;
	},
	
	/**
	 * Create a mask to cover an item when it is checked
	 * */
	_createCheckedSprite: function() {
		var darkMask = new GL2.Sprite();
		darkMask.setImage("./Content/image/combine/mask_dark.png", [this._itemWidth, this._itemHeight], [0, 0], [0, 0, 1, 1]);
		darkMask.setAlpha(0.75);
		darkMask.setPosition(0, -5);
		
		var checkLabel = new GL2.Sprite();
		checkLabel.setImage(this._checkedSpriteImageUrl, [74, 26], [0, 0], [0, 0, 1, 1]);
		checkLabel.setPosition(8, 50);
		var node = new GL2.Node();
		node.addChild(darkMask);
		node.addChild(checkLabel);
		
		this._gabageCollector.push(darkMask);
		this._gabageCollector.push(checkLabel);
		this._gabageCollector.push(node);
		
		return node;
	},
	/**
	 * select an item
	 * @param index {Number} index of item
	 * */
	selectItem: function(index) {
		if (this._items.length > index) {
			this._items[index].setCoverNode(this._createCheckedSprite());
			this._items[index].check();
		}
	},
	/**
	 * unselect an item
	 * @param index {Number} index of item
	 * */
	unSelectItem: function(index) {
		if (this._items.length > index) {
			this._items[index].setCoverNode(new GL2.Node());
			this._items[index].unCheck();
		}
	},
	
	/**
	 * Update Checkable scroll viewer
	 * */
	_updateView: function() {
        if (this._initializeProcess) {
            return;
        }
		var frame = this.getFrame(),
	        sizeX = frame[2],
	        sizeY = frame[3];
		var items = this._items;
		
		if (!this._mainNode) {
			this._mainNode = new GL2.Sprite();
	        this._internalGLObject.addChild(this._mainNode);
		}
		var width = items.length * this._itemWidth + this._backButtonWidth;
		if (this._maxWidth < width) {
			this._maxWidth = width;
		}
		this._mainNode.setImage("./Content/image/combine/mask_dark.png", [this._maxWidth, sizeY], [0, 0]);

		if (this._listNode) {
			this._mainNode.removeChild(this._listNode);
			this._listNode.destroy();
			this._listNode = null;
		}
		//should destroy listener here for the case player can not touch on scroll if there's no item
		if (this._listener) {
			this._listener.destroy();
		}
		console.log("Add list item");
		if (this._items.length > 0) {
			this._mainNode.setPosition(0, 0);
			this._listener = new TouchListener(this._mainNode, (320 - 40 - items.length - this._itemWidth * items.length), this._onItemClick);
	        // Add touch target
	        if (this._nodeTarget) {
	        	this._nodeTarget.destroy();
	        }
	        this._nodeTarget = new GL2.TouchTarget();
			this._nodeTarget.setAnchor(0, 0);
			this._nodeTarget.setPosition(0, 0);
			this._nodeTarget.setSize(items.length * this._itemWidth, sizeY); // 
			this._nodeTarget.getTouchEmitter().addListener(this._listener, this._listener.onNodeTouch);
			this._mainNode.addChild(this._nodeTarget);
			
			this._listNode = new GL2.Node();
			
			//make hero scroll animation.
			this._viewedNum = Math.round(320/this._itemWidth);
			if(this._viewedNum > items.length){
				this._viewedNum = items.length;
			}
			this._count = 0;
			this.makeAnim(sizeY);
			
			// Add remaning items
	        for (var i = this._viewedNum; i < items.length; i++) {
	        	this.addItem(i, sizeY);
	        }
	        
	        // Add back button
	        if (items.length * this._itemWidth >= 320) {
		        var back = new GL2.Sprite();
		        var backTarget = new GL2.TouchTarget();
		        back.setImage('./Content/image/tag/tag_choice_BT10_back.png', [this._backButtonWidth, sizeY], [0, 0], [0, 0, 1, 1]);
		        back.setPosition(items.length * (this._itemWidth + 1), 0);
		        back.index = -1;
		        backTarget.setAnchor(0, 0);
		        backTarget.setSize(this._backButtonWidth, sizeY);
		        backTarget.getTouchEmitter().addListener(this._listener, this._listener.onBackButtonClick);
		        back.addChild(backTarget);
		        this._listNode.addChild(back);
		        
		        this._gabageCollector.push(back);
		        this._gabageCollector.push(backTarget);
	        }
			
	        this._mainNode.addChild(this._listNode);
		}
		console.log("updateView success");
	},
	
	/**
	 * Make animation for the scroll. It makes item shown sequentialy 
	 * @param sizeY {Number} the height of items in scroll
	 * */
	makeAnim : function(sizeY){
		if(this._count >= this._viewedNum){
			return;
		}
		var time = 0.05 * this._count;
		
		Dn.Timekeeper.setTimeout(function(){
			this.addItem(this._count, sizeY);
        	this._count++;
        	this.makeAnim(sizeY);
		}.bind(this),time);
	},
	/**
	 * Add an item to list node
	 * @param index {Number} index of the item in items list
	 * @param sizeY {Number} height of the item
	 * */
	addItem : function(index, sizeY){
		var target = new GL2.TouchTarget();
    	target.setAnchor(0, 0);
    	target.setSize(this._itemWidth, sizeY);
    	target.getTouchEmitter().addListener(this._listener, this._listener.onItemTouch);
    	
    	var itemNode = this._items[index];
    	if(!itemNode){
    		return;
    	}
    	itemNode.setIndex(index);
    	itemNode.addChild(target);
    	itemNode.setPosition(index * (this._itemWidth + 1), 0);
    	
    	this._listNode.addChild(itemNode);
    	
    	this._gabageCollector.push(target);
	},
	/**
	 * Destroy resources
	 * */
	destroy: function($super) {
		for (var i = this._items.length - 1; i >= 0; i--) {
			this._items[i].destroy();
			this._items[i] = null;
		}
		this._items = null;
		
		for(var i = 0 ; i < this._gabageCollector.length ; i++){
			this._gabageCollector[i].destroy();
			this._gabageCollector[i] = null;
		}
		this._gabageCollector = null;
		
		if (this._checkedSpriteImageUrl) {
			this._checkedSpriteImageUrl.destroy();
			this._checkedSpriteImageUrl = null;
		}
		if (this._listNode) {
			this._listNode.destroy();
			this._listNode = null;
		}
		if (this._nodeTarget) {
			this._nodeTarget.destroy();
			this._nodeTarget = null;
		}
		if (this._listener) {
			this._listener.destroy();
			this._listener = null;
		}
		if(this._mainNode){
			this._mainNode.destroy();
			this._mainNode = null;
		}
		this._maxWidth 				= null;
		this._backButtonWidth 		= null;
		this._itemWidth             = null;
        this._itemHeight 			= null;
        this._initializeProcess 	= null;
        
		$super();
	}
});
