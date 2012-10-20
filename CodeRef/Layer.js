var SceneDirector = require('../NGGo/Framework/Scene/SceneDirector').SceneDirector;
exports.Layer = {
    Depth: {
        DEFAULT: 10,
        MAIN:    10,
        HEADER:  500,
        TOP:     1000,
        LOADING: 10000
    },

    addRootChild: function(node, depth) {
        node.setDepth(depth || Layer.DEFAULT);
        ScreenManager.getRootNode().addChild(node);
    },

    removeRootChild: function(node) {
        ScreenManager.getRootNode().addChild(node);
    },

    getHeaderController: function() {
        return HeaderController;
    }
};
