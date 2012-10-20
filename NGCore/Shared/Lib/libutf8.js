/*
 * A JavaScript implementation of UTF-8 encoder and decoder.
 */

var UTF8 = (function() {

  /**
   * Encode a string in UTF-8 format.
   * @name encode
   * @function
   * @memberOf Core.UTF8
   * @example
   * var str = "Test string";
   * var utf8 = Core.UTF8.encode(str);
   * @param {String} str The string to encode.
   * @returns {String} A UTF-8 encoded string.
   * @since 1.7
   */
  var _toUTF8 = function(str) {
    var utf8 = "";

    for (var n = 0; n < str.length; n++) {
      var c = str.charCodeAt(n);

      if(c < 128) {
        utf8 += String.fromCharCode(c);
      } else if((c > 127) && (c < 2048)) {
        utf8 += String.fromCharCode((c >> 6) | 192);
        utf8 += String.fromCharCode((c & 63) | 128);
      } else {
        utf8 += String.fromCharCode((c >> 12) | 224);
        utf8 += String.fromCharCode(((c >> 6) & 63) | 128);
        utf8 += String.fromCharCode((c & 63) | 128);
      }
    }

    return utf8;
  };

  /**
   * Decode a string in UTF-8 format.
   * @name decode
   * @function
   * @memberOf Core.UTF8
   * @example
   * var str = Core.UTF8.decode(utf8);
   * @param {String} utf8 A UTF-8 encoded string.
   * @returns {String} Decodeded string.
   * @since 1.7
   */
  var _fromUTF8 = function(utf8) {
    var str = "";
    var i = 0;
    var c = 0, c1 = 0, c2 = 0;

    while ( i < utf8.length ) {
      c = utf8.charCodeAt(i);

      if(c < 128) {
        str += String.fromCharCode(c);
        i++;
      } else if((c > 191) && (c < 224)) {
        c2 = utf8.charCodeAt(i+1);
        str += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utf8.charCodeAt(i+1);
        var c3 = utf8.charCodeAt(i+2);
        str += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }

    return str;
  };

  return { encode: _toUTF8, decode: _fromUTF8 };
})();

exports.UTF8 = UTF8;

// vim: ts=2:sw=2:expandtab
