var Common = require('./Common').Common;
var Model = require('../Model').Model;
var Pool = require('../Pool').Pool;

exports.Battle = {

    join: function (callback) {
        Common.send("battle_join", {}, function(res) {
            callback(new Model.Battle.Area(res));
        });
    },

    getInfo: function(callback) {
        Common.send("battle_info", {}, function(res) {
            callback(new Model.Battle.Area(res));
        });
    },

    getList: function(callback) {
        Common.send("battle_list", {}, function(res) {
            var area = new Model.Battle.Area(res),
                list = res.list.map(function(v) {
                    return new Model.User(v);
                });
            Pool.Mine.update(res.user_info || {});
            callback({area: area, list: list});
        });
    },

    start: function(callback) {
        callback({status: true});
    }
};
