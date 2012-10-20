var Class = require('./Class').Class;

exports.Buffer = Class.subclass(
/** @lends Core.Buffer.prototype */
{
  classname: 'Buffer',

  /**
   * @class The <code>Core.Buffer</code> class provides buffers for storing binary data. Use this
   * class in combination with <code>{@link Network.Socket}</code> to transmit data through a
   * socket.<br /><br />
   * In general, when you use this class' methods to read data from a buffer, the data is removed
   * from the buffer. If you need to retrieve data from a buffer without altering the buffer's
   * contents, do one of the following:
   * <ul>
   * <li>Retrieve the buffer's contents using <code>{@link Core.Buffer#toString}</code>.</li>
   * <li>Clone the buffer using <code>{@link Core.Buffer#clone}</code>, then read data from the
   * cloned buffer.</li>
   * </ul>
   * @example
   * // Create an empty data buffer.
   * var buffer = new Core.Buffer();
   * @example
   * // Create a data buffer that contains a string of text.
   * var buffer = new Core.Buffer("data");
   * @example
   * // Create a data buffer by copying data from an existing buffer.
   * var buffer1 = new Core.Buffer("data");
   * var buffer2 = new Core.Buffer(buffer1);
   * @constructs Create a data buffer.
   * @augments Core.Class
   * @param {Core.Buffer|String} [data] An existing data buffer whose contents will be copied to the
   *     new buffer, or a string that will be stored in the buffer.
   * @see Network.Socket
   * @since 1.6.5
   */
  initialize: function()
  {
    this._log2 = function(x) {
      return Math.floor(Math.log(x) / Math.LN2);
    };

    this._toIEEE754 = function(val, ctx, bitWidth) {
      var EBITS;  // num of bits in exponent field
      var FBITS;  // num of bits in significand field

      switch(bitWidth) {
        case 32:
          EBITS = 8;
          FBITS = 23;
          break;
        case 64:
          EBITS = 11;
          FBITS = 52;
          break;
        default:
          throw "Invalid bit width";
      }

      var BIAS = Math.pow(2, EBITS-1) - 1;

      ctx.neg = (val < 0)? 1:0;
      ctx.expo = 0;
      ctx.sigd = 0;

      val = Math.abs(val);

      if(isNaN(val)) {
        ctx.neg = 0;
        ctx.expo = 0;
        ctx.sigd = 1;
      } else if(!isFinite(val)) {
        ctx.expo = Math.pow(2, EBITS) - 1;
        ctx.sigd = 0;
      } else if(val === 0) {
        ctx.expo = 0;
        ctx.sigd = 0;
      } else {
        ctx.expo = this._log2(val);
        if(ctx.expo < (1-BIAS) || (ctx.expo == (1-BIAS) && val < Math.pow(2, (1-BIAS)))) {
          ctx.sigd = Math.round((val / Math.pow(2, (1-BIAS))) * Math.pow(2, FBITS));
          ctx.expo = 0;
        } else {
          ctx.sigd = Math.round((val / Math.pow(2, ctx.expo) - 1) * Math.pow(2, FBITS));
          ctx.expo += BIAS;
        }
      }
    };

    this._fromIEEE754 = function(ctx, bitWidth) {
      var EBITS;  // num of bits in exponent field
      var FBITS;  // num of bits in significand field

      switch(bitWidth) {
        case 32:
          EBITS = 8;
          FBITS = 23;
          break;
        case 64:
          EBITS = 11;
          FBITS = 52;
          break;
        default:
          throw "Invalid bit width";
      }

      var BIAS = Math.pow(2, EBITS-1) - 1;

      if(ctx.expo === 0) {
        if(ctx.sigd === 0) {
          return 0.0;
        }

        return ctx.neg * ctx.sigd * Math.pow(2, (1-BIAS) - FBITS);
      }

      if(ctx.expo == Math.pow(2, EBITS) - 1) {
        if(ctx.sigd === 0) {
          return ctx.neg * Number.POSITIVE_INFINITY;
        }

        return NaN;
      }

      return ctx.neg * (1 + ctx.sigd * Math.pow(2, -FBITS)) * Math.pow(2, ctx.expo - BIAS);
    };

    this._array2val = function(bytes, isLE) {
      var val = 0;
      if(isLE) bytes.reverse();
      for(var i = 0; i < bytes.length; ++i) {
        val += bytes[i] * Math.pow(2, (bytes.length - i - 1) * 8);
      }
      return val;
    };

    this._array2str = function(bytes, isLE) {
      if(isLE) bytes.reverse();
      return String.fromCharCode.apply(String, bytes);
    };

    this._isBinary = function(str) {
      for(var i = 0; i < str.length; ++i) {
        var c = str.charCodeAt(i);
        if(c < 0 && c >= 0x100) {
          return false;
        }
      }
      return true;
    };

    if(typeof(arguments[0]) == 'object') {
      this._bytes = arguments[0]._bytes;
    } else if(typeof(arguments[0]) == 'string') {
      this._bytes = arguments[0];
    } else {
      this._bytes = '';
    }

    if(!this._isBinary(this._bytes)) {
      this._bytes = '';
    }
  },

  /**
   * Retrieve the number of characters in the buffer.
   * @returns {Number} The number of characters in the buffer.
   * @since 1.6.5
   */
  getSize: function() {
    return this._bytes.length;
  },

  /**
   * Read an 8-bit unsigned integer value from the beginning of the buffer, and remove the character
   * at index 0 of the buffer.
   * @returns {Number} An 8-bit unsigned integer value, or <code>NaN</code> if the buffer is empty.
   * @since 1.6.5
   */
  readUint8: function() {
    if(this._bytes.length < 1) return NaN;
    var ret = this._bytes.charCodeAt(0);
    this._bytes = this._bytes.slice(1);
    return ret;
  },

  /**
   * Read a 16-bit unsigned integer value from the beginning of the buffer, and remove the 
   * characters at indexes 0 and 1 of the buffer.
   * @param {Boolean} [isLE=false] Set to <code>true</code> to read data in little-endian format. By
   *     default, data is read in big-endian format.
   * @returns {Number} A 16-bit unsigned integer value, or <code>NaN</code> if the buffer contains
   *     fewer than 16 bits of data.
   * @since 1.6.5
   */
  readUint16: function(isLE) {
    if(this._bytes.length < 2) return NaN;
    var ret = this._array2val([
      this._bytes.charCodeAt(0),
      this._bytes.charCodeAt(1)
    ], isLE);
    this._bytes = this._bytes.slice(2);
    return ret;
  },

  /**
   * Read a 32-bit unsigned integer value from the beginning of the buffer, and remove the 
   * characters at indexes 0 through 3 of the buffer.
   * @param {Boolean} [isLE=false] Set to <code>true</code> to read data in little-endian format. By
   *     default, data is read in big-endian format.
   * @returns {Number} A 32-bit unsigned integer value, or <code>NaN</code> if the buffer contains
   *     fewer than 32 bits of data.
   * @since 1.6.5
   */
  readUint32: function(isLE) {
    if(this._bytes.length < 4) return NaN;
    var ret = this._array2val([
      this._bytes.charCodeAt(0),
      this._bytes.charCodeAt(1),
      this._bytes.charCodeAt(2),
      this._bytes.charCodeAt(3)
    ], isLE);
    this._bytes = this._bytes.slice(4);
    return ret;
  },

  /**
   * Read an 8-bit signed integer value from the beginning of the buffer, and remove the character
   * at index 0 of the buffer.
   * @returns {Number} An 8-bit signed integer value, or <code>NaN</code> if the buffer is empty.
   * @since 1.6.5
   */
  readInt8: function() {
    var ret = this.readUint8();
    if(ret >>> 7) {
      return ret - 0x100;
    }
    return ret;
  },

  /**
   * Read a 16-bit signed integer value from the beginning of the buffer, and remove the characters
   * at indexes 0 and 1 of the buffer.
   * @param {Boolean} [isLE=false] Set to <code>true</code> to read data in little-endian format. By
   *     default, data is read in big-endian format.
   * @returns {Number} A 16-bit signed integer value, or <code>NaN</code> if the buffer contains
   *     fewer than 16 bits of data.
   * @since 1.6.5
   */
  readInt16: function(isLE) {
    var ret = this.readUint16(isLE);
    if(ret >>> 15) {
      return ret - 0x10000;
    }
    return ret;
  },

  /**
   * Read a 32-bit signed integer value from the beginning of the buffer, and remove the characters
   * at indexes 0 through 3 of the buffer.
   * @param {Boolean} [isLE=false] Set to <code>true</code> to read data in little-endian format. By
   *     default, data is read in big-endian format.
   * @returns {Number} A 32-bit signed integer value, or <code>NaN</code> if the buffer contains
   *     fewer than 32 bits of data.
   * @since 1.6.5
   */
  readInt32: function(isLE) {
    var ret = this.readUint32(isLE);
    if(ret >>> 31) {
      return ret - 0x100000000;
    }
    return ret;
  },

  /**
   * Read a 64-bit signed float value from the beginning of the buffer, and remove the characters at
   * indexes 0 through 7 of the buffer.
   * @param {Boolean} [isLE=false] Set to <code>true</code> to read data in little-endian format. By
   *     default, data is read in big-endian format.
   * @returns {Number} A 64-bit float value, or <code>NaN</code> if the buffer contains fewer than
   *     64 bits of data.
   * @since 1.6.5
   */
  readFloat64: function(isLE) {
    if(this._bytes.length < 8) return NaN;
    var b = [
      this._bytes.charCodeAt(0),
      this._bytes.charCodeAt(1),
      this._bytes.charCodeAt(2),
      this._bytes.charCodeAt(3),
      this._bytes.charCodeAt(4),
      this._bytes.charCodeAt(5),
      this._bytes.charCodeAt(6),
      this._bytes.charCodeAt(7)
    ];

    if(isLE) b.reverse();
    this._bytes = this._bytes.slice(8);

    var ctx = {
      neg: 1 - (2 * (b[0] >> 7)), // 1 or -1
      expo: (((b[0] << 1) & 0xff) << 3) | (b[1] >> 4),
      sigd: ((b[1] & 0x0f) * 0x1000000000000) +
            (b[2] * 0x10000000000) +
            (b[3] * 0x100000000) +
            (b[4] * 0x1000000) +
            (b[5] * 0x10000) +
            (b[6] * 0x100) +
            b[7]
    };

    return this._fromIEEE754(ctx, 64);
  },

  /**
   * Read a 32-bit float value from the beginning of the buffer, and remove the characters at
   * indexes 0 through 3 of the buffer.
   * @param {Boolean} [isLE=false] Set to <code>true</code> to read data in little-endian format. By
   *     default, data is read in big-endian format.
   * @returns {Number} A 32-bit float value, or <code>NaN</code> if the buffer contains fewer than
   *     32 bits of data.
   * @since 1.7
   */
  readFloat32: function(isLE) {
    if(this._bytes.length < 4) return NaN;
    var b = [
      this._bytes.charCodeAt(0),
      this._bytes.charCodeAt(1),
      this._bytes.charCodeAt(2),
      this._bytes.charCodeAt(3)
    ];

    if(isLE) b.reverse();
    this._bytes = this._bytes.slice(4);

    var ctx = {
      neg: 1 - (2 * (b[0] >> 7)),
      expo: (((b[0] << 1) & 0xff) | (b[1] >> 7)) & 0xffff,
      sigd: ((b[1] & 0x7f) * 0x10000) +
            (b[2] * 0x100) +
            b[3]
      };

    return this._fromIEEE754(ctx, 32);
  },

  /**
   * Read the specified number of characters from the buffer, and remove the characters from the
   * buffer.
   * @param {Number} len The number of characters to read.
   * @returns {String} The characters read from the buffer.
   * @since 1.6.5
   */
  readBytes: function(len) {
    if(len > this._bytes.length) {
      len = this._bytes.length;
    }
    var ret = this._bytes.slice(0, len);
    this._bytes = this._bytes.slice(len);
    return ret;
  },

  /**
   * Write a value to the end of the buffer as an 8-bit unsigned integer. One character will be
   * appended to the buffer.
   * @param {Number} val The value to write into the buffer.
   * @returns {void}
   * @since 1.6.5
   */
  writeUint8: function(val) {
    this._bytes += String.fromCharCode(val);
  },

  /**
   * Write a value to the end of the buffer as a 16-bit unsigned integer. Two characters will be
   * appended to the buffer.
   * @param {Number} val The value to write into the buffer.
   * @param {Boolean} [isLE=false] Set to <code>true</code> to write data in little-endian format.
   *     By default, data is written in big-endian format.
   * @returns {void}
   * @since 1.6.5
   */
  writeUint16: function(val, isLE) {
    this._bytes += this._array2str([
      val>>>8,
      val & 0xff
    ], isLE);
  },

  /**
   * Write a value to the end of the buffer as a 32-bit unsigned integer. Four characters will be
   * appended to the buffer. The value is written in big-endian format.
   * @param {Number} val The value to write into the buffer.
   * @param {Boolean} [isLE=false] Set to <code>true</code> to write data in little-endian format.
   *     By default, data is written in big-endian format.
   * @returns {void}
   * @since 1.6.5
   */
  writeUint32: function(val, isLE) {
    this._bytes += this._array2str([
      (val >>> 24) & 0xff,
      (val >>> 16) & 0xff,
      (val >>> 8) & 0xff,
      val & 0xff
    ], isLE);
  },

  /**
   * Write a value to the end of the buffer as an 8-bit signed integer. One character will be
   * appended to the buffer.
   * @param {Number} val The value to write into the buffer.
   * @returns {void}
   * @throws {Error} The specified value cannot be represented as an 8-bit signed integer.
   * @since 1.6.5
   */
  writeInt8: function(val) {
    if(val < -0x80 || val > 0x7f) throw new Error('Invalid argument');
    if(val < 0) {
      val = 0x100 + val;
    }
    this.writeUint8(val);
  },

  /**
   * Write a value to the end of the buffer as a 16-bit signed integer. Two characters will be
   * appended to the buffer.
   * @param {Number} val The value to write into the buffer.
   * @param {Boolean} [isLE=false] Set to <code>true</code> to write data in little-endian format.
   *     By default, data is written in big-endian format.
   * @returns {void}
   * @throws {Error} The specified value cannot be represented as a 16-bit signed integer.
   * @since 1.6.5
   */
  writeInt16: function(val, isLE) {
    if(val < -0x8000 || val > 0x7fff) throw new Error('Invalid argument');
    if(val < 0) {
      val = 0x10000 + val;
    }
    this.writeUint16(val, isLE);
  },

  /**
   * Write a value to the end of the buffer as a 32-bit signed integer. Four characters will be
   * appended to the buffer.
   * @param {Number} val The value to write into the buffer.
   * @param {Boolean} [isLE=false] Set to <code>true</code> to write data in little-endian format.
   *     By default, data is written in big-endian format.
   * @returns {void}
   * @throws {Error} The specified value cannot be represented as a 32-bit signed integer.
   * @since 1.6.5
   */
  writeInt32: function(val, isLE) {
    if(val < -0x80000000 || val > 0x7fffffff) throw new Error('Invalid argument');
    if(val < 0) {
      val = 0x100000000 + val;
    }
    this.writeUint32(val, isLE);
  },

  /**
   * Write a value to the end of the buffer as a 64-bit signed float. Eight characters will be 
   * appended to the buffer.
   * @param {Number} val The value to write into the buffer.
   * @param {Boolean} [isLE=false] Set to <code>true</code> to write data in little-endian format.
   *     By default, data is written in big-endian format.
   * @returns {void}
   * @since 1.6.5
   */
  writeFloat64: function(val, isLE) {
    var ctx = {};
    this._toIEEE754(val, ctx, 64);

    var sigdu = Math.floor(ctx.sigd / 0x100000000);
    var sigdl = ctx.sigd % 0x100000000;

    this._bytes += this._array2str([
      (ctx.neg << 7) | (ctx.expo >> 4),
      (ctx.expo & 0x0f) << 4 | ((sigdu >> 16) & 0x0f),
      (sigdu >> 8) & 0xff,
      sigdu & 0xff,
      (sigdl >>> 24) & 0xff,
      (sigdl >>> 16) & 0xff,
      (sigdl >>> 8) & 0xff,
      sigdl & 0xff
    ], isLE);
  },

  /**
   * Write a value to the end of the buffer as a 32-bit float. Four characters will be appended to
   * the buffer.
   * @param {Number} val The value to write into the buffer.
   * @param {Boolean} [isLE=false] Set to <code>true</code> to write data in little-endian format.
   *     By default, data is written in big-endian format.
   * @returns {void}
   * @since 1.7
   */
  writeFloat32: function(val, isLE) {
    var ctx = {};
    this._toIEEE754(val, ctx, 32);

    this._bytes += this._array2str([
      (ctx.neg << 7) | (ctx.expo >>> 1),
      ((ctx.expo << 7) & 0xff) | ((ctx.sigd >> 16) & 0x7f),
      (ctx.sigd >> 8) & 0xff,
      ctx.sigd & 0xff
    ], isLE);
  },

  /**
   * Write characters to the end of the buffer.
   * @param {String} str The characters to write into the buffer.
   * @returns {void}
   * @since 1.6.5
   */
  writeBytes: function(str) {
    if(this._isBinary(this._bytes)) {
      this._bytes += str;
    }
  },

  /**
   * Retrieve the buffer's contents as a string.
   * @returns {String} The contents of the buffer.
   * @since 1.6.5
   */
  toString: function() {
      return this._bytes;
  },

  clear: function() {
    this._bytes = '';
  },

  /**
   * Create a copy of the <code>Core.Buffer</code> object.
   * @returns {Core.Buffer} A copy of the <code>Core.Buffer</code> object.
   * @since 1.6.5
   */
  clone: function() {
    return new exports.Buffer(this);
  },

  /**
   * Remove a portion of the buffer's data, and create a new buffer containing the data that was
   * removed.
   * @param {Number} begin The index of the first character to remove from the buffer.
   * @param {Number} [end] The index of the last character to remove from the buffer. If you omit
   *     omit this parameter, all of the data after the starting index will be removed.
   * @returns {Core.Buffer} A new <code>Core.Buffer</code> object containing the data that was
   *     removed from the original buffer.
   * @since 1.6.5
   */
  slice: function(begin, end) {
    return new exports.Buffer(this._bytes.slice(begin, end));
  }
});

// vim: ts=2:sw=2:expandtab:
