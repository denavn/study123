// Bank Public Interface
var RouterInited 	= require("../../_Internal/RouterInit");
var GSGlobals 		= require("../../_Internal/GSGlobals");

/**
* @ignore
* @private
*/
exports.Bank = {
};


/**
 * @class
 * @name Bank.Debit
 * @description
 * Bank.Debit is an interface for in-game item purchasing. A transaction begins with a call to <code>createTransaction()</code>, which presents
 * a user interface to the user. If the user follows through with a purchase, the <code>transaction.state</code> property changes from 
 * <code>new</code> to <code>authorized</code>. Once <code>createTransaction()</code> executes its callback, the game may call 
 * <code>openTransaction()</code>, which changes the state from <code>authorized</code> to <code>open</code> and puts funds into escrow. 
 * At this point, the game/game server should deliver the purchased items. Once the items have been delivered, the game should call   
 * <code>closeTransaction()</code>. If there is a problem at any point in the transaction lifecycle, call <code>cancelTransaction()</code>,
 * which sets the <code>transactionState</code> property to <code>canceled</code> and restores funds from escrow back to the user.
 * <br /><br />
 * The value of a single transaction cannot exceed 100,000 MobaCoins.
 * <br /><br />
 * Please use <code>toLowerCase</code> when checking the state of the transaction to make sure the compatability across Japan and US platform.
 * <code>
 *   if(txnState.toLowerCase() == "open") {
 *    ...
 *   }
 * </code>
 */
