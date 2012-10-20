////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Mizuno Takaaki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

var Class = require('../../NGCore/Client/Core/Class').Class;

/**
 * @class Base class for the object which is mixed into other class.
 * @constructor
 * @name Foundation.Mixin
 */

var Mixin = Class.subclass(
/** @lends Foundation.Mixin.prototype */
{
    classname: 'Mixin',
    reserved: {
        "classname"  : "1",
//      "initialize" : "1",
//      "destroy"    : "1",
        "mixInto"    : "1",
        "_list"      : "1"
    }
});

/**
 * Generates class to be able to mix in.
 * @name Foundation.Mixin.generate
 * @function
 */
Mixin.generate = (function()
{
    return function(object)
    {
        var list = [];
        var mixInto = function(func)
        {
            var i, len, property, getter, setter, value;
            var makeInitialize = function(current, add){
                return function() {
                    current.apply(this, arguments);
                    add.apply(this, arguments);
                };
            };
            var makeDestroy = function(current, add){
                return function() {
                    add.apply(this, arguments);
                    current.apply(this, arguments);
                };
            };
            if( typeof func === 'function' )
            {
                len = list.length;
                for( i=0; i<len; i++ )
                {
                    property = list[i];
                    if( func.prototype[property] && property !== 'initialize' && property !== 'destroy' )
                    {
                        throw new Error("<NGGO> Mixin: property '"+ property+"' already exists");
                    }
                    getter = this.__lookupGetter__(property);
                    setter = this.__lookupSetter__(property);
                    if(getter || setter)
                    {
                        if( getter )
                        {
                            func.prototype.__defineGetter__(property, getter);
                        }
                        if( setter )
                        {
                            func.prototype.__defineSetter__(property, setter);
                        }
                    }else{
                        value = this[property];
                        if( typeof value === 'function' && property[0] !== '$')
                        {
                            if( property === 'initialize' )
                            {
                                var current_initialize = func.prototype.initialize;
                                if( typeof current_initialize === 'function' )
                                {
                                    func.prototype[property] = makeInitialize(current_initialize, value);
                                }
                                else
                                {
                                    func.prototype[property] = value;
                                }
                            }
                            else if( property === 'destroy' )
                            {
                                var current_destroy = func.prototype.destroy;
                                if( typeof current_destroy === 'function' )
                                {
                                    func.prototype[property] = makeDestroy(current_destroy, value);
                                }
                                else
                                {
                                    func.prototype[property] = value;
                                }
                            }
                            else
                            {
                                func.prototype[property] = value;
                            }
                        }
                        else
                        {
                            if(property[0] === '$')
                            {
                                property = property.slice(1);
                        }
                            func.prototype[property] = value;
                            func[property] = value;
                        }
                    }
                }
            }
            else if( typeof func === 'object' &&
                     typeof func.instantiate === 'function' )
            // For Singleton Class
            {
                var initFunc = function(init)
                {
                    var i = 1;
                    return function()
                    {
                        if(i){
                            i--;
                            init.apply(this);
                        }
                    };
                };
                var initialize = this.initialize;
                if( initialize )
                {
                    initialize = initFunc(initialize);
                    var instantiate = func.instantiate;
                    var wrapOringinalfunc = function(self, name)
                    {
                        return function(){
                            self.instantiate();
                            self[name](arguments);
                        };
                    };
                    for(i in func)
                    {
                        if( func.hasOwnProperty(i) && i !== 'initialize' && i !== 'instantiate' )
                        {
                            func[i] = wrapOringinalfunc(func, i);
                        }
                    }
                    var wrapInstanciateFunc = function(self)
                    {
                        return function()
                        {
                            instantiate();
                            initialize.apply(self);
                        };
                    };
                    func.instantiate = wrapInstanciateFunc(func);
                }else{
                    initialize = function() {};
                }
                var wrapfunc = function(real, self)
                {
                    return function(){
                        self.instantiate();
                        initialize.apply(self);
                        real.apply(self,arguments);
                    };
                };
                len = list.length;
                for( i=0; i<len; i++ )
                {
                    property = list[i];
                    var prototype = Object.getPrototypeOf(func);
                    if( prototype[property]  && property !== 'initialize' && property !== 'destroy' )
                    {
                        throw new Error("<NGGo> Mixin: property '"+ property+"' already exists");
                    }
                    getter = this.__lookupGetter__(property);
                    setter = this.__lookupSetter__(property);
                    if(getter || setter)
                    {
                        if( getter )
                        {
                            prototype.__defineGetter__(property, getter);
                        }
                        if( setter )
                        {
                            prototype.__defineSetter__(property, setter);
                        }
                    }
                    else
                    {
                        value = this[property];
                        if( typeof value === 'function')
                        {
                            value = wrapfunc(value, func);
                        }
                        if( typeof value === 'function' && property[0] !== '$')
                        {
                            prototype[property] = value;
                        }
                        else
                        {
                            if(property[0] === '$')
                            {
                                property = property.slice(1);
                            }
                            prototype[property] = value;
                            func[property] = value;
                        }
                    }
                }
            }
        };

        var property;
        if( typeof object !== 'object' )
        {
            if( typeof NgLogW === 'function' ){
                NgLogW("ngGo: Core.Mixin: generate: Object required");
            }
            return -1;
        }
        var ret = {
            mixInto : mixInto
        };
        for(property in object)
        {
            if( object.hasOwnProperty(property) && !Mixin.reserved[property] )
            {
                var getter = object.__lookupGetter__(property);
                var setter = object.__lookupSetter__(property);
                if(getter || setter)
                {
                    if( getter )
                    {
                        ret.__defineGetter__(property, getter);
                    }
                    if( setter )
                    {
                        ret.__defineSetter__(property, setter);
                    }
                }
                else
                {
                    ret[property] = object[property];
                }
                list.push(property);
            }
        }
        return ret;
    };
}());

exports.Mixin = Mixin;
