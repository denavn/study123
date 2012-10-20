var ClassReq = require("./../Core/Class");
var PlusRequestReq = require("././PlusRequest");
var UserReq = require('././User');
var sha1 = require('././sha1');

function searchContactHashes(hashes, cb) {
    var request = new PlusRequestReq.PlusRequest();
    request.setApiMethod("users/search?email_hash=" + hashes.join(","));
    request.setHttpMethod("GET");
    request.send(function(err, data, status, headers) {
	    if ((typeof err) == 'undefined') {
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

				cb(err, retlist, hashes);
                return;
            }
        }
		cb(err, [], hashes);
    });
}

function searchPlusLoop1(err, obj, newIdx, addedCount, onResultCb, onCompleteCb) {
    if ((typeof err) != 'undefined') {
        NgLogD("Error getting contacts on phone: " + err);
        onCompleteCb(err);
        return;
    }

	// Generate list of all hashes and a dict mapping hash to contact
    var hashes = [];
    var hash2contact = {};
    var idx = newIdx;
    while (idx < (newIdx + addedCount)) {
        var contact = obj.items[idx];
        contact.foundInPlus = false;
        var contactEmails = contact.lowercaseEmails;
        for (var emailIdx in contactEmails) {
			if (contactEmails.hasOwnProperty(emailIdx)) {
            	var hash = sha1.hex_sha1(contactEmails[emailIdx]);
            	hashes.push(hash);
            	hash2contact[hash] = contact;
			}
        }
        idx++;
    }

	// Loop over hash results
	// Server won't look past 100 hashes per request, so batch properly
	var serverMaxHashes = 100;
	var nextRequestSize = Math.min(serverMaxHashes,hashes.length);
	
	//
    var combineResultsCb = function(crErr,crUsers,crHashes) {
	
		var founds = [];
		var unfounds = [];
		
		// Find founds
	    for (var crUser in crUsers) {
			if (crUsers.hasOwnProperty(crUser)) {
	        	var crMyUser = crUsers[crUser];
	        	founds.push(crMyUser);
	        	var crContact = hash2contact[crMyUser.emailHash];
	        	if(crContact) {
					crContact.foundInPlus = true;
				}
				crMyUser.contact = crContact;
			}
	    }
		
		// Find unfounds
	    for (var crHashIdx in crHashes) {
	        if (crHashes.hasOwnProperty(crHashIdx)) {
				var crHash = crHashes[crHashIdx];
				if(hash2contact.hasOwnProperty(crHash)) {
					var crContact2 = hash2contact[crHash];
	            	if (!crContact2.foundInPlus) {
	                	unfounds.push(crContact2);
						// In the case when multiple hashes map to the same
						// contact, setting this to true will avoid adding
						// the same contact to the array multiple times
						// MAX: REVIEW: variable name is confusing
						crContact2.foundInPlus = true;
					}
	            }
	        }
	    }
		
		// Trigger callback now that we've parsed founds/unfounds for this batch
		onResultCb(err,founds,unfounds);
		
		// Go on to considering the next batch
        nextRequestSize = Math.min(serverMaxHashes,hashes.length);
        
        if(nextRequestSize > 0) {
			searchContactHashes(hashes.splice(0,nextRequestSize), combineResultsCb);  
		}
		// If we've run out of emails to look at, try to get more out of the
		// adress book via systemBindings.
		else {
		    var cl = function(err2, obj2, newIdx2, addedCount2) {
		        searchPlusLoop1(err2, obj2, newIdx2, addedCount2, onResultCb, onCompleteCb);
		    };

			var hasMore = obj.getMore(cl);
			if(!hasMore)
			{
			   onCompleteCb(err);
			}
		}
	};
		
	// Start looping over returned hashes.
    searchContactHashes(hashes.splice(0,nextRequestSize), combineResultsCb);
}

var ContactsScanBase = ClassReq.Class.subclass({
    classname: "ContactsScanBase",
    initialize: function(continueId) {
    },
    searchPlusForPeople: function(onResultCb, onCompleteCb) {
        var cl = function(err, obj, newIdx, addedCount) {
            searchPlusLoop1(err, obj, newIdx, addedCount, onResultCb, onCompleteCb);
        };
        this.getMore(cl);
    },
    /*
	 * It is up to the subclasses to implement getMore.
	 */
    getMore: function(cb) {
        NgLogW("NOT IMPLEMENTED - ContactsSearchBase.getMore");
    }
});

exports.ContactsScanBase = ContactsScanBase;
