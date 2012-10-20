// Banking Public Interface
var RouterInited 	= require("../../../_Internal/RouterInit");
var GSGlobals 		= require("../../../_Internal/GSGlobals");
var UI 				= require("../../../../UI").UI;
var LocText			= require("../../../../Assets/Localization").LocalizedString;

/**
* @ignore
* @private
*/
exports.Banking = {
};


/**
* @ignore
* @private
*/
exports.Banking.Legacy = {
	
    /**
    * @ignore
    * @private
    */	
    asyncFulfill: function(ordercb, donecb) {
        NgLogD("Public call Legacy.asyncFulfill");
        var cmd = {
            apiURL: "US.Service.Banking.Legacy.asyncFulfill",
            data: {}
        };
        cmd["callbackFunc"] = (function(err, data) {
			if (data.cbtype == 'donecb') {
				donecb();
			} else if (data.cbtype == 'ordercb') {
				this._asyncFulfillContinue(data, ordercb, donecb);
			}
        }).bind(this);
        GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
    },
    
    /**
    * @ignore
    * @private
    */	    
    launchPurchaseView: function(sku, purchasecb, failcb, cancelcb) {
        NgLogD("Public call Legacy.launchPurchaseView");
        var cmd = {
            apiURL: "US.Service.Banking.Legacy.launchPurchaseView",
            data: {}
        };
        if (sku) {
            cmd.data.sku = sku;
        }
		var self = this;
        cmd["callbackFunc"] = function(err, data) {
			if (err) {
				if (err == 'cancelled') {
					cancelcb();
				} else {
					failcb(false);
				}
			} else {
				self._keepTryingMtxTxn(data.itemID, data.orderid, data.receipt,
					purchasecb, failcb);
			}
        };
        GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
    },
	/**
	 * @private
	 */
    _asyncFulfillContinue: function(data, ordercb, donecb) {
		var self = this;
		var contcb = function() {
	        var cmd = {
	            apiURL: "US.Service.Banking.Legacy._asyncFulfillContinue",
	            data: {}
	        };
	        cmd["callbackFunc"] = function(err, data) {
				if (data.cbtype == 'donecb') {
					donecb();
				} else if (data.cbtype == 'ordercb') {
					self._asyncFulfillContinue(data, ordercb, donecb);
				}
	        };
	        GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
		};
		ordercb(data.prodId, data.orderId, data.verificationToken, data.jsonorder, contcb);
    },
	/**
	 * Show a progress dialog, and retry at designated intervals
	 * for up to approx 2 minutes
	 *
	 * @private
	 */
	_keepTryingMtxTxn: function(itemID, orderId, receipt, purchasecb, failcb) {
	    var progDialog = new UI.ProgressDialog();
	    progDialog.setText(LocText("Processing order..."));
	    progDialog.show();
	    // total # of retries - approx 2 min 30 seconds.  Note that the total
		// elapsed time before giving up should be larger than the timeout
		// of plus server optimistic fulfillment
	    var retriesSec = [0, 3, 10, 20, 30, 45, 60, 90, 115, 130, 150];
	    var retries = retriesSec.splice(0);
	    this._tryMtxTxn(false, retries, progDialog, itemID, orderId, receipt, purchasecb, failcb);
	},
	/**
	 * @private
	 */
	_tryMtxTxn: function(isDone, retries, progDialog, itemID, orderId, receipt, purchasecb, failcb) {
	    if (isDone !== false) {
	        progDialog.hide();
            progDialog.destroy();
	        return;
	    }
	    if (retries.length < 2) {
	        // Not retrying any more, simply report error
	        progDialog.hide();
            progDialog.destroy();
	        /*
			 * The error message should be:
			 *   'Sorry for temporary delay. If you receive email receipt from
			 *    Google Checkout / Apple, please restart game in a few minutes.  Your
			 *    order will be ready then.'
			 */
	        failcb(true);
	        return;
	    }
	    var sec1 = retries[0];
	    var sec2 = retries[1];
	    var interval = (sec2 - sec1) * 1000;
	    retries.shift();
		var self = this;
	    setTimeout(function(){
		    var nextcb = function(cbIsDone) {
		        self._tryMtxTxn(cbIsDone, retries, progDialog, itemID, orderId, receipt, purchasecb, failcb);
		    };
	        purchasecb(itemID, orderId, receipt, nextcb);
		},
	    interval);
	}
};

