var Common = require('./Common').Common;
var Model = require('../Model').Model;
var Pool = require('../Pool').Pool;

var SELECT_STYLE = Model.Hero.SELECT_STYLE;

var Combine = {

    /**
     * ベース超人候補一覧
     *
     * @patam {Integer} style   (all|1|2|3)
     * @param {Function} callback
     */
    getBaseList: function(style, callback) {
        style = style || SELECT_STYLE.ALL;
        Common.send("combine_bases", {style: style}, function(res) {
            callback(res.list.map(function(v){
                return new Model.Hero(v);
            }));
        });
    },

    /**
     * 素材超人候補一覧
     *
     * @patam {Integer} base_id ベース超人のstatus.seq_id
     * @patam {Integer} style   (all|1|2|3)
     * @patam {Boolean} is_multi 
     * @param {Function} callback
     */
    getElementList: function(base_id, style, is_multi, callback) {
        style = style || SELECT_STYLE.ALL;
        is_multi = is_multi || false;
        Common.send("combine_list", {id: base_id, style: style, is_multi: is_multi}, function(res) {
            Pool.Mine.update(res.user_info);
            callback({
                status: true, // TODO ベース超人がすでに合成済みなどエラーのときはfalse
                basehero: new Model.Hero(res.base_superman),
                list: res.list.map(function(v){
                    return new Model.Hero(v);
                })
            });
        });
    },

    /**
     * 合成プロセスの開始
     * 合成ポイントの確認、合成可能かどうかの確認に使います
     *
     * @patam {Integer} base_id ベース超人のstatus.seq_id
     * @patam {Array} element_ids 素材超人のstatus.seq_idのリスト 
     * @param {Function} callback
     */
    process: function(base_id, element_ids, callback) {
        if (!Array.isArray(element_ids)) {
            element_ids = [element_ids];
        }
        Common.send("combine_process", {id: base_id, elms: element_ids.join(",")}, function(res) {
            console.log(JSON.stringify(res));
            Pool.Mine.update(res.data.user_info);
            var process = {
                is_multi       : res.is_multi == 1,
                base_id        : res.data.base_seq_id,
                element_ids    : res.data.material_seq_ids,
                combined_point : ~res.data.consumable_combined_point,
                process_id     : res.data.token,
                num            : ~res.data.num,
                fever_flag     : res.data.fever_flag == 1,
                is_updated     : res.data.is_updated == 1
            };
            callback(process);
        });
    },

    /**
     * 合成実行
     *
     * @patam {String} process_id Combine.process の結果のtoken
     * @patam {Boolean} is_multi  Combine.process の結果のis_multi
     * @param {Function} callback
     */
    commit: function(process_id, is_multi, callback) {
        Common.send("combine_commit", {id: process_id, is_multi: is_multi}, function(res) {
            console.log(JSON.stringify(res));
            callback(res);
        });
    }
};
Combine.SELECT_STYLE = SELECT_STYLE;
exports.Combine = Combine;
