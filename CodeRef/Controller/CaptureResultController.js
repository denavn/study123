var Core = require("../../NGCore/Client/Core").Core;

exports.CaptureResultController = Core.Class.subclass({
    classname: "CaptureResultController",

    _resultView: [{
        "name": "ResultItemView",
        "type": "node",
        "attrs": {
            "frame": [10, 0, null, null]
        },
        "children": [{
            "name": "ResultItemName",
            "type": "replaceLabel",
            "attrs": {
                "text": "%name%",
                "textColor": "ffffff",
                "textGravity": [0, 0.5],
                "frame": [0, 0, 200, 24],
                "textSize": 12
            }
        }, {
            "name": "ResultItemResult",
            "type": "replaceLabel",
            "attrs": {
                "text": "%result%",
                "textColor": "ffff00",
                "textGravity": [0, 0.5],
                "frame": [120, 0, 200, 24],
                "textSize": 12
            }
        }, {
            "name": "ResultItemButton",
            "type": "button",
            "attrs": {
                "frame": [160, 0, 72, 24],
                "image": {
                    "anchor": [0, 0],
                    "url": "Content/image/tag/btn_change.png",
                    "size": [72, 24]
                },
                "action": {
                    "name": "tagChangeClick",
                    "param": ""
                }
            }
        }]
    }],

    initialize: function() {
    },

    destroy: function() {
    },

    deactive: function() {
        this.CaptureResultView.setTouchable(false);
    },

    active: function() {
        this.CaptureResultView.setTouchable(true);
    },

    onSceneLoaded: function() {
        this._updateResultMessage();
        this._initResult();
    },

    action_forwardClick: function(elem, param) {
        SceneDirector.pop();
    },

    action_tagChangeClick: function(elem, param) {
        NgLogD(this + "::action_tagChangeClick id = " + param.id);
    },

    _updateResultMessage: function() {
        this.ResultMessage.gluiobj.replace({
            num: Pool.mission.captureResult.capture_num
        });
    },

    _initResult: function() {
        var result = Pool.mission.captureResult,
            num = 0;

        for (id in result.capture) {
            if (id === "key") {
                continue;
            }

            this._buildResultItem(result.capture[id], num);
            ++num;
        }
    },

    _buildResultItem: function(capture, num) {
        var self = this,
            view = this._copyView(this._resultView),
            id = capture.super_man.id;

        self._renameView(view, id);

        // タッグ変更ボタンのクリックアクション
        view[0].children[2].attrs.action.param = { id: id };

        // 縦位置の調整
        view[0].attrs.frame[1] = 10 + 30 * num;

        GUIBuilder.loadConfigFromData(view, self, function() {
            self._updateResult(capture);
            self.ResultContainer.addChild(self["ResultItemView" + id]);
        });
    },

    _renameView: function(view, id) {
        var self = this;
        view.forEach(function(node) {
            node.name = node.name + id;

            if (node.children) {
                self._renameView(node.children, id);
            }
        });
    },

    _updateResult: function(capture) {
        var a = (this["ResultItemName" + capture.super_man.id]);
        this["ResultItemName" + capture.super_man.id].gluiobj.replace({
            name: capture.super_man.name
        });

        this["ResultItemResult" + capture.super_man.id].gluiobj.replace({
            result: capture.is_get ? "成功" : "失敗"
        });

        if (!capture.is_get) {
            this["ResultItemButton" + capture.super_man.id].setVisible(false);
        }
    },

    _copyView: function(view) {
        return JSON.parse(JSON.stringify(view)); // MU RI YA RI
    }
});
