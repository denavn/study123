var Core = require('../../NGCore/Client/Core').Core;
var GameAPI = require('../GameAPI').GameAPI;
var Pool = require('../Pool').Pool;
var Dump = require('../Common/Dump').Dump;

exports.MyPageController = Core.Class.subclass({
    classname: 'MyPageController',

    initialize: function() {
        NgLogD('MyPageController.initialize()');
    },

    action_missionClick: function(elem) {
        SceneDirector.transition('MissionListScene');
    },

    action_battleClick: function(elem) {
        GameAPI.Battle.getInfo(function(area) {
            if (area.status.is_joined) {
                SceneDirector.transition('BattleListScene', {area: area});
            } else {
                SceneDirector.push('BattleJoinScene', {area: area});
            }
        });
    },

    action_combineClick: function(elem) {
        if (Pool.Mine.last_combined_id == 0) {
            SceneDirector.transition('CombineBaseSelectScene', {});
            return;
        }
        GameAPI.Combine.getElementList(Pool.Mine.last_combined_id, GameAPI.Combine.SELECT_STYLE.ALL, false, function(ret) {
            if (ret.status) {
                SceneDirector.transition('CombineSingleSelectScene', ret);
            } else {
                SceneDirector.transition('CombineBaseSelectScene', {});
            }
        });
    },

    action_tagClick: function(elem, hero) {
        SceneDirector.push('StatusScene');
    },

    action_click: function(elem, param) { // @param String: "feed", "gacha"
        switch (param) {
        case "feed":
            SceneDirector.transition('FeedListScene');
            break;
        case "gacha":
            alert("画面未実装");
            // SceneDirector.transition('GachaScene');
            break;
        }
    },

    deactive: function() {
        if (this.MyPageView) {
            this.MyPageView.setTouchable(false);
        }
    },

    active: function() {
        if (this.MyPageView) {
            this.MyPageView.setTouchable(true);
        }
    },

    buildNodes: function() {
        this.updateKKDGauge();
//      this.updateMessages();
        this.updateHeros(Pool.Mine.tag.a, Pool.Mine.tag.b);
    },
    updateKKDGauge: function() {
        var kkd = Pool.Mine.kkd;

        this.KKDGauge.gluiobj.setValue(kkd);
        this.KKDValue.gluiobj.setText("" + kkd + "p");
    },
/*
    updateMessages: function() {
        var messages = 99; // = Pool.Mine.messages; // 存在しない

        if (messages > 99) { // limit 99
            messages = 99;
        }
        this.txt_messages.gluiobj.setText(messages);
    },
 */
    updateHeros: function(hero1, hero2) {
        // hero images (size: 512 x 512px)

        var h1 = null, h2 = null, n1 = null, n2 = null;

        h1 = hero1.getFullSprite([512, 512], [0.5,0]);
        h1.setPosition(0,0)

        h2 = hero2.getFullSprite([512, 512], [0.5,0]);
        h2.setPosition(0,0)

        n1 = hero1.getNameSprite([100, 23], [0.5,0]);
        n1.setPosition(0,0)

        n2 = hero2.getNameSprite([100, 23], [0.5,0]);
        n2.setPosition(0,0)

        this.Hero1.addChild(h1);
        this.Hero2.addChild(h2);

        // hero names (max size: 110 x 30px)
        this.Hero1Name.addChild(n1);
        this.Hero2Name.addChild(n2);
    }
});
