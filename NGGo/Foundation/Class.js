////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Mizuno Takaaki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

var Class = require('../../NGCore/Client/Core/Class').Class;
var Mixin = require('./Mixin').Mixin;

/**
 * @constructs
 * @class
 * Extend ngCore's <code>Core.Class</code> to add mixin feature. Mixin works on both <code>subclass()</code> method ans <code>singleton()</code> method.
 * @name Foundation.Class
 */

(function(){
     var core_subclass = Class.subclass;
     var core_singleton = Class.singleton;
     var mixfunc = function( object, mixins, parent, parentClass )
     {
         var i;
         var ret = parent.call( parentClass, object );
         if( !mixins || mixins.length <= 0 )
         {
             return ret;
         }
         var len = mixins.length;
         for(i=0; i<len; i++)
         {
             mix = mixins[i];
             if( mix && typeof mix === 'object' && typeof mix.mixInto === 'function' )
             {
                 mix.mixInto(ret);
             }
         }
         return ret;
     };
     Class.subclass = function( object, mixins )
     {
         return mixfunc(object, mixins, core_subclass, this);
     };
     Class.singleton = function( object, mixins )
     {
         return mixfunc(object, mixins, core_singleton, this);
     };
}());

exports.Class = Class;
