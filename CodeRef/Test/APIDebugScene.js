var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var Layer = require("../Layer").Layer;
var Pool = require("../Pool").Pool;

//var Core = require('../../NGCore/Client/Core').Core;
var GameAPI = require('../GameAPI').GameAPI;

var DnListView = require('../../DnLib/Dn/GLUI/ListView').ListView;
var DnButton   = require('../../DnLib/Dn/GLUI/Button').Button;
var URLSprite  = require('../../NGGo/GLUI/Sprite').URLSprite;

exports.APIDebugScene = Scene.subclass({
    classname: "APIDebugScene",
    sceneName: "APIDebugScene",

    onEnter: function(prevScene, option) {
        var _self = this;
        this.list = new DnListView();
        this.list.setItemSize([200, 50]);
        this.list.setFrame([60, 50, 200, 380]);
        this.list.setScrollDirection(DnListView.ScrollDirection.Vertical);

        this._createButton("Mission.getEpisodeList", function () {
            GameAPI.Mission.getEpisodeList(function(rs) {
                console.log(JSON.stringify(rs));
            });
        });

        this._createButton("Mission.getMissionList", function () {
            GameAPI.Mission.getMissionList(1, function(rs) {
                console.log(JSON.stringify(rs));
                _self.mission = rs.missions[0];
            });
        });

        this._createButton("Mission.process", function () {
            GameAPI.Mission.process(_self.mission.id, function(rs) {
                console.log(JSON.stringify(rs));
                _self.mission_process = rs;
                _self.mission_process.setMission(_self.mission);
            });
        });

        this._createButton("Mission.click", function () {
            if (!_self.mission_process) {
                console.log("none");
                return;
            } else if (_self.mission_process.hasNextProcess()) {
                console.log("process");
                console.log(JSON.stringify(_self.mission_process.nextProcess().getChange()));
                console.log(JSON.stringify(Pool.Mine));
            } else if (_self.mission_process.hasNextEvent()) {
                console.log("event");
                console.log(JSON.stringify(_self.mission_process.nextEvent()));
                console.log(JSON.stringify(Pool.Mine));
            }
        });

        this._createButton("Mission.commit", function () {
            GameAPI.Mission.commit(_self.mission_process.transactionId, function(rs) {
                console.log(JSON.stringify(rs));
            });
        });

        this._createButton("Mission.capture", function () {
            GameAPI.Mission.capture(_self.mission_process.transactionId, 0, function(rs) {
                console.log(JSON.stringify(rs));
            });
        });

        this._createButton("Mission.requestSecret", function () {
            GameAPI.Mission.requestSecret(_self.mission_process.transactionId, function(rs) {
                console.log(JSON.stringify(rs));
            });
        });

        this._createButton("User.getTagHeroList", function () {
            GameAPI.User.getTagHeroList(Pool.Mine.tag.b.status.seq_id, "all", function(rs) {
                _self.heros = rs;
                var hero = null;
                for (var i=0; i < rs.length; i++) {
                    hero = rs[i];
                    console.log([hero.id, hero.name, hero.status.seq_id, hero.status.level].join(" : "))
                }
            });
        });

        this._createButton("User.changeTagHero", function () {
            if (!_self.heros) {
                return;
            }
            var new_hero = _self.heros[(Math.random() * _self.heros.length | 0 + 1)];
            GameAPI.User.changeTagHero(Pool.Mine.tag.b.status.seq_id, new_hero.status.seq_id, function(rs) {
                console.log(JSON.stringify(rs));
            });
        });

        this._createButton("Combine.getBaseList", function () {
            GameAPI.Combine.getBaseList(0, function(rs) {
                console.log(JSON.stringify(rs));
            });
        });

        this._createButton("Combine.getElementList", function () {
            var base_hero = Pool.Mine.tag.a;
            GameAPI.Combine.getElementList(base_hero.status.seq_id, 0, false, function(rs) {
                console.log(JSON.stringify(rs));
                _self.element_ids = [];
                for (var i=0; i < rs.length; i++) {
                    if (_self.element_ids.length > 0 && Math.random() > 0.2) {
                        continue;
                    }
                   _self.element_ids.push(rs[i].status.seq_id);
                }
            });
        });

        this._createButton("Combine.process", function () {
            var base_hero = Pool.Mine.tag.a;
            var element_ids = _self.element_ids;
            console.log("Combine.process: " + element_ids.join(","));
            GameAPI.Combine.process(base_hero.status.seq_id, element_ids, function(rs) {
                _self.combine_process = rs;
                console.log(JSON.stringify(rs));
            });
        });

        this._createButton("Combine.commit", function () {
            GameAPI.Combine.commit(_self.combine_process.process_id, _self.combine_process.is_multi, function(rs) {
                console.log(JSON.stringify(rs));
            });
        });


        Layer.addRootChild(this.list, Layer.Depth.TOP);
    },

    onExit: function(nextScene, option) {
        Layer.removeRootChild(this.list);
        this.list.destroy();

        this.controller = null;
    },

    _createButton: function(label, func) {
        var bg = new URLSprite();
        var btn = new DnButton();
        bg.setImage('./Content/blank.png', [200, 50], [0, 0]);
        bg.setPosition(0,0);
        //bg.setColor("666666");

        btn.setFrame([5, 5, 190, 40]);
        btn.setImage('./Content/blank.png');
        btn.setText(label);
        btn.setTextColor(0, 0, 0);
        //btn.setSize(14);
        btn.onclick = func;
        bg.addChild(btn);
        this.list.addItem(bg, [btn]);
        return bg;
    }

});

