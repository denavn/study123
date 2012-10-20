////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Takushima Nobutaka
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

var MessageListener = require('../../../NGCore/Client/Core/MessageListener').MessageListener;
var UpdateEmitter   = require('../../../NGCore/Client/Core/UpdateEmitter').UpdateEmitter;
var Core       = require('../../../NGCore/Client/Core').Core;
var Node       = require('../../../NGCore/Client/GL2/Node').Node;
var Sprite     = require('../../../NGCore/Client/GL2/Sprite').Sprite;
var Animation  = require('../../../NGCore/Client/GL2/Animation').Animation;
var FileSystem = require('../../../NGCore/Client/Storage/FileSystem').FileSystem;

var Vector2    = require('../../Foundation/Math/Vector2').Vector2;
var Ops        = require('../../Foundation/Math/Ops').Ops;

var randomMinusOneToOne = Ops.randomMinusOneToOne;

/** @private */
var degreesToRadians = function(angle)
{
    return angle / 180.0 * Math.PI;
};

/** @private */
var color4Make = function(r, g, b, a)
{
    return {r: r, g: g, b: b, a: a};
};

/** @private */
var ParticleType =
{
    Gravity: 0,
    Radial: 1
};

/** @private */
var ParticleEmitterBody = MessageListener.subclass(
{
    classname: 'ParticleEmitterBody',

    initialize: function(root, config)
    {
        this._config = config;
        this._particleCount = 0;
        this._emissionRate = this._config.maxParticles / this._config.particleLifespan;
        this._emitCounter = 0.0;
        this._elapsedTime = 0.0;
        this._active = true;
        this._particleIndex = 0;
        this._particles = null;
        this._sprites = null;

        this._setupArrays(root);
        UpdateEmitter.addListener(this, this._updateWithDelta);
    },

    destroy: function()
    {
        UpdateEmitter.removeListener(this);
        var i;
        for(i=0; i < this._sprites.length; i++)
        {
            var sprite = this._sprites[i];
            sprite.getAnimation().destroy();
            sprite.destroy();
        }
    },

    start: function()
    {
        this._active = true;
        this._elapsedTime = 0.0;
        this._emitCounter = 0.0;
    },

    stop: function()
    {
        this._active = false;
        this._elapsedTime = 0.0;
        this._emitCounter = 0.0;
    },

    _setupArrays: function(root)
    {
        this._particles = new Array(this._config.maxParticles);
        this._sprites = new Array(this._config.maxParticles);
        var i;
        for(i=0; i < this._particles.length; i++)
        {
            var particle =
            {
                position: new Vector2(),
                direction: new Vector2(),
                startPos: new Vector2(),
                color: color4Make(),
                colorPerSecond: color4Make(),
                radialAcceleration: 0.0,
                tangentialAcceleration: 0.0,
                radius: 0.0,
                radiusPerSecond: 0.0,
                angle: 0.0,
                degreesPerSecond: 0.0,
                particleSize: 0.0,
                particleSizePerSecond: 0.0,
                rotation: 0.0,
                rotationPerSecond: 0.0,
                timeToLive: 0.0
            };
            this._particles[i] = particle;
        }

        var blendMode;
        if(this._config.blendFuncSource === 770 && this._config.blendFuncDestination === 1) // GL_SRC_ALPHA(0x0302) && GL_ONE(1)
        {
            blendMode = Animation.BlendMode.Add;
        }
        else
        {
            blendMode = Animation.BlendMode.Alpha;
        }

        for(i=0; i < this._sprites.length; i++)
        {
            var sprite = new Sprite();
            var animation = new Animation();
            animation.pushFrame(new Animation.Frame(this._config.texturePath, 0, [1, 1]));
            animation.setBlendMode(blendMode);
            sprite.setAnimation(animation);
            sprite.setVisible(false);
            root.addChild(sprite);
            this._sprites[i] = sprite;
        }
    },

    _initParticle: function(particle)
    {
        var cnf = this._config;

        particle.position.x = cnf.sourcePosition.x + cnf.sourcePositionVariance.x * randomMinusOneToOne();
        particle.position.y = cnf.sourcePosition.y + cnf.sourcePositionVariance.y * randomMinusOneToOne();
        particle.startPos.x = cnf.sourcePosition.x;
        particle.startPos.y = cnf.sourcePosition.y;

        var newAngle = degreesToRadians(cnf.angle + cnf.angleVariance * randomMinusOneToOne());
        var vector = new Vector2(Math.cos(newAngle), Math.sin(newAngle));
        var vectorSpeed = cnf.speed + cnf.speedVariance * randomMinusOneToOne();

        particle.direction = vector.scale(vectorSpeed);

        particle.radius = cnf.maxRadius + cnf.maxRadiusVariance * randomMinusOneToOne();
        particle.radiusPerSecond = cnf.maxRadius / cnf.particleLifespan;
        particle.angle = degreesToRadians(cnf.angle + cnf.angleVariance * randomMinusOneToOne());
        particle.degreesPerSecond = degreesToRadians(cnf.rotatePerSecond + cnf.rotatePerSecondVariance * randomMinusOneToOne());

        particle.radialAcceleration = cnf.radialAcceleration;
        particle.tangentialAcceleration = cnf.tangentialAcceleration;

        particle.timeToLive = Math.max(0.0, cnf.particleLifespan + cnf.particleLifespanVariance * randomMinusOneToOne());

        var particleStartSize = cnf.startParticleSize + cnf.startParticleSizeVariance * randomMinusOneToOne();
        var particleFinishSize = cnf.finishParticleSize + cnf.finishParticleSizeVariance * randomMinusOneToOne();
        particle.particleSizePerSecond = (particleFinishSize - particleStartSize) / particle.timeToLive;
        particle.particleSize = Math.max(0.0, particleStartSize);

        var rotationStart = cnf.rotationStart + cnf.rotationStartVariance * randomMinusOneToOne();
        var rotationEnd = cnf.rotationEnd + cnf.rotationEndVariance * randomMinusOneToOne();
        particle.rotationPerSecond = (rotationEnd - rotationStart) / particle.timeToLive;
        particle.rotation = rotationStart;

        var start = color4Make();
        var startColor = cnf.startColor;
        var startColorVariance = cnf.startColorVariance;
        start.r = startColor.r + startColorVariance.r * randomMinusOneToOne();
        start.g = startColor.g + startColorVariance.g * randomMinusOneToOne();
        start.b = startColor.b + startColorVariance.b * randomMinusOneToOne();
        start.a = startColor.a + startColorVariance.a * randomMinusOneToOne();

        var end = color4Make();
        var finishColor = cnf.finishColor;
        var finishColorVariance = cnf.finishColorVariance;
        end.r = finishColor.r + finishColorVariance.r * randomMinusOneToOne();
        end.g = finishColor.g + finishColorVariance.g * randomMinusOneToOne();
        end.b = finishColor.b + finishColorVariance.b * randomMinusOneToOne();
        end.a = finishColor.a + finishColorVariance.a * randomMinusOneToOne();

        particle.color = start;
        var colorPerSecond = particle.colorPerSecond;
        var timeToLive = particle.timeToLive;
        colorPerSecond.r = (end.r - start.r) / timeToLive;
        colorPerSecond.g = (end.g - start.g) / timeToLive;
        colorPerSecond.b = (end.b - start.b) / timeToLive;
        colorPerSecond.a = (end.a - start.a) / timeToLive;
    },

    _addParticle: function()
    {
        if(this._particleCount === this._config.maxParticles)
        {
            return false;
        }

        var particle = this._particles[this._particleCount];
        this._initParticle(particle);

        this._particleCount++;

        return true;
    },

    _updateWithDelta: function(delta)
    {
        var cnf = this._config;
        delta = delta / 1000;

        if(this._active && this._emissionRate)
        {
            var rate = 1.0 / this._emissionRate;
            this._emitCounter += delta;
            while(this._particleCount < cnf.maxParticles && this._emitCounter > rate)
            {
                this._addParticle();
                this._emitCounter -= rate;
            }

            this._elapsedTime += delta;
            if(cnf.duration !== -1 && cnf.duration < this._elapsedTime)
            {
                this.stopParticleEmitter();
            }
        }

        this._particleIndex = 0;

        while(this._particleIndex < this._particleCount)
        {
            var currentParticle = this._particles[this._particleIndex];
            var currentPosition = currentParticle.position;

            currentParticle.timeToLive -= delta;

            if(currentParticle.timeToLive > 0.0)
            {
                if(cnf.emitterType === ParticleType.Radial)
                {
                    currentParticle.angle += currentParticle.degreesPerSecond * delta;
                    currentParticle.radius -= currentParticle.radiusPerSecond * delta;
                    currentPosition = new Vector2(
                        cnf.sourcePosition.x - Math.cos(currentParticle.angle) * currentParticle.radius,
                        cnf.sourcePosition.y - Math.sin(currentParticle.angle) * currentParticle.radius);
                    if(currentParticle.radius < cnf.minRadius)
                    {
                        currentParticle.timeToLive = 0.0;
                    }
                }
                else
                {
                    var radial, tangential;
                    currentPosition.sub(currentParticle.startPos);

                    if(currentPosition.x || currentPosition.y)
                    {
                        radial = currentPosition.clone();
                        radial.normalize();
                    } else {
                        radial = new Vector2();
                    }
                    tangential = radial.clone();
                    radial.scale(currentParticle.radialAcceleration);

                    var newy = tangential.x;
                    tangential.x = -tangential.y;
                    tangential.y = newy;
                    tangential.scale(currentParticle.tangentialAcceleration);
                    currentParticle.direction.scale_and_add(delta, radial.add(tangential).add(cnf.gravity));
                    currentPosition.scale_and_add(delta, currentParticle.direction);
                    currentPosition.add(currentParticle.startPos);
                }
                var colorPerSecond = currentParticle.colorPerSecond;
                var currentColor = currentParticle.color;
                currentColor.r += colorPerSecond.r * delta;
                currentColor.g += colorPerSecond.g * delta;
                currentColor.b += colorPerSecond.b * delta;
                currentColor.a += colorPerSecond.a * delta;

                this._sprites[this._particleIndex].setPosition(~~(currentPosition.x),
                                                               ~~(-currentPosition.y));

                currentParticle.particleSize += currentParticle.particleSizePerSecond * delta;
                var scale = Math.max(0.0, currentParticle.particleSize);
                this._sprites[this._particleIndex].setScale(scale, scale);
                currentParticle.rotation += currentParticle.rotationPerSecond * delta;
                this._sprites[this._particleIndex].setRotation(~~(-currentParticle.rotation));
                this._sprites[this._particleIndex].setColor(currentColor.r, currentColor.g, currentColor.b);
                this._sprites[this._particleIndex].setAlpha(currentColor.a);
                this._sprites[this._particleIndex].setVisible(true);

                this._particleIndex++;
            }
            else
            {
                if(this._particleIndex !== this._particleCount - 1)
                {
                    var tmp = this._particles[this._particleIndex];
                    this._particles[this._particleIndex] = this._particles[this._particleCount - 1];
                    this._particles[this._particleCount - 1] = tmp;
                }
                this._particleCount--;

                this._sprites[this._particleCount].setVisible(false);
            }
        }
    }
});

