var Class = require("./Class").Class;
var NgPipesRemote = require('./NgPipesRemote').NgPipesRemote;
var hex_sha1 = require('./Lib/sha1').hex_sha1;
var __hasProp = Object.prototype.hasOwnProperty;
var CapabilitiesReq = require('../Client/Core/Capabilities');
var KeyValueCache = require('../Client/Storage/KeyValue').KeyValueCache;

/*
The NgPipes object
*/

var NgPipe = Class.subclass({
    classname: "NgPipe",
    initialize: function(options) {
        options = options || {};
		var Capabilities = CapabilitiesReq.Capabilities;
		/*
		 * Note that this require statement cannot be put at the top level
		 * because it will cause code to fail to execute.  It's an intricacy
		 * in our require system.
		 */
		this._socAnalytics = require('../Client/Social').Social.Common.Analytics;
        this._meta = options.meta || {};
        this._queue = null;
        this._isSendQueued = false;
        this._sendDelay = options.sendDelay || 1000;
		this.UTCoffset = options.offset || 0;
		this.timeQueue = []; // Queue to hold items not yet ready for send. holds {msg:message,time:deviceTime} objects.
        this._meta = options.meta || {};
        this._seqStart = options.seqStart || new Date().getTime();
        this._playerState = options.playerState || null;
        this._seqNumber = options.seqNumber || 0;
        this._allowedLargeValue = {
            msg: 1024 * 5,
            err: 1024 * 5,
            sid: 64,
            udid: 64
        };

		this._waitForUTC = Capabilities.meetsBinaryVersion && Capabilities.meetsBinaryVersion("1.3.5.8");

        this._sendToRemote = true;
        this._globalKey = '__PipeKey';
        var self = this;
        var cb = function(error,value, key) {
            var new_queue = [];
            if (!error) {
                try {
                    new_queue = JSON.parse(value);
                } catch(e) {
                    new_queue = [];
                }
            }

            if (self._queue) {
                new_queue = self._queue.concat(new_queue);
            }

            self._setQueue(new_queue);
            if (self._queue.length > 0 ){
                self._drainQueue();
            }
        };
        this._locListener = null;
        this._location = null;
        KeyValueCache.global(this._globalKey).getItem(this._globalKey, {}, cb);
        var starting_queue = [].concat(options.queue || []);
        this._queue = starting_queue;
        this._sessionEnded = false;
        this._capAlphaNumStringKeys = ['afam', 'asku', 'srcty', 'evcl', 'evid', 'pltfmsku','carr','srv'];
        this.sessionStartEvent();
        this._tagQa();
        this._hookLifetime();
        this._hookGeo();
        return true;
    },

    close: function() {
        this._drainQueue();
        return true;
    },

    enable: function() {
        this._sendToRemote = true;
    },

    disable: function() {
        this._sendToRemote = false;
    },

    setRemoteUrl: function(url) {
        NgPipesRemote.setUrl(url);
    },

    playerEvent: function(eventId, evcl, change, playerState) {
        var e;
        evcl || (evcl = "PLST");
        e = {
            change: change,
            srcty: 'GC',
            evid: eventId,
            evcl: evcl,
            plst: this._getPlayerStateDiff(playerState || this._playerState)
        };
        this._queueMessage(e);
        this._setCurrentPlayerState(playerState);
        return e;
    },
    gameEvent: function(eventId, payload, playerState) {
        var e;
        e = {
            evid: eventId,
            evpl: payload,
            srcty: 'GC',
            evcl: 'GAME'
        };

        if (playerState) {
          e.plst = this._getPlayerStateDiff(playerState || this._playerState);
        }
        this._queueMessage(e);
        return e;
    },
    gameOpsEvent: function(eventId, payload) {
        var e;
        e = {
            evid: eventId,
            evpl: payload,
            srcty: 'GC',
            evcl: 'GAMEOPS'
        };
        this._queueMessage(e);
        return e;
    },
    revenueEvent: function(eventId, payload) {
        var e;
        e = {
            evcl: 'REV',
            evid: eventId,
            srcty: 'PC',
            evpl: payload
        };
        this._queueMessage(e);
        return e;
    },
    uiEvent: function(eventId, payload) {
        var e;
        e = {
            evcl: 'UI',
            srcty: 'GC',
            evid: eventId,
            evpl: payload
        };
        this._queueMessage(e);
        return e;
    },
    funnelEvent: function(eventId, payload, playerState) {
        var e;
        e = {
            evcl: 'FUNNEL',
            srcty: 'GC',
            evid: eventId,
            evpl: payload
        };

        if (playerState) {
          e.plst = this._getPlayerStateDiff(playerState || this._playerState);
          this._setCurrentPlayerState(playerState);
        }
        this._queueMessage(e);
        return e;
    },
    plusEvent: function(eventId, payload, forThis)
	{
        var e;
        e = {
            evcl: 'PLUS',
            srcty: 'PC',
            evid: eventId,
            evpl: payload
        };
        this._queueMessage(e, forThis);
        return e;
    },
    plusUIEvent: function(eventId, payload) {
        var e = {
            evcl: 'PLUSUI',
            srcty: 'PC',
            evid: eventId,
            evpl: payload
        };
        this._queueMessage(e);
        return e;
    },
    navigationEvent: function(fromScreen, toScreen, buttonID){
        var payload = {};
        payload.fro = fromScreen;
        payload.to  = toScreen;
        if(buttonID){
            payload.btnid = buttonID;
        }

        return this.plusUIEvent("NAV", payload);
    },
	_setUTC: function(time)
	{
		this.UTCoffset = time ? time - new Date().getTime() : 0;	// Default to phone time if we don't get something valid
		this.UTCready = true;
		var i = this.timeQueue.length;
		while (i--)
		{
			var x = this.timeQueue[i];
			x.msg.evts = x.time + this.UTCoffset;
			this._queueMessage(x.msg);
		}
	},
    sessionEndEvent: function() {
		if (!this.UTCready)
		{
			// Exiting before we got the right timestamp, we still need to send messages!
			this.UTCready = true;
			var i = this.timeQueue.length;
			while (i--)
			{
				var x = this.timeQueue[i];
				x.msg.evts = x.time;
				this._queueMessage(x.msg);
			}
		}
        if (!(this._sessionEnded)) {
            var e;
            var Capabilities = CapabilitiesReq.Capabilities;

            e = {
                evid:  'SFN',
                evcl:  'PLUS',
                srcty: 'PC',
                hwty:  Capabilities.getDeviceName(), // cat ro.product.manufacturer, ro.product.brandh, ro.product.model
                hwrev: Capabilities.getPlatformHW(), // cat ro.revision + ro.build.date.utc
                osrev: ""+  Capabilities.getPlatformOS() + " " + Capabilities.getPlatformOSVersion(), // ro.build.fingerprint
                lang: Capabilities.getLanguage()
            };

            e = this._queueMessage(e);
            this._sessionEnded = true;
            return e;
        }
        return null;
    },
    sessionStartEvent: function() {
        var e;
        var Capabilities = CapabilitiesReq.Capabilities;

        e = {
            evid:  'SST',
            evcl:  'PLUS',
            srcty: 'PC',
            hwty:  Capabilities.getDeviceName(), // cat ro.product.manufacturer, ro.product.brandh, ro.product.model
            hwrev: Capabilities.getPlatformHW(), // cat ro.revision + ro.build.date.utc
            osrev: ""+  Capabilities.getPlatformOS() + " " + Capabilities.getPlatformOSVersion(), // ro.build.fingerprint
            lang: Capabilities.getLanguage()
        };



        e = this._queueMessage(e);
        this._drainQueue();
        return e;
    },
    socialEvent: function(eventId, friendId,  payload) {
        var e;
        e = {
            evcl: 'SOCL',
            srcty: 'GC',
            frid: friendId,
            evid: eventId,
            evpl: payload
        };
        return this._queueMessage(e);
    },
    initPlayerState: function(inState) {
        this._setCurrentPlayerState(inState);
        return true;
    },

    updatePlayerState: function(newState) {
        this._setCurrentPlayerState(newState);
        return true;
    },

    //params for internal IAP events:

    //promo campaign unique identifier
    //promoid (String)

    //price of virtual good
    //price (Float)

    //currency used. Defaults to USD
    //cur (String)

    //user's moba balance after purchase
    //mobabalance (Integer)

    //unique identifier for purchase
    //orderid (String)

    //a string identifier for an item, e.g. "IceCastle"
    //sku (String)

    //the value of the item in moba
    //mobaprice (Float)

    //the quantity of item being purchased
    //itemamt (Float)

    //a text description of the item.
    //desc (String)

    //a message displayed to the user when the debit or credit occurs
    //dispmsg (String)

    //the name of the item, as displayed to the user
    //dispname (String)

    //the Mobage ID for the product.
    //productid (Integer)

    //dynamic data accepts a custom object with any params not included above
    //dynamicdata (Object)

    reportAdShow : function(adid) {
        return this.revenueEvent('ADSHOW',{'adid':adid});      
    },

    reportAdClick : function(adid) {
        return this.revenueEvent('ADCLCK',{'adid':adid});    
    },

    reportPromoShow : function(promoid) {
        return this.revenueEvent('PROMOSHOW',{'promoid':promoid});    
    },

    reportPromoClick : function(promoid) {
        return this.revenueEvent('PROMOCLCK',{'promoid':promoid});    
    },

    reportPromoRedeem : function(promoid) {
        return this.revenueEvent('PROMOREDM',{'promoid':promoid});    
    },

    //user clicks on money sku
    reportMoneyIAPIntent : function(sku,item_amt,price,product_id,display_name,user_end_moba_balance,description,display_message,cur,dynamicdata) {
        var evpl = {
            sku : sku,
            itemamt : item_amt,
            productid: product_id,
            //desc : description,
            dispmsg : display_message,
            dispname : display_name,
            mobabalance : user_end_moba_balance,
            amt : price,
            cur : cur || 'USD'
            };
        dynamicdata ? evpl.dynamicdata = dynamicdata : '';
        return this.revenueEvent('IAPINTENT', evpl);
    },

    //user cancels a money sku transaction
    reportMoneyIAPCancel : function(sku,item_amt,price,product_id,display_name,user_end_moba_balance,description,display_message,cur,dynamicdata) {
        var evpl = {
            sku : sku,
            itemamt : item_amt,
            productid: product_id,
            //desc : description,
            dispmsg : display_message,
            dispname : display_name,
            mobabalance : user_end_moba_balance,
            amt : price,
            cur : cur || 'USD'
            };
        dynamicdata ? evpl.dynamicdata = dynamicdata : '';
        return this.revenueEvent('IAPCANCEL', evpl);
    },

    //money sku transaction is successful; orderid required
    reportMoneyIAPSuccess : function(sku,item_amt,price,orderid,product_id,display_name,user_end_moba_balance,description,display_message,cur,dynamicdata) {
        var evpl = {
            sku : sku,
            itemamt : item_amt,
            orderid : orderid,
            productid: product_id,
            //desc : description,
            dispmsg : display_message,
            dispname : display_name,
            mobabalance : user_end_moba_balance,
            amt : price,
            cur : cur || 'USD'
            };
        dynamicdata ? evpl.dynamicdata = dynamicdata : '';
        return this.revenueEvent('IAPSUCCESS',evpl);
    },

    //money iap purchase fails after being authorized by user; orderid optional if available, pass in null otherwise
    reportMoneyIAPFail : function(sku,item_amt,price,orderid,product_id,display_name,user_end_moba_balance,description,display_message,cur,dynamicdata) {
        var evpl = {
            sku : sku,
            itemamt : item_amt,
            productid: product_id,
            //desc : description,
            dispmsg : display_message,
            dispname : display_name,
            mobabalance : user_end_moba_balance,
            amt : price,
            cur : cur || 'USD'
            };
        orderid ? evpl.orderid = orderid : "";
        dynamicdata ? evpl.dynamicdata = dynamicdata : '';
        return this.revenueEvent('IAPFAIL', evpl);
    },

    //user opens money IAP store
    reportMoneyIAPShow : function() {
        return this.revenueEvent('IAPSHOW',{});
    },

    //user opens moba IAP store
    reportMobaIAPShow : function() {
        return this.revenueEvent('MOBAIAPSHOW',{});
    },

    //user clicks on a moba sku
    reportMobaIAPIntent : function(sku,moba_price,product_id,display_name,user_end_moba_balance,description,display_message,dynamicdata) {
        var evpl = {
            sku : sku,
            mobaprice : moba_price,
            productid : product_id,
            //desc : description,
            dispmsg : display_message,
            dispname : display_name,
            mobabalance : user_end_moba_balance
            };
        dynamicdata ? evpl.dynamicdata = dynamicdata : '';
        return this.revenueEvent('MOBAIAPINTENT', evpl);
    },

    //user cancels moba sku transaction
    reportMobaIAPCancel : function(sku,moba_price,product_id,display_name,user_end_moba_balance,description,display_message,dynamicdata) {
        var evpl = {
            sku : sku,
            mobaprice : moba_price,
            productid : product_id,
            //desc : description,
            dispmsg : display_message,
            dispname : display_name,
            mobabalance : user_end_moba_balance
            };
        dynamicdata ? evpl.dynamicdata = dynamicdata : '';
        return this.revenueEvent('MOBAIAPCANCEL', evpl);
    },

    //moba sku transaction is successful. orderid required. 
    reportMobaIAPSuccess : function(sku,moba_price,orderid,product_id,display_name,user_end_moba_balance,description,display_message,dynamicdata) {
        var evpl = {
            sku : sku,
            mobaprice : moba_price,
            orderid : orderid,
            productid : product_id,
            //desc : description,
            dispmsg : display_message,
            dispname : display_name,
            mobabalance : user_end_moba_balance
            };
        dynamicdata ? evpl.dynamicdata = dynamicdata : '';
        return this.revenueEvent('MOBAIAPSUCCESS', evpl);
    },

    //moba sku purchase fails after being authorized by user. orderid optional if available, pass in null otherwise
    reportMobaIAPFail : function(sku,moba_price,orderid,product_id,display_name,user_end_moba_balance,description,display_message,dynamicdata) {
        var evpl = {
            sku : sku,
            mobaprice : moba_price,
            productid : product_id,
            //desc : description,
            dispmsg : display_message,
            dispname : display_name,
            mobabalance : user_end_moba_balance
            };
        orderid ? evpl.orderid = orderid : '';
        dynamicdata ? evpl.dynamicdata = dynamicdata : '';
        return this.revenueEvent('MOBAIAPFAIL', evpl);
    },

    /**
    * Report us scraping a facebook user's profile - ext_id is the user's facebook ID.
    *
    * @since 1.1.1.2
    */
    reportFacebookScrape : function(ext_id, dynamicdata) {
        var e;
        var evpl={};
        dynamicdata ? evpl.dynamicdata = dynamicdata : '';
        e = {
            evcl: 'PLUS',
            srcty: 'PC',
            extid: ext_id,
            evid: 'FBSCRAPE',
            evpl: evpl
        };
        this._queueMessage(e);
        return e;
    },

    /**
    * Report us scraping a user's contact list - ext_id is the user's facebook ID.
    *
    * @since 1.1.1.2
    */
    reportContactScrape : function(dynamicdata) {
        var e;
        var evpl={};
        dynamicdata ? evpl.dynamicdata = dynamicdata : '';
        e = {
            evcl: 'PLUS',
            srcty: 'PC',
            evid: 'CONTACTSCRAPE',
            evpl: evpl
        };
        this._queueMessage(e);
        return e;
    },

    /**
    * Report a user posting to another user's wall.
    *
    * @since 1.1.1.2
    */
    reportWallPost : function(friendId, payload) {
        var e;
        e = {
            evcl: 'SOCL',
            srcty: 'PC',
            frid: friendId,
            evid: 'WALLPOST',
            evpl: payload
        };
        this._queueMessage(e);
        return e;
    },

    /**
    * Report a user downloading a game from a specific section in the store.
    * @param {String} game is the asku for the game being downloaded.
    * @param {String} section is the name of the section that the user downloaded from:
    *   AllGames, FeaturedGames, MyProfile, FriendsLastPlayedGame, FriendsPlayingGame
    * @param {String} slot is the order of the game in the section (if applicable)
    * @since 1.1.1.2
    */
    reportDownload : function(game, section, slot) {
        var payload = {};
        payload.game = game;
        payload.section = section;
        payload.slot = slot;
        var e;
        e = {
            evcl: 'PLUS',
            srcty: 'PC',
            evid: 'DOWNLOAD',
            evpl: payload
        };
        this._queueMessage(e);
        return e;
    },

    /**
    * add internal tag to a user.
    * @since 1.1.1.2
    */
    addTag : function(tagName) {
        var payload = {};
        payload.tag = tagName;
        var e;
        e = {
            evcl: 'PLUS',
            evid: 'TAG', 
            srcty: 'PC',
            evpl: payload
        };
        this._queueMessage(e);
        return e;
    },

    getSeqNumber: function() {
        this._seqNumber += 1;
        return this._seqNumber;
    },

    getQueueCount: function() {
        return this._queue.length;
    },

    getSendDelay: function() {
        return this._sendDelay;
    },

    setSendDelay: function(val) {
        return (this._sendDelay = val);
    },

    setMeta: function(key, value) {
        if (!value) {
            value = key;
            return (this._meta = value);
        } else {
            return (this._meta[key] = value);
        }
    },

    getMeta: function(key) {
        if (key) {
            return this._meta[key];
        } else {
            return this._meta;
        }
    },

    _queueMessage: function(msg, forThis) {
        if (!msg) {
            return false;
        }

		if (this._waitForUTC && !this.UTCready)
		{
			this.timeQueue.unshift({msg:msg, time:new Date().getTime()});
			return true;
		}

        var self = this;

        //This sets metas that don't change often
        this._setUnsetMetaKeys();

		// evts = UTC time. Makes sense, no?
		msg.evts = msg.evts || this._getUTCTime();

        // The rest of these function set properties that 
        msg = this._mergeMeta(msg);
        msg = this._addSeqDetails(msg);
        msg = this._addGeo(msg);
        msg = this._addGameSku(msg, forThis);
        msg = this._addGameRel(msg);
        msg = this._addCarrier(msg);
        msg = this._addService(msg);
        msg = this._addPlatformVersion(msg);
        msg = this._addUserId(msg);
        msg = this._addUserName(msg);
        msg = this._normalizeValues(msg);
        var queue = this._getQueue();
        queue.push(msg);
        this._setQueue(queue);

        if (!this._isSendQueued) {
            setTimeout(function() {
                self._isSendQueued = false;
                return self._drainQueue();
            }, self._sendDelay);
        }
        return msg;
    },
    _tagQa: function() {
        var fs = require('../Client/Storage/FileSystem').FileSystem;
        var self = this;
        fs.readFile('QA', {}, function(err, data) {
            if (!err) {
                self.addTag("NGMOCOQA");
            }
        });
    },
    _hookGeo: function() {
        var Social = require('../Client/Social').Social;
        if(Social.US){
            var MessageListener = require('../Client/Core/MessageListener').MessageListener;
            var Device = require('../Client/Device').Device, self = this;
            var LocationListener = MessageListener.subclass({
                initialize: function() {
                    Device.LocationEmitter.addListener(this, this.onUpdate, false);
                },
                onUpdate: function(location) {
                    self._location = location;
                    Device.LocationEmitter.removeListener(this);
                    self._locListener = null;
                }
            });
            this._locListener = new LocationListener();
        }
    },
    _hookLifetime: function() {
        var self = this;
        var MessageListener = require('../Client/Core/MessageListener').MessageListener;
        var Device = require('../Client/Device').Device;
        var ListenerClass =  MessageListener.subclass({
            initialize: function() {
                Device.LifecycleEmitter.addListener(this, this.onLifecycleUpdate);
            },
            onLifecycleUpdate: function(event) {
                switch (event) {
                case Device.LifecycleEmitter.Event.Suspend:
                case Device.LifecycleEmitter.Event.Terminate:
                    self.sessionEndEvent();
					self._drainQueue();
                    break;
                }
            }
        });
        if (!this._listener) {
            this._listener = new ListenerClass();
        }
    },
    /**
    * Change the Social Analytic object to be used.  Please see MOBWEST-2300
	* for details
	*
    * @private
    */
	_setSocialAnalytics: function(obj) {
		this._socAnalytics = obj;
	},
    _setUnsetMetaKeys: function() {
        var Capabilities = CapabilitiesReq.Capabilities, udid;
        if ((!this.getMeta('udid')) && (udid = Capabilities.getUniqueId() )) {
            this.setMeta('udid', udid);
        }

        if (!this.getMeta('sid')) {
            var sid = ''+ hex_sha1(this._seqStart+ (this.getMeta('udid')|| "UNKNOWN"));
            this.setMeta('sid', sid);
        }

        if (!this.getMeta('pltfmsku')) {
            var platRegex = /android/;

            var plat = Capabilities.getPlatformOS();
            if (plat) {
                plat = plat.toLowerCase();
                if (plat.match(platRegex) ) {
                    plat = "android";
                } else if ("flash" === plat ) {
                    plat = "flash";
                } else {
                    plat = "ios";
                }
                this.setMeta( 'pltfmsku', plat);
            }
        }

        if (!this.getMeta('apiver')) {
            this.setMeta('apiver', 5);
        }
        return true;
    },

    _getPlayerStateDiff: function(newState) {
        var delta_sign, delta_value, diff, key, value;
        diff = {};
        if (!this._playerState) {
            this._setCurrentPlayerState(newState);
        }
        for (key in newState) {
            if (!__hasProp.call(newState, key)) continue;
            value = newState[key];
            if (typeof value === 'number') {
                delta_value = (value - this._playerState[key]) || 0;
                if (delta_value < 0) {
                    delta_sign = '-';
                }
                if (delta_value >= 0) {
                    delta_sign = '+';
                }
                diff[key] = "" + delta_sign + "," + Math.abs(delta_value) + "," + (this._playerState[key]);
            } else if (typeof value === 'string') {
                diff[key] = value;
            }
        }
        return diff;
    },

    _setCurrentPlayerState: function(pst) {
        var key, value;
        this._playerState = {};
        for (key in pst) {
            if (!__hasProp.call(pst, key)) continue;
            value = pst[key];
            this._playerState[key] = value;
        }
        return true;
    },
	_getUTCTime: function()
	{
		return new Date().getTime() + this.UTCoffset;
	},
    _addGeo: function(msg) {
        var loc_point;

        if (this._location && (loc_point = this._location.getPosition())  && !isNaN(loc_point.getX()) && !isNaN(loc_point.getY())) {
            msg.geo = "" + loc_point.getX() + "," + loc_point.getY();
        }
        return msg;
    },
    _addCarrier: function(msg) {
        var Capabilities = CapabilitiesReq.Capabilities;
        var carr = Capabilities.getCarrier();
        if (carr) {
            msg.carr = carr;
        }
        return msg;
    },
    _addService: function(msg) {
        var Analytics = this._socAnalytics;
        msg.srvc = Analytics.getServiceId();
        return msg;
    },
    _addPlatformVersion: function(msg) {
        var Analytics = this._socAnalytics;
        msg.pver = Analytics.getPlatformVersion();
        return msg;

    },
    _addSeqDetails: function(msg) {
        this._seqNum += 1;
        msg.seq = this.getSeqNumber();
		// This is the length of the session. No need to offset on the real UTC, it's all relative.
        msg.seqdt = new Date().getTime() - this._seqStart;
        return msg;
    },
    _addUserId: function(msg) {
      var Analytics = this._socAnalytics;
      var uid = Analytics.getUserId();
      if (uid) {
        msg.uid = uid;
      }
      return msg;
    },
    _addUserName: function(msg) {
      var Analytics = this._socAnalytics;
      var un = Analytics.getUsername();
      if (un) {
        msg.plus = un;
      }
      return msg;
    },
    _addGameSku: function(msg, forThis) {
        var app_key = forThis || (Capabilities.getConfigs() || {} )["appId"];
        if ( app_key ) {
            msg.asku = app_key;
        }
        return msg;
    },
    _addGameRel: function(msg) {
        var arel = Capabilities.getAppReleaseVersion();
        if (arel) {
          msg.arel = arel;
        }
        return msg;
    },
    _normalizeValues: function(msg) {
        var key, value;
        for (key in msg) {
            if (!__hasProp.call(msg, key)) continue;
            value = msg[key];
            if (typeof value === 'string') {
                value = this._normalizeString(key, value);
            } else if (typeof value === 'object') {
                value = this._normalizeValues(value);
            }
            msg[key] = value;
        }
        return msg;
    },

    _normalizeString: function(key, value) {
        value = value.substring(0, this._allowedLargeValue[key] || 32);
        if (-1 !== this._capAlphaNumStringKeys.indexOf(key)) {
            value = value.toUpperCase().replace(/[^\w]+/g, "").replace("_", "");
        }
        return value;
    },

    _mergeMeta: function(msg) {
        var _ref, _ref2, key, new_msg, value;
        new_msg = {};
        for (key in msg) {
            if (!__hasProp.call(msg, key)) continue;
            value = msg[key];
            new_msg[key] = value;
        }
		ref = this._meta;
        for (key in _ref)
		{
            if (!__hasProp.call(_ref, key)) continue;
            value = _ref[key];
            (_ref2 = new_msg[key]) ? _ref2 : new_msg[key] = value;
        }
        return new_msg;
    },

    _drainQueue: function() {
        var cb, self, toDrain;
        toDrain = this._getQueue();
        this._setQueue([]);
        self = this;

        if (! this._sendToRemote)
            return true;

        cb = function(state, not_sent) {
            if (state === NgPipesRemote.possibleStates.error) {
                self._queueMany(not_sent);
				self._storeQueue();
                self._sendDelay = self._sendDelay * 2;
            } else if (state === NgPipesRemote.possibleStates.finished ) {
                self._sendDelay = 1000;
            }
            return true;
        };
        NgPipesRemote.clearQueue(toDrain, cb);
        toDrain = null; // explicit clear to keep memory down
        return true;
    },

	_exitingApp: function()
	{
		// called by LifecycleEmitter when we are about to exit the application
		this.sessionEndEvent();
		this._drainQueue();
	},

    _queueMany: function(msg_arr) {
        var _i, _len, msg, self = this;
        this._setQueue( (this._getQueue() || [] ).concat(msg_arr) );
        if (this._isSendQueued) {
          this._isSendQueued = true;
          setTimeout(function() {
              self._isSendQueued = false;
              return self._drainQueue();
          }, self._sendDelay);
        }

        return true;
    },
    _setQueue: function(new_queue) {
        this._queue = new_queue;
        return true;
    },
	_storeQueue: function()
	{
		KeyValueCache.global(this._globalKey).setItem(this._globalKey, {}, JSON.stringify(this._queue));
    },
    _getQueue: function() {
        return this._queue;

    }
});

exports.NgPipe = NgPipe;
