var ClassReq = require("./../Core/Class");
var Base64 = require("./../Core/Base64").Base64;
var ResultSetReq = require("./../Plus/ResultSet");

var NGSystemBindingCommands = {
    HandleAction: 0
};

var SystemBinding = ClassReq.Class.subclass({
    classname: "SystemBinding",
    callbacks: {},
    callbacksUidGenerator: 0,
    _contResultSets: {},
    _contResultSetIdxs: {}
});

var ResultSet = ClassReq.Class.subclass({
    classname: "ResultSet",
    initialize: function(continueId) {
        this.items = [];
        this._continueId = continueId;
        this.totalLength = Number.MAX_VALUE;
    },
    /*
	 * Call to getMore adds more items to items list.
	 * Please note that in the callback, it is possible that addedCount == 0
	 * in some cases.  In that case access to items[newIdx] does not yield
	 * any result
	 */
    getMore: function(cb) {
        return SystemBinding._getMoreContacts(this, cb);
    },
    /*
	 * Releases resource used by current ResultSet.
	 *
	 * To avoid resource leakage, please call closeResultSet if getMore
	 * is not called all the way to the end.
	 */
    closeResultSet: function() {
        SystemBinding._closeContactsResultSet(this);
    }
});

SystemBinding._pushContactsCmd = function(cmdname, callbackFunc, continueId) {
    // Generate unused callbackEntry
    var callbackId = SystemBinding.callbacksUidGenerator++;
    if ( !! !callbackFunc) {
        callbackFunc = function() {};
    }
    SystemBinding.callbacks[callbackId] = callbackFunc;
    var message = {
        name: cmdname,
        callbackId: callbackId
    };
    if (typeof continueId != 'undefined') {
        message.continueId = continueId;
    }
    message = JSON.stringify(message);
    NgPushCommand3(NgEntityTypes.NgSystemBinding, NGSystemBindingCommands.HandleAction,
    Base64.encode(message));
};

SystemBinding._closeContactsResultSetfunction = function(rSet) {
    // Passing empty callback as caller does not need to know when the close
    // is complete
    var cb = function() {};
    SystemBinding._pushContactsCmd('closecontacts', cb, rSet._continueId);
};

SystemBinding._getMoreContacts = function(rSet, callbackFunc) {
    if ((typeof rSet._continueId != 'undefined') &&
    (rSet.items.length < rSet.totalLength)) {
        SystemBinding._pushContactsCmd('morecontacts', callbackFunc, rSet._continueId);
        return true;
    }
    return false;
};

SystemBinding.getContacts = function(callbackFunc) {
    SystemBinding._pushContactsCmd('contacts', callbackFunc, undefined);
};

SystemBinding.getDeviceToken = function(callbackFunc) {
    // Generate unused callbackEntry
    var callbackId = SystemBinding.callbacksUidGenerator++;
    if ( !! !callbackFunc) {
        callbackFunc = function() {};
    }
    SystemBinding.callbacks[callbackId] = callbackFunc;
    var message = {
        name: 'devicetoken',
        callbackId: callbackId
    };
    message = JSON.stringify(message);
    NgPushCommand3(NgEntityTypes.NgSystemBinding, NGSystemBindingCommands.HandleAction,
    Base64.encode(message));
};

SystemBinding.handleCommand = function(command) {
    var fields = NgParseCommand2(command, NgParseInt, NgParseBase64);
    var cmd = JSON.parse(fields[1]);
    if (cmd.name == 'callback') {
    	var cb = SystemBinding.callbacks[cmd.callbackId];
		if (typeof cb == "function") {
            if (cmd.callbackname == 'contacts') {
                var obj = SystemBinding._contResultSets[cmd.continueId];
                if (typeof obj == 'undefined') {
                    // First time for this callback
                    obj = new ResultSetReq.ResultSet(cmd.continueId);
                    SystemBinding._contResultSets[cmd.continueId] = obj;
                    SystemBinding._contResultSetIdxs[cmd.continueId] = 0;
                }

                var addedCount = cmd.list.length;
                while (cmd.list.length > 0) {
                    var item = cmd.list.shift();
                    obj.items.push(item);
                }

                var newIdx = SystemBinding._contResultSetIdxs[cmd.continueId];
				if ((typeof newIdx) != 'undefined') {
                	SystemBinding._contResultSetIdxs[cmd.continueId] = newIdx + addedCount;
				}

                // Invalidate the continueId if done - when total is return (no
                // more result) or when result set is explicitly closed (cmd.closed)
                if ((typeof cmd.total != 'undefined') ||
                (typeof cmd.rsclosed != 'undefined')) {
                    if (typeof cmd.total != 'undefined') {
                        obj.totalLength = cmd.total;
                    }
                    delete obj._continueId;
                    delete SystemBinding._contResultSets[cmd.continueId];
                    delete SystemBinding._contResultSetIdxs[cmd.continueId];
                }

                delete SystemBinding.callbacks[cmd.callbackId];
				if (cmd.success) {
                	cb(undefined, obj, newIdx, addedCount);
				} else {
                	cb(cmd.error, obj, newIdx, addedCount);
				}
            } else {
                // other callbacks
                delete SystemBinding.callbacks[cmd.callbackId];
                cb(cmd);
            }
        }
    }
};

exports.SystemBinding = SystemBinding;
