////////////////////////////////////////////////////////////////////////////////
/**
 *  @author    Takaaki Mizuno
 *  Website    https://developer.mobage.com/
 *  Copyright:  2011, by DeNA Co., Ltd
 */
////////////////////////////////////////////////////////////////////////////////

var Class = require('../../NGCore/Client/Core/Class').Class;

exports.NGGOError = Class.subclass(
/** @lends Foundation.NGGOError.prototype */
{
    classname: 'NGGOError',
    /**
     * @class
     * Error description object for callback functions.
     * @constructs
     * @name Foundation.NGGOError
     * @augments Core.Class
     * @param {Number} errorCode Error code. The meaning of each error code depends on the module which generate NGGOError module. 0 means "no error" and non 0 value means "error".
     * @param {String} errorText Text description of the error.
     * @property {Number} errorCode Error code. The meaning of each error code depends on the module which generate NGGOError module. 0 should means "no error".
     * @property {String} errorText Text description of the error.
     * @property {Boolean} isError (readonly)  It returns boolean value which means it is error or not. True means error.
     */
    initialize: function( errorCode, errorText )
    {
        this._errorCode = ~~(errorCode);
        this._errorText = errorText;
    },
    /**
     * Convert the error data to text.
     * @returns {String} String expression includes error code and error text.
     */
    toString: function()
    {
        return "("+this._errorCode+") "+ this._errorText;
    },
    get errorCode()
    {
        return this._errorCode;
    },
    set errorCode(value)
    {
        this._errorCode = ~~(value);
    },
    get errorText()
    {
        return this._errorText;
    },
    set errorText(value)
    {
        this._errorText = value;
    },
    get isError()
    {
        return !!this._errorCode;
    },
    set isError(value)
    {
        if( typeof NgLodW === 'function' )
        {
            NgLogW("NGGOError: isError is read only property" );
        }
    }
});
