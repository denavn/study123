
var Core = require('../../NGCore/Client/Core').Core;
var GL2 = require('../../NGCore/Client/GL2').GL2;

exports.CheckableScrollItem = GL2.Node.subclass({
		Depth: {
	        CONTENT_NODE: 10,
	        COVER_NODE: 20
	    },
	    initialize: function() {
			this._contentNode = null;
			this._coverNode = null;
			this._isChecked = false;
			this._size = [0, 0];
			this._index = -1;
		},
		destroy: function($super) {
			console.log("Call destroy in CheckableScrollItem");
			if (this._contentNode) {
				this._contentNode.destroy();
				this._contentNode = null;
			}
			if (this._coverNode) {
				this._coverNode.destroy();
				this._coverNode = null;
			}
			this._isChecked = null;
			this._size = null;
			this._index = null;
			
			$super();
		},
		setIndex: function(v) {
			this._index = v;
		},
		getIndex: function() {
			return this._index;
		},
		setSize: function(s) {
			this._size = s;
		},
		getSize: function() {
			return this._size;
		},
		isChecked: function() {
			return this._isChecked;
		},
		check: function() {
			this._isChecked = true;
		},
		unCheck: function() {
			this._isChecked = false;
		},
		getContentNode: function() {
			return this._contentNode;
		},
		setContentNode: function(node) {
			if (this._contentNode === node) {
				return;
			}
			else if (node) {
				if (this._contentNode) {
					this.removeChild(this._contentNode);
					this._contentNode.destroy();
				}
				this._contentNode = node;
				this._contentNode.setDepth(this.Depth.CONTENT_NODE);
				this.addChild(this._contentNode);
			}
			else {
				throw new Error("Cannot set a null or undefined value to contentNode object");
			}
		},
		getCoverNode: function() {
			return this._coverNode;
		},
		setCoverNode: function(node) {
			if (this._coverNode === node) {
				return;
			}
			else if (node) {
				if (this._coverNode) {
					this.removeChild(this._coverNode);
					this._coverNode.destroy();
				}
				this._coverNode = node;
				this._coverNode.setDepth(this.Depth.COVER_NODE);
				this.addChild(this._coverNode);
			}
			else {
				throw new Error("Cannot set a null or undefined value to contentNode object");
			}
		}
});