var ParticleEmitter = Node.subclass(
/** @lends Service.Graphics.ParticleEmitter.prototype */
{
    classname: 'ParticleEmitter',

    /**
     * @class This class loads ParticleDesigner's plist and plays a particle animation. New emitter plays effect automatically.
     * @example
     * var particle = new ParticleEmitter("Content/watersplash.plist");
     * particle.setPosition(2/w, 2/h);
     * GL2.Root.addChild(particle);
     * @constructs Default constructor.
     * @name Service.Graphics.ParticleEmitter
     * @augments GL2.Node
     * @param {String} plistPath ParticleDesigner's output file paths.
     */
    initialize: function(plistPath)
    {
        this._body = null;

        var that = this;
        FileSystem.readFile(plistPath, false, function(err, data)
        {
            if(!err)
            {
                that._body = new ParticleEmitterBody(that, that._parsePlist(plistPath, data));
            }
        });
    },

    /**
     * Destroys all used resources and remove graphics.
     */
    destroy: function()
    {
        if(this._body)
        {
            this._body.destroy();
        }
    },

    /**
     * Starts particle animation.
     */
    start: function()
    {
        if(this._body)
        {
            this._body.start();
        }
    },

    /**
     * Stops particle animation.
     */
    stop: function()
    {
        if(this._body)
        {
            this._body.stop();
        }
    },

    /** @private */
    _plistToJSON: function(plist)
    {
        var json = {};
        var re = /<key>(.+)<\/key>\s*<(\w+)>(.+)<\/\w+>/gm;
        var m = re.exec(plist);
        while(m)
        {
            var key = m[1];
            var value = (m[2] === 'string') ? m[3] : Number(m[3]);
            json[key] = value;
            m = re.exec(plist);
        }
        return json;
    },

    /** @private */
    _parsePlist :function(plistPath, data)
    {
        var config = this._plistToJSON(data);
        config.sourcePosition = new Vector2();
        config.sourcePositionVariance = new Vector2(config.sourcePositionVariancex,
                                                    config.sourcePositionVariancey);
        config.gravity = new Vector2(config.gravityx, config.gravityy);
        config.startColor = color4Make(config.startColorRed, config.startColorGreen,
                                       config.startColorBlue, config.startColorAlpha);
        config.startColorVariance = color4Make(config.startColorVarianceRed, config.startColorVarianceGreen,
                                               config.startColorVarianceBlue, config.startColorVarianceAlpha);
        config.finishColor = color4Make(config.finishColorRed, config.finishColorGreen,
                                        config.finishColorBlue, config.finishColorAlpha);
        config.finishColorVariance = color4Make(config.finishColorVarianceRed, config.finishColorVarianceGreen,
                                                config.finishColorVarianceBlue, config.finishColorVarianceAlpha);
        var dirname = plistPath.substring(0, plistPath.lastIndexOf("/"));
        config.texturePath = (dirname ? (dirname + "/") : "") + config.textureFileName;
        return config;
    }
});

exports.ParticleEmitter = ParticleEmitter;
