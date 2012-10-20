var Model = require('../Model').Model;
var SecureRequest = require('../Network/SecureRequest').SecureRequest;

exports.Common = {

    /**
     * 未登録者をランディングページに飛ばす
     *
     * @param {Hash} res  サーバーからのレスポンス
     * @return void
     */
    showWelcome: function(res) {},

    /**
     * XHRの例外をキャッチします
     *
     * @param {Hash} res  サーバーからのレスポンス
     * @param {Error} e   例外
     * @return void
     */
    onError: function(res, e) {},

    /**
     * サーバーのリクエスト結果がエラーの場合にコールされます
     *
     * @param {Hash} res  サーバーからのレスポンス
     * @return void
     */
    onFail: function(res) {},

    /**
     * サーバーのリクエスト結果が例外（ポイント不足など）の時にコールされます
     *
     * @param {Hash} res  サーバーからのレスポンス
     * @return void
     */
    onException: function(res, e) {},

    /**
     * リクエスト開始時にコールされます
     *
     * @return void
     */
    onRequestBegin: function() {},

    /**
     * リクエスト完了時にレスポンスの種類によらずコールされます
     *
     * @return void
     */
    onRequestDone: function() {},

    /**
     * リクエストを初期化しセッションを確立する
     *
     * @param {String}  host     HOSTドメイン
     * @param {Hash}    callbacks コールバック関数{success: 成功時, failure: 失敗時, error: エラー時}
     * @return void
     */
    init: function(host, callbacks) {
        SecureRequest.setHost(host);
        if (callbacks.failure) {
            SecureRequest.onFail = callbacks.failure;
        }
        if (callbacks.error) {
            SecureRequest.onError = callbacks.error;
        }
        if (callbacks.maintenance) {
            SecureRequest.showMaintenance = callbacks.maintenance;
        }
        if (callbacks.welcome) {
            GameAPI.showWelcome = callbacks.welcome;
        }
        if (!callbacks.success) {
            throw new Error("GameAPI.init requires callbacks.success");
        }
        SecureRequest.onCreate = callbacks.success;
        SecureRequest.create();
    },

    /**
     * サーバサイドメソッドを呼び出します
     *
     * @param {String}  api       API名
     * @param {Hash}    params    リクエストパラメーター
     * @param {Hash}    callbacks コールバック関数{success: 成功時, failure: 失敗時, error: エラー時, exception: サーバー例外時}
     * @param {string}  method    リクエストメソッド(default: "POST")
     * @param {Request} request   Requestオブジェクト(default: SecureRequest)
     * @return void
     */
    send: function (api, params, callbacks, method, request, options) {
        params    = params    || {};
        callbacks = callbacks || {};
        method    = method    || "POST";
        request   = request   || SecureRequest;

        if (typeof callbacks === "function") {
            callbacks = {success: callbacks};
        }

        callbacks.failure      = callbacks.failure      || exports.Common.onFail;
        callbacks.error        = callbacks.error        || exports.Common.onError;
        callbacks.exception    = callbacks.exception    || exports.Common.onException;
        callbacks.requestBegin = callbacks.requestBegin || exports.Common.onRequestBegin;
        callbacks.requestDone  = callbacks.requestDone  || exports.Common.onRequestDone;

        if (callbacks.requestBegin) {
            callbacks.requestBegin();
        }

        request._doRequest(method, "sp/_" + api, {
            data:    params,
            success: function(r) {
                var res = JSON.parse(r.responseText);

                if (callbacks.requestDone) {
                    callbacks.requestDone();
                }

                if (res._error) {
                    if (callbacks.failure) {
                        callbacks.failure(res);
                    }
                } else if (res.welcome) {
                    GameAPI.showWelcome(res);
                } else if (res.exception) {
                    if (res.t && request._updateDiffOfTime) {
                        request._updateDiffOfTime(res.t);
                    }
                    callbacks.exception(res);
                } else {
                    if (res.t && request._updateDiffOfTime) {
                        request._updateDiffOfTime(res.t);
                    }
                    if (callbacks.success) {
                        callbacks.success(res);
                    }
                }
            },
            failure: function (r) {
                NgLogE("SecureRequest::Response Failure. { status:" + r.status + ", respons:" + r.responseText + " }");
                var res = null;

                if (callbacks.requestDone) {
                    callbacks.requestDone();
                }

                try {
                    res = JSON.parse(r.responseText);
                } catch (e) {}
                res = res || {};
                res._code  = res._code || r.status;
                res._error = true;
                res._message = res._message || r.responseText;
                if (callbacks.failure) {
                    callbacks.failure(res);
                }
            },
            error:  function (r, e) {
                NgLogException(e);

                if (callbacks.requestDone) {
                    callbacks.requestDone();
                }

                if (callbacks.error) {
                    callbacks.error(r, e);
                }
            }
        });
    }
};
