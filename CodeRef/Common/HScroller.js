var Core 	= require('../../NGCore/Client/Core').Core;
var GL2 	= require('../../NGCore/Client/GL2').GL2;

var TouchListener = Core.MessageListener.subclass({
	initialize: function(node, lowestX, onItemClick) {
		this._node = node;		
		this._lowestX = lowestX;
		this._epsilon = 2;
		this._onItemClick = onItemClick;
	},
	
	onNodeTouch: function(touch) {
		console.log("EXEC onNodeTouch");
		switch(touch.getAction()) {
			case touch.Action.Start:
				this._ox = this._node.getPosition().getX();
				this._sx = this._node.getParent().screenToLocal(touch.getPosition()).getX();
				this._touchCount = 1;
				
				return true;
			case touch.Action.Move:
				this._cx = this._node.getParent().screenToLocal(touch.getPosition()).getX();
				var newX = this._ox + (this._cx - this._sx);
				
				if (newX <= 1 && this._lowestX <= newX) {
					this._node.setPosition(newX, this._node.getPosition().getY());
				}
				
				this._touchCount++;
				
				break;
			case touch.Action.End:
				if (this._item.index >=0) {
					this._item.setColor(1, 1, 1);
					if (this._touchCount <= this._epsilon) {
						console.log("Transition to next scene");
						this._onItemClick(this._item.index, this._item.getParent());
					}
				} else {
					this._item.getParent().setPosition(1, this._item.getParent().getPosition().getY());
				}
				
				break;
		}
	},
	
	onItemTouch: function(touch) {
		console.log("EXEC onItemTouch");
		switch(touch.getAction()) {
			case touch.Action.Start:
				this._item = touch.getTouchTargets()[0].getParent();
				if (this._item.index >= 0) {
					this._item.setColor(0.5, 06, 0.7);
				}
				console.log(this._item);
				this._item.setColor(0.5, 06, 0.7);
		}
	}
});

