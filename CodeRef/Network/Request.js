var Core = require('../../NGCore/Client/Core').Core;
var XHR = require('../../NGCore/Client/Network/XHR').XHR;

// this class is copy from DnLib/Dn/Network/Request

exports.Request = Core.MessageListener.subclass({
    classname: 'Request',

    /**
     * Request to Game Server.
     * @class This is the basic Server Request class.  
     * @param {String} host リクエスト送信先の設定。
     */
    initialize: function (host) {
        if (host) {
            this.setHost(host);
        }
        this.opts = {
            isAsync: true
        };
    },
    setHost: function(host) {
        if (!host.match(/\/$/)) {
            host += "/";
        }
        this.host = host;
    },

    /**
     * GETリクエストを送信する
     * @param {String} uri Request uri
     * @param {Hash} uri Options(data, success, failure, error, headers, isJson)
     * @type void
     */
    get: function(uri, opts) {
        this._doRequest('GET', uri, opts);
    },
    /**
     * POSTリクエストを送信する
     * @param {String} uri Request uri
     * @param {Hash} uri Options(data, success, failure, error, headers, isJson)
     * @type void
     */
    post: function(uri, opts) {
        this._doRequest('POST', uri, opts);
    },
    /**
     * Set Option Pparameter
     * @param {String} key Option key
     * @param {Hash} value Option value
     * @type void
     */
    setOption: function(key, value) {
        this.opts[key] = value;
    },
    /**
     * show maintenance page when if response status code is 503
     * @param {XHR} XHR instance 
     * @param {Hash} uri Options(data, success, failure, error, headers, isJson)
     */
    showMaintenance: function(request, opts) {
    },
    /**
     * リクエストを送信する
     * @param {String} method Request method
     * @param {String} uri Request uri
     * @param {Hash} uri Options(data, success, failure, error, headers, isJson, isAsync)
     * @type void
     * @protected 
     */
    _doRequest: function (method, uri, opts) {
        var _self = this,
            request = new XHR(),
            url = '', 
            o = '';

        if (!opts) {
            opts = {};
        }
        for (o in this.opts) {
            if(opts[o] === undefined) {
                opts[o] = this.opts[o];
            }
        }

        if (this.host) {
            url += this.host;
        }
        url += uri;

        var param = this._makeParam(opts.data);
        if (method === 'GET') {
            url += '?' + param;
        }

        request.onreadystatechange = function () {
            var success = 0;
            try {
                success = request.readyState === 4;
            } catch (ex) {
                if (opts.error) {
                    opts.error(request, ex);
                    return;
                } else {
                    NgLogException (ex);
                }
            }

            if (success) {
                if (request.status === 200) {
                    if (opts.success) {
                        opts.success(request);
                    }
                } else if (request.status === 503 && request.responseText) {
                    // サーバメンテナンスの表示
                    _self.showMaintenance(request, opts);
                } else {
                    if (opts.failure) {
                        opts.failure(request);
                    }
                }
            }
            if (opts.onreadystatechange) {
                opts.onreadystatechange(request);
            }
        };

        NgLogD("doRequest: [" + method + "] " + url + " param: " + param);
        
        request.open( method, url, opts.isAsync );

        if (opts.headers) {
            for (var h in opts.headers) {
                request.setRequestHeader (h, headers[ h ]);
            }
        }

        if (method === 'POST') {
            // post JSON
            if (opts.isJson && param) {
                request.setRequestHeader("Content-type", "application/json");
                param = JSON.stringify(opts.data);
            } else {
                request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            }
            request.send(param);
        } else {
            request.send (null);
        }
    },
    /**
     * HashからURIパラメータを生成する
     * @param {Hash} data Options(data, success, failure, error, headers, isJson)
     * @type void
     */
    _makeParam: function (data) {
        if (!data) {
            return '';
        }
        var params = [];
        for (key in data) {
            params.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
        }
        return params.join('&');
    }
});

