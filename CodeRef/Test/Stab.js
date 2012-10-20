var GameAPI = require('../GameAPI').GameAPI;
var Model = require('../Model').Model;
var Pool = require('../Pool').Pool;
var JSONData  = require('../../NGGo/Service/Data/JSONData').JSONData;

var EPISODES = (function() {
    var ids = [1, 2, 3],
        count      = { 1: 3, 2: 2, 3: 1 },
        res        = {};

    ids.forEach(function(id) {
        res[id] = new Model.Episode({
            id: id,
            name: "episode" + id,
            description: "this is episode" + id,
            user_episode: id === 3 ? null : {
                count: count[id],
                status: id === 2 ? 0 : id === 1 ? 1 : null,
                lock: id === 3
            }
        });
    });

    return res;
})();

var TAG = {
    a: {
        id: 1,
        name: "キン肉マン",
        rarity: 1,
        user: {
            offence: 100,
            defence: 200
        }
    },
    b: {
        id: 3,
        name: "テリーマン",
        rarity: 1,
        user: {
            offence: 150,
            defence: 250
        }
    }
};

var USER = {
    1: new Model.User({
        id: 1000,
        mobage_id: 1234,
        nickname: "TestUser",
        level: 42,
        exp: 87654,
        kkd: 54,
        mission_point: 123,
        mission_stamina: 111,
        max_mission_stamina: 200,
        battle_stamina: 222,
        max_battle_stamina: 300,
        tag: TAG
    })
};

exports.Stab = {
    setup: function (lang) {
        GameAPI.Common.send = function (api, params, callbacks, method, request) {
            if (typeof callbacks === "function") {
                callbacks = {success: callbacks};
            }
            // スタブデータがあれば返す
            var jsondata = new JSONData();
            jsondata.load("./Stab/"+lang+"/"+api+".json", function(err, obj) {
                console.log("Use Stab: ./Stab/"+lang+"/"+api+".json, param: "+JSON.stringify(params));
                if (err) {
                    console.log("Stab Error: "+api);
                    console.log(err);
                    callbacks.success({});
                } else {
                    console.log("Stab Success: "+api);
                    console.log(obj.data);
                    callbacks.success(obj.data);
                }
            });
        };
        GameAPI.init = function (host, cbs) {
            setTimeout(function() {
                cbs.welcome({});
            }, 500);
        };

        // ユーザー
        GameAPI.User.register = function (callbacks) {
            GameAPI.User.getSelfStatus(callbacks);
        };

        GameAPI.User.getItem = function(item_id, callback) {
            GameAPI.User.getItemList(0, function(list){
                for (var i=0; i<list.length; i++) {
                    if (list[i].id == item_id) {
                        callback(list[i]);
                        return;
                    }
                }
            });
        };

        // ミッション
        GameAPI.Mission.getEpisodeList = function(callback) {
            var res = [];

            for (id in EPISODES) {
                res.push(EPISODES[id]);
            }

            callback(res);
        };

        GameAPI.Mission.getMissionList = function(episodeId, callback) {
            var episode, num, missionId, i;

            episodeId = episodeId || 1;
            episode = EPISODES[episodeId];
            episode.missions = [];

            num = 4 - episodeId;

            for (i = 0; i < num; ++i) {
                missionId = episodeId * 10 + i;

                episode.missions.push(new Model.Mission({
                    id: missionId,
                    episode_id: episodeId,
                    name: "mission" + missionId,
                    description: "this is mission " + missionId,
                    consumable_stamina: (i / 2) | 0 + 1,
                    exp: i,
                    exp_bonus: i + 1,
                    max_combined_point: i * 2,
                    complete_num: 4 - i,
                    achivement_rate: 50 - 10 * i,
                    user_mission: {
                        achievement_rate: 100 * (num - i) / num,
                        count: num - i
                    },
                    super_man_to_mission: {
                        max_dropped: 3,
                        has_dropped: 1,
                        info: [i+ 1, i + 2, i + 3].map(function(id) {
                            return {
                                super_man: { id: id },
                                is_got: id == i + 1
                            };
                        })
                    },
                    current: i + 1,
                    total: num
                }));
            }

            episode.missions.user_info = {
                tag: TAG
            };

            Pool.Mine.update(episode.missions.user_info);

            callback(episode);
        };

        GameAPI.Mission.process = function(missionId, callback) {
            var mission, process, events;

            mission = new Model.Mission({
                id: missionId,
                episode_id: 1,
                name: "mission" + missionId,
                description: "this is mission " + missionId,
                consumable_stamina: 5,
                exp: 10,
                exp_bonus: 3,
                max_combined_point: 15,
                complete_num: 1,
                achivement_rate: 50,
                user_mission: {
                    achievement_rate: 60,
                    count: 2
                },
                super_man_to_mission: {
                    max_dropped: 3,
                    has_dropped: 1,
                    info: [1, 2, 3].map(function(id) {
                        return {
                            super_man: { id: id },
                            is_got: id == 1
                        };
                    })
                }
            });

            switch(Math.random() * 10 | 0) {
            case 0: events = [1]; break; // スタミナ切れ
            case 1: events = [2]; break; // クリア
            case 2: events = [3]; break; // レベルアップ
            case 3: events = [4]; break; // 超人に会う
            case 4: events = [5]; break; // レア超人に会う
            case 5: events = [6]; //break; // 他ユーザに会う
            case 6: events = [7]; break; // KKDが100%に
            case 7: events = [2, 1]; break;
            case 8: events = [2, 3]; break;
            case 9: events = [2, 3, 1]; break;
            }

            console.log("events after mission: " + events.join(","));

            process = new Model.Mission.Process({
                transactionId: 123456,
                end_list: events,
                current: 1,
                total: 4,
                process: [{}, {}]
            }, mission);

            callback(process);
        };

        GameAPI.Mission.capture = function(transaction_id, used_glove_num, callback) {
            var res = {
                is_get: true,
                is_update: true,
                capture_num: 1,
                target_num: 3,
                capture: []
            };

            res.capture = [{
                is_get: true,
                is_glove: true,
                super_man: {
                    id: 393,
                    name: "イワオ"
                }
            }, {
                is_get: false,
                is_glove: true,
                super_man: {
                    id: 459,
                    name: "ジェシー・メイビア"
                }
            }];

            callback(res);
        };

        GameAPI.Mission.commit = function(transactionId, callback) {
            callback();
        };

        GameAPI.Mission.requestSecret = function(transactionId, callback) {
            callback();
        };

        GameAPI.Mission.acceptSecret = function(secretId, callback) {
            callback();
        };

        GameAPI.Friend.list = function (callback) {
            var user = USER[1];
            callback([user]);
        };

        GameAPI.Friend.requested = function (callback) {
            var user = USER[1];
            callback([user]);
        };

        GameAPI.Friend.pending = function (callback) {
            var user = USER[1];
            callback([user]);
        };

        GameAPI.Friend.approve = function (id, callback) {
            callback({ result: 'ok' });
        };

        GameAPI.Friend.remove = function (id, callback) {
            callback({ result: 'ok' });
        };

        GameAPI.Friend.reject = function (id, callback) {
            callback({ result: 'ok' });
        };

        // Shop

        GameAPI.Shop.getList = function (category, callback) {
            callback([ITEMS[1], ITEMS[3]]);
        };
    }
};
