var Commands = require('./Commands').Commands;
var AbstractView = require('./AbstractView').AbstractView;

// CAREFUL! THIS IS NOT A CLASS!
exports.ViewParent = {
	initialize : function() {
		this._children = [];
	},

	getChildCount : function() {
		return this._children.length;
	},

	getChildren : function() {
		return this._children.slice();
	},

	addChild : function(childNode,index) {
		if (childNode === this) throw new Error("Cannot add " + childNode + " as a child of itself!");
		if (childNode instanceof AbstractView) {
			if (childNode._parent) childNode.removeFromParent();

			if (index === 0 || index > 0) {
				index = Math.min(index, this.getChildCount());
				this._children.splice(index, 0, childNode);
			} else {
				index = -1;
				this._children.push(childNode);
			}

			// Must populate parent before setting visibility
			childNode._parent = this;
			childNode._setVisible(this._visible);

			Commands.addSubview.call(this, childNode.__objectRegistryId, index);

		} else throw new Error(this.type + ".addChild: " + childNode + " is not a view!");
		return this;
	},

	removeChild : function(childNode) {
		if (childNode instanceof AbstractView) {
			if (childNode._parent == this) {
				childNode._setVisible(false);

				// Remove this node from parent's child list
				var nodeIndex = this._children.indexOf(childNode);
				if (nodeIndex != -1) {
					this._children.splice(nodeIndex, 1);
				}
			}
			// Clear parent value
			childNode._parent = undefined;

			// Remove from the parent at the system level
			Commands.removeFromSuperview.call(childNode);
		} else throw {message: this.type + ".removeChild: " + childNode + " is not a view!"};
		return childNode;
	}

};
