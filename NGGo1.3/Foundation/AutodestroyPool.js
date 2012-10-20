////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Takushima Nobutaka
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

var Class = require("../../NGCore/Client/Core/Class").Class;

/** @private */
var AutodestroyPoolStack = Class.singleton(
{
    initialize: function()
    {
        this._attached = false;
        this._stack = [];
        this.attach();
    },
    /**
     * @returns {Boolean}
     * @private
     */
    attach: function()
    {
        if (this._isAttached() === false)
        {
            this._attach();
            this._attached = true;
            return true;
        }
        else {
            return false;
        }
    },
    /**
     * @returns {Boolean}
     * @private
     */
    detach: function()
    {
        if (this._isAttached() === true)
        {
            this._detach();
            this._attached = false;
            return true;
        }
        else
        {
            return false;
        }
    },
    _attach: function()
    {
        var that = this;
        Class.prototype.autodestroy = function()
        {
            that._getTopPool().addObject(this);
            return this;
        };
        Class.prototype.noAutodestroy = function()
        {
            if(this.__ownerPool)
            {
                this.__ownerPool.removeObject(this);
            }
            return this;
        };
    },
    _detach: function()
    {
        delete Class.prototype.autodestroy;
        delete Class.prototype.noAutodestroy;
    },
    _isAttached: function()
    {
        return this._attached;
    },
    _pushPool: function(pool)
    {
        this._stack.push(pool);
    },
    _destroyPool: function(pool)
    {
        var index = this._stack.lastIndexOf(pool);
        var poolsAboveThePool = this._stack.splice(index, this._stack.length - index);
        var i;

        for(i = 0; i < poolsAboveThePool.length; i++)
        {
            poolsAboveThePool[i]._destroyObjects();
        }
    },
    _getTopPool: function()
    {
        return this._stack[this._stack.length - 1];
    }
});

exports.AutodestroyPool = Class.subclass(
/** @lends Foundation.AutodestroyPool.prototype */
{
    classname: 'AutodestroyPool',
    /**
     * @class The <code>AutodestroyPool</code> class is used to manage destroyable objects by region-based approach.
     * <br><br>
     * The function is quite similar to Cocoa's <a href="http://developer.apple.com/library/mac/#documentation/Cocoa/Reference/Foundation/Classes/NSAutoreleasePool_Class/Reference/Reference.html">NSAutoreleasePool</a>.
     * As new pools are created, they get added to the top of the pool stack. When pools are destroyed, they are removed from the pool stack.
     * <br><br>
     * Autodestroyed objects are added into the top pool. For that purpose you can use autodestroy method which is <code>Foundation.Class</code>'s extended method.
     * Autodestroyed objects which are associated with the pool are destroyed when the pool is destroyed.
     * @example
     * var pool1 = new AutodestroyPool();             // push pool1 to the pool stack
     * var obj1 = new DestroyableObj().autodestroy(); // add obj1 to pool1
     * var pool2 = new AutodestroyPool();             // push pool2 to the pool stack
     * var obj2 = new DestroyableObj().autodestroy(); // add obj2 to pool2
     * var obj3 = new DestroyableObj().autodestroy();
     * obj3.noAutodestroy();                          // you can cancel autodestroy by calling noAutodestroy.
     * ...
     * // you can destroy pools one by one
     * pool2.destroy();
     * pool1.destroy();
     * // or destroy pools at once.
     * pool1.destroy();                               // pool2 are destroyed at the same time.
     * @constructs Constructor method.
     * @name Foundation.AutodestroyPool
     */
    initialize: function()
    {
        this._objects = [];

        AutodestroyPoolStack._pushPool(this);
    },
    /**
     * Destroys autodestroyed objects which are associated with this pool.
     */
    destroy: function()
    {
        this.destroy = function() {};
        AutodestroyPoolStack._destroyPool(this);
    },
    /**
     * Attach autodestroy() and noAutodestroy() to `Class.prototype`.
     * @returns {Boolean}
     * @private
     */
    _attach: function()
    {
        return AutodestroyPoolStack.attach();
    },
    /**
     * Detach autodestroy() and noAutodestroy() from `Class.prototype`.
     * @returns {Boolean}
     * @private
     */
    _detach: function()
    {
        return AutodestroyPoolStack.detach();
    },
    /**
     * Adds an object to this pool.
     * Normally you don't use this method directly, instead, you use <code>Foundation.Class</code>'s autodestroy method.
     * @param {Object} object Destroyable object
     */
    addObject: function(object)
    {
        if(!object.__origDestroy)
        {
            object.__origDestroy = object.destroy;
            object.destroy = function()
            {
                object.destroy = function() {};
                object.__origDestroy();
            };
        }

        if(!object.__ownerPool)
        {
            object.__ownerPool = this;
            this._objects.push(object);
        }
    },
    /**
     * Removes an object from this pool.
     * Normally you don't use this method directly, instead, you use <code>Foundation.Class</code>'s noAutodestroy method.
     * @param {Object} object Destroyable object
     */
    removeObject: function(object)
    {
        if(object.__ownerPool === this)
        {
            delete object.__ownerPool;
            var index = this._objects.lastIndexOf(object);
            this._objects.splice(index, 1);
        }
    },
    /** @private */
    _destroyObjects: function()
    {
        var i;
        for(i = 0; i < this._objects.length; i++)
        {
            try
            {
                this._objects[i].destroy();
            }
            catch (e)
            {
                NgLogException(e);
            }
        }
    }
});
