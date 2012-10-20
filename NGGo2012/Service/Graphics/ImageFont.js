////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Muhammad Awais
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 *              Unauthorized redistribution of source code is
 *              strictly prohibited. Violators will be prosecuted.
 */
////////////////////////////////////////////////////////////////////////////////
var Class = require('../../../NGCore/Client/Core/Class').Class;
var Node = require('../../../NGCore/Client/GL2/Node').Node;
var Primitive = require('../../../NGCore/Client/GL2/Primitive').Primitive;
var FileSystem = require('../../../NGCore/Client/Storage/FileSystem').FileSystem;
/**
 * @private
 * Private class.
 */
var LettersContainer = Node.subclass(
/** @lends Node.prototype*/
{
    initialize: function ()
    {
        this._nodes = [];
    },
    destroy: function ()
    {
        var i;
        for (i = 0; i < this._nodes.length; ++i)
        {
            this._nodes[i].destroy();
        }
    },
    /**
     * This function refreshes all the letters, i.e. deletes the all previous letters and reload again.
     */
    refresh: function ()
    {
        var i;
        for (i = 0; i < this._nodes.length; ++i)
        {
            this._nodes[i].destroy();
        }
        this._nodes = [];
    },
    addLetter: function (letter)
    {
        this.addChild(letter);
        this._nodes.push(letter);
    }
});
/**
 * @private
 * Private class.
 */
