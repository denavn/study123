var Common = require('./Common').Common;
var Model = require('../Model').Model;

exports.Friend = {
    /*
     * 友達一覧の取得
     *
     * @param {Function} callback [{Model.User}]
     */
    list: function (callback) {
        Common.send("friend_list", {}, function (res) {
            // 友達がいない場合はnull?
            if (res.friends) {
                var list = res.friends.map(function (v) {
                    return new Model.User(v);
                });
                callback(list);
            } else {
                callback([]);
            }
        });
    },

    /*
     * 自分が友達申請中のユーザ一覧の取得
     * @param {Function} callback [{Model.User}]
     */
    requested: function (callback) {
        Common.send("friend_requested_list", {}, function (res) {
            // 友達がいない場合はnull?
            if (res.friends) {
                var list = res.friends.map(function (v) {
                    return new Model.User(v);
                });
                callback(list);
            } else {
                callback([]);
            }
        });
    },

    /*
     * 自分に友達申請を行っているユーザ一覧の取得
     * @param {Function} callback [{Model.User}]
     */
    pending: function (callback) {
        Common.send("friend_pending_list", {}, function (res) {
            // 友達がいない場合はnull?
            if (res.friends) {
                var list = res.friends.map(function (v) {
                    return new Model.User(v);
                });
                callback(list);
            } else {
                callback([]);
            }
        });
    },

    approve: function (id, callback) {
        Common.send("friend_approve", { id: id }, function (res) {
            callback(res);
        });
    },

    /*
     * 友達から削除
     */
    remove: function (id, callback) {
        Common.send("friend_remove", { id: id }, function (res) {
            callback(res);
        });
    },

    /*
     * 友達申請を拒否/取り下げ
     */
    reject: function (id, callback) {
        Common.send("friend_reject", { id: id }, function (res) {
            callback(res);
        });
    }
};
