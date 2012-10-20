var ClassReq = require("./../Core/Class");
var SystemBindingReq = require('./../UI/SystemBinding');

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
        return SystemBindingReq.SystemBinding._getMoreContacts(this, cb);
    },
    /*
	 * Releases resource used by current ResultSet.
	 *
	 * To avoid resource leakage, please call closeResultSet if getMore
	 * is not called all the way to the end.
	 */
    closeResultSet: function() {
        SystemBindingReq.SystemBinding._closeContactsResultSet(this);
    }
});

exports.ResultSet = ResultSet;
