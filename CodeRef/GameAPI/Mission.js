var Common = require('./Common').Common;
var Model = require('../Model').Model;
var Pool = require('../Pool').Pool;

exports.Mission = {

    /**
     * エピソード一覧を取得します。
     * 各エピソードにはMissionは含まれません
     * クリア済みの全エピソードと現在のエピソード、ロックされた次のエピソードが含まれます
     *
     * @param {Function} callback(episodeList)
     * Episode is [<Model.Episode>, <Model.Episode>, ...]
     */
    getEpisodeList: function(callback) {
        Common.send("episode_list", {}, function(res) {
            callback(res.list.map(function(v) {
                return new Model.Episode(v);
            }));
        });
    },

    /**
     * エピソードを取得します。
     * エピソードにはMission情報も含まれます
     *
     * @param {Number} episode_id episode_id を指定しない場合はカレントエピソードを返します
     * @param {Function} callback(<Episode>)
     */
    getMissionList: function(episode_id, callback) {
        var params = {};

        if (episode_id) {
            params.id = episode_id;
        }

        Common.send("mission_list", params, function(res) {
            Pool.Mine.update(res.user_info);
            callback(new Model.Episode(res));
        });
    },

    // getMissionのエイリアスです
    getEpisode: function(episode_id, callback) {
        exports.Mission.getMissionList(episode_id, callback);
    },

    /**
     * ミッションプロセスを取得します。
     * 次のイベントまでの行程リストを取得します
     *
     * @param {Number} mission_id
     * @param {Function} callback(<Episode>)
     */
    process: function(mission_id, callback) {
        Common.send("mission_process", {id: mission_id}, function(res) {
            callback(new Model.Mission.Process(res));
        });
    },

    /**
     * ミッションプロセスを確定しサーバーに通知します
     * 次のイベントまでの行程リストを取得します
     *
     * @param {String} transaction_id
     * @param {Function} callback(<Episode>)
     */
    commit: function(transaction_id, callback) {
        Common.send("mission_commit", {id: transaction_id || null}, function(res) {
            Pool.Mine.update(res.user_info);
            callback(res.result);
        });
    },

    /**
     * 捕獲を実行する
     *
     * @param {String} transaction_id
     * @param {Integer}  used_glove_num
     * @param {Function} callback(<Episode>)
     */
    capture: function(transaction_id, used_glove_num, callback) {
        Common.send("capture_commit", {id: transaction_id, gnum: used_glove_num || 0}, function(res) {
            if (!res._error) {
                res.is_get      = !+res.is_get;
                res.is_update   = !+res.is_update;
                res.capture_num = ~~res.capture_num;
                res.target_num  = ~~res.target_num;
                for (var k in res.capture) {
                    res.capture[k].is_get   = !+res.capture[k].is_get;
                    res.capture[k].is_glove = !+res.capture[k].is_glove;
                }
            }
            callback(res);
        });
    },

    /**
     * Processのイベントで発生した秘密特訓をします
     *
     * @param {String} transaction_id
     * @param {Function} callback({data})
     */
    requestSecret: function(transaction_id, callback) {
        Common.send("secret_request", {id: transaction_id}, function(res) {
            callback(res);
        });
    },

    /**
     * 申請された秘密特訓を受けます
     *
     * @param {String} secret_id 申請ID
     * @param {Function} callback({data})
     */
    acceptSecret: function(secret_id, callback) {
        Common.send("secret_accept", {id: secret_id}, function(res) {
            callback(res);
        });
    },

    /**
     * 申請された秘密特訓の詳細を見ます
     *
     * @param {String} secret_id 申請ID
     * @param {Function} callback({data})
     */
    getSecret: function(secret_id, callback) {
        Common.send("secret_show", {id: secret_id}, function(res) {
            callback(res);
        });
    },

    /**
     * ボス情報を取得します
     *
     * @param {String} front 先行超人 "a" or "b"
     * @param {Function} callback({data})
     */
    getBoss: function(front, callback) {
        var switched = false;

        if (front === "b" || front === "B") {
            switched = true;
        }

        Common.send("boss_show", {"switch": switched}, function(res) {
            if (res.friend) {
                res.friend.tag = {
                    a: res.friend.super_man_a,
                    b: res.friend.super_mbn_b
                };
            }

            callback({
                friend: res.friend ? new Model.User(res.friend) : undefined,
                user: new Model.User(res.self),
                boss: new Model.Boss({
                    user_boss: res.user_boss,
                    super_man: { id: res.boss.super_man_id || 100 },
                    exp: res.boss.exp,
                    threshold_base: res.boss.threshold_base,
                    threshold: res.boss.threshold,
                    coefficient: res.boss.coefficient
                })
            });
        });
    },

    /**
     * ボス戦の進行状況を取得します
     *
     * @param {String} front 先行超人 "a" or "b"
     * @param {Function} callback({data})
     */
    processBoss: function(front, callback) {
        var switched = false;

        if (front === "b" || front === "B") {
            switched = true;
        }

        Common.send("boss_process", {"switch": switched}, function(res) {
            Pool.Mine.update(res.process.self.user);
            callback(new Model.BossProcess(res));
        });
    },

    /**
     * ボス戦の結果を送信します
     *
     * @param {String} transaction_id
     * @param {Boolean} is_win 勝敗
     * @param {Boolean} is_use
     * @param {Function} callback({data})
     */
    commitBoss: function(transaction_id, is_win, is_use, callback) {
        Common.send("boss_commit", {
            id: transaction_id,
            is_win: is_win,
            is_use: is_use
        }, function(res) {
            var bpBefoe = Pool.Mine.battle_stamina,
                userData = res.self.user;

            // userData.tag = {
            //     a: res.self.user_super_man_a,
            //     b: res.self.user_super_man_b
            // };
            Pool.Mine.update(userData);

            callback({
                isWin: res.win,
                boss: new Model.Boss(res.boss),
                episodeId: res.episode_id,
                transactionId: res.token,
                battleStamina: {
                    before: bpBefoe,
                    after: Pool.Mine.battle_stamina
                }
            });
        });
    }
};
