/**
 * @author sonnn
 */

var Core = require('../../NGCore/Client/Core').Core;
var GL2 = require('../../NGCore/Client/GL2').GL2;

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
				this._node.setPosition(newX, this._node.getPosition().getY());
				
				// if (newX <= 5 && this._lowestX <= newX) {
					// this._node.setPosition(newX, this._node.getPosition().getY());
				// }
				
				this._touchCount++;
				
				break;
			case touch.Action.End:
				this._item.setColor(1, 1, 1);
				if (this._touchCount <= this._epsilon) {
					console.log("Transition to next scene");
					this._onItemClick(this._item.name);
				}
				
				break;
		}
	},
	
	onItemTouch: function(touch) {
		console.log("EXEC onItemTouch");
		switch(touch.getAction()) {
			case touch.Action.Start:
				this._item = touch.getTouchTargets()[0].getParent();
				this._item.setColor(0.5, 06, 0.7);
		}
	}
});

exports.HScroller = Core.Class.singleton({
	create: function(size, pos, items, onItemClick) {
		var node = new GL2.Node();
		node.setPosition(pos[0], pos[1]);
		
		var listener = new TouchListener(node, pos[0], onItemClick);
		var nodeTarget = new GL2.TouchTarget();
		nodeTarget.setAnchor(0, 0);
		nodeTarget.setSize(size[0] + (items.length * 5), size[1]);
		nodeTarget.getTouchEmitter().addListener(listener, listener.onNodeTouch);
		node.addChild(nodeTarget);
		
		var item = null;
		var target = null;
		var size = null;
		var s = null;
        for (var i = 0; i < items.length; i++) {
        	s = items[i].size;
        	target = new GL2.TouchTarget();
        	target.setAnchor(0, 0);
        	target.setSize(s[0], s[1]);
        	target.getTouchEmitter().addListener(listener, listener.onItemTouch);
        	
        	item = new GL2.Sprite();
        	item.name = items[i].name;
        	item.setImage(items[i].img, s, [0, 0], [0, 0, 1, 1]);
        	item.setPosition(i * (s[0] + 5), 0);
        	item.addChild(target);
        	node.addChild(item);
        }
        
        return node;
	}
});
