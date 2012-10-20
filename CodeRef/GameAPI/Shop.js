var Core   = require('../../NGCore/Client/Core').Core;
var Bank   = require('../../NGCore/Client/Bank').Bank;
var Common = require('./Common').Common;
var Model  = require('../Model').Model;

var _PaymentTransaction = Core.Class.subclass({

    classname: "_PaymentTransaction",

    initialize: function(itemId, transactionId) {
        this._itemId = itemId || 0;
        this._id     = transactionId || "";
        this._sdkresponse = {};
    },

    create: function (itemId, num, callback) {
        var _self = this;
        if (typeof itemId === "function") {
            callback = itemId;
            itemId = undefined;
        }
        _self._itemId = itemId || _self._itemId;
        if (!_self._itemId) {
            throw new Error("Transaction.create is must be use itemId");
        }
        Common.send("shop_transaction", {id: _self._itemId, num: num}, function (res) {
            _self._id = res.transaction.id;
            NgLogD("Bank.transaction id = "+_self._id);
            callback();
        });
    },

    // メソッド名についてはcontinueが予約語なのでご勘弁
    continueSDK: function(callback) {
        var _self = this;
        if (!_self._id) {
            throw new Error("Transaction.continueSDK must be use transactionId. you call create at first befor this method call.");
        }
        Bank.Debit.continueTransaction(_self._id, function(error, transaction) {
            if (error) {
                NgLogE(error);
            }
            _self._sdk_response = transaction;
            callback();
        });
    },

    commit: function(callback) {
        var _self = this;
        if (!_self._sdk_response.id) {
            throw new Error("you must be call continueSDK at first befor this method call.");
        }
        Common.send("shop_commit", {id: _self._id}, function (res) {
            if (res.state === "closed") {
                callback(res);
            } else {
                NgLogD(JSON.stringify(res));
                _self.onError(res);
            }
        });
    },

    onError: function(error) {
    }
});

exports.Shop = {
    /* Internal classes */
    PaymentTransaction: _PaymentTransaction,

    /* static functions */
    getItem: function(item_id, callback) {
        Common.send("shop_show", {id: item_id}, function(res) {
            callback(new Model.Item(res.item));
        });
    },

    getList: function(category, callback) {
        category = category || 0;
        Common.send("shop_list", {category: category}, function(res) {
            callback(res.list.map(function (v) {
                return new Model.Item(v);
            }));
        });
    },

    payment: function(item_id, num, callback, onError) {
        var transaction = new _PaymentTransaction();
        if (onError) {
            transaction.onError = onError;
        }
        transaction.create(item_id, num, function () {
            transaction.continueSDK(function() {
                transaction.commit(function(res) {
                    callback(new Model.Item(res.item));
                });
            });
        });
    } 
};

