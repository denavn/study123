////////////////////////////////////////////////////////////////////////////////
/**
 *  @author    Shamas Shahid
 *  Website    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
/**
 * @class
 * Error description object for callback functions.
 * @constructs
 * @name Foundation.NGGOError
 * @param {Number} errorCode Error code. The meaning of each error code depends on the module which generate NGGOError module. 0 means "no error" and non 0 value means "error".
 * @param {String} errorText Text description of the error.
 * @property {Number} errorCode Error code. The meaning of each error code depends on the module which generate NGGOError module. 0 should means "no error".
 * @property {String} message Text description of the error.
 * @property {Boolean} isError (readonly)  It returns boolean value which means it is error or not. True means error.
 * @private
 */
function NGGOError(errorCode, errorText) {
    this._errorCode = undefined;
    var _originError = new Error();
    var _arguments = _originError.arguments;
    var _type = _originError.type;
    var _stackGetter = _originError.__lookupGetter__("stack");
    var _stackSetter = _originError.__lookupSetter__("stack");
    this.arguments = _arguments;
    this.type = _type;
    if (_stackGetter !== undefined) {
        this.__defineGetter__("stack", _stackGetter);
    }
    if (_stackSetter !== undefined) {
        this.__defineSetter__("stack", _stackSetter);
    }
    Error.call(this, errorText);
    if (errorCode !== undefined) {
        this._errorCode = Number(errorCode);
    }
    if (errorText !== undefined) {
        this.message = String(errorText);
    }
    try {
        //intentional throw error.
        not.exist.variable += 0; 
    } catch (e) {
        if (e.stack !== undefined) {
            var lines = e.stack.split('\n');
            lines.shift();
            lines[0] = this.name + ': ' + this.message;
            this.stack = lines.join('\n');
        }
    }
};
NGGOError.prototype = (function(base) {
    var Inheritor = function(){};
    Inheritor.prototype = base.prototype;
    return new Inheritor();
})(Error);
NGGOError.prototype.constructor = NGGOError;
NGGOError.prototype.name = "NGGOError";
NGGOError.prototype.message = "";
/**
 * Convert the error data to text.
 * @returns {String} String expression includes error code and error text.
 */
NGGOError.prototype.toString = function() {
    return "(" + String(this._errorCode) + ") " + String(this.message);
};
NGGOError.prototype.__defineGetter__("errorCode", function() {
    return Number(this._errorCode);
});
NGGOError.prototype.__defineSetter__("errorCode", function(value){
    this._errorCode = Number(~~(value));
});
NGGOError.prototype.__defineGetter__("errorText", function() {
    return String(this.message);
});
NGGOError.prototype.__defineSetter__("errorText", function(value) {
    this.message = String(value);
});
NGGOError.prototype.__defineGetter__("isError", function() {
    return Boolean(!!this._errorCode);
});
NGGOError.prototype.__defineSetter__("isError", function(value) {
    throw new NGGOError(0, "isError() is read only property.");
});
exports.NGGOError = NGGOError;
