////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Amjad Aziz
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
var VFX = require('./_VFXActions').VFX;
var Node = require('../../../NGCore/Client/GL2/Node').Node;
var Core = require('../../../NGCore/Client/Core').Core;
var VFXActions;
var Sequence = Core.Class.subclass( /** @lends Service.Graphics.Sequence.prototype*/
{
    classname: "Sequence",
    /**
     * Creates new sequence for provided actions. Sets repeat 1 as default. 
     * @param {Array} actions.
     * @arguments Core.Class
     * @constructs Init sequence class.
     * @example 
     * var action1 = VFXActions.moveTo(4,new Core.Point(200,200),Ops.easeInQuad);
     * var action2 = VFXActions.moveTo(4,new Core.Point(20,20),Ops.easeInQuad);
     * var sequence = VFXActions.createSequence([action1,action2]);
     * 
     * @see Service.Graphics.VFXActions
     * */
    initialize: function (actions)
    {
        if(actions instanceof Array && VFXActions._isEligible(actions))
        {
            this.actions = [];
            var i, len = actions.length;
            for(i = 0; i < len; i++)
            {
                if(actions[i].classname === "Action" || actions[i].classname === "Sequence" || actions[i].classname === "Spawn")
                {
                    this.actions.push(actions[i]);
                }
            }
            this._totalDuration = VFXActions._calculateTotalDuration(this.actions);
            this._frequency = 1;
            this._progress = 0;
            this._parent = null;
            this._index = 0;
            this._node = null;
        }
        else
        {
            throw new Error('Invalid actions or One of inner Sequence or Spawn has repeat forever.');
        }
    },
    /**
     * destroy the current sequence.
     */
    destroy: function ()
    {
        if(this.actions)
        {
            delete this.actions;
        }
        delete this._frequency;
        if(this._parent)
        {
            delete this._parent;
        }
        delete this._index;
        if(this._node)
        {
            delete this._node;
        }
        if(this._callback)
        {
            delete this._callback;
        }
        delete this._progress;
    },
    /**
     * Starts already created sequence on passed node.
     * @param {GL2.Node} node 
     * @param {Function} callback. When sequence completes it's execution after play then callback function is called.
     * @example 
     * var callback = function() {
     * console.log("Sequence Ended...");
     * };
     * var action1 = VFXActions.moveTo(4,new Core.Point(200,200),Ops.easeInQuad);
     * var action2 = VFXActions.moveTo(4,new Core.Point(20,20),Ops.easeInQuad);
     * var sequence = VFXActions.createSequence([action1,action2]);
     * sequence.play(node,callback);
     * 
     * */
    play: function (node, callback)
    {
        if(node && node instanceof Node)
        {
            //TODO: Is it neccesity? Why is it necessity?
            //if(!VFX._isNodeBusy(node))
            //{
                if(callback)
                {
                    if(typeof (callback) === "function")
                    {
                        this._callback = callback;
                    }
                }
                if(VFXActions._isEligible(this.actions))
                {
                    this._progress = 0;
                    this._node = node;
                    this._handleRepeat(this);
                }
                else
                {
                    throw new Error("Inner Sequence or Spawn has repeat forever property. Could not run this Sequence.");
                }
            //}
            //else
            //{
            //    console.log("Another Sequence or Spawn is already in-progess on " + node);
            //}
        }
        else
        {
            throw new Error('Argument Can\'t be null or should be instance of Node.\n For Example: sequence.play(node,callback);');
        }
    },
    /**
     * Repeat current sequence for given number of times. 
     * @param {Number} frequency 
     * */
    repeat: function (frequency)
    {
        if(frequency >= 1)
        {
            this._frequency = frequency;
            return this;
        }
        else
        {
            throw new Error('Repeat accepts only positive number \nFor Example: seq.repeat(2);\n');
        }
    },
    /**
     * Repeat current sequence forever. 
     * */
    repeatForEver: function ()
    {
        if(VFXActions._isEligible(this.actions))
        {
            this._frequency = -1;
            return this;
        }
        else
        {
            throw new Error("Inner Sequence or Spawn already have repeat forever property .. ");
        }
    },
    /** 
     *@private
     */
    _handleRepeat: function (context)
    {
        if(this !== context)
        {
            this.finish(0);
        }
        if(context._frequency !== -1 && context._progress >= context._frequency)
        {
            if(context._parent && context._hasMaxDuration)
            {
                context._parent._index = 0;
                VFX.enchant(context._node).and(context._parent._handleRepeat, [context._parent]);
            }
            else if(context._parent && context._parent.classname !== "Spawn")
            {
                VFX.enchant(context._node).and(context._parent._execute, [context._parent]);
            }
            else
            {
                context._progress = 0;
                context._index = 0;
            }
            if(context._callback)
            {
                context._callback();
            }
        }
        else
        {
            context._progress++;
            context._index = 0;
            context._execute(context);
        }
    },
    /** 
     *@private
     */
    _execute: function (context)
    {
        if(this !== context)
        {
            this.finish(0);
        }
        if(context.actions[context._index])
        {
            /**
             * Reset both inner Sequences and Spawn.
             */
            var resetSS = function (context)
                {
                    context.actions[context._index]._node = context._node;
                    context.actions[context._index]._parent = context;
                    context.actions[context._index]._index = 0;
                    context.actions[context._index]._progress = 0;
                };
            switch(context.actions[context._index].classname)
            {
            case "Action":
                var vfxTask = VFX.enchant(context._node).and(context.actions[context._index].func, context.actions[context._index].args);
                context._index++;
                while(context.actions[context._index] && context.actions[context._index].classname === "Action")
                {
                    vfxTask = vfxTask.and(context.actions[context._index].func, context.actions[context._index].args);
                    context._index++;
                }
                if(context.actions.length === context._index)
                {
                    vfxTask.and(context._handleRepeat, [context]);
                }
                else
                {
                    vfxTask.and(context._execute, [context]);
                }
                break;
            case "Sequence":
            case "Spawn":
                resetSS(context);
                VFX.enchant(context._node).and(context.actions[context._index]._handleRepeat, [context.actions[context._index]]);
                context._index++;
                break;
            }
        }
        else
        {
            if(context.actions.length === context._index)
            {
                VFX.enchant(context._node).and(context._handleRepeat, [context]);
            }
        }
    }
});
exports.Sequence = Sequence;
var Spawn = Core.Class.subclass( /** @lends Service.Graphics.Spawn.prototype*/
{
    classname: "Spawn",
    /**
     * Creates new spawn for provided actions. Sets repeat 1 as default.
     *  Note: For spawn all actions must have equal duration.
     * @param {Array} actions.
     * @arguments Core.Class
     * @constructs Init spawn class. 
     * @example 
     * var action1 = VFXActions.moveTo(4,new Core.Point(200,200),Ops.easeInQuad);
     * var action2 = VFXActions.scaleTo(4,new Core.Vector(2,2),Ops.easeInQuad);
     * var spawn   = VFXActions.createSpawn([action1,action2]);
     * 
     * @see Service.Graphics.VFXActions
     * */
    initialize: function (actions)
    {
        this.actions = [];
        if(actions instanceof Array)
        {
            var i, len = actions.length;
            for(i = 0; i < len; i++)
            {
                if(actions[i].classname === "Action" || actions[i].classname === "Sequence" || actions[i].classname === "Spawn")
                {
                    this.actions.push(actions[i]);
                }
            }
            this._totalDuration = VFXActions._calculateMaxDuration(this.actions);
            this._node = null;
            this._frequency = 1;
            this._index = 0;
            this._progress = 0;
            this._parent = null;
        }
        else
        {
            throw new Error('Invalid actions or One of inner Sequence or Spawn has repeat forever.');
        }
    },
    /**
     * destroy the current spawn.
     * 
     * */
    destroy: function ()
    {
        if(this.actions)
        {
            delete this.actions;
        }
        delete this._frequency;
        if(this._parent)
        {
            delete this._parent;
        }
        delete this._index;
        if(this._node)
        {
            delete this._node;
        }
        if(this._callback)
        {
            delete this._callback;
        }
        delete this._progress;
    },
    /**
     * Starts already created spawn on passed node.
     * @param {GL2.Node} node 
     * @example 
     * var callback = function() {
     * console.log("Spawn Ended...");
     * };
     * var action1 = VFXActions.moveTo(4,new Core.Point(200,200),Ops.easeInQuad);
     * var action2 = VFXActions.scaleTo(4,new Core.Vector(2,2),Ops.easeInQuad);
     * var spawn   = VFXActions.createSpawn([action1,action2]);
     * spawn.play(node,callback);
     * 
     * */
    play: function (node, callback)
    {
        if(node && node instanceof Node)
        {
            //TODO: Is it neccesity? Why is it necessity?
            //if(!VFX._isNodeBusy(node))
            //{
                if(callback)
                {
                    if(typeof (callback) === "function")
                    {
                        this._callback = callback;
                    }
                }
                this._progress = 0;
                this._node = node;
                this._handleRepeat(this);
            //}
            //else
            //{
            //    console.log("Another Sequence or Spawn is already in-progess on " + node);
            //}
        }
        else
        {
            throw new Error('Argument Can\'t be null or should be instance of Node.\n For Example: spawn.play(node,callback);');
        }
    },
    /**
     * Repeat current spawn for given number of times. 
     * @param {Number} frequency 
     * */
    repeat: function (frequency)
    {
        if(frequency >= 1)
        {
            this._frequency = frequency;
            return this;
        }
        else
        {
            throw new Error('Repeat accepts only positive number\nFor Example: spawn.repeat(2);\n');
        }
    },
    /**
     * Repeat current spawn forever. 
     * */
    repeatForEver: function ()
    {
        this._frequency = -1;
        return this;
    },
    /** 
     *@private
     */
    _handleRepeat: function (context)
    {
        if(this !== context)
        {
            this.finish(0);
        }
        if(context._progress >= context._frequency && context._frequency !== -1)
        {
            if(context._parent && context._hasMaxDuration)
            {
                context._parent._index = 0;
                VFX.enchant(context._node).and(context._parent._handleRepeat, [context._parent]);
            }
            else if(context._parent && context._parent.classname !== "Spawn")
            {
                VFX.enchant(context._node).and(context._parent._execute, [context._parent]);
            }
            else
            {
                context._progress = 0;
                context._index = 0;
            }
            if(context._callback)
            {
                context._callback();
            }
        }
        else
        {
            context._progress++;
            context._index = 0; // Looping back
            context._execute(context);
        }
    },
    /** 
     *@private
     */
    _execute: function (context)
    {
        if(this !== context)
        {
            this.finish(0);
        }
        if(context.actions[context._index])
        {
            /**
             * Reset both inner Sequences and Spawns.
             */
            var resetSS = function (context)
                {
                    context.actions[context._index]._node = context._node;
                    context.actions[context._index]._parent = context;
                    context.actions[context._index]._index = 0;
                    context.actions[context._index]._progress = 0;
                };
            switch(context.actions[context._index].classname)
            {
            case "Action":
                if(context.actions[context._index]._hasMaxDuration)
                {
                    VFX.enchant(context._node).and(context.actions[context._index].func, context.actions[context._index].args).and(context._handleRepeat, [context]);
                }
                else
                {
                    VFX.enchant(context._node).and(context.actions[context._index].func, context.actions[context._index].args);
                }
                if(context.actions.length !== context._index + 1)
                {
                    VFX.enchant(context._node).and(context._execute, [context]);
                }
                context._index++;
                break;
            case "Sequence":
            case "Spawn":
                resetSS(context);
                VFX.enchant(context._node).and(context.actions[context._index]._handleRepeat, [context.actions[context._index]]);
                if(context.actions.length !== context._index + 1)
                {
                    VFX.enchant(context._node).and(context._execute, [context]);
                }
                context._index++;
                break;
            }
        }
        else
        {
            if(context.actions.length === context._index)
            {
                VFX.enchant(context._node).and(context._handleRepeat, [context]);
            }
        }
    }
});
exports.Spawn = Spawn;
var Action = Core.Class.subclass( /** @lends Service.Graphics.Action.prototype*/
{
    classname: "Action",
    initialize: function (func, args)
    {
        this._duration = 0;
        if(args && func !== "hop")
        {
            this._duration = args[0];
        }
        this.func = func;
        this.args = args;
    },
    repeatForEver: function ()
    {
        var sequence = new Sequence([this]);
        sequence.repeatForEver();
        return sequence;
    }
});
exports.Action = Action;
var VFXActions = Core.Class.singleton( /** @lends Service.Graphics.VFXActions.prototype*/
{
    classname: "VFXActions",
    /**
     * @class This <code>VFXActions</code> 
     * <br><br>
     * VFXActions class helps you to run different visual effects sequentially or simultaneously.
     * @arguments Core.Class
     * @constructs Init VFXActions.
     * @see Service.Graphics.Sequence
     * @see Service.Graphics.Spawn
     * */
    initialize: function ()
    {},
    /**
     * Apply any function as the task. It can be used if any callback is required after any action within the sequence.
     * It takes <code>function</code> as parameter.
     * @example 
     *  var notification = function ()
     *  {
     *      console.log("My custom function executed");
     *      
     *  }
     *  var action1  = VFXActions.rotate(4, 180, Ops.easeInQuad);
     *  var action2  = VFXActions.move(3, [200, 0], Ops.easeInQuad);
     *  var action3  = VFXActions.blink(4, 0.5, [1, 0]);
     *  var action4  = VFXActions.callFunc(notification);
     *  var sequence = VFXActions.createSequence([action1,action4, action2,action4 , action3, action4]);
     *  sequence.play(this._node);
     * @param {Function} custom function. It takes "function" as parameter and this function is registered as a task in the sequence.
     * @returns {Service.Graphics.VFXActions} next job
     */
    callFunc: function (callback)
    {
        if(typeof (callback) === "function")
        {
            this._callback = callback;
            return new Action(callback);
        }
        else
        {
            throw new Error("Parameter should be a function");
        }
    },
    /**
     * Creates a Move action which moves a node to target position passed, in given duration. 
     * @param {Number} duration The time it takes in moving[Seconds].
     * @param {Core.Point | Core.Vector | Array} targetPosition
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad , "easeOutQuad".
     * @returns {Service.Graphics.Action} action.
     * @see Service.Graphics.VFXActions#move
     */
    moveTo: function (duration, position, easing)
    {
        if(typeof (duration) === "number" && (position instanceof Core.Vector || position instanceof Core.Point || (position instanceof Array && position.length === 2)))
        {
            var p = new Core.Point(position);
            if(VFXActions._isNumber(p))
            {
                return new Action('moveTo', [duration, p.getX(), p.getY(), easing]);
            }
            else
            {
                throw new Error("Invalid point. Only numbers are acceptable for position. \nFor Example:  VFXActions.moveTo(4,[200,300],Ops.easeInQuad); ");
            }
        }
        else
        {
            throw new Error("Invalid arguments. \nFor Example: VFXActions.moveTo(4,[200,300],Ops.easeInQuad)");
        }
    },
    /**
     * Creates a Move action which moves a node by the delta position passed, in given duration.  
     * @param {Number} duration the time it takes moving[Seconds].
     * @param {Core.Point | Core.Vector | Array} deltaPosition
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad, "easeOutQuad".
     * @returns {Service.Graphics.Action} new action.
     * @see Service.Graphics.VFXActions#moveTo
     */
    move: function (duration, deltaPosition, easing)
    {
        if(typeof (duration) === "number" && (deltaPosition instanceof Core.Vector || deltaPosition instanceof Core.Point || (deltaPosition instanceof Array && deltaPosition.length === 2)))
        {
            var p = new Core.Point(deltaPosition);
            if(VFXActions._isNumber(p))
            {
                return new Action('move', [duration, p.getX(), p.getY(), easing]);
            }
            else
            {
                throw new Error("Invalid point. Only numbers are acceptable for deltaPosition. \nFor Example:  VFXActions.move(4,new Core.Vector(20,30),Ops.easeInQuad); ");
            }
        }
        else
        {
            throw new Error("Invalid arguments. \nFor Example: VFXActions.move(4,new Core.Point(50,50),Ops.easeInQuad);");
        }
    },
    /**
     * Creates a Scale action which scales a node by delta scale passed, in given duration.
     * @param {Number} duration the time it takes in scaling[Seconds].     
     * @param {Core.Point | Core.Vector | Array} deltaScale
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad, "easeOutQuad".
     * @returns {Service.Graphics.Action} new action.
     * @see Service.Graphics.VFXActions#scaleTo
     */
    scale: function (duration, dScale, easing)
    {
        if(typeof (duration) === "number" && (dScale instanceof Core.Vector || dScale instanceof Core.Point || (dScale instanceof Array && dScale.length === 2)))
        {
            var p = new Core.Point(dScale);
            if(VFXActions._isNumber(p))
            {
                return new Action('scale', [duration, p.getX(), p.getY(), easing]);
            }
            else
            {
                throw new Error("Invalid scale factor. Only numbers are acceptable for deltaScale. \nFor Example:  VFXActions.scale(4,new Core.Vector(1,0.5),Ops.easeInQuad); ");
            }
        }
        else
        {
            throw new Error("Invalid arguments. \nFor Example: VFXActions.scale(4,[1,1],Ops.easeInQuad)");
        }
    },
    /**
     * Creates a Scale action which scales a node to target scale passed, in given duration.
     * @param {Number} duration the time it takes in scaling[Seconds].
     * @param {Core.Point | Core.Vector | Array} targetScale
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad, "easeOutQuad".
     * @returns {Service.Graphics.Action} new action.
     * @see Service.Graphics.VFXActions#scale
     */
    scaleTo: function (duration, scale, easing)
    {
        if(typeof (duration) === "number" && (scale instanceof Core.Vector || scale instanceof Core.Point || (scale instanceof Array && scale.length === 2)))
        {
            var p = new Core.Point(scale);
            if(VFXActions._isNumber(p))
            {
                return new Action('scaleTo', [duration, p.getX(), p.getY(), easing]);
            }
            else
            {
                throw new Error("Invalid scale factor. Only numbers are acceptable for scale. \nFor Example:  VFXActions.scaleTo(4,new Core.Vector(2,2),Ops.easeInQuad); ");
            }
        }
        else
        {
            throw new Error("Invalid arguments. \nFor Example: VFXActions.scaleTo(4,[2,2],Ops.easeInQuad)");
        }
    },
    /**
     * Creates a Blink action which applies blinking effect to a node, for given duration.  
     * @param {Number} duration the time it takes for blinking[Seconds].
     * @param {Number} term Time duration for completing a blinking cycle default = 0.5.
     * @param {Number} alphas ranage of alphas to blink. default = [1,0]
     * @returns {Service.Graphics.Action} new action.
     */
    blink: function (duration, term, alphas)
    {
        if(typeof (duration) === "number")
        {
            if(!alphas || (alphas instanceof Array && alphas.length === 2 && typeof (alphas[0]) === "number" && typeof (alphas[1]) === "number"))
            {
                if(!term || typeof (term) === "number")
                {
                    term = term || 0.5;
                    alphas = alphas || [1, 0];
                    return new Action('blink', [duration, term, alphas]);
                }
                else
                {
                    throw new Error("term must be number.\nFor Example: VFXActions.blink(4,0.5,[0.8,0.3]);");
                }
            }
            else
            {
                throw new Error("alphas must be an Array.\nFor Example: VFXActions.blink(4,0.5,[0.8,0.3]);");
            }
        }
        else
        {
            throw new Error("duration must be provided:\nFor Example: VFXActions.blink(4,0.5,[0.8,0.3]);");
        }
    },
    /**
     * Creates FadeIn action which applies fading in effect on a node, in given duration.
     * @param {Number} duration the time it takes to fade in[Seconds].
     * @param {Number} alpha default=1.
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad, "easeOutQuad".
     * @returns {Service.Graphics.Action} new action.
     * @see Service.Graphics.VFXActions#fadeOut
     */
    fadeIn: function (duration, alpha, easing)
    {
        if(typeof (duration) === "number" && (!alpha || typeof (alpha) === "number"))
        {
            return new Action('fadeIn', [duration, alpha, easing]);
        }
        else
        {
            throw new Error("Invalid Arguments. \nFor Example: VFXActions.fadeIn(4,0.5);");
        }
    },
    /**
     * Creates FadeOut action which applies fading out effect on a node, in given duration.
     * @param {Number} duration the time it takes to fade out[Seconds].
     * @param {Number} alpha default=0.
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad, "easeOutQuad".
     * @returns {Service.Graphics.Action} new action.
     * @see Service.Graphics.Action#fadeIn
     */
    fadeOut: function (duration, alpha, easing)
    {
        if(typeof (duration) === "number" && (!alpha || typeof (alpha) === "number"))
        {
            return new Action('fadeOut', [duration, alpha, easing]);
        }
        else
        {
            throw new Error("Invalid Arguments. \nFor Example: VFXActions.fadeOut(4,0.5);");
        }
    },
    /**
     * Creates an Alpha action which modifies opacity of a node by passed delta alpha, in given duration. 
     * @param {Number} duration the time it takes for action[Seconds].
     * @param {Number} deltaAlpha 
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad, "easeOutQuad".
     * @returns {Service.Graphics.Action} new action.
     * @see Service.Graphics.VFXActions#moveTo
     */
    alpha: function (duration, alpha, easing)
    {
        if(typeof (duration) === "number" && typeof (alpha) === "number")
        {
            return new Action('alpha', [duration, alpha, easing]);
        }
        else
        {
            throw new Error("Invalid arguments. \nFor Example: VFXActions.aplha(4,0.5,Ops.easeInQuad);");
        }
    },
    /**
     * Creates an Alpha action which modifies opacity of a node to passed target alpha, in given duration.
     * @param {Number} duration the time it takes moving[Seconds].
     * @param {Number} targetAlpha 
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad, "easeOutQuad".
     * @returns {Service.Graphics.Action} new action.
     * @see Service.Graphics.VFXActions#move
     */
    alphaTo: function (duration, alpha, easing)
    {
        if(typeof (duration) === "number" && typeof (alpha) === "number")
        {
            return new Action('alphaTo', [duration, alpha, easing]);
        }
        else
        {
            throw new Error("Invalid arguments. \nFor Example: VFXActions.alphaTo(4,0.5,Ops.easeInQuad);");
        }
    },
    /**
     * Creates a Rotate action which rotates a node by passed delta angle, in given duration.
     * @param {Number} duration the time it takes in rotation[Seconds].
     * @param {Number} deltaRot delta angle(degree)
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad, "easeOutQuad".
     * @returns {Service.Graphics.Action} new action.
     * @see Service.Graphics.VFXActions#rotateTo
     */
    rotate: function (duration, dRot, easing)
    {
        if(typeof (duration) === "number" && typeof (dRot) === "number")
        {
            return new Action('rotate', [duration, dRot, easing]);
        }
        else
        {
            throw new Error("Invalid arguments. \nFor Example: VFXActions.rotate(4,180,Ops.easeInQuad);");
        }
    },
    /**
     * Creates a Rotate action which rotates a node to passed target angle, in given duration.
     * @param {Number} duration the time it takes in rotation[Seconds].
     * @param {Number} targetRot target rotation angle in degrees.
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad, "easeOutQuad".
     * @returns {Service.Graphics.Action} new action.
     * @see Service.Graphics.VFXActions#rotate
     */
    rotateTo: function (duration, tRot, easing)
    {
        if(typeof (duration) === "number" && typeof (tRot) === "number")
        {
            return new Action('rotateTo', [duration, tRot, easing]);
        }
        else
        {
            throw new Error("Invalid arguments. \nFor Example: VFXActions.rotateTo(4,180,Ops.easeInQuad);");
        }
    },
    /**
     * Creates a Color action which modifies color filter of a node by passed deltaRGB, in given duration.
     * @param {Number} duration the time it takes changing color[Seconds].
     * @param {Number} dr change in red component of color.
     * @param {Number} dg change in green component of color.
     * @param {Number} db change in blue component of color.
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad, "easeOutQuad".
     * @returns {Service.Graphics.Action} new action.
     * @see Service.Graphics.VFXActions#colorTo
     */
    color: function (duration, dr, dg, db, easing)
    {
        if(typeof (duration) === "number" && typeof (dr) === "number" && typeof (dg) === "number" && typeof (db) === "number")
        {
            return new Action('color', [duration, dr, dg, db, easing]);
        }
        else
        {
            throw new Error("Invalid arguments. \nFor Example: VFXActions.color(4,1,0,0,Ops.easeInQuad)");
        }
    },
    /**
     * Creates a Color action which modifies color filter of a node to passed targetRGB, in given duration.
     * @param {Number} duration the time it takes changing color[Seconds].
     * @param {Number} tr target red component of color.
     * @param {Number} tg target green component of color.
     * @param {Number} tb target blue component of color.
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad, "easeOutQuad".
     * @returns {Service.Graphics.Action} new action.
     * @see Service.Graphics.VFXActions#color
     */
    colorTo: function (duration, r, g, b, easing)
    {
        if(typeof (duration) === "number" && typeof (r) === "number" && typeof (g) === "number" && typeof (b) === "number")
        {
            return new Action('colorTo', [duration, r, g, b, easing]);
        }
        else
        {
            throw new Error("Invalid arguments. \nFor Example: VFXActions.colorTo(4,1,0,0,Ops.easeInQuad)");
        }
    },
    /**
     * Creates a Bezier action which moves the target node to the destination point, moving it through a curve created from the control points passed in configuration object, in the duration passed. 
     * @param {Number} duration Time duration for action.
     * @param {Object} Object Contains 3 points controlPoint_1{Point},controlPoint_2{Point},endPosition{Point} 
     * @example
     * var obj = {};
        obj.controlPoint_1 = [75,200];
        obj.controlPoint_2 = [150,400];
        obj.endPosition = [250,300];
        var action = VFXActions.bezierTo(5,obj);
     */
    bezierTo: function (duration, bezierConfigObject)
    {
        if(isNaN(duration) === false && bezierConfigObject.controlPoint_1 && (bezierConfigObject.controlPoint_1 instanceof Array) && bezierConfigObject.controlPoint_1.length === 2 && bezierConfigObject.controlPoint_2 && (bezierConfigObject.controlPoint_2 instanceof Array) && bezierConfigObject.controlPoint_2.length === 2 && bezierConfigObject.endPosition && (bezierConfigObject.endPosition instanceof Array) && bezierConfigObject.endPosition.length === 2)
        {
            return new Action('bezierTo', [duration, bezierConfigObject]);
        }
        else
        {
            throw new Error("Invalid arguments for VFXActions.bezierTo");
        }
    },
    /**
     * Creates a Bezier action which moves the target node by the delta position, moving it through a curve created from the control points passed in configuration object, in the duration passed.  
     * @param {Number} duration Time duration for action.
     * @param {Object} Object containing 3 points ControlPoint_1{Point},ControlPoint_2{Point},EndPosition{Point} 
     */
    bezier: function (duration, bezierConfigObject)
    {
        if(isNaN(duration) === false && bezierConfigObject.controlPoint_1 && (bezierConfigObject.controlPoint_1 instanceof Array) && bezierConfigObject.controlPoint_1.length === 2 && bezierConfigObject.controlPoint_2 && (bezierConfigObject.controlPoint_2 instanceof Array) && bezierConfigObject.controlPoint_2.length === 2 && bezierConfigObject.endPosition && (bezierConfigObject.endPosition instanceof Array) && bezierConfigObject.endPosition.length === 2)
        {
            return new Action('bezier', [duration, bezierConfigObject]);
        }
        else
        {
            throw new Error("Invalid arguments for VFXActions.bezier");
        }
    },
    /**
     * Creates a Jump action which moves the target node to destination, while giving it a jumping effect. Number of jumps and height of each jump can be configured by parameters. 
     * @param {Number} duration Time duration for action.
     * @param {Core.Point | Core.Vector | Array} targetPosition
     * @param {Number} height for Jump.
     * @param {Number} numberofJumps 
     */
    jumpTo: function (duration, position, height, jumps)
    {
        if(typeof (duration) === "number" && (position instanceof Core.Vector || position instanceof Core.Point || (position instanceof Array && position.length === 2)))
        {
            if((!height || typeof (height) === "number") && (!jumps || typeof (jumps) === "number"))
            {
                var p = new Core.Point(position);
                if(VFXActions._isNumber(p))
                {
                    height = height || 100;
                    jumps = jumps || 1;
                    return new Action('jumpTo', [duration, p.getX(), p.getY(), height, jumps]);
                }
                else
                {
                    throw new Error("Invalid position. Only numbers are acceptable for position. \nFor Example:  VFXActions.jumpTo(4,new Core.Vector(20,20),100,5); ");
                }
            }
            else
            {
                throw new Error("height and jumps should be numbers. ");
            }
        }
        else
        {
            throw new Error("Invalid arguments. \nFor Example: VFXActions.jumpTo(4,[100,100],10,3)");
        }
    },
    /**
     * Creates a Jump action which moves the target node by delta position, while giving it a jumping effect. Number of jumps and height of each jump can be confiugred by parameters.
     * @param {Number} duration Time duration for action.
     * @param {Core.Point | Core.Vector | Array} deltaPosition
     * @param {Number} height for Jump.
     * @param {Number} numberofJumps 
     */
    jump: function (duration, dPosition, height, jumps)
    {
        if(typeof (duration) === "number" && (dPosition instanceof Core.Vector || dPosition instanceof Core.Point || (dPosition instanceof Array && dPosition.length === 2)))
        {
            if((!height || typeof (height) === "number") && (!jumps || typeof (jumps) === "number"))
            {
                var p = new Core.Point(dPosition);
                if(VFXActions._isNumber(p))
                {
                    height = height || 100;
                    jumps = jumps || 1;
                    return new Action('jump', [duration, p.getX(), p.getY(), height, jumps]);
                }
                else
                {
                    throw new Error("Invalid position. Only numbers are acceptable for position. \nFor Example:  VFXActions.jump(4,new Core.Vector(20,20),100,5); ");
                }
            }
            else
            {
                throw new Error("Only numbers are acceptable for jumps and height. ");
            }
        }
        else
        {
            throw new Error("Invalid arguments. \nFor Example: VFXActions.jump(4,[100,0],10,3)");
        }
    },
    /**
     * Creates a Place action which changes the position relative to the node after the given duration.
     * @param {Number} duration Time duration for Place action.
     * @param {Core.Point | Core.Vector | Array} deltaPosition
     */
    place: function (duration, position)
    {
        if(typeof (duration) === "number" && (position instanceof Core.Vector || position instanceof Core.Point || (position instanceof Array && position.length === 2)))
        {
            var p = new Core.Point(position);
            if(VFXActions._isNumber(p))
            {
                return new Action('place', [duration, p.getX(), p.getY()]);
            }
            else
            {
                throw new Error("Invalid point. Only numbers are acceptable for position. \nFor Example:  VFXActions.place(4,[200,300]); ");
            }
        }
        else
        {
            throw new Error("Invalid arguments. \nFor Example: VFXActions.place(4,[100,100])");
        }
    },
    /**
     * Creates a Place action which changes the position of the node to destination point, after a given duration.
     * @param {Number} duration Time duration for that particular task.
     * @param {Core.Point | Core.Vector | Array} targetPosition
     */
    placeTo: function (duration, position)
    {
        if(typeof (duration) === "number" && (position instanceof Core.Vector || position instanceof Core.Point || (position instanceof Array && position.length === 2)))
        {
            var p = new Core.Point(position);
            if(VFXActions._isNumber(p))
            {
                return new Action('placeTo', [duration, p.getX(), p.getY()]);
            }
            else
            {
                throw new Error("Invalid point. Only numbers are acceptable for position. \nFor Example:  VFXActions.placeTo(4,[200,300]); ");
            }
        }
        else
        {
            throw new Error("Invalid arguments. \nFor Example: VFXActions.placeTo(4,[100,100]);");
        }
    },
    /**
     * Creates a Visibility action which instantly toggles the visibility of a node. 
     */
    toggleVisible: function ()
    {
        return new Action('toggleVisible');
    },
    /**
     * Creates a Hop action which makes a node jump with velocity under the effect of gravity. Velocity and gravity are configurable. 
     * @param {Number} velocity first speed.
     * @param {Number} gravity damping rate.
     * @returns {Service.Graphics.Action} new action.
     */
    hop: function (velocity, gravity)
    {
        if(typeof (velocity) === "number" && typeof (gravity) === "number" && velocity >= 0)
        {
            return new Action('hop', [velocity, gravity]);
        }
        else
        {
            throw new Error("Velocity and Gravity must be provided and velocity should be positive.");
        }
    },
    /**
     * Creates a Visibility action which makes the node appear instantly. 
     * @returns {Service.Graphics.Action} new action.
     * @see Service.Graphics.VFXActions#disappear
     */
    appear: function ()
    {
        return new Action('appear');
    },
    /**
     * Creates a Visibility action which makes a node disappear instantly.
     * @returns {Service.Graphics.Action} new action.
     * @see Service.Graphics.VFXActions#appear
     */
    disappear: function ()
    {
        return new Action('disappear');
    },
    /**
     * Creates a wait action which stops running actions for given duration.
     * @param {Number} time seconds
     * @returns {Service.Graphics.Action} new action.
     */
    waitFor: function (duration)
    {
        if(typeof (duration) === "number" && duration >= 0)
        {
            return new Action('waitFor', [duration]);
        }
        else
        {
            throw new Error("Time should be provided and must be positive. :)");
        }
    },
    /**
     * creates new sequence for given actions. 
     * @param {Array}  actions 
     * @returns currently created sequence.
     */
    createSequence: function (actions)
    {
        return new exports.Sequence(actions);
    },
    /**
     * creates new spawn for given actions. 
     * @param {Array}  actions 
     * @returns currently created spawn.
     */
    createSpawn: function (actions)
    {
        return new exports.Spawn(actions);
    },
    /**
     * Pauses all actions. 
     */
    pause: function ()
    {
        VFX.pause();
    },
    /**
     * Resumes paused actions. 
     */
    resume: function ()
    {
        VFX.resume();
    },
    /**
     * Checks if actions are paused or running.
     * @returns {Boolean}. Returns true if actions are running otherwise false. 
     */
    isRunning: function ()
    {
        return VFX.isActive;
    },
    /**
     * Stop all remained tasks of passed node.
     *
     * @param {GL2.Node} node Target node object.
     */
    stopAction: function (node)
    {
        if(node instanceof Node)
        {
            VFX.stop(node);
        }
        else
        {
            throw new Error("Only instance of GL2.Node is acceptable");
        }
    },
    /**
     * removes all running tasks.
     */
    stopActions: function ()
    {
        VFX.removeAllTasks();
        VFX.resume();
    },
    /**
     * Checks if input is valid number or not.. 
     * @private
     * */
    _isNumber: function (input)
    {
        if(typeof (input.getX()) === "number" && typeof (input.getY()) === "number")
        {
            return true;
        }
        else
        {
            return false;
        }
    },
    /**
     * checks if inner sequence or spawn has repeatForEver property.
     * @private
     */
    _isEligible: function (actions)
    {
        var length = actions.length;
        var i;
        for(i = 0; i < length; i++)
        {
            if(actions[i] && actions[i].classname === "Action")
            {
                if(i + 1 === length)
                {
                    return true;
                }
            }
            else if(actions[i] && (actions[i].classname === "Spawn" || actions[i].classname === "Sequence"))
            {
                if(actions[i]._frequency === -1)
                {
                    return false;
                }
                else
                {
                    if(!VFXActions._isEligible(actions[i].actions))
                    {
                        return false;
                    }
                    if(i + 1 === length)
                    {
                        return true;
                    }
                }
            }
        }
    },
    /**
     * private method
     */
    _calculateTotalDuration: function (actions)
    {
        var length = actions.length;
        var i, duration = 0;
        for(i = 0; i < length; i++)
        {
            if(actions[i] && actions[i].classname === "Action")
            {
                duration = duration + actions[i]._duration;
            }
            else if(actions[i] && (actions[i].classname === "Spawn" || actions[i].classname === "Sequence"))
            {
                duration = duration + actions[i]._totalDuration;
            }
        }
        return duration;
    },
    /**
     * private method
     */
    _calculateMaxDuration: function (actions)
    {
        var maxDuration = 0;
        var maxIndex = 0;
        var i = 0;
        for(i = 0; i < actions.length; i++)
        {
            if(actions[i] && actions[i].classname === "Action" && actions[i]._duration >= maxDuration)
            {
                maxIndex = i;
                maxDuration = actions[i]._duration;
            }
            else if(actions[i] && (actions[i].classname === "Spawn" || actions[i].classname === "Sequence"))
            {
                if(maxDuration <= actions[i]._totalDuration)
                {
                    maxDuration = actions[i]._totalDuration;
                    maxIndex = i;
                }
            }
        }
        actions[maxIndex]._hasMaxDuration = true;
        return maxDuration;
    }
});
exports.VFXActions = VFXActions;