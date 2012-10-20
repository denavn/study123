var Common = require('./Common').Common;
var Model = require('../Model').Model;
var Pool = require('../Pool').Pool;

exports.User = {

    /**
     * 登録する
     *
     * @param {Function} callback [{Model.User}]
     */
    register: function(callback) {
        Common.send("register", {}, function(res) {
            Pool.Mine.update(res.user);
            callback(Pool.Mine);
        });
    },

    /**
     * 利用者自身の情報
     *
     * @param {Function} callback [{Model.User}]
     */
    getSelfStatus: function(callback) {
        Common.send("get_user_status", {}, function(res) {
            Pool.Mine.update(res.user);
            callback(Pool.Mine);
        });
    },

    /**
     * 特定のユーザーの情報
     *
     * @param {Integer} user_id
     * @param {Function} callback [{Model.User}]
     */
    getUserStatus: function(user_id, callback) {
        Common.send("get_user_status", {id: user_id}, function(res) {
            var user = new Model.User(res.user);
            callback(user);
        });
    },

    /**
     * マイページに表示するべき情報をとってくる
     *
     * @param {Function} callback [{user: {Model.User}, feeds: {Array}]
     */
    getMypageInfo: function(callback) {
        Common.send("mypage", {}, function(res) {
            Pool.Mine.update(res.user);
            var feeds = (res.has_feed == 1) ? res.enum_feed : [];
            callback({user: Pool.Mine, feeds: feeds});
        });
    },

    /**
     * アイテムを利用する
     *
     * @param {Integer} item_id
     * @param {Function} callback [{Model.Item}]
     */
    useItem: function(item_id, callback) {
        Common.send("item_use", {id: item_id}, function(res) {
            if (res.user) {
                Pool.Mine.update(res.user);
            }
            callback(new Model.Item(res.item));
        });
    },

    /**
     * アイテム情報を取得する
     *
     * @param {Integer} item_id
     * @param {Function} callback [{Model.Item}]
     */
    getItem: function(item_id, callback) {
        Common.send("item_show", {id: item_id}, function(res) {
            if (res.user) {
                Pool.Mine.update(res.user);
            }
            callback(new Model.Item(res.item));
        });
    },

    /**
     * アイテム一覧を取得する
     *
     * @param {Integer} item_id
     * @param {Function} callback Array([{Model.Item},...]
     */
    getItemList: function(category, callback) {
        category = category || 0;
        Common.send("item_list", {category: category}, function(res) {
            if (res.user) {
                Pool.Mine.update(res.user);
            }
            callback(res.list.map(function (v) {
                return new Model.Item(v);
            }));
        });
    },

    /**
     * タッグを交代する
     *
     * @param {Integer} change_hero_id 交代する超人のseq_id
     * @param {Integer} new_hero_id  新しい超人のseq_id
     * @param {Function} callback success: bool
     */
    changeTagHero: function(change_hero_id, new_hero_id, callback) {
        var tag   = Pool.Mine.tag,
            slot  = (tag.a.status.seq_id === change_hero_id) ? "a" : "b",
            part  = tag[(slot=="a"?"b":"a")],
            param = {
                old_id:  change_hero_id,
                new_id:  new_hero_id,
                part_id: part.status.seq_id,
                slot:    slot
            };

        Common.send("tag_commit", param, function(res) {
            if (res.user_info) {
                Pool.Mine.update(res.user_info.user);
            }
            callback({success: Pool.Mine.tag[slot].status.seq_id == new_hero_id});
        });

    },

    /**
     * タッグを交代する候補の超人リストを取得する
     *
     * @param {Integer} change_hero_id 交代する超人のseq_id
     * @param {style} 絞り込み種類 (all,1,2,3)
     * @param {Function} callback Array([{Model.Hero},...]
     */
    getTagHeroList: function(change_hero_id, style, callback) {
        var tag   = Pool.Mine.tag,
            slot  = (tag.a.status.seq_id === change_hero_id) ? "a" : "b",
            part  = tag[(slot=="a"?"b":"a")],
            param = {
                id:           change_hero_id,
                part_id:      part.status.seq_id,
                part_hero_id: part.id,
                style:        style | Model.Hero.SELECT_STYLE.ALL 
            };

        Common.send("tag_list", param, function(res) {
            var heroes = res.list.map(function (v) {
                return new Model.Hero(v);
            });
            // res.current_hero <- いらない?
            callback(heroes);
        });

    },

    getHeroCollection: function(rarity, page, callback) {
        var param = {
            rarity: rarity || 1,
            page:   page   || 1,
        };
        Common.send("hero_collection", param, function(res) {
            var collection = res.collection.map(function (v) {
                return new Model.Hero(v);
            });
            callback(collection);
        });
    },

    getSkillCollection: function(rarity, page, callback) {
        var param = {
            rarity: rarity || 1,
            page:   page   || 1,
        };
        Common.send("move_collection", param, function(res) {
            var collection = res.collection.map(function (v) {
                return new Model.Skill(v);
            });
            callback(collection);
        });
    },

    getComboCollection: function(page, callback) {
        var param = {
            page:   page   || 1,
        };
        Common.send("combo_collection", param, function(res) {
            var collection = res.collection.map(function (v) {
                return new Model.Skill(v);
            });
            callback(collection);
        });
    }
};
