var ClassReq = require("./../Core/Class");
var ContactsScanBaseReq = require("./ContactsScanBase");
var SystemBindingReq = require("./../UI/SystemBinding");

var AddressBookScan = ContactsScanBaseReq.ContactsScanBase.subclass({
    classname: "AddressBookScan",
    initialize: function($super) {
		$super();
    },
    getMore: function(cb) {
	    SystemBindingReq.SystemBinding.getContacts(cb);
    }
});

exports.AddressBookScan = AddressBookScan;