exports.HScroller = Core.Class.singleton({
	initialize : function(){
		this._gabageCollector = [];
	},
	/**
	 * Create scroll sprite
	 * @param heros {Array Hero}
	 * */
	_createSprites: function(heros) {
		var h = null;
		var heroSprite = null;
		var spriteArray = [];
		for (var i = 0; i < heros.length; i++) {
			h = heros[i];
			console.log("Create sprites");
			console.log(h);
			
			heroSprite = h.getBgSprite([90, 135], [0, 0]);
			var faceSprite = h.getFaceSprite([89, 67], [0, 0]);
			faceSprite.setPosition(0.5, 0.5);
			heroSprite.addChild(faceSprite);
			
			var nameSprite = h.getNameSprite([80, 24], [0, 0]);
			nameSprite.setPosition(5, 43);
			heroSprite.addChild(nameSprite);
			var styleSprite = h.getStyleSprite([38, 27], [0, 0]);
			styleSprite.setPosition(90 - 38, 135 - 28);
			heroSprite.addChild(styleSprite);
			heroSprite.size = [90, 135];
			
			// Level
			var level = new GL2.Text();
			level.setText('Lv. ' + h.status.level);
			level.setFontSize(13);
			level.setVerticalAlign(GL2.Text.VerticalAlign.Top);
			level.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
			level.setAnchor(0, 0);
			level.setPosition(2, 68);
			heroSprite.addChild(level);
			
			var maxLevel = new GL2.Text();
			maxLevel.setText('最大' + h.max_level);
			maxLevel.setFontSize(13);
			maxLevel.setVerticalAlign(GL2.Text.VerticalAlign.Top);
			maxLevel.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
			maxLevel.setAnchor(0, 0);
			maxLevel.setPosition(45, 68);
			heroSprite.addChild(maxLevel);
			
			var rarityName = new GL2.Text();
			rarityName.setText('こんにちは');
			rarityName.setFontSize(13);
			rarityName.setVerticalAlign(GL2.Text.VerticalAlign.Top);
			rarityName.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
			rarityName.setAnchor(0, 0);
			rarityName.setPosition(2, 83);
			heroSprite.addChild(rarityName);
			
			var offence = new GL2.Text();
			offence.setText('攻: ' + h.status.offence);
			offence.setFontSize(13);
			offence.setVerticalAlign(GL2.Text.VerticalAlign.Top);
			offence.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
			offence.setAnchor(0, 0);
			offence.setPosition(2, 95);
			heroSprite.addChild(offence);
			
			var defence = new GL2.Text();
			defence.setText('防: ' + h.status.defence);
			defence.setFontSize(13);
			defence.setVerticalAlign(GL2.Text.VerticalAlign.Top);
			defence.setHorizontalAlign(GL2.Text.HorizontalAlign.Left);
			defence.setAnchor(0, 0);
			defence.setPosition(2, 107);
			heroSprite.addChild(defence);

			heroSprite.isChecked = h.isChecked;
			heroSprite.checkedSprite = h.checkedSprite;
			
			spriteArray.push(heroSprite);
			
			this._gabageCollector.push(heroSprite);
			this._gabageCollector.push(faceSprite);
			this._gabageCollector.push(nameSprite);
			this._gabageCollector.push(styleSprite);
			this._gabageCollector.push(level);
			this._gabageCollector.push(maxLevel);
			this._gabageCollector.push(rarityName);
			this._gabageCollector.push(offence);
			this._gabageCollector.push(defence);
		}
		
		return spriteArray;
	},
	
	create: function(size, pos, heros, onItemClick, checkedSprite) {
		var items = this._createSprites(heros);
		this._items = items;
		
		var node = new GL2.Node();
		node.setPosition(pos[0], pos[1]);
		
		var listener = new TouchListener(node, (320 - (size[0] + 40 + 0.2 * items.length)), onItemClick);
		var nodeTarget = new GL2.TouchTarget();
		nodeTarget.setAnchor(0, 0);
		nodeTarget.setSize(size[0] + (items.length * 5), size[1]);
		nodeTarget.getTouchEmitter().addListener(listener, listener.onNodeTouch);
		node.addChild(nodeTarget);
		var itemNode = null;
		var target = null;
		var s = null;
        for (var i = 0; i < items.length; i++) {
        	s = items[i].size;
        	target = new GL2.TouchTarget();
        	target.setAnchor(0, 0);
        	target.setSize(s[0], s[1]);
        	target.getTouchEmitter().addListener(listener, listener.onItemTouch);
        	
        	item = items[i];
        	item.index = i;
        	item.addChild(target);
        	console.log("create target success");
        	console.log(item);
        	
        	itemNode = new GL2.Node();
        	itemNode.addChild(item);
        	itemNode.setPosition(i * (s[0] + 1), 0);
        	
        	itemNode.getCoverNode = function() {
        		return this._coverNode;
        	}.bind(itemNode);
        	
        	itemNode.setCoverNode = function(v) {
        		if (this._coverNode) {
        			this._coverNode.destroy();
        		}
        		this._coverNode = v;
        		this.addChild(this._coverNode);
        		console.log("call setCoverNode");
        		console.log(this._coverNode);
        	}.bind(itemNode);

        	if (item.checkedSprite != undefined && item.checkedSprite instanceof GL2.Node && item.isChecked) {
        		itemNode.setCoverNode(item.checkedSprite);
        		itemNode.isChecked = true;
        	}
        	
        	node.addChild(itemNode);
        	this._gabageCollector.push(target);
        	this._gabageCollector.push(itemNode);
        }
        
        if (size && size[0] >= 320) {
	        var back = new GL2.Sprite();
	        var backTarget = new GL2.TouchTarget();
	        back.setImage('./Content/image/tag/tag_choice_BT10_back.png', [37, s[1]], [0, 0], [0, 0, 1, 1]);
	        back.setPosition(items.length * (s[0] + 0.2), 0);
	        back.index = -1;
	        backTarget.setAnchor(0, 0);
	        backTarget.setSize(37, s[1]);
	        backTarget.getTouchEmitter().addListener(listener, listener.onItemTouch);
	        back.addChild(backTarget);
	        
	        node.addChild(back);
	        this._gabageCollector.push(back);
	        this._gabageCollector.push(backTarget);
        }
        
        this._gabageCollector.push(node);
        this._gabageCollector.push(listener);
        this._gabageCollector.push(nodeTarget);
        
        return node;
	},
	getItems: function() {
		return this._items;
	},
	setCheckedSprite: function(s) {
		this._checkedSprite = s;
	},
	destroy : function($super){
		if(this._gabageCollector){
			for(var i = 0 ; i < this._gabageCollector.length ; i++){
				this._gabageCollector[i].destroy();
				this._gabageCollector[i] = null;
			}
			this._gabageCollector[i] = null;	
		}
		
		$super();
	}
});