/**
 * @class The <code>Core.Base64</code> class provides methods for converting strings and binary data
 * to and from Base64 format.
 * @name Core.Base64
 */

/*
 * $Id: base64.js,v 1.1 2009/03/01 22:38:45 dankogai Exp dankogai $
 *
 * History:
 *   dankogai's original: character-based
 *   drry's fix: split string to array then join
 *   new version: regexp-based
 */

var Base64 = (function() {
/** @lends Core.Base64.prototype */
    var b64chars
        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var b64tab = function(bin){
        var t = {};
        for (var i = 0, l = bin.length; i < l; i++) {
            t[bin.charAt(i)] = i;
        }
        return t;
    }(b64chars);

    var fromCharCode = String.fromCharCode;

    var sub_toBase64 = function(m){
        var n = (m.charCodeAt(0) << 16)
              | (m.charCodeAt(1) <<  8)
              | (m.charCodeAt(2)      );
        return b64chars.charAt( n >>> 18)
             + b64chars.charAt((n >>> 12) & 63)
             + b64chars.charAt((n >>>  6) & 63)
             + b64chars.charAt( n         & 63);
    };

    var toBase64 = function(bin){
        if (bin.match(/[^\x00-\xFF]/)) {
            throw 'unsupported character found';
        }
        var padlen = 0;
        while(bin.length % 3) {
            bin += '\x00';
            padlen++;
        }
        var b64 = bin.replace(/[\x00-\xFF]{3}/g, sub_toBase64);
        if (!padlen) return b64;
        b64 = b64.substr(0, b64.length - padlen);
        while(padlen--) b64 += '=';
        return b64;
    };

    // use native btoa() if it exists
    var _btoa = typeof(btoa) !== "undefined" ? btoa : toBase64;

    var sub_fromBase64 = function(m){
            var n = (b64tab[ m.charAt(0) ] << 18)
                |   (b64tab[ m.charAt(1) ] << 12)
                |   (b64tab[ m.charAt(2) ] <<  6)
                |   (b64tab[ m.charAt(3) ]);
        return fromCharCode(  n >> 16 )
            +  fromCharCode( (n >>  8) & 0xff )
            +  fromCharCode(  n        & 0xff );
    };

    var fromBase64 = function(b64){
        b64 = b64.replace(/[^A-Za-z0-9\+\/]/g, '');
        var padlen = b64.length % 4;
        while(b64.length % 4){
            b64 += 'A';
        }
        var bin = b64.replace(/[A-Za-z0-9\+\/]{4}/g, sub_fromBase64);
        if (padlen >= 2)
            bin = bin.substring(0, bin.length - [0,0,2,1][padlen]);
        return bin;
    };

    // use native atob() if it exists
    var _atob = typeof(atob) !== "undefined" ? atob : fromBase64;

    var re_char_nonascii = /[^\x00-\x7F]/g;

    var sub_char_nonascii = function(m){
        var n = m.charCodeAt(0);
        return n < 0x800 ? fromCharCode(0xc0 | (n >>>  6))
                         + fromCharCode(0x80 | (n & 0x3f))
            :              fromCharCode(0xe0 | ((n >>> 12) & 0x0f))
                         + fromCharCode(0x80 | ((n >>>  6) & 0x3f))
                         + fromCharCode(0x80 |  (n         & 0x3f))
            ;
    };

    var utob = function(uni){
        return unescape(encodeURIComponent(uni));
    };

    var re_bytes_nonascii
        = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;

    var sub_bytes_nonascii = function(m){
        var c0 = m.charCodeAt(0);
        var c1 = m.charCodeAt(1);
        if(c0 < 0xe0){
            return fromCharCode(((c0 & 0x1f) << 6) | (c1 & 0x3f));
        }else{
            var c2 = m.charCodeAt(2);
            return fromCharCode(
                ((c0 & 0x0f) << 12) | ((c1 & 0x3f) <<  6) | (c2 & 0x3f)
            );
        }
    };

    var btou = function(bin){
        return decodeURIComponent(escape(bin));
    };
    return {
        fromBase64:fromBase64,
        toBase64:toBase64,
        atob:_atob,
        btoa:_btoa,
        utob:utob,
        btou:btou,
        
		/**
		 * Encode a string in Base64 format.
		 * @name encode
		 * @function
		 * @memberOf Core.Base64
		 * @example
		 * var str = "Test string";
		 * var encoded = Core.Base64.encode(str);  // returns "VGVzdCBzdHJpbmc="
		 * @param {String} u The string to encode.
		 * @returns {String} A Base64-encoded version of the string.
		 * @since 1.3.1b
		 */
        encode:function(u){
            if(!u) {
                return "";
            }
            return _btoa(utob(new String(u)));
        },
	
		/**
		 * Encode binary data in Base64 format.
		 * @name encodeBinary
		 * @function
		 * @memberOf Core.Base64
		 * @example
		 * var fileSys = Storage.FileSystem;
		 * fileSys.readFileIn(Storage.FileSystem.Store.Local, "file.bin", { },
		 *   function(err, data) {
		 *     if (err) {
		 *         console.log("An error occurred while reading " + fileName + ": " + err);
		 *     } else {
		 *         var encoded = Core.Base64.encodeBinary(data);
		 *     }
		 * });
		 * @param {String} u The binary data to encode.
		 * @returns {String} A Base64-encoded version of the data.
		 */
		// do not process unicode coversion for binary data.
		encodeBinary: function(u) {
            if(!u) {
                return "";
            }
	    	return _btoa(new String(u));
		},
	
		/**
		 * Decode a Base64-encoded string.
		 * @name decode
		 * @function
		 * @example
		 * var encoded = "VGVzdCBzdHJpbmc=";
		 * var str = Core.Base64.decode(encoded);  // returns "Test string"
		 * @memberOf Core.Base64
		 * @param {String} a A Base64-encoded string.
		 * @returns {String} The decoded string.
		 * @since 1.4.1
		 */
        decode:function(a){
            if(!a) {
                return "";
            }

        	if(a.length % 4 == 1)
			{
				throw new Error("Invalid Base64 string: " + a);
			}

            return btou(_atob(a.replace(/[\-_]/g, function(m0){
                return m0 == '-' ? '+' : '/';
            })));
		},
       
		/**
		 * Decode Base64-encoded binary data.
		 * @name decodeBinary
		 * @function
		 * @example
		 * var fileSys = Storage.FileSystem;
		 * fileSys.readFileIn(Storage.FileSystem.Store.Local, "file.bin.b64", { },
		 *   function(err, data) {
		 *     if (err) {
		 *         console.log("An error occurred while reading " + fileName + ": " + err);
		 *     } else {
		 *         var decoded = Core.Base64.decodeBinary(data);
		 *     }
		 * });
		 * @memberOf Core.Base64
		 * @param {String} a Base64-encoded binary data.
		 * @returns {String} The decoded data.
		 */
		// do not process unicode conversion for binary data.
		decodeBinary: function(a) {
            if(!a) {
                return "";
            }
            return _atob(a.replace(/[\-_]/g, function(m0){
                return m0 == '-' ? '+' : '/';
            }));
       }
    };
})();

exports.Base64 = Base64;