var Letters = Node.subclass(
/** @lends Node.prototype*/
{
    initialize: function ()
    {
        this._container = new LettersContainer();
        this.addChild(this._container);
        this._imgPath = null;
        this._fontHeight = null;
        this._anchorX = 0;
        this._anchorY = 0;
        this._width = 0;
        this._height = 0;
        this._spacing = 0;
        this._gradColorTop = [1, 1, 1];
        this._gradColorBottom = [1, 1, 1];
    },
    destroy: function ()
    {
        this._container.destroy();
    },
    refresh: function ()
    {
        this._container.refresh();
    },
    /**
     * This function is used to add letters.
     * @param{node} letter  required letters.
     */
    addLetter: function (letter)
    {
        this._container.addLetter(letter);
    },
    /**
     * This function recreates font on given input string.
     * @param {String} text The input string which is to be represented by font.
     * @param {String} imgPath The exact path of the image file.
     * @param {Number} fontHeight The size of the font.
     * @param {Number} spacing OPTIONAL number of spaces between each chracter.
     * @param {Array} gradColorTop OPTIONAL set color of upper part.
     * @param {Array} gradColorBottom OPTIONAL set color of lower part.
     */
    recreate: function (text, _imgPath, _fontHeight, _spacing, _gradColorTop, _gradColorBottom)
    {
        var imgPath = _imgPath || this._imgPath;
        var fontHeight = _fontHeight || this._fontHeight;
        var spacing = _spacing || this._spacing;
        var gradColorTop = _gradColorTop || this._gradColorTop;
        var gradColorBottom = _gradColorBottom || this._gradColorBottom;
        this.factory.create(imgPath, text, fontHeight, spacing, gradColorTop, gradColorBottom, this);
    },
    /**
     * This function in used to set Anchor of the points.
     * @param {number} x The value of x-axis of x,y point.
     * @param {number} y The value of y-axis of x,y point
     */
    setAnchor: function (x, y)
    {
        this._anchorX = x;
        this._anchorY = y;
        this._container.setPosition(-(this._width * this._anchorX), -(this._height * this._anchorY));
    },
    /**
     * This function sets the postion of the letters according to given point.
     * @param {number} x The value of x-axis of x,y point.
     * @param {number} y The value of y-axis of x,y point
     */
    setContainerPosition: function (x, y)
    {
        this._container.setPosition(x, y);
    }
});
exports.ImageFont = Class.subclass( /** @lends Service.Graphics.ImageFont.prototype*/
{
    classname: "ImageFont",
    /**
     * @class The <code>ImageFont</code> class is used to display font styles of letters that are given in the form of spriteSheet.
     * @constructs The default constructor
     * @augments Class.subclass
     * @param {String} jsonPath Path of JSON file for source spritesheet.
     * @param {String} imageDir Path to source image file. Default path is 'Content/'.
     * @param {function} onCompleteHandler if json file is read completely then this function is called.
     */
     
    initialize: function (jsonPath, imageDir, onCompleteHandler)
    {
        this._imageBaseDir = imageDir || 'Content/';
        this._fontMap = {};
        this._loadFiles = {};
        this._fontKeys = [];
        if (this._loadFiles[jsonPath])
        {
            NgLogD('Warning: Service.Graphics.ImageFont: font-info file already loaded.');
            return false;
        }
        this._loadFiles[jsonPath] = true;
        var that = this;
        FileSystem.readFile(jsonPath, false, function (err, data)
        {
            if (err)
            {
                NgLogD("Error: Service.Graphics.ImageFont: failed to read font-info file.");
            }
            else
            {
                var fontInfo = JSON.parse(data);
                var framesObj = null;
                var metaObj = null;
                var tmpObj = null;
                var imagePath = null;
                for (imagePath in fontInfo)
                {
                    if (fontInfo.hasOwnProperty(imagePath))
                    {
                        if (imagePath === 'frames')
                        {
                            var obj = null;
                            for (obj in fontInfo[imagePath])
                            {
                                if (fontInfo[imagePath].hasOwnProperty(obj))
                                {
                                    tmpObj = fontInfo[imagePath][obj];
                                    delete fontInfo[imagePath][obj];
                                    var ln = obj.length;
                                    var newKey = obj;
                                    if (ln > 3)
                                    {
                                        if (obj.charAt(ln - 4) === '.')
                                        {
                                            newKey = obj.substring(0, ln - 4);
                                        }
                                    }
                                    fontInfo[imagePath][newKey] = tmpObj;
                                    tmpObj = null;
                                }
                            }
                            framesObj = fontInfo[imagePath];
                        }
                        else if (imagePath === 'meta')
                        {
                            metaObj = fontInfo[imagePath];
                        }
                    }
                }
                that._fontKeys.push(String(metaObj.image));
                that._fontMap[metaObj.image] = framesObj;
                that._fontMap[metaObj.image + '_meta'] = metaObj;
                metaObj = null;
                framesObj = null;
            }
            if (onCompleteHandler)
            {
                onCompleteHandler.apply();
            }
        });
    },
    /**
     * This function is used to set the location of the spritesheet.
     * @param {String} path The path of the spritesheet where it is placed.
     */
    setImageBaseDir: function (path)
    {
        this._imageBaseDir = path;
    },
    /**
     * This function displays the input letters string in form of font.
     * @param {String} text The input string which is to be represented by font.
     * @param {Number} fontHeight The size of the font.
     * @param {Number} spacing OPTIONAL number of spaces between each chracter.
     * @param {Array} gradColorTop OPTIONAL set color of upper part.
     * @param {Array} gradColorBottom OPTIONAL set color of lower part.
     * @param {Node} Node OPTIONAL
     * @return {Node} node having required letters. 
     * @example var imageFont = new ImageFont('Content/font.json', 'Content/');
     * var font = imageFont.create('123456', 20 , 2, [1,0,0] , [1,1,1]);
     */
    create: function (text, fontHeight, _spacing, _gradColorTop, _gradColorBottom, node)
    {
        if (typeof text !== 'string' || typeof fontHeight !== 'number')
        {
            errorMsg = "Input is not correct in " + this.classname + ".create Method";
            throw new Error(errorMsg);
        }
        var imgPath = "";
        if (this._fontKeys.length > 0)
        {
            imgPath = this._fontKeys[0];
        }
        if (!this._fontMap[imgPath])
        {
            NgLogD('Error: Service.Graphics.ImageFont: image file not loaded.');
            return false;
        }
        if (node)
        {
            node.refresh();
        }
        var letters = node || new Letters();
        var f = this._fontMap[imgPath];
        var V = Primitive.Vertex;
        var spacing = _spacing || 0;
        var gradColorTop = _gradColorTop || [1, 1, 1];
        var gradColorBottom = _gradColorBottom || [0.5, 0.5, 0.5];
        var xPos = 0;
        var p = new Primitive();
        p.setType(Primitive.Type.Triangles);
        p.setImage(
        this._imageBaseDir + imgPath, [this._fontMap[imgPath + '_meta'].size.w, this._fontMap[imgPath + '_meta'].size.h], [0, 0], [0, 0, 1, 1]);
        // ------ The following two lines of code is to stop console messages 'Primitives cannot render less than 3 vertices'
        var dummyVertex = new Primitive.Vertex([0, 0], [0, 0], [0, 0, 0]);
        p.spliceVertexes(0, 0, dummyVertex, dummyVertex, dummyVertex);
        // -------------------------------------------------
        
        var i = 0;
        for (i = 0; i < text.length; i++)
        {
            var isFound = true;
            var c = text.charAt(i);
            if (!f[c])
            {
                c = "%" + c.charCodeAt(0).toString(16);
                if (!f[c])
                {
                    xPos += (fontHeight / 1.5 + spacing);
                    isFound = false;
                }
            }
            if (isFound)
            {
                var scale = fontHeight / f[c].sourceSize.h;
                var left = (f[c].frame.x);
                var right = (f[c].frame.x + f[c].frame.w);
                var top = f[c].frame.y;
                var bottom = f[c].frame.y + f[c].sourceSize.h;
                var w = scale * (right - left);
                var h = scale * (bottom - top);
                left /= this._fontMap[imgPath + '_meta'].size.w;
                right /= this._fontMap[imgPath + '_meta'].size.w;
                top /= this._fontMap[imgPath + '_meta'].size.h;
                bottom /= this._fontMap[imgPath + '_meta'].size.h;
                p.pushVertex(new Primitive.Vertex([xPos, h], [left, bottom], gradColorBottom));
                p.pushVertex(new Primitive.Vertex([xPos, 0], [left, top], gradColorTop));
                p.pushVertex(new Primitive.Vertex([xPos + w, 0], [right, top], gradColorTop));
                p.pushVertex(new Primitive.Vertex([xPos + w, 0], [right, top], gradColorTop));
                p.pushVertex(new Primitive.Vertex([xPos + w, h], [right, bottom], gradColorBottom));
                p.pushVertex(new Primitive.Vertex([xPos, h], [left, bottom], gradColorBottom));
                xPos += (w + spacing);
            }
        }
        letters.addLetter(p);
        letters._imgPath = imgPath;
        letters._fontHeight = fontHeight;
        letters._spacing = spacing;
        letters._gradColorTop = gradColorTop;
        letters._gradColorBottom = gradColorBottom;
        letters._width = xPos;
        letters._height = fontHeight;
        letters.setContainerPosition(-(letters._width * letters._anchorX), -(letters._height * letters._anchorY));
        letters.factory = this;
        return letters;
    },
    /**
     * Default Destructor for ImageFont.
     */
    destroy: function ()
    {
        this._fontMap = null;
        this._loadFiles = null;
        this._fontKeys = null;
    }
});