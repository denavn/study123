var LifecycleEmitter = require('../../NGCore/Client/Device/LifecycleEmitter').LifecycleEmitter;
var Core = require('../../NGCore/Client/Core').Core;
var Social = require('../../NGCore/Client/Social').Social;
var toMD5 = require('../../NGCore/Shared/Lib/md5').toMD5;
var Request = require('./Request').Request;

exports.SecureRequest = Request.singleton({

    classname: "SecureRequest",

    initialize: function ($super, host) {
        NgLogD("{SecureRequest} initialize");
        $super(host);

        this.sessionId   = "";
        this.verifier    = "";
        this.mobageId    = 0;
        this.nickname    = ""; 
        this.createTime  = Date.now();
        this.diffOfTime  = 0;
        this.onReAuth    = null;
        this.onAuthError = null;
        this.onCreate    = null;
        this.checkIntervalMinutes = 50;
    },

    getSessionId: function() {
        return this.sessionId;
    },

    getCurrentMobageId: function() {
        return this.mobageId;
    },

    getCurrentNickname: function() {
        return this.nickname;
    },

    getNow: function() {
        return Date.now() - this.diffOfTime;
    },

    getEpoch: function() {
        return (this.getNow() / 1000) | 0;
    },

    setOnReAuth: function(callbackFunc) {
        this.onReAuth = callbackFunc;
    },

    setOnAuthError: function(callbackFunc) {
        this.onAuthError = callbackFunc;
    },

    create: function() {
        var _self = this;
        Social.Common.People.getCurrentUser(["id", "nickname"], function(error, user) {
            if (!error) {
                _self.mobageId = parseInt(user.id);
                _self.nickname = user.nickname;
                NgLogD("People.getCurrentUser() User ["+ _self.mobageId + ", " + _self.nickname +"]");
                _self._startAuth();
            } else {
                NgLogE("People.getCurrentUser() Error [" + error.errorCode + "] : " + error.description);
                if (_self.onAuthError) {
                    _self.onAuthError(error);
                }
            }
        });
    },

    isExpiered: function() {
        var diffSec = (Date.now() - this.createTime) / 1000;

        if (diffSec > this.checkIntervalMinutes * 60 ) {
            return true;
        }
        return false;
    },

    onFail : function(request) {
        NgLogE("[MobageAPI] fail : "+ request.responseText);
    },

    onError : function(request, e) {
        NgLogException(e);
        NgLogE("[MobageAPI] error : "+ request.responseText);
    },
    
    _startAuth: function() {
        NgLogD("{SecureRequest} :: Start Auth");
        var _self = this,
            _request = new Request(this.host);

        _request.get("sp/_start_session", {
            success : function (request){
                try {
                    respons = JSON.parse(request.responseText);
                    _self._authToken(respons);
                } catch (e) {   // SyntaxError: Unexpected token ILLEGAL
                    NgLogException(e);
                    _self.onError(request, e);
                }
            },
            failure:  function(request) {
               _self.onFail(request);
            },
            error: function(request, e) {
               _self.onError(request, e);
            }
        });
        
    },

    _reAuth: function() {
        NgLogD("*** re authorize start");
        this.createTime = -1;
        this._startAuth();
    },

    _reAuthWithFlgCheck : function(){
        var _self = this;
        if(_self.createTime > 0) {
            _self._reAuth();
        }
    },

    _authToken : function(respons) {
        var _self = this;
        var oauth_token = respons.token;
        Social.Common.Auth.authorizeToken(oauth_token, function (error, verifier) {
            NgLogI("[MobageAPI] oauth_token        =" + oauth_token);
            NgLogI("[MobageAPI] verifier           =" + verifier);

            if (error) {
                NgLogE("[MobageAPI] Social.Common.Auth.authorizeToken error :" + JSON.stringify(error));
                if (_self.onAuthError) {
                    _self.onAuthError(error);
                }
                return;
            }
            
            var _request = new Request(_self.host);
            _self.verifier = verifier;

            _request.post("sp/_get_session_id", {
                data:    {
                    token:       respons.token,
                    verifier:    verifier,
                    device_id:   Core.Capabilities.getUniqueId(),
                    sdk_version: Core.Capabilities.getSDKVersion(),
                },
                success: function(request) {
                    NgLogD("getSessionId success  JSON "+request.responseText);
                    var res = JSON.parse(request.responseText);
                    NgLogD("getSessionId success  session id = "+res.token);

                    _self._updateDiffOfTime(res.t);
                    _self.sessionId  = res.token;
                    _self.createTime = Date.now();

                    if (_self.createTime == -1) {
                        // アクセストークン再取得時
                        if (_self.onReAuth) {
                            _self.onReAuth(request);  
                        }
                    } else if (_self.onCreate) {
                        // 起動時の認証時
                        _self.onCreate(request);
                        _self._startCheckAccessToken();
                    }
                },
                failure:  function(request) {
                   _self.onFail(request);
                },
                error: function(request, e) {
                   _self.onError(request, e);
                }
            });
        });
    },

    _updateDiffOfTime: function(serverTime){
        serverTime *= 1000;
        var localTime = Date.now();
        this.diffOfTime = localTime - serverTime;
        NgLogD("_updateDiffOfTime, localTime: "+localTime+", serverTime: "+serverTime+", diffOfTime"+this.diffOfTime);
    },

    _startCheckAccessToken: function(){
        var _self = this;
        try {
            LifecycleEmitter.addListener(_self, function(ev) {
                NgLogD("{SecureRequest} LifecycleEmitter callback event = " + ev);
                switch (ev) {
                case LifecycleEmitter.Event.Resume:
                    if (_self.isExpiered()) {
                        _self._reAuthWithFlgCheck();
                    }
                    break;
                case LifecycleEmitter.Event.Suspend:
                case LifecycleEmitter.Event.Terminate:
                }
            });
        } catch (e) {
            // クリティカルではないと思うのでログのみ
            NgLogException(e);
        }
        setInterval(function() {
            _self._reAuthWithFlgCheck();
        }, _self.checkIntervalMinutes * 60 * 1000);
    },
    
    _createToken: function(method, uri, params) {
        var now = this.getEpoch();
        if (uri.charAt(0) != '/') {
            uri = '/' + uri;
        }
        return now + ":" + toMD5([now, this.sessionId, this.mobageId, this.verifier, method, uri].join(":"));
    },

    // @override
    _doRequest: function ($super, method, uri, opts) {
        var _self = this;
        if (_self.sessionId === "") {
            throw new Error("SecureRequest doesn't set sessionId.");
        }
        opts.data = opts.data || _self.opts.data;
        opts.data.token = _self._createToken(method, uri);
        opts.data.session = _self.sessionId;
        $super(method, uri, opts);
    }

});

