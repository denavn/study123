////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Takaaki Mizuno
 *  Website:    https://developer.mobage.com/
 *  Copyright:  2011, by DeNA Co., Ltd
 */
////////////////////////////////////////////////////////////////////////////////

var Mixin = require('./Mixin').Mixin;

/**
 * @class Mixin object to add oberver pattern event feature.
 * @name Foundation.Observable
 * @constructs
 */
exports.Observable = Mixin.generate(
/** @lends Foundation.Observable.prototype */
{
    /**
     * Attachs observer function(s).
     * @param {String|Object} name Name of the event attach the observer. Or object includes one or more observers with event name.
     * @param {Function} func Observer function associate with name.
     * @returns {Number} ID of the attached listner(s)
     */
    addObserver: function(name, func)
    {
        var obj;
        if( typeof name === 'string' && typeof func === 'function' )
        {
            obj = {};
            obj[name] = func;
        }
        else if( typeof name === 'object' )
        {
            obj = name;
        }
        else
        {
            return -1;
        }

        if( typeof this.__observers !== 'object'
            || !this.__observers.length )
        {
            this.__observers = [];
        }
        this.__observers.push(obj);
        return this.__observers.length;
    },
    /**
     * Dettachs listner function(s)
     * @param {Object|Number} id ID of observer function(s) or object which passed to the add observer method.
     * @retuns {Number} Deleted observer ID.
     */
    deleteObserver: function(id)
    {
        var i;
        var list = this.__observers;
        if( typeof list !== "object" || !list.length )
        {
            return -1;
        }
        if( typeof id === "number" )
        {
            if( list.length >= id )
            {
                list[id-1] = {};
                return id;
            }
        }
        else if( typeof id === "object" )
        {
            var len = list.length;
            for(i=0; i<len; i++)
            {
                if( id === list[i])
                {
                    list[i] = {};
                    return i;
                }
            }
        }
        return -1;
    },
    /**
     * Delete all observers.
     */
    deleteObservers: function()
    {
        if( this.__observers )
        {
            delete this.__observers;
        }
    },
    /**
     * Get how many observers are attached to paticular event name.
     * @param {String} name Name of event.
     * @retuns {Number} Number of observer functions.
     */
    countObservers: function(name)
    {
        var i;
        var list = this.__observers;
        if( typeof list !== 'object' || !list.length )
        {
            return 0;
        }
        if( typeof name === 'string' )
        {
            var count = 0;
            var len = list.length;
            for(i=0; i<len; i++)
            {
                var h = list[i];
                if( typeof h === 'object' && typeof h[name] === 'function' )
                {
                    count++;
                }
            }
            return count;
        }
        if( typeof list !== "object" || !list.length )
        {
            return 0;
        }
        return list.length;
    },
    /**
     * Execute observer associated with the name.
     * @param {String} name Event name to notify
     */
    notify: function( name )
    {
        var i;
        var list = this.__observers;
        if( typeof name !== 'string'
            || typeof list !== "object"
            || !list.length )
        {
            return;
        }
        var args = Array.prototype.slice.call(arguments, 1);
        var len = list.length;
        for(i=0; i<len; i++)
        {
            var h = list[i];
            if( typeof h === 'object' && typeof h[name] === 'function' )
            {
                try
                {
                    h[name].apply( h, args );
                }
                catch (ex)
                {
                    if( typeof NgLogException === 'function' )
                    {
                        NgLogException(ex);
                    }
                }
            }
        }
        return;
    }
});
