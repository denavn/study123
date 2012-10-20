var ClassReq = require("./../Core/Class");
var PlusRequestReq = require("././PlusRequest");
var UserReq = require('././User');
var hex_sha1_req = require('././sha1');

var ContactSearch = ClassReq.Class.subclass({
    classname: "ContactSearch",
    initialize: function($super, emails) {
		this._emails = emails;
    },

    getSearchResults: function(fieldlist, cb) {
		var sparseMode = true;
		for (var key in fieldlist) {
			if (fieldlist.hasOwnProperty(key)) {
				var field = fieldlist[key];
				if (UserReq.User.NonSparseKeys.indexOf(field) > -1) {
					sparseMode = false;
					break;
				}
			}
		}
		var hashes = [];
		for (var idx in this._emails) {
			if (this._emails.hasOwnProperty(idx)) {
				var hash = hex_sha1_req.hex_sha1(this._emails[idx]);
				hashes.push(hash);
			}
		}

        var request = new PlusRequestReq.PlusRequest();
        request.setApiMethod("users/search?email_hash=" + hashes.join(","));
        request.setHttpMethod("GET");
        request.send(function(err, data, status, headers) {
            var users = null;
            if (!err) {
                var success = data.success;
                if (success) {
                    var retlist = [];
                    for (var idx in data.list) {
                        if (data.list.hasOwnProperty(idx)) {
                            var item = data.list[idx];
                            var userObj = UserReq.User.getUserWithData(item);
                            retlist.push(userObj);
                        }
                    }
					// for contact search there is no 'page size' hence null
					// is used for that field
					if (sparseMode) {
                    	cb(err, retlist, data.total, data.offset, null);
					} else {
						UserReq.User._loopUsersDetails(cb, err, data.total, data.offset, null, retlist, []);
					}
                    return;
                }
            }
            cb(err, null, null, null, null);
        });
    }
});

exports.ContactSearch = ContactSearch;
