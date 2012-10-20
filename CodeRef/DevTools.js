var SceneDirector = require('../NGGo/Framework/Scene/SceneDirector').SceneDirector;

exports.DevTools = {
    /**
     * ノードを受け取ってツリー表示する
     * @property {Node} node ダンプ対象のノード。省略した場合は ScreenManager.getRootNode()
     * @property {Function} extra 追加表示する情報を返す関数 function(node) { ... }
     * @property {Integer} level インデントのレベル。指定の必要なし
     */
    dumpNodeTree: function(node, extra, level) {
        var _self = this,
            indent = "", children,
            i;

        if (typeof node === "function") {
            extra = node;
            node  = null;
        }

        node  = node  || ScreenManager.getRootNode();
        extra = extra || function() { return ""; };
        level = level || 0;

        if (level === 0) {
            console.log("↓↓↓↓ DevTools.dumpNodeTree ↓↓↓↓");
        }

        children = node.getChildren();

        if (children.length < 1) {
            return;
        }

        for (i = 0; i < level; ++i) {
            indent += "  ";
        }

        children.forEach(function(child) {
            console.log([
                indent + "",
                "[" + child.classname + "] ",
                child.name,
                " (" + extra(child) + ")"
            ].join(""));

            if (child.getChildren) {
                _self.dumpNodeTree(child, extra, level + 1);
            }
        });

        if (level === 0) {
            console.log("↑↑↑↑ DevTools.dumpNodeTree ↑↑↑↑");
        }
    }
};