exports.Bank.Debit = {
/** @lends Bank.Debit.prototype */
	
		
	/**
	 * Creates a transaction. Initially, it sets the <code>transaction.state</code> to <code>new</code>.
     * Mobage presents a dialog that prompts the user to confirm the transaction. 
	 * If the user decides not to proceed with the transaction, the callback error returns as "usercanceled."
	 * In the client-only flow, this call checks inventory and sets the state to <code>authorized</code>.
	 * <br /><br />
	 * The value of a single transaction cannot exceed 100,000 MobaCoins.
	 * 
	 * @name Bank.Debit.createTransaction
	 * @function
	 * 
	 * @param {Array} billingItems The billing items for the transaction. <br/><b>Note:</b> The array is limited to one item for this release.
	 * @param {String} comment A comment about the transaction.
	 * @cb {Function} callback The function to call after creating the transaction.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {Object} transaction Information about the transaction.
	 * @cb-param {String} transaction.comment A comment about the transaction.
	 * @cb-param {String} transaction.id The transaction ID.
	 * @cb-param {String} transaction.state The current state of the transaction.
	 * @cb-returns {void}
	 * @example
     * var billingItems = [{
     *     "item": {
     *           "id": "iceCastle",
     *          },
     *     "quantity": 1
     *    }
     * ];
     * 
     * var createTxCallback = function (error, transaction) {
	 *     if (error === 'usercanceled') {
     *         var userCanceledDlg = new UI.AlertDialog();
     *         userCanceledDlg.setTitle("Transaction Cancelled");
     *         userCanceledDlg.setText("The transaction has been cancelled.");
     *         userCanceledDlg.setChoices([('OK')]);
     *         userCanceledDlg.show();
     *     } else if(error) {
     *         var errorCode = error.errorCode;
     *         var errorDesc = error.description;
     *         Bank.Debit.cancelTransaction(transaction.id);
     *     } else {
     *         txId = transaction.id;
     *         Bank.Debit.openTransaction(txId, openTxCallback)
     * };
     *
     * Bank.Debit.createTransaction(billingItems, "Sample transaction", createTxCallback);
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */				
    createTransaction: function(billingItems, comment, callback) {
		NgLogD("Public call createTransaction");
		
		
	var data = {
	    billingItems: billingItems,
	    comment: comment
	};
		var cmd = {
			apiURL:"US.Service.Banking.Purchase.createTransaction",
			data: data
		};

		if (callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = this._getCallBackFunc(callback);
		}    
        GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},
	
	/**
	 * Places funds into escrow and begins processing the transaction. 
	 * Indicates the game server needs to deliver the purchased item.
	 * The <code>transaction.state</code> transitions from <code>authorized</code> to <code>open</code>.
	 *
	 * @name Bank.Debit.openTransaction
	 * @function
	 * 
	 * @param {String} transactionId The <code>transactionId</code> identifying this transaction.
	 * @cb {Function} callback The function to call after opening the transaction.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {Object} transaction Information about the transaction.
	 * @cb-param {String} transaction.comment A comment about the transaction.
	 * @cb-param {String} transaction.id The transaction ID.
	 * @cb-param {String} transaction.state The current state of the transaction.
	 * @cb-returns {void}
	 * @example
	 * var openTxCallback = function (error, transaction) {
	 *      if (error) {
	 *          var errorCode = error.errorCode;
     *          var errorDesc = error.errorDescription;
     *          Bank.Debit.cancelTransaction(transaction.id, cancelTxCallback );
     *      } else {
     *          var txId = transaction.id;
     *          var txState = transaction.state;
     *          var txComment = transaction.comment;
     *          // Deliver items to the client
     *          MyGameTxClass.deliverItems(transaction.items);
     *          // You must close the transaction in order to be paid
     *          Bank.Debit.closeTransaction(transaction.id, closeTxCallback );
     *      }	
     * };
     *
     * Bank.Debit.openTransaction(myTxId, openTxCallback);
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
     */
	openTransaction: function(transactionId, callback) {
		NgLogD("Public call openTransaction");
		
		var cmd = {
			apiURL:"US.Service.Banking.Purchase.openTransaction",
			data:{}
		};
		
		if (transactionId) {
			cmd.data.transactionId = transactionId;
		}
		if (callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = this._getCallBackFunc(callback);
		}
        
        GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},
	
	/**
	 * Continues processing a transaction.
	 * Checks the inventory to verify the item is valid, available, and so on. After verification, the <code>transaction.state</code> chranges from <code>new</code> to <code>authorized</code>,
	 * and funds are placed in escrow. The <code>transaction.state</code> transitions from <code>authorized</code> to <code>open</code>, which 
	 * indicates the game server needs to deliver the purchased item. 
	 * 	 
	 *
	 * @name Bank.Debit.continueTransaction
	 * @function
	 * 
	 * @param {String} transactionId The <code>transactionId</code> identifying this transaction.
	 * @cb {Function} callback The function to call after continuing to process the transaction.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {Object} transaction Information about the transaction.
	 * @cb-param {String} transaction.comment A comment about the transaction.
	 * @cb-param {String} transaction.id The transaction ID.
	 * @cb-param {String} transaction.state The current state of the transaction.
	 * @cb-returns {void}
	 * @example
	 * var continueTxCallback = function (error, transaction) {
     *      if (error) {
	 *           var errorCode = error.errorCode;
	 *           var errorDesc = error.description;
     *           Bank.Debit.cancelTransaction(transaction.id, cancelTxCallback );
     *      } else {
     *           var tx = transaction;
     *           Bank.Debit.openTransaction(transaction.id, openTxCallback );
     *      }
	 * };
	 * 
	 * Bank.Debit.continueTransaction(myTxId, continueTxCallback);
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
    continueTransaction: function(transactionId, callback) {
		NgLogD("Public call continueTransaction");
		
		var cmd = {
			apiURL:"US.Service.Banking.Purchase.continueTransaction",
			data:{}
		};
		
		if (transactionId) {
			cmd.data.transactionId = transactionId;
		}
		if (callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = callback;
		}
        
        GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},
	

    /**
     * Cancels the transaction. The transaction was canceled or the purchased item was not delivered and the game
     * needs to return the user's funds. The <code>transaction.state</code> transitions to <code>canceled</code>.
     *
     * @name Bank.Debit.cancelTransaction
     * @function
     * 
     * @param {String} transactionId The <code>transactionId</code> identifying this transaction.
	 * @cb {Function} callback The function to call after continuing to process the transaction.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {Object} transaction Information about the transaction.
	 * @cb-param {String} transaction.comment A comment about the transaction.
	 * @cb-param {String} transaction.id The transaction ID.
	 * @cb-param {String} transaction.state The current state of the transaction.
	 * @cb-returns {void}
	 * @example
	 * var cancelTxCallback = function (error, transaction) {
     *     if (error) {
     *        var errorCode = error.errorCode;
     *        var errorDesc = error.errorDescription;
     *        console.log("An error occurred while canceling a transaction: " + error.errorCode +
     *            error.errorDescription);
     *     } else {
     *        var txId = transaction.id;
     *        var txState = transaction.state;
     *        var txComment = transaction.comment;
	 *     }	
     * };
     * 
     * Bank.Debit.cancelTransaction(myTxId, cancelTxCallback);
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
     */
    cancelTransaction: function(transactionId, callback) {
		NgLogD("Public call cancelTransaction");
		
		var cmd = {
			apiURL:"US.Service.Banking.Purchase.cancelTransaction",
			data:{}
		};
		
		if (transactionId) {
			cmd.data.transactionId = transactionId;
		}
		if (callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = callback;
		}
        
        GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
    },


	/**
	 * Closes the transaction. The virtual item was delivered.
	 * The <code>transaction.state</code> transitions from <code>open</code> to <code>closed</code>.
	 *
	 * @name Bank.Debit.closeTransaction
	 * @function
	 * 
	 * @param {String} transactionId The <code>transactionId</code> identifying this transaction.
	 * @cb {Function} callback The function to call after continuing to process the transaction.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {Object} transaction Information about the transaction.
	 * @cb-param {String} transaction.comment A comment about the transaction.
	 * @cb-param {String} transaction.id The transaction ID.
	 * @cb-param {String} transaction.state The current state of the transaction.
	 * @cb-returns {void}
	 * @example
	 * var closeTxCallback = function (error, transaction) {
     *     if (error) {
     *          var errorCode = error.errorCode;
     *          var errorDesc = error.errorDescription;
     *          Bank.Debit.cancelTransaction(transaction.id, cancelTxCallback);
	 *     } else {
     *          var txId = transaction.id;
     *          var txState = transaction.state;
     *          var txComment = transaction.comment;
     *     }	
     * };
     *
     * Bank.Debit.closeTransaction(myTxId, closeTxCallback);
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	closeTransaction: function(transactionId, callback) {
		NgLogD("Public call closeTransaction");
		
		var cmd = {
			apiURL:"US.Service.Banking.Purchase.closeTransaction",
			data:{}
		};
		
		if (transactionId) {
			cmd.data.transactionId = transactionId;
		}
		if (callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = this._getCallBackFunc(callback);
		}
        
        GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},
	
	/**
	 * Retrieves the transaction corresponding to the given transaction ID parameter.
	 *
	 * @name Bank.Debit.getTransaction
	 * @function
	 * 
	 * @param {String} transactionId The <code>transactionId</code> identifying this transaction.
	 * @cb {Function} callback The function to call after continuing to process the transaction.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {Object} transaction Information about the transaction.
	 * @cb-param {String} transaction.comment A comment about the transaction.
	 * @cb-param {String} transaction.id The transaction ID.
	 * @cb-param {String} transaction.state The current state of the transaction.
	 * @cb-returns {void}
	 * @example
	 * var getTxCallback = function(error, transaction) {
     *      if (error) {
	 *            var errorCode = error.errorCode;
	 *            var errorDesc = error.description;
     *      } else {
     *            var tx = transaction;     
     *      }
	 * };
	 *
	 * Bank.Debit.getTransaction(myTxId, getTxCallback);
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	getTransaction: function(transactionId, callback) {
		NgLogD("Public call getTransaction");
		
		var cmd = {
			apiURL:"US.Service.Banking.Purchase.getTransaction",
			data:{}
		};
		
		if (transactionId) {
			cmd.data.transactionId = transactionId;
		}
		if (callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = this._getCallBackFunc(callback);
		}
        
        GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},

	/**
	 * Retrieves the user's transactions where the state is <code>new</code>, <code>authorized</code> or <code>open</code>.
     * See the <a href="https://developer.mobage.com/en/resources/bank_economy">Bank and Economy
     * section</a> of the <a href="https://developer.mobage.com/">Mobage Developer Portal</a> for
     * details.
     * <br /><br />
     * <strong>Note</strong>: This method is not available on the Japan platform.
	 *
	 * @name Bank.Debit.getPendingTransactions
	 * @function
	 * 
	 * @cb {Function} callback The function to call after continuing to process the transaction.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {Object[]} transactions Information about the transactions.
	 * @cb-param {String} transactions[] transaction ID
	 * @cb-returns {void}
	 * @example
	 * var getPendingTxCallback = function(error, transaction) {
     *      if (error) {
	 *         var errorCode = error.errorCode;
	 *         var errorDesc = error.description;
     *      } else {
     *         var tx = transaction;     
     *      }
	 * };
	 *
	 * Bank.Debit.getPendingTransactions(getPendingTxCallback);
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	getPendingTransactions: function(callback) {
		NgLogD("Public call getPendingTransactions");

		var cmd = {
			apiURL:"US.Service.Banking.Purchase.getPendingTransactions",
			data:{}
		};

		if (callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = function(err, data) {
				callback(err.error, data.openTransactions);
			};
		}

	    GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},

	_getCallBackFunc : function(callback) {
			return function(err, data) {
				if(err) {
					callback(err, undefined);
				} else {
					callback(err, data.transaction);					
				}
			};
	}
};

/**
 * @class 
 * @name Bank.Inventory
 * @description
 * Provides an interface to retrieve items from inventory. The Mobage platform
 * server is responsible for managing item inventory in games.
 */
exports.Bank.Inventory = {


	/**
	 * Retrieves the item identified by its product ID from inventory on the Mobage platform server.
	 *
	 * @name Bank.Inventory.getItem
	 * @function
	 * 
	 * @param {Number} itemId The product ID for the item.
	 * @cb {Function} callback The function to call after retrieving the item.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {Object} item Information about the item.
	 * @cb-param {String} item.description A description of the item.
	 * @cb-param {String} item.id The item ID.
	 * @cb-param {String} item.imageUrl The URL for an image of the item.
	 * @cb-param {String} item.name The name of the item.
	 * @cb-param {Number} item.price The price of the item.
	 * @cb-returns {void}
	 * @example
	 * var getItemCallback = function(error, item) {
     *      if (error) {
	 *         var errorCode = error.errorCode;
	 *         var errorDesc = error.description;
     *      } else {
     *         var itemData = item;
     *      }
	 * };
	 *
	 * Bank.Inventory.getItem(myItemId, getItemCallback);
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */    
    getItem: function(itemId,callback) {
	    NgLogD("Public call Inventory getItem");

	    var data = {
	        itemId: itemId
	    };

	    var cmd = {
	        apiURL:"US.Service.Banking.Purchase.getItem",
	        data:data
	    };

	    if (callback != undefined && typeof callback == "function") {
	        cmd["callbackFunc"] =  function(err, data) {
		        if(err) {
		            callback(err, undefined);
		        } else {
		            callback(err, data.item);					
		        }
	        };
	    }

	    GSGlobals.getRouterInstance().sendCommandToGameService(cmd);

    },

	/**
	 * Retrieves the IAP items pricing information by IAP product IDs.
	 *
     * Note that the current implementation is not synchronized. If you do the following,
     * you will only get one callback:
     *
     * Bank.Inventory.getIAPItems(itemListA, cb);
     * Bank.Inventory.getIAPItems(itemListB, cb);
     * 
     * Here are the workarounds:
     * 1. Put all the item in one list and just call getIAPItems once.
     * 2. Chain the two call like :
     * Bank.Inventory.getIAPItems(itemListA, function(err, data){
     *     Bank.Inventory.getIAPItems(itemListB, function(err, data){
     *   });
     * });
     *
	 * @name Bank.Inventory.getIAPItems
	 * @function
	 * 
	 * @param {Array} items The product ID array.
	 * @cb {Function} callback The function to call after retrieving the items.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} [error.description] A description of the error.
	 * @cb-param {String} [error.errorCode] A code identifying the error type.
	 * @cb-param {Object} data IAP product information
	 * @cb-returns {void}
     *
	 * @example
     * var items = new Array();
     * items.push("com_mobage_Dreamtopia_iOS_PLANET75");
     * items.push("com_mobage_Dreamtopia_iOS_SOLARSYSTEM165");
     * items.push("com_mobage_Dreamtopia_iOS_CONSTELLATION300");
     *     
     * Bank.Inventory.getIAPItems(items, function(err, data) {
     *     if(!err && data) {
     *          NgLogD("data = " + JSON.stringify(data));
     *     }
     * });
	 *
     * data = {"currency":"USD","items":[{"price":"29.990000","sku":"com_mobage_Dreamtopia_iOS_CONSTELLATION300","formatted":"$29.99"},{"price":"9.990000","sku":"com_mobage_Dreamtopia_iOS_PLANET75","formatted":"$9.99"},{"price":"19.990000","sku":"com_mobage_Dreamtopia_iOS_SOLARSYSTEM165","formatted":"$19.99"}]}
     *
     *
	 * Bank.Inventory.getIAPItems(items, cb);
	 * @returns {void}
	 * @status iOS
	 */    
    getIAPItems: function(items,callback) {
	    NgLogD("Public call Inventory getIAPItems");

	    var data = {
	        itemId: items
	    };

	    var cmd = {
	        apiURL:"US.Service.Banking.Purchase.getIAPItems",
	        data:data
	    };

	    if (callback != undefined && typeof callback == "function") {
	        cmd["callbackFunc"] =  function(err, data) {
		        if(err) {
		            callback(err, undefined);
		        } else {
		            callback(err, data.item);					
		        }
	        };
	    }

	    GSGlobals.getRouterInstance().sendCommandToGameService(cmd);

    }


};
