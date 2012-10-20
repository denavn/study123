////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Harris Khurram, Taha Samad, Amjad Aziz
 *  Website:       https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
// ngCore
var GL2 = require('../../NGCore/Client/GL2').GL2;
var UI = require('../../NGCore/Client/UI').UI;
// ngGo
var GLUI = require('../GLUI').GLUI;
var URLSprite = require('../GLUI/Sprite').URLSprite;
var AbstractView = require('../GLUI/AbstractView').AbstractView;
var ServerSync = require('../Service/Data/ServerSync').ServerSync;
var ImageListView = require('../Service/Graphics/ImageListView').ImageListView;
/**
 * @private
 */
var GUIListViewItem = GLUI.ListViewItem.subclass(
{
    classname: "GUIListViewItem",
    initialize: function ($super, cellId, controller)
    {
        $super(cellId);
        this.setOnCreateView(this._onCreateView);
        this.setOnSetView(this._onSetView);
        this.__view = {};
        this.__controller = controller;
    },
    _onCreateView: function ()
    {
        var cell = this._createView(this.__view);
        return cell;
    },
    _onSetView: function (cell)
    {
        this._setView(cell, this.__view);
    },
    _createView: function (viewObj, secondary)
    {
        var cell, localAttrs;
        switch (viewObj.type)
        {
        case "Button":
        case "CheckBox":
        case "Image":
        case "Label":
        case "View":
        case "CellView":
            cell = new GLUI[viewObj.type]();
            localAttrs = GUIBuilder._shallowCopy(viewObj.attrs);
            if (localAttrs.action)
            {
                GUIBuilder._setOnAction(this.__controller, cell, localAttrs.action);
                delete localAttrs.action;
            }
            cell.setAttributes(localAttrs);
            break;
        case "Node":
            if (secondary)
            {
                cell = GUIBuilder._createNode(
                {
                    "type": "Node",
                    "name": viewObj.type,
                    "attrs": viewObj.attrs
                });
            }
            else
            {
                throw new Error("GL2.Node cannot be a docking object of Cell of a ListView.");
            }
            break;
        case "Sprite":
        case "URLSprite":
            if (secondary)
            {
                cell = GUIBuilder._createSprite(
                {
                    "type": viewObj.type,
                    "name": viewObj.type,
                    "attrs": viewObj.attrs
                });
            }
            else
            {
                throw new Error("GL2.Sprite cannot be a docking object of Cell of a ListView.");
            }
            break;
        case "Text":
            if (secondary)
            {
                cell = GUIBuilder._createText(
                {
                    "type": "Text",
                    "name": viewObj.type,
                    "attrs": viewObj.attrs
                });
            }
            else
            {
                throw new Error("GL2.Text cannot be a docking object of Cell of a ListView.");
            }
            break;
        case "EditText":
        case "EditTextArea":
            cell = new UI[viewObj.type]();
            localAttrs = GUIBuilder._shallowCopy(viewObj.attrs);
            if (localAttrs.action)
            {
                GUIBuilder._setOnAction(this.__controller, cell, localAttrs.action);
                delete localAttrs.action;
            }
            cell.setAttributes(localAttrs);
            break;
        case "WebView":
            cell = GUIBuilder._createUIElement(UI[viewObj.type], this.__controller, viewObj);
            GUIBuilder._applyWebViewProperties(cell, viewObj);
            break;
        case "MapView":
            cell = GUIBuilder._createMapElement(UI[viewObj.type], this.__controller, viewObj);
            break;
        default:
            throw new Error("Element type not defined in GUIBuilder");
        }
        if (viewObj.childrenView)
        {
            cell.__guiBuildChildren = [];
            var childrenView = viewObj.childrenView;
            var i;
            var len = childrenView.length;
            for (i = 0; i < len; i++)
            {
                var child = this._createView(childrenView[i], true);
                if ((child instanceof GL2.Node) && (cell instanceof AbstractView))
                {
                    cell.getGLObject().addChild(child);
                }
                else if ((child instanceof AbstractView) && (cell instanceof GL2.Node))
                {
                    cell.addChild(child.getGLObject());
                }
                else
                {
                    cell.addChild(child);
                }
                cell.__guiBuildChildren.push(child);
            }
            var cellOrginalDestroy = cell.destroy.bind(cell);
            cell.destroy = function ()
            {
                var k = 0;
                var cellChildren = this.__guiBuildChildren;
                var klen = cellChildren.length;
                for (k = 0; k < klen; k++)
                {
                    var child = cellChildren[k];
                    child.destroy();
                }
                cellOrginalDestroy();
            }.bind(cell);
        }
        return cell;
    },
    _setView: function (cell, viewObj)
    {
        var dataObj, localAttrs;
        if (viewObj.dynamicAttrs)
        {
            dataObj = viewObj.dynamicAttrs;
        }
        else
        {
            dataObj = viewObj.attrs;
        }
        switch (viewObj.type)
        {
        case "Button":
        case "CheckBox":
        case "Image":
        case "Label":
        case "View":
        case "CellView":
            localAttrs = GUIBuilder._shallowCopy(dataObj);
            if (localAttrs.action)
            {
                GUIBuilder._setOnAction(this.__controller, cell, localAttrs.action);
                delete localAttrs.action;
            }
            cell.setAttributes(localAttrs);
            break;
        case "Node":
            GUIBuilder._applyNodeAttributes(cell, {
                type: "Node",
                "name": viewObj.type,
                "attrs": dataObj
            });
            break;
        case "Sprite":
        case "URLSprite":
            GUIBuilder._applySpriteAttributes(cell, {
                type: viewObj.type,
                "name": viewObj.type,
                "attrs": dataObj
            });
            break;
        case "Text":
            GUIBuilder._applyTextAttributes(cell, {
                type: "Text",
                "name": viewObj.type,
                "attrs": dataObj
            });
            break;
        case "EditText":
        case "EditTextArea":
        case "WebView":
        case "MapView":
            localAttrs = GUIBuilder._shallowCopy(dataObj);
            if (localAttrs.action)
            {
                GUIBuilder._setOnAction(this.__controller, cell, localAttrs.action);
                delete localAttrs.action;
            }
            cell.setAttributes(localAttrs);
            break;
        }
        if (cell.__guiBuildChildren)
        {
            var children = cell.__guiBuildChildren;
            var childrenView = viewObj.childrenView;
            var i;
            var len = children.length;
            for (i = 0; i < len; i++)
            {
                this._setView(children[i], childrenView[i]);
            }
        }
    }
});
exports.GUIBuilder = ServerSync.singleton( /** @lends Framework.GUIBuilder.prototype */
{
    classname: 'GUIBuilder',
    /**
     * @class The <code>GUIBuilder</code> class is a Singleton class for
     * creating GLUI and GL2 element against JSON.
     * </br>The class had following properties which can be accessed like:</br><code>GUIBuilder.defaultDepth = 12;</code>
     * <li> <b>defaultDepth</b>:Default Depth of Node.Dafault Value 20000 </li>
     * <li> <b>defaultSize</b>:Default Size of Sprite.Dafault Value [128, 128] </li>
     * <li> <b>defaultAnchor</b>:Default Anchor of Sprite.Dafault Value [0, 0] </li>
     * <li> <b>defaultUVs</b>:Default uvs of Sprite.Dafault Value [0, 0, 1, 1] </li>
     * <li> <b>defaultFont</b>:Default Font.Dafault Value "Arial" </li>
     * <li> <b>defaultFontLocation</b>:Default Font Location.Dafault Value <code>GL2.Text.FontLocation.Default</code> </li>
     * <li> <b>basePath</b>:Base Path of Images.Dafault Value ""</li>
     * @extends Service.Data.ServerSync
     * @constructs The default constructor.
     * @status Android, Flash
     */
    initialize: function ()
    {
        this._context = null;
        this._unrollDataCell = null;
        this._unrollDataArray = null;
        this._unrollIndex = null;
        this._basePath = "";
        this._defaultAnchor = [0, 0];
        this._defaultUVs = [0, 0, 1, 1];
        this._defaultDepth = 20000;
        this._defaultFont = 'Arial';
        this._defaultSize = [128, 128];
        this._defaultFontLocation = GL2.Text.FontLocation.Default;
        this._userDefinedTypes = [];
    },
    /**
     * Loads the configuration from JSON string or JavaScript Object.
     * @param $super
     * @param {String|Object} jsonData JSON string to be parsed.
     * @param {object} param controller. Object to store all the hierarchical data.
     * @param {object} [context] context. Object that provides data for ListViewItem unrolling. Optional parameter, you can provide callback as third parameter.
     * @param {Function} [callback] Callback function to be called when configuration has been loaded.
     * @returns {Service.Data.ServerSync} Error code.
     * @example
     * GUIBuilder.loadConfigFromData(json, controller, callback);
     * OR
     * GUIBuilder.loadConfigFromData(json, controller, context, callback);
     */
    loadConfigFromData: function ($super, jsonData, param, context, callback)
    {
        this._context = null;
        if (typeof context === "function")
        {
            callback = context;
            context = undefined;
        }
        else if (context instanceof Object)
        {
            this._context = context;
        }
        return $super(jsonData, param, callback);
    },
    /**
     * Loads the configuration from a flat file or URI.
     * @param $super
     * @param {String|Service.Network.URI} filename File name to load the JSON config data or URI.
     * @param {object} param controller. Object to store all the hierarchical data.
     * @param {object} [context] context. Object that provides data for ListViewItem unrolling. Optional parameter, you can provide callback as third parameter.
     * @param {Function} [callback] Callback function to be called when configuration has been loaded.
     * @returns {Service.Data.ServerSync} Error code.
     * @example 
     * GUIBuilder.loadConfigFromFile("./Content/file.json",controller,callback);
     * OR
     * GUIBuilder.loadConfigFromFile("./Content/file.json",controller,context,callback);
     */
    loadConfigFromFile: function ($super, path, param, context, callback)
    {
        this._context = null;
        if (typeof context === "function")
        {
            callback = context;
            context = undefined;
        }
        else if (context instanceof Object)
        {
            this._context = context;
        }
        return $super(path, param, callback);
    },
    /**
     * Registers the user defined type.
     * @param {String} type The type name defined by user.
     * @param {Function} methodDefinition The definition of type defined by user.
     * @status Android, Test
     */
    registerTypeMethod: function (type, methodDefinition)
    {
        if (typeof type === 'string' && typeof methodDefinition === 'function')
        {
            this._userDefinedTypes[type] = methodDefinition;
        }
    },
    /**
     * Gets the base path for images.
     * @returns {String} Base path
     */
    get basePath()
    {
        return this._basePath;
    },
    /**
     * Sets the base path for images.
     * Default value of this parameter is <code>""</code>.
     * @param {String} basePath Image base path
     */
    set basePath(value)
    {
        if (typeof value === "string")
        {
            this._basePath = value;
        }
        else
        {
            throw new Error("basePath needs to be a string.");
        }
    },
    /**
     * Gets the default anchor for images
     * @returns {Number[]} Default anchor
     */
    get defaultAnchor()
    {
        return this._defaultAnchor.slice();
    },
    /**
     * Sets the default anchor for images.
     * Default value of this parameter is <code>[0, 0]</code>.
     * @param {Number[]} anchor Default anchor.
     */
    set defaultAnchor(value)
    {
        if (value instanceof Array && value.length === 2)
        {
            this._defaultAnchor = value.slice();
        }
        else
        {
            throw new Error("defaultAnchor needs to be an Array of 2 Numbers.");
        }
    },
    /**
     * Gets the default size for sprites.
     * @returns {Number[]} Default size
     */
    get defaultSize()
    {
        return this._defaultSize.slice();
    },
    /**
     * Sets the default size for sprites.
     * Default value of this parameter is <code>[128, 128]</code>.
     * @param {Number[]} Default size.
     */
    set defaultSize(value)
    {
        if (value instanceof Array && value.length === 2)
        {
            this._defaultSize = value.slice();
        }
        else
        {
            throw new Error("defaultSize needs to be an Array of 2 Numbers.");
        }
    },
    /**
     * Gets the default uvs for sprites.
     * @returns {Number[]} Default uvs
     */
    get defaultUVs()
    {
        return this._defaultUVs.slice();
    },
    /**
     * Sets the default uvs for sprites.
     * Default value of this parameter is <code>[0, 0, 1, 1]</code>.
     * @param {Number[]} Default uvs.
     */
    set defaultUVs(value)
    {
        if (value instanceof Array && value.length === 4)
        {
            this._defaultUVs = value.slice();
        }
        else
        {
            throw new Error("defaultUVs needs to be an Array of 4 Numbers.");
        }
    },
    /**
     * Gets the default font for text.
     * @returns {String} Default font
     */
    get defaultFont()
    {
        return this._defaultFont;
    },
    /**
     * Sets the default font for text.
     * Default value of this parameter is <code>'Arial'</code>.
     * @param {String} Default font.
     */
    set defaultFont(value)
    {
        if (typeof value === "string")
        {
            this._defaultFont = value;
        }
        else
        {
            throw new Error("defaultFont needs to be a string.");
        }
    },
    /**
     * Gets the default font location for text.
     * @returns {GL2.Text.FontLocation} Default font location
     */
    get defaultFontLocation()
    {
        return this._defaultFontLocation;
    },
    /**
     * Sets the default font location for text.
     * Default value of this parameter is <code>GL2.Text.FontLocation.Default</code>.
     * @param {GL2.Text.FontLocation} location Font location
     */
    set defaultFontLocation(value)
    {
        if (typeof value === "number")
        {
            this._defaultFontLocation = value;
        }
        else
        {
            throw new Error("defaultFontLocation needs to be a number.");
        }
    },
    /**
     * defaultDepth: The default depth for the node.
     */
    get defaultDepth()
    {
        return this._defaultDepth;
    },
    /**
     * Sets the default depth for node.
     * Default value of this parameter is <code>20000</code>.
     * @param {Number} depth Default depth
     */
    set defaultDepth(value)
    {
        if (typeof value === "number")
        {
            this._defaultDepth = value;
        }
        else
        {
            throw new Error("defaultDepth needs to be a number.");
        }
    },
    /**
     * Checks wheather method are defined by user or not.
     * @private
     */
    _checkUserDefinedMethods: function (controller, def)
    {
        var type = def.type;
        var userDefinedTypes = this._userDefinedTypes;
        var userType;
        for (userType in userDefinedTypes)
        {
            if (userDefinedTypes.hasOwnProperty(userType))
            {
                if (type === userType)
                {
                    return this._userDefinedTypes[type](controller, def);
                }
                else
                {
                    console.log("<NGGo> Element type not found in GUIBuilder.js");
                }
            }
        }
        return null;
    },
    /** @private */
    __onLoadData: function (jsonData, param)
    {
        var controller = null;
        if (param instanceof Object)
        {
            controller = param;
        }
        else
        {
            throw new Error('Parameter for GUIBuilder in loadConfigFromData/loadConfigFromFile should be a controller.');
        }
        var attr;
        if (!controller.__elem)
        {
            controller.__elem = [];
        }
        controller.destroyAll = function ()
        {
            var i;
            var elem = this.__elem;
            var len = elem.length;
            for (i = 0; i < len; ++i)
            {
                if (elem[i].name)
                {
                    delete this[elem[i].name];
                }
                this.__elem[i].destroy();
            }
            this.__elem.length = 0;
        };
        for (attr in jsonData)
        {
            if (jsonData.hasOwnProperty(attr))
            {
                var json = jsonData[attr];
                var root = this._buildUI(controller, json);
                if (root instanceof AbstractView)
                {
                    root = root.getGLObject();
                }
                if (json.attrs === undefined)
                {
                    root.setDepth(this._defaultDepth);
                }
                else if (json.attrs.depth === undefined)
                {
                    root.setDepth(this._defaultDepth);
                }
            }
        }
        return controller;
    },
    /**
     * @private
     */
    _buildUI: function (controller, def, parentElem)
    {
        var i, len;
        var child;
        var elem = this._createElement(controller, def, parentElem);
        var children = def.children;
        if (children)
        {
            len = children.length;
            for (i = 0; i < len; i++)
            {
                child = this._buildUI(controller, children[i], elem);
                if ((child instanceof GL2.Node) && (elem instanceof AbstractView))
                {
                    elem.getGLObject().addChild(child);
                }
                else if ((child instanceof AbstractView) && (elem instanceof GL2.Node))
                {
                    elem.addChild(child.getGLObject());
                }
                else
                {
                    elem.addChild(child);
                }
            }
        }
        if (def.sections)
        {
            var sectArray = [];
            var sections = def.sections;
            len = sections.length;
            for (i = 0; i < len; i++)
            {
                sectArray.push(this._buildUI(controller, sections[i], elem));
            }
            elem.setSections(sectArray);
        }
        if (def.items)
        {
            var itemsArray = [];
            if (def.childTarget)
            {
                if (!this._context)
                {
                    throw new Error("Context is not defined or null.");
                }
                this._unrollDataArray = this._context[def.childTarget];
                if (!this._unrollDataArray instanceof Array)
                {
                    throw new Error(def.childTarget + " is not an array in Context.");
                }
                len = this._unrollDataArray.length;
                for (i = 0; i < len; i++)
                {
                    this._unrollDataCell = this._unrollDataArray[i];
                    this._unrollIndex = i;
                    itemsArray.push(this._buildUI(controller, def.items[0], elem));
                }
                this._unrollDataCell = null;
                this._unrollDataArray = null;
                this._unrollIndex = null;
            }
            else
            {
                var items = def.items;
                len = items.length;
                for (i = 0; i < len; i++)
                {
                    itemsArray.push(this._buildUI(controller, items[i], elem));
                }
            }
            elem.setItems(itemsArray);
        }
        if (def.listitems)
        {
            var listitems = def.listitems;
            len = listitems.length;
            for (i = 0; i < len; i++)
            {
                child = this._buildUI(controller, listitems[i], elem);
                elem.addItem(child);
            }
        }
        return elem;
    },
    /**
     * @private
     */
    _createElement: function (controller, def, parentElem)
    {
        var elem;
        switch (def.type)
        {
        case "Button":
        	elem = this._createGLUIElement(GLUI.Button, controller, def);
            break;
        case "CheckBox":
        case "Image":
        case "Label":
        case "View":
        case "ListView":
        case "CellView":
        case "ListViewSection":
            elem = this._createGLUIElement(GLUI[def.type], controller, def);
            break;
        case "ListViewItem":
            elem = this._createListViewItem(controller, def);
            break;
        case "Node":
            elem = this._createNode(def);
            break;
        case "URLSprite":
        case "Sprite":
            elem = this._createSprite(def);
            break;
        case "Text":
            elem = this._createText(def);
            break;
        case "ImageListView":
            elem = this._createImageListView(def);
            break;
        case "MapView":
            elem = this._createMapElement(UI[def.type], controller, def);
            break;
        case "EditText":
        case "EditTextArea":
            elem = this._createUIElement(UI[def.type], controller, def);
            break;
        case "WebView":
            elem = this._createUIElement(UI[def.type], controller, def);
            this._applyWebViewProperties(elem, def);
            break;
        default:
            elem = this._checkUserDefinedMethods(controller, def);
            break;
        }
        if (def.name)
        {
            var defName = def.name;
            if (typeof this._unrollIndex === "number")
            {
                defName = defName + this._unrollIndex.toString();
            }
            elem.name = defName;
            controller[defName] = elem;
            if (parentElem)
            {
                parentElem[defName] = elem;
            }
        }
        controller.__elem.push(elem);
        elem.type = def.type;
        elem.align = def.align;
        elem.marginRight = def.marginRight;
        elem.marginLeft = def.marginLeft;
        elem.valign = def.valign;
        elem.marginBottom = def.marginBottom;
        elem.marginTop = def.marginTop;
        elem.layout = def.layout;
        if (!elem.layout && parentElem)
        {
            elem.layout = parentElem.layout;
        }
        return elem;
    },
    /** @private */
    _setOnAction: function (controller, elem, action, extra)
    {
        var i;
        for (i = 0; i < action.length; i++)
        {
            if (extra)
            {
                this._applyProperty(elem, action[i].type, this._createActionCaller(controller, [elem, extra], action[i]), elem.classname);
            }
            else
            {
                this._applyProperty(elem, action[i].type, this._createActionCaller(controller, elem, action[i]), elem.classname);
            }
        }
    },
    /** @private */
    _createActionCaller: function (controller, elem, action)
    {
        var caller = function ()
            {
                if (typeof action === 'string')
                {
                    var fnByString = controller["action_" + action];
                    if (elem instanceof Array)
                    {
                        fnByString.apply(controller, elem);
                    }
                    else
                    {
                        fnByString.call(controller, elem);
                    }
                }
                else if (typeof action === 'object')
                {
                    var fnByObject = controller["action_" + action.name];
                    var params;
                    if (elem instanceof Array)
                    {
                        params = elem;
                    }
                    else
                    {
                        params = [elem];
                    }
                    if (action.param)
                    {
                        params.push(action.param);
                    }
                    if (action.params)
                    {
                        params = params.concat(action.params);
                    }
                    fnByObject.apply(controller, params);
                }
            };
        return caller;
    },
    /** @private */
    _createGLUIElement: function (ElementType, controller, def)
    {
        var attrs = this._shallowCopy(def.attrs);
        var action = attrs.action;
        var titleView = attrs.titleView;
        delete attrs.action;
        delete attrs.sections;
        delete attrs.items;
        var elem = new ElementType(attrs);
        if (action)
        {
            this._setOnAction(controller, elem, action);
        }
        if (titleView)
        {
            elem.setTitleView(this._buildUI(controller, titleView, elem));
        }
        return elem;
    },
    /** @private */
    _createMapElement: function (ElementType, controller, def)
    {
        var attrs = this._shallowCopy(def.attrs);
        var action = attrs.action;
        var annotation = attrs.annotation;
        var titleView = attrs.titleView;
        delete attrs.action;
        delete attrs.sections;
        delete attrs.items;
        delete attrs.annotation;
        var elem = new ElementType(attrs);
        if (annotation)
        {
            var i;
            for (i = 0; i < annotation.length; i++)
            {
                var ann = this._createUIElement(UI.MapAnnotation, controller, annotation[i]);
                controller.__elem.push(ann);
                if (annotation[i].marker)
                {
                    var actions = annotation[i].marker.attrs.action;
                    delete annotation[i].marker.attrs.action;
                    if (actions)
                    {
                        this._setOnAction(controller, ann, actions);
                    }
                    var marker = this._createUIElement(UI[annotation[i].marker.type], controller, annotation[i].marker);
                    controller.__elem.push(marker);
                    ann.setView(marker);
                }
                if (annotation[i].left_view)
                {
                    var left = this._createUIElement(UI[annotation[i].left_view.type], controller, annotation[i].left_view, elem);
                    controller.__elem.push(left);
                    ann.setCalloutLeftView(left);
                }
                if (annotation[i].right_view)
                {
                    var right = this._createUIElement(UI[annotation[i].right_view.type], controller, annotation[i].right_view, elem);
                    controller.__elem.push(right);
                    ann.setCalloutRightView(right);
                }
                elem.addAnnotation(ann);
            }
        }
        if (action)
        {
            this._setOnAction(controller, elem, action);
        }
        if (titleView)
        {
            elem.setTitleView(this._buildUI(controller, titleView, elem));
        }
        return elem;
    },
    /** @private */
    _createUIElement: function (ElementType, controller, def, extra)
    {
        var attrs = this._shallowCopy(def.attrs);
        var action = attrs.action;
        var titleView = attrs.titleView;
        delete attrs.action;
        delete attrs.sections;
        delete attrs.items;
        var elem = new ElementType(attrs);
        if (action)
        {
            this._setOnAction(controller, elem, action, extra);
        }
        if (titleView)
        {
            elem.setTitleView(this._buildUI(controller, titleView, elem));
        }
        return elem;
    },
    _applyWebViewProperties: function (elem, def)
    {
        if (def.load)
        {
            if (elem[def.load.type])
            {
                elem[def.load.type].apply(elem, def.load.args);
            }
            else
            {
                console.log('<NGGo> | ' + def.load.type + ' property not defined for ' + elem);
            }
        }
    },
    /** @private */
    _createListViewItem: function (controller, def)
    {
        var elem;
        if (def.view)
        {
            switch (def.view.type)
            {
            case "Button":
            case "CheckBox":
            case "Image":
            case "Label":
            case "View":
            case "CellView":
            case "EditText":
            case "EditTextArea":
            case "WebView":
            case "MapView":
                elem = new GUIListViewItem(def.reuseId, controller);
                var attrs = this._shallowCopy(def.attrs);
                delete attrs.onCreateView;
                delete attrs.onSetView;
                delete attrs.onReleaseView;
                elem.setAttributes(attrs);
                if (def.view)
                {
                    this._setItemViewDef(def.view, elem.__view);
                }
                break;
            default:
                elem = this._checkUserDefinedMethods(controller, def);
                return elem;
            }
            return elem;
        }
        return null;
    },
    /** @private */
    _setItemViewDef: function (viewDef, obj)
    {
        obj.type = viewDef.type;
        var key;
        if (!this._unrollDataCell)
        {
            obj.attrs = viewDef.attrs;
        }
        else
        {
            obj.dynamicAttrs = {};
            obj.attrs = {};
            var localAttrs = this._shallowCopy(viewDef.attrs);
            if (viewDef.load)
            {
                obj.load = viewDef.load;
            }
            for (key in localAttrs)
            {
                if (localAttrs.hasOwnProperty(key))
                {
                    if (key === "action" && localAttrs[key] instanceof Array)
                    {
                        var i = 0;
                        var action = [];
                        var dynamic = false;
                        for (i = 0; i < localAttrs[key].length; i++)
                        {
                            if (typeof (localAttrs[key][i].param) === "string" && this._stringHasContext(localAttrs[key][i].param))
                            {
                                var p = this._getObjectForContext(localAttrs[key][i].param);
                                action.push(
                                {
                                    "name": localAttrs[key][i].name,
                                    "param": p,
                                    "params": localAttrs[key][i].params,
                                    "type": localAttrs[key][i].type
                                });
                                dynamic = true;
                            }
                            else
                            {
                                action.push(
                                {
                                    "name": localAttrs[key][i].name,
                                    "params": localAttrs[key][i].params,
                                    "type": localAttrs[key][i].type
                                });
                            }
                        }
                        if (dynamic)
                        {
                            obj.dynamicAttrs[key] = action;
                        }
                        else
                        {
                            obj.attrs[key] = action;
                        }
                    }
                    else if (key.toLowerCase().indexOf("image") >= 0 && localAttrs[key] instanceof Object && typeof (localAttrs[key].url) === "string" && this._stringHasContext(localAttrs[key].url))
                    {
                        obj.dynamicAttrs[key] = {
                            "url": this._replaceContext(localAttrs[key].url),
                            "size": localAttrs[key].size
                        };
                    }
                    else if (typeof (localAttrs[key]) === "string" && this._stringHasContext(localAttrs[key]))
                    {
                        obj.dynamicAttrs[key] = this._replaceContext(localAttrs[key]);
                    }
                    else
                    {
                        obj.attrs[key] = localAttrs[key];
                    }
                }
            }
        }
        if (viewDef.children)
        {
            obj.childrenView = [];
            var children = viewDef.children;
            var j;
            var len = children.length;
            for (j = 0; j < len; j++)
            {
                obj.childrenView[j] = {};
                this._setItemViewDef(children[j], obj.childrenView[j]);
            }
        }
        return obj;
    },
    /** @private */
    _createNode: function (def)
    {
        var elem = new GL2.Node();
        this._applyNodeAttributes(elem, def);
        return elem;
    },
    /** @private */
    _applyNodeAttributes: function (elem, def)
    {
        var attrs = def.attrs;
        var key;
        for (key in attrs)
        {
            if (attrs.hasOwnProperty(key))
            {
                this._applyProperty(elem, key, attrs[key], def.name);
            }
        }
    },
    /**
     * create and reutrn GL2.Sprite or GLUI.URLSprite.
     * @private
     */
    _createSprite: function (def)
    {
        var Sprite;
        switch (def.type)
        {
        case "Sprite":
            Sprite = GL2.Sprite;
            break;
        case "URLSprite":
            Sprite = URLSprite;
            break;
        }
        var elem = new Sprite();
        this._applySpriteAttributes(elem, def);
        return elem;
    },
    /** @private */
    _applySpriteAttributes: function (elem, def)
    {
        var attrs = def.attrs;
        var image = attrs.image;
        var anchor = (image) ? image.anchor : this._defaultAnchor;
        var uvs = (image) ? image.uvs : this._defaultUVs;
        var size = (image) ? image.size : this._defaultSize;
        var key;
        //iterate through attributes
        for (key in attrs)
        {
            if (attrs.hasOwnProperty(key))
            {
                switch (key)
                {
                case "image":
                    elem.setImage(this._basePath + image.url, size, anchor, uvs);
                    break;
                case "animation":
                    //currently animation is not supported
                    break;
                default:
                    this._applyProperty(elem, key, attrs[key], def.name);
                }
            }
        }
    },
    /**
     * create and reutrn GL2.Text.
     * @private
     * */
    _createText: function (def)
    {
        var elem = new GL2.Text();
        this._applyTextAttributes(elem, def);
        return elem;
    },
    /** @private */
    _applyTextAttributes: function (elem, def)
    {
        var attrs = def.attrs;
        var horizontalAlignment = attrs.horizontalAlign;
        var verticalAlignment = attrs.verticalAlign;
        var overflowMode = attrs.overflowMode;
        //var fontFamily = attrs.fontFamily; //what to do?
        var fontLocation = attrs.fontLocation;
        var key;
        for (key in attrs)
        {
            if (attrs.hasOwnProperty(key))
            {
                switch (key)
                {
                case "horizontalAlign":
                    if (String(horizontalAlignment).toLowerCase().search("right") !== -1)
                    {
                        horizontalAlignment = GL2.Text.HorizontalAlign.Right;
                    }
                    else if (String(horizontalAlignment).toLowerCase().search("left") !== -1)
                    {
                        horizontalAlignment = GL2.Text.HorizontalAlign.Left;
                    }
                    else // include "center"
                    {
                        horizontalAlignment = GL2.Text.HorizontalAlign.Center;
                    }
                    elem.setHorizontalAlign(horizontalAlignment);
                    break;
                case "verticalAlign":
                    if (String(verticalAlignment).toLowerCase().search("bottom") !== -1)
                    {
                        verticalAlignment = GL2.Text.VerticalAlign.Bottom;
                    }
                    else if (String(verticalAlignment).toLowerCase().search("top") !== -1)
                    {
                        verticalAlignment = GL2.Text.VerticalAlign.Top;
                    }
                    else // include "middle"
                    {
                        verticalAlignment = GL2.Text.HorizontalAlign.Middle;
                    }
                    elem.setVerticalAlign(verticalAlignment);
                    break;
                case "overflowMode":
                    if (String(overflowMode).toLowerCase().search("reducefontsize") !== -1)
                    {
                        overflowMode = GL2.Text.OverflowMode.ReduceFontSize;
                    }
                    else // include "multiline"
                    {
                        overflowMode = GL2.Text.OverflowMode.Multiline;
                    }
                    elem.setOverflowMode(overflowMode);
                    break;
                case "fontLocation":
                    if (String(fontLocation).toLowerCase().search("bundled") !== -1)
                    {
                        fontLocation = GL2.Text.FontLocation.Bundled;
                    }
                    else if (String(fontLocation).toLowerCase().search("system") !== -1)
                    {
                        fontLocation = GL2.Text.FontLocation.System;
                    }
                    else if (String(fontLocation).toLowerCase().search("manifest") !== -1)
                    {
                        fontLocation = GL2.Text.FontLocation.Manifest;
                    }
                    else // include "default"
                    {
                        fontLocation = GL2.Text.FontLocation.Default;
                    }
                    elem.setFontLocation(fontLocation);
                    break;
                default:
                    this._applyProperty(elem, key, attrs[key], def.name);
                }
            }
        }
    },
    /** @private */
    _applyProperty: function (elem, key, value, name)
    {
        var methodCall = [];
        methodCall.push('set');
        methodCall.push(key.charAt(0).toUpperCase());
        methodCall.push(key.substr(1));
        methodCall = methodCall.join("");
        if (elem[methodCall])
        {
            elem[methodCall].call(elem, value);
        }
        else
        {
            console.log('<NGGo> | ' + key + ' property not defined for ' + name);
        }
    },
    /** @private */
    _createImageListView: function (def)
    {
        var elem = new ImageListView();
        elem._setAttributes(def.attrs);
        return elem;
    },
    /** @private */
    _shallowCopy: function (obj)
    {
        var newObj = {};
        var key;
        for (key in obj)
        {
            if (obj.hasOwnProperty(key))
            {
                newObj[key] = obj[key];
            }
        }
        return newObj;
    },
    /** @private */
    _stringHasContext: function (str)
    {
        var contextStart = str.indexOf("{{");
        var contextFinish = str.indexOf("}}");
        if (contextStart >= 0 && contextFinish >= 0 && contextFinish > contextStart + 2)
        {
            return true;
        }
        return false;
    },
    /** @private */
    _replaceContext: function (str)
    {
        while (true)
        {
            var contextStart = str.indexOf("{{");
            var contextFinish = str.indexOf("}}");
            if (contextStart >= 0 && contextFinish >= 0 && contextFinish > contextStart + 2)
            {
                var contextKey = str.substring(contextStart + 2, contextFinish);
                var replacementString = this._unrollDataCell[contextKey];
                str = str.replace("{{" + contextKey + "}}", replacementString);
            }
            else
            {
                break;
            }
        }
        return str;
    },
    /** @private */
    _getObjectForContext: function (str)
    {
        var contextStart = str.indexOf("{{");
        var contextFinish = str.indexOf("}}");
        if (contextStart >= 0 && contextFinish >= 0 && contextFinish > contextStart + 2)
        {
            var contextKey = str.substring(contextStart + 2, contextFinish);
            var replacementObject = this._unrollDataCell[contextKey];
            return replacementObject;
        }
        return undefined;
    }
});