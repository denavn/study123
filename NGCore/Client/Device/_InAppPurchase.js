////////////////////////////////////////////////////////////////////////////////
// Class InAppPurchase
//
// Copyright (C) 2011 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////


var Class = require('../Core/Class').Class;
var Analytics = require('../Core/Analytics').Analytics;
var DeviceReq = require('../Device');
var Localization = require('../Core/Localization').Localization;

////////////////////////////////////////////////////////////////////////////////

exports.InAppPurchase = Class.singleton(
/** @lends Device.InAppPurchase.prototype */
{
	classname: 'InAppPurchase',
	
	/**
	 * Function.
	 * @constructs
	 * @augments Core.Class
	 */
	initialize: function()
	{
		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
	},

	initService: function(ordercb, donecb, options) {
        NgLogD("initService called");
		if(this._iapInited) {
            NgLogD("initService has been called");
            return;
        }

		if ((!this._isIOS()) && (!this._isAndroid())) {
			NgLogE("ERROR: Neither Android nor iOS platform, IAP will not work");
			donecb();
			return;
		}

		this._initDonecb = donecb;
		this._initOrdercb = ordercb;

		if(options) {
			var options2 = JSON.parse(options);
			if(options2.service === "boku") {
				this._paymentProvider = "boku";
			}
		}
		if (!this._iapInited) {
			var IAPListener = Core.MessageListener.subclass({
				onPurchaseEvent: this._iapCallback.bind(this)
			});
			
			// Register for Android / iOS IAP callbacks the same way
			this.listener = new IAPListener();
	        DeviceReq.Device.InAppPurchaseEmitter.addListener(
				this.listener, this.listener.onPurchaseEvent);
	    	// listener will be called when purchase state changes
		}
		if (this._isAndroid()) {
			this._iapCallback('morenonces', '', '');
			/*
			 * Gets persisted unfulfilled orders, calls back ordercb for each
			 * unfulfilled order.
			 */
			var self = this;
			Storage.KeyValueCache.local.getItem(this._IAB_ORPHANED, {},
			function(err, currorder) {
                    NgLogD("_iap getting orphaned order callback");
	   			if (currorder) {
					var order = JSON.parse(currorder);
   					// _restoreOrder eventually calls _initService when fully
					// done.
                    NgLogD("_iap restoring order");
					self._restoreOrder(order, options);
				} else {
                    NgLogD("_iap initService 0");
					self._initService(options);
				}
			});
		} else {
			// _isIOS - call _initService directly.  It will call back with
			// orphaned order if any.
                    NgLogD("_iap initService 1");
			this._initService(options);
		}
	},

	launchPurchaseView: function(productID, quantity, purchasecb, failcb, cancelcb, options) {
		if (!this._iapInited) {
            Analytics.reportGameEvent( "MobaIAPInitFailed" );
			NgLogE("ERROR: function initService must be called and its donecb " +
			"called back, before launchPurchaseView may be used.");
			failcb(false, "failed:initservice_not_done");
			return;
		}

		this._currentOrderProductID = productID;

		this._currentOrderCancelcb = cancelcb;
		this._currentOrderFailcb = failcb;
		this._currentOrderPurchasecb = purchasecb;

		// Android IAB currently only supports quantity of 1
		if (quantity !== 1 && this._isAndroid()) {
			failcb(false, "failed:unsupported_quantity");
            Analytics.reportGameEvent( "MobaIAPInvalidQuantity" );
			return;
		}

		if (this._isIOS() || this._isAndroid()) {
	        DeviceReq.Device.InAppPurchase._requestPurchase(productID, quantity, options);
			// Note that _iapCallback will call the *cb callback function(s)
			return;
		}
            
		var capabilities = Core.Capabilities;
        Analytics.reportGameEvent( "MobaIAPUnsupportPlatorm"+capabilities.getPlatformOS() );
		NgLogE('launchPurchaseView failed: only Android and iOS platforms are currently supported.');
		failcb(false, "failed:unsupported_platform");
		return;
	},

    // depreicated function
	pushSingleNonce: function(nonce){
		var noncePool = [];
		noncePool.push(nonce);
		this._fillIABNoncePool(JSON.stringify(noncePool));
	},

	/**
	 * get a product information specified by productId.
	 * @param {String} productId the product ID registered at iTunes connect.
	 * @param {Function} callback called back when it gets a response. The signature for the callback is equivalent to:<br /><br />
	 * <pre>function(productData, err)</pre><br />
	 * The <code>productData</code> is an product information like "JPY,115.000000".
	 * When something bad happenes, <code>err</code> is set to the error message. Otherwise, err will be null or undefined.
	 * @status iOS, iOSTested
	 */
	getProductInformation: function(productId, callback) {
		this._getProductInformationCB = callback;
		this._getProductInformationSendGen(productId);
	},

	/**
	 * get product information specified by set of product ids
	 * @param {String} productSet the set ofproduct ID registered at iTunes connect. JSON format: {"items":["sku1", "sku2"]}
	 * @param {Function} callback called back when it gets a response. The signature for the callback is equivalent to:<br><br>
	 * <pre>function(productData, err)</pre><br>
	 * The <code>productData</code> is product information like "{"currency":"US", "items":[{"sku":"webgame_test_D", "price":0.99},{"sku":"abc", "price":1.00}]}"
	 * @status iOS, iOSTested
	 */
	getProductSetInfo: function(productSet, callback) {
		this._getProductSetInfoCB = callback;
		this._getProductSetInfoSendGen(productSet);
	},

	/*
	 * For Google IAB, these constants come from
	 * Consts.java in IAB sample code
	 *
	 *	public enum PurchaseState {
     *   PURCHASED,   // User was charged for the order. -- 0
     *   CANCELED,    // The charge failed on the server. -- 1
	 *   REFUNDED;    // User received a refund for the order. -- 2
	 */
	_IAB_PURCHASED: 0,
	_IAB_CANCELED: 1,
	_IAB_REFUNDED: 2,
	_IAB_ORPHANED: "com.ngmoco.in_app_purchase.iab_orphaned_orders",

	_capIsAndroid: undefined,
	_capIsIOS: undefined,

	// at most one outstanding order is supported
	_currentOrderCancelcb : undefined,
	_currentOrderFailcb : undefined,
	_currentOrderProductID : undefined,
    // This flag is used by Google IAB only
	_currentOrderPurchasecb : undefined,

	_initDonecb : undefined,
	_initOrdercb : undefined,
	_iapInited: false,

	_generateIABNonce: function(){
		var timestamp = new Date().getTime();
		var random = Math.floor(Math.random() * 1000);
		var nonce = (timestamp * 1000) + random;
		NgLogD("Generated nonce: " + nonce);
		return nonce;
	},

    // For Android, this function will be called for the following scenarios:
    // 1. First initService after start the game
    // 2. After each IAB purchase
    // 
    // Looks like during restart, if there are un-ack orders, this _iapCallback
    // is being called twice.
    // First, it will be called after the service has been established
    // Second time, it will be alled if there are un-ack order with orders, receipt
    //
    //
    // For iOS
    // Only after IAP purchase
    //
	_iapCallback: function( err, data, verificationToken ) {
        NgLogD("8 _iapCallback with err: "+err + " data: "+data + " verficationToken: "+verificationToken);
		if (err == 'morenonces') {
			var count = 10;
			var noncePool = [];
			while(noncePool.length < count){
				noncePool.push(this._generateIABNonce());
			}
			this._fillIABNoncePool(JSON.stringify(noncePool));
			return true;
		}
		if ((err == 'initdone') || (err == 'initcheckdone')) {
			if (typeof this._initDonecb == 'function') {
				this._iapInited = true;
				this._initDonecb();
                NgLogD("_iap initService Done");
			} else {
				NgLogW("WARN: " + err + " callback with empty donecb");
			}
	        // at most one listener gets iap events
	        return true;
		}
		if (err == 'getProductInformationDone') {
			if (data && data.length > 0) {
				var datajsonp = JSON.parse(data);
				try {
					this._productInformationExtras = JSON.parse(verificationToken);
				} catch (e) {
					NgLogE("Error parsing Product Information");
				}
				
				this._getProductInformationCB(datajsonp.productId);
			} else {
				this._getProductInformationCB('', "no information on this product");
			}
			this._getProductInformationCB = undefined;
			delete this._productInformationExtras;
			return true;
		}
		if (err == 'getProductSetInfoDone') {
			this._getProductSetInfoCB(data);
			this._getProductSetInfoCB = undefined;
			return true;
		}

		var orderId;
		var prodId = "";
	        var datajson, receiptj;
        // There are two scenarios we will get the orders from Google
        // 1. during initService to the Googel market
        // 2. after the initService, user makes purchase.
        // before pop up the Google UI

		if (data && data.length > 0) {
		    datajson = JSON.parse(data);
		    if ((datajson.orders) && (datajson.orders.length > 0)) {
                this._dumpOrderIds(datajson.orders); // for debugging and troubleshooting

                // note: see the NGStoreObserver.m to understand how we contrust this JSON block

                orderId = datajson.orders[0].orderid;

 				if (this._isAndroid() && (!this._currentOrderPurchasecb)) {
					// this callback comes in 'out of band', when user did
					// not attempt a purchase.  This happens on Android
					// when async callbacks are not confirmed due to
					// connectivity issue.  This callback will come in
					// the time when we establish the connection to MarketService
                    // which is when the game restart
					//
                    // we only come to here when we first start the game
                    var order0 = datajson.orders[0];
			        receiptj = {
					    data: data,
					    signature: verificationToken
				    };
				    order0.receipt = JSON.stringify(receiptj);

                    // We overwrite the existing data if there is one
                    // Google will include all the previous un-ack orders in the latest
                    // signData
                     if(!order0.receipt) {
                        Analytics.reportGameEvent("NGNILRECEIPT2");
                     }
                     this._initOrdercb(order0.productId, order0.orderId, order0.receipt);
	                return true;
				}

            }
		}

		if (err && err.length > 0) {
			if (err == 'cancelled') {
				if ((typeof this._currentOrderCancelcb) == 'function') {
					this._currentOrderCancelcb();
					this._currentOrderCancelcb = undefined;
				} else {
                    Analytics.reportGameEvent("MobaIAPERR02");
                }
			} else {
				if (err) {
					NgLogD("DEBUG: iapCallback: got error: " + err);
				} else {
					// _IAB_CANCELED
					NgLogD("DEBUG: iapCallback: got canceled purchaseState.");
				}
				if ((typeof this._currentOrderFailcb) == 'function') {
					this._currentOrderFailcb(false, err);
					this._currentOrderFailcb = undefined;
				} else {
                    Analytics.reportGameEvent("MobaIAPERR01");
                }
			}

	        // at most one listener gets iap events
	        return true;
	    }

		if ((typeof this._currentOrderPurchasecb) == 'function') {
			var receipt = verificationToken;
			if (this._isAndroid()) {
				// on Android, both the data and signature are required
				// for verification
				receiptj = {
					data: data,
					signature: verificationToken
				};
				receipt = JSON.stringify(receiptj);
			}
            // prodId is undefined if it is Android.
            // We are OK for this since we never use this prodId on narwhal side anyway.
            // For iOS, we converted to uppercase. SKU is casesensitve. We are OK here. Again it is because
            // we don't use the prodId on the narwhal side.
            // Might be we should just fix the prodId logic
            if(!receipt) {
                Analytics.reportGameEvent("NGNILRECEIPT");
            }
		    this._currentOrderPurchasecb(prodId, orderId, receipt);
			this._currentOrderPurchasecb = undefined;
		} else if ((!this._iapInited) && ((typeof this._initOrdercb) ==
		 			'function')) {
            // KLO - I don't understand how we will get to this flow
			// part of initService flow
            // initOrdercb is pointing to the first function while calling
            // in the Purchase.js DeviceReq.Device.InAppPurchase.initService
		    this._initOrdercb(prodId, orderId, verificationToken);
		} else {
            Analytics.reportGameEvent("MobaIAPERR04");                    
        }
        // at most one listener gets iap events
        return true;
    },

	_isAndroid: function() {
		if (typeof this._capIsAndroid != 'undefined') {
			return this._capIsAndroid;
		}
		// Find out from capabilities
	    var capabilities = Core.Capabilities;
	    if ((typeof capabilities.getPlatformOS() != "undefined") &&
	        (capabilities.getPlatformOS().toLowerCase() == 'android')) {
	        this._capIsAndroid = true;
	    } else {
	        this._capIsAndroid = false;
		}
		return this._capIsAndroid;
	},

	_isIOS: function() {
		if (typeof this._capIsIOS != 'undefined') {
			return this._capIsIOS;
		}
		// Find out from capabilities
	    var capabilities = Core.Capabilities;
	    if ((typeof capabilities.getPlatformOS() != "undefined") &&
	        (capabilities.getPlatformOS().toLowerCase() == 'iphone os')) {
	        this._capIsIOS = true;
	    } else {
	        this._capIsIOS = false;
		}
		return this._capIsIOS;
	},

	_fillIABNoncePool: function(nonces) {
		this._fillIABNoncePoolSendGen(nonces);
	},

    _dumpOrderIds: function(orders) {
        for(var i=0; i < orders.length; i++) {
            var theOrder = orders[i];
            Analytics.reportGameEvent("NGIABRECEIVED", {orderId: theOrder.orderId});
        }
    },

    // deprecated
	_filterSuccessOrders: function(datajson, verificationToken, data) {
		var successOrders = [];
		for (var kdx in datajson.orders) {
			if (datajson.orders[kdx].purchaseState === this._IAB_PURCHASED) {
				var theorder = datajson.orders[kdx];
	            if(this._isAndroid()) {
			        var receiptj = {
					    data: data,
					    signature: verificationToken
				    };
				    theorder.receipt = JSON.stringify(receiptj);
                } else {
                    theorder.verificationToken = verificationToken;
                }
				successOrders.push(theorder);
			} else {
				//Send ACK for non-success orders
                // For success orders, we won't ACK until we get confirm from
                // Bank in the Mobage JS level
                // We don't need to this before because we ack everything 
                // right away in the old Google IAB example
				this._sendOrderProcessedAck(datajson.orders[kdx].notificationId);
				NgLogD("Sending ACK to google for filterorders");
			}
		}
        NgLogD("successOrders length = "+successOrders.length);
		return successOrders;
	},
    // deprecated
	_persistOrphanedOrders: function(successOrders) {
		// add orders to existing list of persisted orders
		Storage.KeyValueCache.local.getItem(this._IAB_ORPHANED, {},
			(function(err, currorders){
				if (currorders && (currorders.length > 0)) {
					var orderlist = JSON.parse(currorders);
                    // append the new orders to the existing orders
					for (var idx in orderlist) {
						var o = orderlist[idx];
                        var foundOrder = false;
                        // If we don't ack the Google callback, it 
                        // will just keep coming back until we ack it.
                        // Therefore, don't add the older to the queue anymore
                        // This O(n^2) performance won't be a problem because
                        // we most likely have 2 - 3 orders in the callback.
                        for(var jdx in successOrders) {
                            var t = successOrders[jdx];
                            if(t.orderId === o.orderId) {
                                foundOrder = true;
                                break;
                            }
                        }
                        if(!foundOrder) {
                            successOrders.push(orderlist[idx]);
                        }
					}
				}
				var content = JSON.stringify(successOrders);
				Storage.KeyValueCache.local.setItem(this._IAB_ORPHANED, content, {},
				function(){
					NgLogD("Orphaned orders added to persistent store: " + content);
					NgLogD("Number of orders: " + successOrders.length);
			    });
			}).bind(this));
	},
	_initService: function(options) {
		if(options) {
            Analytics.reportGameEvent("MobaIAPERR06");
			this._initService2SendGen(options);
		} else {
            NgLogD("_iap calling initServiceSendGen");
			this._initServiceSendGen();
		}
	},

	_requestPurchase: function( sku, quantity, options ) {
		if(options){
			this._requestPurchase2SendGen(sku, quantity, options);
		} else {
			this._requestPurchaseSendGen(sku, quantity);
		}
	},
	
    // Send ACK to Google 
	_sendOrderProcessedAck: function( notificationId, orderId ) {
		NgLogD("sending ACK to Google with orderId: "+orderId);
        Analytics.reportGameEvent("MobaIABACK", {orderId: orderId});
		this._sendOrderProcessedAckSendGen( notificationId );
	},

	/* Deprecated
	 * Given unfulfilled orders, calls back ordercb for each unfulfilled order.
	 * Resets persisted store using removeItem when done, then call
	 * _initService to continue init process.
	 */
	_restoreOrder: function(order, options) {
		var self = this;

        // send the order back to Mobage application layer so it can forward
        // these order to bank
        // initOrdercb is pointing to the first function while calling
        // in the Purchase.js DeviceReq.Device.InAppPurchase.initService
        if(this._isAndroid()) {
		    this._initOrdercb(order.productId, order.orderId, order.receipt, order);
        } else {
		    this._initOrdercb(order.productId, order.orderId, order.verificationToken, order);
        }
		Storage.KeyValueCache.local.removeItem(this._IAB_ORPHANED, {},
			function() {
                NgLogD("_iap removeItem callback");
                    NgLogD("_iap initService 2");
				self._initService(options);
			});
	
	},

// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 348,
	// Method create = -1
	// Method initService = 2
	// Method requestPurchase = 3
	// Method fillIABNoncePool = 4
	// Method getProductInformation = 5
	// Method sendOrderProcessedAck = 6
	// Method getProductSetInfo = 7
	// Method initService2 = 8
	// Method requestPurchase2 = 9
	
	/** 
	 * Command dispatch.
	 * @private
	 */
	$_commandRecvGen: (function() { var h = (function ( cmd )
	{
		var cmdId = Core.Proc.parseInt( cmd.shift(), 10 );
		
		if( cmdId > 0 )	// Instance Method.
		{
			var instanceId = Core.Proc.parseInt( cmd.shift(), 10 );
			var instance = Core.ObjectRegistry.idToObject( instanceId );
			
			if( ! instance )
			{
				NgLogE("Object instance could not be found for command " + cmd + ". It may have been destroyed this frame.");
				return;
			}
			
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown instance method id " + cmdId + " in InAppPurchase._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in InAppPurchase._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[348] = h; return h;})(),
	
	/////// Private recv methods.
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x15cffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_initServiceSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x15c0002, this );
	},
	
	/** @private */
	_requestPurchaseSendGen: function( sku, quantity )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x15c0003, this, [ Core.Proc.encodeString( sku ), +quantity ] );
	},
	
	/** @private */
	_fillIABNoncePoolSendGen: function( nonces )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x15c0004, this, [ Core.Proc.encodeString( nonces ) ] );
	},
	
	/** @private */
	_getProductInformationSendGen: function( productId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x15c0005, this, [ Core.Proc.encodeString( productId ) ] );
	},
	
	/** @private */
	_sendOrderProcessedAckSendGen: function( orderId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x15c0006, this, [ Core.Proc.encodeString( orderId ) ] );
	},
	
	/** @private */
	_getProductSetInfoSendGen: function( skuIds )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x15c0007, this, [ Core.Proc.encodeString( skuIds ) ] );
	},
	
	/** @private */
	_initService2SendGen: function( options )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x15c0008, this, [ Core.Proc.encodeString( options ) ] );
	},
	
	/** @private */
	_requestPurchase2SendGen: function( sku, quantity, options )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x15c0009, this, [ Core.Proc.encodeString( sku ), +quantity, Core.Proc.encodeString( options ) ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// initService: function(  ) {}
	
	// requestPurchase: function( sku, quantity ) {}
	
	// fillIABNoncePool: function( nonces ) {}
	
	// getProductInformation: function( productId ) {}
	
	// sendOrderProcessedAck: function( orderId ) {}
	
	// getProductSetInfo: function( skuIds ) {}
	
	// initService2: function( options ) {}
	
	// requestPurchase2: function( sku, quantity, options ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});
