////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// Require Block
// GL2 Package
var Node     = require('../../../NGCore/Client/GL2/Node').Node;
var Sprite   = require('../../../NGCore/Client/GL2/Sprite').Sprite;
// NGGo/Network Package
var JSONData = require('../Data/JSONData').JSONData;


exports.NinePatchSprite = Node.subclass(
/** @lends Service.Graphics.NinePatchSprite.prototype */
{
    classname: "NinePatchSprite",
    /**
     * @class This <code>NinePatchSprite</code> draws 9-patch on GL2.
     * <br><br>
     * Add special information to PNG file by draw9patch command which is
     * bundled in Android SDK. Then create setting JSON file via script
     * which is a part of ngGo. This class reads that JSON file and draws.
     * <br><br>
     * API of this class is almost as same as GL2.Sprite.
     * @constructs The default constructor.
     * @name Service.Graphics.NinePatchSprite
     * @augments GL2.Node
     */
    initialize: function()
    {
        this._images = [];
    },
    /**
     * Destroys internal resources of <code>NinePatchSprite</code>.
     */
    destroy: function()
    {
        this._removeChildrenSprites();
    },
    /**
     * Set informations which are needed for display.
     *
     * @param {String} jsonpath Path for the output of NinePatch tool. JSON object/File path/URL available.
     * @param {Number[]} size Array which has 2 numbers. It is size of 9-patch sprite.
     * @param {Number[]} anchor Array which has 2 numbers. It is anchor point of this sprite. Default is [0.5, 0.5].
     * @param {Function} callback It is called after finishing read JSON file.
     */
    setImage: function(jsonpath, size, anchor, callback)
    {
        this._removeChildrenSprites();
        if (typeof anchor === "function")
        {
            callback = anchor;
            anchor = [0.5, 0.5];
        }
        else if (!anchor instanceof Array)
        {
            anchor = [0.5, 0.5];
        }
        var loader = new JSONData();
        var that = this;
        loader.load(jsonpath, function(err)
        {
            if(!err)
            {
                that._createChildrenSprites(size, anchor, loader.data.ninepatch);
            }
            if(callback)
            {
                callback(err);
            }
        });
    },
    /** @private */
    _removeChildrenSprites: function()
    {
        var i;
        for(i=0; i<this._images.length; ++i)
        {
            this._images[i].destroy();
        }
        this._images = [];
    },
    /** @private */
    _createChildrenSprites: function(size, anchor, json)
    {
        var widths, heights;
        var width = size[0];
        var height = size[1];
        var right = json.right;
        var left = json.left;
        var top = json.top;
        var bottom = json.bottom;
        var us = json.us;
        var vs = json.vs;

        if (us.length === 2)
        {
            widths = [json.width];
        }
        else
        {
            if (right + left < width)
            {
                widths = [left, width-(right+left), right];
            }
            else
            {
                left = ~~(width * left / (right + left));
                right = width - left;
                widths = [left, 0, right];
            }
        }

        if (vs.length === 2)
        {
            heights = [json.height];
        }
        else
        {
            if (top + bottom < height)
            {
                heights = [top, height-(top+bottom), bottom];
            }
            else
            {
                top = ~~(height * top / (top + bottom));
                bottom = height - top;
                heights = [top, 0, bottom];
            }
        }

        var offsetX = ~~(- width * anchor[0]);
        var offsetY = ~~(- height * anchor[1]);

        var y = offsetY;
        var i, j;
        for(j=0; j<heights.length; ++j)
        {
            var x = offsetX;
            for(i=0; i<widths.length; ++i)
            {
                if (widths[i] !== 0 && heights[j] !== 0)
                {
                    var sprite = new Sprite();
                    var uvs = [us[i], vs[j], (us[i+1]-us[i]), (vs[j+1]-vs[j])];
                    sprite.setImage(json.filename, [widths[i], heights[j]], [0, 0], uvs);
                    sprite.setPosition(x, y);
                    this._images.push(sprite);
                    this.addChild(sprite);
                    x += widths[i];
                }
            }
            y += heights[j];
        }
    }
});
