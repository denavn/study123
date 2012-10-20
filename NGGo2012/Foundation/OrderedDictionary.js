////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Takaaki Mizuno
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

var Class = require('./Class').Class;

var OrderedDictionary = Class.subclass(
/** @lends Foundation.OrderedDictionary.prototype */
{
    classname: 'OrderedDictionary',
    /**
     * @class
     * Dictionary like collection which persists the order of entries similar to an array.
     * @constructs
     * @param {String} [json] Initial data formatted in JSON.
     * @property {Number} length (readonly) Number of entries.
     * @property {String[]} keys (readonly) Array includes key of all entries.
     * @property {String[]} values (readonly) Array includes value of all entries.
     * @property {String[]} items (readonly) Array includes key/value of all entries.
     * @name Foundation.OrderedDictionary
     */
    initialize: function( json )
    {
        this._list = [];
        this._hash = {};
        if( typeof json === 'string' )
        {
            this._fromJSON(json);
        }
    },
    /**
     * Adds entry to the end of this dictionary and returns the new length of the array.
     * @param {String} key Key of entry
     * @param {any} obj Value of entry.
     * @returns {Number} New length of this OrderedDictionary.
     */
    push: function( key, obj )
    {
        var index = this._list.indexOf(key);
        if( index > -1 )
        {
            return -1;
        }
        this._list.push(key);
        this._hash[key] = obj;
        return this._list.length-1;
    },
    /**
     * Removes the last entry from this dictionary and returns the value of the entry.
     * @returns {any} Value of removed entry.
     */
    pop: function()
    {
        var key = this._list.pop();
        var obj = this._hash[key];
        delete this._hash[key];
        return obj;
    },
    /**
     * Removes the first entry from this dictionary and returns the value of the entry.
     * @returns {any} Value of removed entry.
     */
    shift: function()
    {
        var key = this._list.shift();
        var obj = this._hash[key];
        delete this._hash[key];
        return obj;
    },
    /**
     * Adds entry to the beginning of this dictionary and returns the new length of the array.
     * @param {String} key Key of entry
     * @param {any} obj Value of entry.
     * @returns {Number} New length of this OrderedDictionary.
     */
    unshift: function(key, obj )
    {
        var index = this._list.indexOf(key);
        if( index > -1 )
        {
            return -1;
        }
        this._list.unshift(key);
        this._hash[key] = obj;
        return 0;
    },
    /**
     * Inserts entry to paticular position and return that position. If speficied key already exists, old value has been removed and updated with new index and value.
     * @param {Number} index The position to insert entry.
     * @param {String} key Key of entry
     * @param {any} obj Value of entry.
     * @returns {Number} The position the entry inserted ( -1 will be returned if it failed ).
     */
    insert: function(index, key, obj)
    {
        // Check if specified key already exists.
        this.remove(key);
        if( index >= this._list.length )
        {
            this._list[index] = key;
        }
        else
        {
            this._list.splice(index, 0, key);
        }
        this._hash[key] = obj;
        return index;
    },
    /**
     * Set the value to entry specified by key.
     * @param {String} key key to set the value
     * @param {any} obj Value to set
     */
    set: function(key, obj)
    {
        var index = this._list.indexOf(key);
        if( index > -1 )
        {
            this._hash[key] = obj;
        }
        else
        {
            this.push(key, obj);
        }
    },
    /**
     * Set the value to entry when the key doesn't exist.
     * @param {String} key key to set the value
     * @param {any} obj Value to set
     */
    setDefault: function(key, obj)
    {
        var index = this._list.indexOf(key);
        if( index === -1 )
        {
            this.push(key, obj);
            return obj;
        }
        return this._hash[key];
    },
    /**
     * Remove entry specified by key.
     * @param {String} key ket to remove the value
     * @returns {any} Value of removed entry.
     */
    remove: function( key )
    {
        var index = this._list.indexOf(key);
        if( index === -1 )
        {
            return undefined;
        }
        this._list.splice(index, 1);
        var obj = this._hash[key];
        delete this._hash[key];
        return obj;
    },
    /**
     * Remove entry specified by index.
     * @param {Number} index Index to get the value. 
     * @returns {any} Value of removed entry.
     */
    removeByIndex: function( index )
    {
        var key = this.getKeyByIndex(index);
        return this.remove(key);
    },
    
    /**
     * Get an entry value specified by key.
     * @param {String} key Key to get the value.
     * @param {any} defaultValue Default value if the key does not exist.
     * @returns {any} value specified by given key.
     */
    get: function( key, defaultValue )
    {
        var result = this._hash[key];
        if (result === undefined)
        {
            return defaultValue;
        }
        return result;
    },
    /**
     * Get an entry value specified by index.
     * @param {Number} index index to get the value.
     * @returns {any} value specified by given index.
     */
    getByIndex: function( index )
    {
        var key = this._list[index];
        return this._hash[key];
    },
    /**
     * Get an entry key specified by index.
     * @param {Number} index index to get the key.
     * @returns {any} key specified by given index.
     */
    getKeyByIndex: function( index )
    {
        return this._list[index];
    },
    /**
     * Clear all the entries.
     */
    clear: function()
    {
        this._list = [];
        this._hash = {};
    },
    /**
     * Remove multiple entries from this OrderedDictionary
     * @param {Number} start Start index position to remove.
     * @param {Number} n  Number to remove
     * @returns {Array} Array of removed values.
     */
    splice: function(start, n)
    {
        var i;
        var list = this._list.splice(start, n);
        var len = list.length;
        var res = [];
        for( i=0; i<len; i++ )
        {
            var key = list[i];
            res.push( this._hash[key]);
            delete this._hash[key];
        }
        return res;
    },
    /**
     * Reverse the order of entries.
     */
    reverse: function()
    {
        this._list.reverse();
    },
    /**
     * Sorts the order of entries.
     * @example
     * ordereddict.sort(function(a, b) { areturn a-b; });
     * @param {Function} cmp Comparater function.
     */
    sort: function(cmp)
    {
        return this._list.sort(cmp);
    },
    /**
     * Get JSON expression of OrderedDictionary.
     * @returns {String} JSON text describe this object.
     */
    toJSON: function()
    {
        return JSON.stringify(
            {
                list: this._list,
                hash: this._hash
            }
        );
    },
    /**
     * Ailias method of toJSON.
     * @returns {String} JSON text describe this object.
     */
    toString: function()
    {
        return this.toJSON();
    },
    // property getter
    get length()
    {
        return this._list.length;
    },
    set length(value)
    {
        if( typeof NgLogW === 'function' )
        {
            NgLogW("OrderedDictionary: length is a read only property.");
        }
    },
    get keys()
    {
        var i;
        var ret = [];
        var len = this._list.length;
        for( i=0; i<len; i++ )
        {
            ret.push(this._list[i]);
        }
        return ret;
    },
    set keys(value)
    {
        if( typeof NgLogW === 'function' )
        {
            NgLogW("OrderedDictionary: keys is a read only property.");
        }
    },
    get values()
    {
        var i;
        var ret = [];
        var len = this._list.length;
        for( i=0; i<len; i++ )
        {
            ret.push(this._hash[this._list[i]]);
        }
        return ret;
    },
    set values(value)
    {
        if( typeof NgLogW === 'function' )
        {
            NgLogW("OrderedDictionary: values is a read only property.");
        }
    },
    get items()
    {
        var i;
        var ret = [];
        var len = this._list.length;
        for( i=0; i<len; i++ )
        {
            ret.push([this._list[i], this._hash[this._list[i]]]);
        }
        return ret;
    },
    set items(value)
    {
        if( typeof NgLogW === 'function' )
        {
            NgLogW("OrderedDictionary: items is a read only property.");
        }
    },
    /** @private */
    _fromJSON: function(json)
    {
        var obj;
        try
        {
            obj = JSON.parse(json);
        }
        catch (ex)
        {
            throw new Error("<NGGO> OrderedDictionary: JSON Parse Error");
        }
        if( !obj.list || !obj.hash )
        {
            return;
        }
        this._list = obj.list;
        this._hash = obj.hash;
    }
});

exports.OrderedDictionary = OrderedDictionary;
