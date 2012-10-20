/**
 *  @author:    Amjad Aziz, Tatsuya Koyama
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
var MessageListener = require('../../../NGCore/Client/Core/MessageListener').MessageListener;
var UpdateEmitter = require('../../../NGCore/Client/Core/UpdateEmitter').UpdateEmitter;
var Class = require('../../../NGCore/Client/Core/Class').Class;
var Time = require('../../../NGCore/Client/Core/Time').Time;
var Utils = require('../../Foundation/Math/Utils').Utils;
var Ops = require('../../Foundation/Math/Ops').Ops;
exports.VFXTaskNode = Class.subclass( /** @lends Service.Graphics.VFXTaskNode.prototype */
{
    classname: 'VFXTaskNode',
    /**
     * @class <code>VFXTaskNode</code> class is a effect task class. 
     * Use it in fluent interface(http://martinfowler.com/bliki/FluentInterface.html), like jQuery.
     *
     * @example
     * VFX.enchant(node)
     *    .move(3.0, 100, 100)
     *    .hop(5, 5)
     *    .end();
     *
     * @arguments Core.Class
     * @constructs Init effect task class.
     * @param {GL2.Node} node Target node object.
     * @param {Function} call back when called on finish.
     */
    initialize: function (node)
    {
        this.node = node;
        this.func = null;
        this.args = [];
        this.progress = 0;
        this.delta = 0;
        this.next = null;
        this.param = {};
        this.isInitialized = false;
        this.isActive = false;
        this.isFinished = false;
        this.isDestroyed = false;
    },
    /**
     * Apply any functions as the task. The function should call <code>this.finish()</code>.
     *
     * @example
     * var msg = function(message) {
     *     text.setText(message);
     *     this.finish();
     * };
     *
     * VFX.enchant(node)
     *     .wait(10)
     *     .and(msg, ["wait finished"])
     *     .end();
     * 
     * @param {Function} func Function object which is called after previous task was finished.
     * @param {Array} args arguments they are passed to the function.
     * @returns {Service.Graphics.VFXTaskNode} next job.
     */
    and: function (func, args)
    {
        if(func === "blink")
        {
            this.node._previousAlpha = this.node.getAlpha();
        }
        this.isActive = true;
        this.func = func;
        this.args = args;
        var nextTask = new exports.VFXTaskNode(this.node);
        this.next = nextTask;
        return nextTask;
    },
    /**
     * Insert new task into the task chain.
     *
     * @example
     * var msg = function(message) {
     *     text.setText(message);
     *     if (Math.random() > 0.5) {
     *          this.insert('hop', [10, 1]);
     *     }
     *     this.finish();
     * };
     *
     * VFX.enchant(node)
     *     .and(msg, ["sometimes hopping finished"])
     *     .end();
     * 
     * @param {Function} func Function object which is called after previous task was finished.
     * @param {Array} args arguments they are passed to the function.
     * @returns {Service.Graphics.VFXTaskNode} next job.
     */
    insert: function (func, args)
    {
        var insertTask = new exports.VFXTaskNode(this.node);
        insertTask.isActive = true;
        insertTask.func = func;
        insertTask.args = args;
        insertTask.next = this.next;
        this.next = insertTask;
        return insertTask;
    },
    /**
     * Finish VFX tasks and destroy target node.
     */
    end: function ()
    {
        return this.and('end');
    },
    /**
     * Register task, but not fire now. To restart this task, run Service.Graphics.VFX.run(node).
     * 
     * @returns {Service.Graphics.VFXTaskNode} next job.
     */
    register: function ()
    {
        var next = this.and('register', []);
        this.isActive = false;
        return next;
    },
    finish: function (duration)
    {
        if(!duration)
        {
            duration = 0;
        }
        if(this.progress >= duration)
        {
            this.isFinished = true;
        }
        return this.isFinished;
    },
    /**
     * @private
     */
    _bezierat: function (a, b, c, d, t)
    {
        return(Math.pow(1 - t, 3) * a + 3 * t * (Math.pow(1 - t, 2)) * b + 3 * Math.pow(t, 2) * (1 - t) * c + Math.pow(t, 3) * d);
    },
    _getEasingFunction: function (easingFunc)
    {
        var easingFunction = null;
        if(typeof easingFunc === "function")
        {
            easingFunction = easingFunc;
        }
        else if(typeof easingFunc === "string")
        {
            easingFunction = Ops[easingFunc];
            if(easingFunction === undefined)
            {
                throw new Error("Provided name:" + easingFunc + " is not an easingFunction available in Math.Ops");
            }
        }
        else
        {
            easingFunction = Ops.linearTween;
        }
        return easingFunction;
    }
});
//========================================================================================
exports.VFX = MessageListener.singleton( /** @lends Service.Graphics.VFX.prototype */
{
    classname: 'VFX',
    /**
     * @class <code>VFX</code> class effect to the <code>GL2.Node</code> class. 
     * Use it in fluent interface(http://martinfowler.com/bliki/FluentInterface.html), like jQuery.
     *
     * @arguments Core.MessageListener
     * @constructs Initialize effect class.
     */
    initialize: function ()
    {
        UpdateEmitter.addListener(this, this.onUpdate);
        this.tasks = {};
        this.nodeId = 0;
        this.taskId = 0;
        this.isActive = true;
    },
    /**
     * Start setting new tasks.
     *
     * @param {GL2.Node} node Target node object.
     * @returns {Service.Graphics.VFXTaskNode} next job.
     */
    enchant: function (node)
    {
        var nodeId = 0;
        var taskId = 0;
        if(!node._dnVFXManagedId)
        {
            nodeId = ++this.nodeId;
            node._dnVFXManagedId = nodeId;
            this.tasks[nodeId] = {};
        }
        else
        {
            nodeId = node._dnVFXManagedId;
            taskId = ++this.taskId;
        }
        //Work around
        if(!this.tasks[nodeId])
        {
            this.tasks[nodeId] = {};
        }
        var newTask = new exports.VFXTaskNode(node);
        this.tasks[nodeId][taskId] = newTask;
        return newTask;
    },
    /**
     * Stop all remained tasks of passed node.
     *
     * @param {GL2.Node} node Target node object.
     */
    stop: function (node)
    {
        if(node._dnVFXManagedId)
        {
            delete this.tasks[node._dnVFXManagedId];
            delete node._dnVFXManagedId;
        }
    },
    /**
     * Reset task groups and start recreating.
     *
     * @param {GL2.Node} node Target node object.
     * @returns {Service.Graphics.VFXTaskNode} next job.
     */
    restart: function (node)
    {
        this.stop(node);
        return this.enchant(node);
    },
    /**
     * Starts all registered tasks for given node.
     *
     * @param {GL2.Node} node Target node object.
     */
    run: function (node)
    {
        if(node._dnVFXManagedId)
        {
            var nodeId = node._dnVFXManagedId;
            var taskId;
            for(taskId in this.tasks[nodeId])
            {
                if(this.tasks[nodeId].hasOwnProperty(taskId))
                {
                    var task = this.tasks[nodeId][taskId];
                    if(task.func === "register")
                    {
                        if(task.next.isActive)
                        {
                            this.tasks[nodeId][taskId] = task.next;
                        }
                        else
                        {
                            delete this.tasks[nodeId][taskId];
                        }
                    }
                }
            }
        }
    },
    //--------------------------------------------------------------------------
    removeAllTasks: function ()
    {
        var nodeId;
        for(nodeId in this.tasks)
        {
            if(this.tasks.hasOwnProperty(nodeId))
            {
                var taskId;
                for(taskId in this.tasks[nodeId])
                {
                    if(this.tasks[nodeId].hasOwnProperty(taskId))
                    {
                        var n = this.tasks[nodeId][taskId].node || null;
                        if(!n)
                        {
                            break;
                        }
                        if(n._previousAlpha)
                        {
                            n.setAlpha(n._previousAlpha);
                            delete n._previousAlpha;
                        }
                        if(n._dnVFXManagedId)
                        {
                            delete n._dnVFXManagedId;
                            break;
                        }
                        delete this.tasks[nodeId][taskId];
                    }
                }
                delete this.tasks[nodeId];
            }
        }
        this.tasks = {};
    },
    //==========================================================================
    // Animation methods
    //--------------------------------------------------------------------------
    end: function ()
    {
        Utils.destroyIfAlive(this.node);
        this.isDestroyed = true;
    },
    //--------------------------------------------------------------------------
    waitFor: function (time)
    {
        this.finish(time);
    },
    //--------------------------------------------------------------------------
    appear: function ()
    {
        this.node.setVisible(true);
        this.finish();
    },
    //--------------------------------------------------------------------------
    disappear: function ()
    {
        this.node.setVisible(false);
        this.finish();
    },
    //--------------------------------------------------------------------------
    toggleVisible: function ()
    {
        this.node.setVisible(!this.node.getVisible());
        this.finish();
    },
    //--------------------------------------------------------------------------
    fadeIn: function (duration, alpha, easingFunc)
    {
        if(!alpha)
        {
            alpha = 1;
        }
        if(!this.isInitialized)
        {
            this._easingFunc = this._getEasingFunction(easingFunc);
            this.isInitialized = true;
            this.param.startAlpha = 0;
            this.param.targetAlpha = alpha;
            if(this.param.targetAlpha > 1)
            {
                this.param.targetAlpha = 1;
            }
            if(this.param.targetAlpha < 0)
            {
                this.param.targetAlpha = 0;
            }
        }
        this.node.setAlpha(this._easingFunc(this.progress, this.param.startAlpha, this.param.targetAlpha, duration));
        this.finish(duration);
    },
    //--------------------------------------------------------------------------
    fadeOut: function (duration, alpha, easingFunc)
    {
        if(!alpha)
        {
            alpha = 0;
        }
        if(!this.isInitialized)
        {
            this._easingFunc = this._getEasingFunction(easingFunc);
            this.isInitialized = true;
            this.param.startAlpha = 1;
            this.param.targetAlpha = alpha - 1;
            if(this.param.targetAlpha < -1)
            {
                this.param.targetAlpha = -1;
            }
            if(this.param.targetAlpha > 0)
            {
                this.param.targetAlpha = 0;
            }
        }
        this.node.setAlpha(this._easingFunc(this.progress, this.param.startAlpha, this.param.targetAlpha, duration));
        this.finish(duration);
    },
    //--------------------------------------------------------------------------
    alpha: function (duration, alpha, easingFunc)
    {
        if(!this.isInitialized)
        {
            this._easingFunc = this._getEasingFunction(easingFunc);
            this.isInitialized = true;
            var a = this.node.getAlpha();
            this.param.startAlpha = a;
            this.param.targetAlpha = alpha + a;
            if(this.param.targetAlpha > 1)
            {
                this.param.targetAlpha = 1;
            }
            if(this.param.targetAlpha < 0)
            {
                this.param.targetAlpha = 0;
            }
        }
        if(this.finish(duration))
        {
            this.node.setAlpha(this.param.targetAlpha);
        }
        else
        {
            this.node.setAlpha(this._easingFunc(this.progress, this.param.startAlpha, alpha, duration));
        }
    },
    //--------------------------------------------------------------------------
    alphaTo: function (duration, alpha, easeIn)
    {
        var a = alpha - this.node.getAlpha();
        this.func = 'alpha';
        this.args = [duration, a, easeIn];
    },
    //--------------------------------------------------------------------------
    move: function (duration, dx, dy, easingFunc)
    {
        if(!this.isInitialized)
        {
            this._easingFunc = this._getEasingFunction(easingFunc);
            var x = this.node.getPosition().getX();
            var y = this.node.getPosition().getY();
            this.isInitialized = true;
            this.param.startX = x;
            this.param.startY = y;
            this.param.targetX = x + dx;
            this.param.targetY = y + dy;
        }
        if(this.finish(duration))
        {
            this.node.setPosition(this.param.targetX, this.param.targetY);
        }
        else
        {
            this.node.setPosition(
            this._easingFunc(this.progress, this.param.startX, dx, duration), this._easingFunc(this.progress, this.param.startY, dy, duration));
        }
    },
    //--------------------------------------------------------------------------
    moveTo: function (duration, tx, ty, easeIn)
    {
        var dx = tx - this.node.getPosition().getX();
        var dy = ty - this.node.getPosition().getY();
        this.func = 'move';
        this.args = [duration, dx, dy, easeIn];
    },
    //--------------------------------------------------------------------------
    bezier: function (duration, bezierConfigObject)
    {
        if(!this.isInitialized)
        {
            var _x = this.node.getPosition().getX();
            var _y = this.node.getPosition().getY();
            this.param.startX = _x;
            this.param.startY = _y;
            this._xa = 0;
            this._xb = bezierConfigObject.controlPoint_1[0];
            this._xc = bezierConfigObject.controlPoint_2[0];
            this._xd = bezierConfigObject.endPosition[0];
            this._ya = 0;
            this._yb = bezierConfigObject.controlPoint_1[1];
            this._yc = bezierConfigObject.controlPoint_2[1];
            this._yd = bezierConfigObject.endPosition[1];
            this.isInitialized = true;
        }
        var t = this.progress / duration;
        var x = this._bezierat(this._xa, this._xb, this._xc, this._xd, t);
        var y = this._bezierat(this._ya, this._yb, this._yc, this._yd, t);
        if(this.finish(duration))
        {
            this.node.setPosition(this.param.startX + bezierConfigObject.endPosition[0], this.param.startY + bezierConfigObject.endPosition[1]);
        }
        else
        {
            this.node.setPosition(this.param.startX + x, this.param.startY + y);
        }
    },
    //--------------------------------------------------------------------------
    bezierTo: function (duration, bezierConfigObject)
    {
        var _x = this.node.getPosition().getX();
        var _y = this.node.getPosition().getY();
        bezierConfigObject.controlPoint_1[0] -= _x;
        bezierConfigObject.controlPoint_2[0] -= _x;
        bezierConfigObject.endPosition[0] -= _x;
        bezierConfigObject.controlPoint_1[1] -= _y;
        bezierConfigObject.controlPoint_2[1] -= _y;
        bezierConfigObject.endPosition[1] -= _y;
        this.func = 'bezier';
        this.args = [duration, bezierConfigObject];
    },
    //---------------------------------------------------------------------------------
    jump: function (duration, dx, dy, height, jumps)
    {
        if(!this.isInitialized)
        {
            var _x = this.node.getPosition().getX();
            var _y = this.node.getPosition().getY();
            this.param.startX = _x;
            this.param.startY = _y;
            this.isInitialized = true;
        }
        var t = this.progress / duration;
        var value = (t * jumps) % 1.0;
        var y = height * 4 * value * (1 - value);
        y = -1 * y + dy * t;
        var x = dx * t;
        if(this.finish(duration))
        {
            this.node.setPosition(this.param.startX + dx, this.param.startY + dy);
        }
        else
        {
            this.node.setPosition(this.param.startX + x, this.param.startY + y);
        }
    },
    //-----------------------------------    -----------------------------------
    jumpTo: function (duration, tx, ty, heights, jumps)
    {
        var dx = tx - this.node.getPosition().getX();
        var dy = ty - this.node.getPosition().getY();
        this.func = 'jump';
        this.args = [duration, dx, dy, heights, jumps];
    },
    //--------------------------------------------------------------------------
    place: function (duration, targetX, tragetY)
    {
        if(!this.isInitialized)
        {
            var _x = this.node.getPosition().getX();
            var _y = this.node.getPosition().getY();
            this.param.startX = _x;
            this.param.startY = _y;
            this.isInitialized = true;
        }
        if(this.finish(duration))
        {
            this.node.setPosition(this.param.startX + targetX, this.param.startY + tragetY);
        }
    },
    //--------------------------------------------------------------------------
    placeTo: function (duration, targetX, tragetY)
    {
        var dx = targetX - this.node.getPosition().getX();
        var dy = tragetY - this.node.getPosition().getY();
        this.func = 'place';
        this.args = [duration, dx, dy];
    },
    //--------------------------------------------------------------------------
    scale: function (duration, dScaleX, dScaleY, easingFunc)
    {
        if(!this.isInitialized)
        {
            this._easingFunc = this._getEasingFunction(easingFunc);
            var sx = this.node.getScale().getX();
            var sy = this.node.getScale().getY();
            this.isInitialized = true;
            this.param.startScaleX = sx;
            this.param.startScaleY = sy;
            this.param.targetScaleX = sx + dScaleX;
            this.param.targetScaleY = sy + dScaleY;
        }
        if(this.finish(duration))
        {
            this.node.setScale(this.param.targetScaleX, this.param.targetScaleY);
        }
        else
        {
            this.node.setScale(
            this._easingFunc(this.progress, this.param.startScaleX, dScaleX, duration), this._easingFunc(this.progress, this.param.startScaleY, dScaleY, duration));
        }
    },
    //--------------------------------------------------------------------------
    scaleTo: function (duration, tScaleX, tScaleY, easeIn)
    {
        var dsx = tScaleX - this.node.getScale().getX();
        var dsy = tScaleY - this.node.getScale().getY();
        this.func = 'scale';
        this.args = [duration, dsx, dsy, easeIn];
    },
    //--------------------------------------------------------------------------
    rotate: function (duration, dRot, easingFunc)
    {
        if(!this.isInitialized)
        {
            this._easingFunc = this._getEasingFunction(easingFunc);
            var rot = this.node.getRotation();
            this.isInitialized = true;
            this.param.startRot = rot;
            this.param.targetRot = rot + dRot;
        }
        if(this.finish(duration))
        {
            this.node.setRotation(this.param.targetRot);
        }
        else
        {
            this.node.setRotation(
            this._easingFunc(this.progress, this.param.startRot, dRot, duration));
        }
    },
    //--------------------------------------------------------------------------
    rotateTo: function (duration, tRot, easeIn)
    {
        var dRot = tRot - this.node.getRotation();
        this.func = 'rotate';
        this.args = [duration, dRot, easeIn];
    },
    //--------------------------------------------------------------------------
    color: function (duration, dr, dg, db, easingFunc)
    {
        if(!this.isInitialized)
        {
            this._easingFunc = this._getEasingFunction(easingFunc);
            this.isInitialized = true;
            this.param.startR = this.node.getColor().getRed();
            this.param.targetR = this.param.startR + dr;
            this.param.startG = this.node.getColor().getGreen();
            this.param.targetG = this.param.startG + dg;
            this.param.startB = this.node.getColor().getBlue();
            this.param.targetB = this.param.startB + db;
        }
        if(this.finish(duration))
        {
            this.node.setColor(
            this.param.targetR, this.param.targetG, this.param.targetB);
        }
        else
        {
            this.node.setColor(
            this._easingFunc(this.progress, this.param.startR, dr, duration), this._easingFunc(this.progress, this.param.startG, dg, duration), this._easingFunc(this.progress, this.param.startB, db, duration));
        }
    },
    //--------------------------------------------------------------------------
    colorTo: function (duration, tr, tg, tb, easeIn)
    {
        var dr = tr - this.node.getColor().getRed();
        var dg = tg - this.node.getColor().getGreen();
        var db = tb - this.node.getColor().getBlue();
        this.func = 'color';
        this.args = [duration, dr, dg, db, easeIn];
    },
    //--------------------------------------------------------------------------
    hop: function (velocity, gravity)
    {
        if(!this.isInitialized)
        {
            this.isInitialized = true;
            this.param.vecY = -velocity;
            this.param.baseLineY = this.node.getPosition().getY();
            this.param.hopCount = 10;
        }
        var x = this.node.getPosition().getX();
        var y = this.node.getPosition().getY();
        this.param.vecY += gravity;
        y += this.param.vecY;
        this.node.setPosition(x, y);
        if(y > this.param.baseLineY)
        {
            y = this.param.baseLineY;
            this.node.setPosition(x, y);
            this.param.vecY *= -0.7;
            this.param.hopCount -= 1;
            if(this.param.hopCount === 0)
            {
                this.finish();
            }
            if(Math.abs(this.param.vecY) < 0.1)
            {
                this.finish();
            }
        }
    },
    blink: function (duration, term, alphas)
    {
        var progress = this.progress % term / term;
        var alpha = alphas[0] * (1 - progress) + alphas[1] * progress;
        this.node.setAlpha(alpha);
        this.finish(duration);
    },
    finish: function ()
    {
        this.finish();
    },
    /**
     * Pause all tasks.
     *
     */
    pause: function ()
    {
        if(this.isActive)
        {
            this.isActive = false;
            UpdateEmitter.removeListener(this, this.onUpdate);
        }
    },
    /**
     * Resume all paused tasks.
     *
     */
    resume: function ()
    {
        if(!this.isActive)
        {
            this.isActive = true;
            UpdateEmitter.addListener(this, this.onUpdate);
        }
    },
    //==========================================================================
    //--------------------------------------------------------------------------
    onUpdate: function ()
    {
        var delta = Time.getFrameDelta() / 1000;
        var nodeId;
        for(nodeId in this.tasks)
        {
            if(this.tasks.hasOwnProperty(nodeId))
            {
                var taskId;
                for(taskId in this.tasks[nodeId])
                {
                    if(this.tasks[nodeId].hasOwnProperty(taskId))
                    {
                        var t = this.tasks[nodeId][taskId];
                        if(t.isActive)
                        {
                            t.progress += delta;
                            t.delta = delta;
                            if(!t.isFinished)
                            {
                                if(typeof (t.func) === 'function')
                                {
                                    t.func.apply(t, t.args);
                                    t.isFinished = true;
                                }
                                else
                                {
                                    this[t.func].apply(t, t.args);
                                }
                            }
                            if(t.isDestroyed)
                            {
                                if(this.tasks[nodeId])
                                {
                                    delete this.tasks[nodeId];
                                }
                            }
                            else if(t.isFinished)
                            {
                                if(t.func === "blink")
                                {
                                    if(t.node._previousAlpha)
                                    {
                                        t.node.setAlpha(t.node._previousAlpha);
                                        delete t.node._previousAlpha;
                                    }
                                }
                                if(this.tasks[nodeId] && t.next.isActive)
                                {
                                    var nextTask = this.tasks[nodeId][taskId] = t.next;
                                    // Check to avoid call utilizeTick if task has duration less than delta.
                                    if(!nextTask.args || typeof (nextTask.args[0]) !== "number" || nextTask.args[0] >= delta)
                                    {
                                        this._utilizeTick(nextTask, delta);
                                    }
                                }
                                else
                                {
                                    if(this.tasks[nodeId] && this.tasks[nodeId][taskId])
                                    {
                                        delete this.tasks[nodeId][taskId];
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    _utilizeTick: function (nextTask, delta)
    {
        if(nextTask.isActive)
        {
            nextTask.progress += delta;
            nextTask.delta = delta;
            if(!nextTask.isFinished)
            {
                if(typeof (nextTask.func) === 'function')
                {
                    nextTask.func.apply(nextTask, nextTask.args);
                    nextTask.isFinished = true;
                }
                else
                {
                    this[nextTask.func].apply(nextTask, nextTask.args);
                }
            }
        }
    },
    _isNodeBusy: function (node)
    {
        var nodeId;
        for(nodeId in this.tasks)
        {
            if(this.tasks.hasOwnProperty(nodeId))
            {
                var taskId;
                for(taskId in this.tasks[nodeId])
                {
                    if(this.tasks[nodeId].hasOwnProperty(taskId))
                    {
                        var n = this.tasks[nodeId][taskId].node || null;
                        if(n.__objectRegistryId === node.__objectRegistryId)
                        {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
});