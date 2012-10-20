var Core = require('../../NGCore/Client/Core').Core;
var GameAPI = require('../GameAPI').GameAPI;
var Times = require('../Common/Util/Times').Times;
var BattleListNode = require('../GLUI/BattleListNode').BattleListNode;

exports.BattleListController = Core.Class.subclass({
    classname: "BattleListController",

    initialize: function() {
        this.timer = null;
        this.area  = null;
    },

    destroy: function() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.destroyAll();
        this.area = null;
    },

    action_select: function(elem, user) {
        if (SceneDirector.currentScene == "BattleListScene") {
            SceneDirector.push("BattleReadyScene", {user: user});
        }
    },

    deactive: function() {
        this.BattleListView.setTouchable(false);
        if (this.timer) {
            clearInterval(this.timer);
        }
    },

    active: function() {
        this.BattleListView.setTouchable(true);
        this._startTimer();
    },

    update: function() {
        var _self = this;
        GameAPI.Battle.getList(function(ret) {
            var node = null,
                i    = 0;
            _self.setArea(ret.area);
            for (i=0;i<ret.list.length;i++) {
                node = new BattleListNode();
                node.setUser(ret.list[i]);
                node.setOnAction(_self.action_select);
                _self.BattleList.addItem(node);
            }
        });
    },

    setArea: function(area) {
        var dTime = Times.toDigitString(area.getRemainingSec());

        this.WinLabel.gluiobj.replace({
            win: area.clear_win_num
        });
        this.LoseLabel.gluiobj.replace({
            lose: area.lose_num
        });
        this.HistoryLabel.gluiobj.replace({
            win:  area.status.win_num, 
            lose: area.status.lose_num
        });
        this.CountdownText.gluiobj.setText(dTime.replace(/:/g, "c").trim());

        this.area = area;
        this._startTimer();
    },

    _startTimer: function() {
        var _self = this;
        if (!_self.timer) {
            _self.timer = setInterval(function() {
                var dTime = Times.toDigitString(_self.area.getRemainingSec());
                _self.CountdownText.gluiobj.setText(dTime.replace(/:/g, "c").trim());
            }, 1000);
        }
    },
});
