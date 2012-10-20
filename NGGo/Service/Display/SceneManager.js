////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Chris Jimison
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// Require Block
var Core       = require('../../../NGCore/Client/Core').Core;
var GL2        = require('../../../NGCore/Client/GL2').GL2;
var Storage    = require('../../../NGCore/Client/Storage').Storage;
var ServerSync = require('../Data/ServerSync').ServerSync;
var NGGOError  = require('../../Foundation/NGGOError').NGGOError;

////////////////////////////////////////////////////////////////////////////////

exports.SceneManager = ServerSync.singleton(
/** @lends Service.Display.SceneManager.prototype */
{
    classname: "SceneManager",
    /**
     * Error code of <code>ServerSync</code> class.
     * @namespace ERROR
     */
    ERROR:
    {
        DUPLICATE_KEYS: 1
    },
    /**
     * @class The <code>SceneManager</code> is a wrapper over the basic skeleton
     * of the Scene Graph to allow for quick data driven setup.
     * <br><br>
     * The SceneManager is a singleton object that will manage the basic
     * skeleton of the scene graph hierarchy. The SceneManager will provide
     * the main access point for game code to read, modify and add objects
     * to the scene.
     * <br><br>
     * Many examples of games use a much more complex
     * Scene Graph then the ngCore samples provide, and this system
     * will allow users to get a complex scene with UI, and game
     * objects up and rendering quickly.
     * @name Service.Display.SceneManager
     * @constructs
     * @augments Core.Class
     */
    initialize : function()
    {
        this.mNodes = {};
        this.mSceneData = {};
        this.mNodes.GL2_ROOT = GL2.Root;
    },

    /**
     * Loads the configuration from a flat file
     * @param {String} filename File name.
     * @param {GL2.Node} parent Parent node of this scene.
     * @param {Function} callback Callback function it is called when the loading is finished.
     * @name Service.Display.SceneManager.loadConfigFromFile
     */
    /**
     * Loads the configuration from a data set.
     * @param {String} jsonData Which should be JSON data
     * @param {GL2.Node} parent Parent node of this scene.
     * @returns {Service.Display.SceneManager.error} Error code.
     * @name Service.Display.SceneManager.loadConfigFromData
     */
    /**
     * Loads the configuration using the asset manager.
     * @param {String} assetKey
     * @param {GL2.Node} parent Parent node of this scene.
     * @param {Function} callback Callback function it is called when the loading is finished.
     * @name Service.Display.SceneManager.loadConfigFromAsset
     */
    /**
     * Gets a node from a key name defined in the config
     * @param {String} key Name for the Node
     * @returns {GL2.Node} Instance or <code>undefined</code> if no node for that key
     */
    getNodeForKey : function(key)
    {
        return this.mNodes[key];
    },

    /**
     * adds a node to the manager.
     * <br><br>
     * Notes about this method:
     * <ul>
     * <li>No dynamic API will be generated when using this call
     * <li>Duplicate node can be inserted but this can causes errors so be careful
     * <li>You can not add the GL2 Root to the manager.  It is already there with the key "GL2_ROOT" if you need it
     * </ul>
     * <br><br>
     * It is HIGHLY recommended that you define all your nodes inside a JSON data file
     * and NOT use this method, but if needed it is provided
     * @param {String} key Name for the GL2.Node. If key does exits then nothing is set.
     * @param {GL2.Node} node to be accessed for the key
     */
    addNodeForKey : function(key, node)
    {
        if(!this.mNodes[key] && node !== GL2.Root)
        {
            this.mNodes[key] = node;
        }
    },

    /**
     * Sets the node instance for a given key.
     * <br><br>
     * If you are changing the node it will go though and reattach the children nodes  <br><br>
     * This will do the following
     * <ul>
     * <li>Insert the new node.</li>
     * <li>Detach the old node.</li>
     * <li>Copy all children from the old node into the new node.</li>
     * <li>Release the old node.</li>
     * </ul>
     * @param {String} key Name for the GL2.Node. If key does not exits then nothing is set.
     * @param {GL2.Node} node New node object it is used instead of current node.
     */
    replaceNodeForKey : function(key, node)
    {
        if(node !== GL2.Root && this.mNodes[key] && this.mNodes[key] !== GL2.Root)
        {
            this._replaceNode(this.mNodes[key], node, key);
        }
    },

    /**
     * Inserts a node infront of the given node.
     * <br><br>
     * When a node is "inserted" it will add it above the node that it was given and insert the old node as a child.
     * <br><br>
     * For example assume you have a node structure that looks like:<br>
     * <pre class="code">
     *     A <-- B <-- C
     * </pre> where B is the parent of C an A is the
     * parent of A.  If you call insertNodeForKey(node, "B", "new") the graph will now look
     * like:<br>
     * <pre class="code">
     *     A <-- node(new) <-- B <-- C.
     * </pre>
     * @param {GL2.Node} node <code>GL2.Node</code> object to insert.
     * @param {String} key Name for the old node to be replaced.
     * @param {String} nodeKey Name for the new node.
     */
    insertNodeForKey : function(key, node, nodeKey)
    {
        if(node !== GL2.Root && this.mNodes[key] && this.mNodes[key] !== GL2.Root)
        {
            this._insertNode(key, this.mNodes[key], nodeKey, node);
        }
    },

    /**
     * Resets the SceneManager to it's "Initalized" state.
     * <br><br>
     * <b>NOTE:</b> This does NOT reset your scene graph nodes.  It just clears out the
     * "managed" nodes by the scene manager.  This was done so people can insert
     * nodes into SceneManager if later the reset the manager they will not lose
     * their node hierachy.
     */
    reset : function()
    {
        var key;
        for(key in this.mNodes)
        {
            if(this.mNodes.hasOwnProperty(key))
            {
                if(this['insertNode' + key])
                {
                    delete this['insertNode' + key];
                }

                if(this['replaceNode' + key])
                {
                    delete this['settNode' + key];
                }

                if(this['getNode' + key])
                {
                    delete this['getNode' + key];
                }
            }
        }


        this.mNodes = {};
        this.mSceneData = {};
        this.mNodes.GL2_Root = GL2.Root;

        this.notify("onReset", this);
    },

    /**
     * @private
     * Replaces a node in the graph.  WARNING!!!
     * this method uses privates from the node class.
     */
    _replaceNode : function(oldNode, newNode, key)
    {
        if (key === "GL2_ROOT" || oldNode === GL2.Root || newNode === GL2.Root)
        {
            throw new Error ("All set operations with the GL2 Root node are invalid");
        }
        else
        {
            // Step 1 detach node from it's parent
            var p = oldNode.getParent();
            p.removeChild(oldNode);
            p.addChild(newNode);

            var children = [];
            var oldNodeChildLen = oldNode._children;
            var idx = 0;

            for(idx = 0; idx < oldNodeChildren; ++ idx)
            {
                children.push(oldNode._children[idx]);
            }

            for(idx = 0; idx < oldNodeChildren; ++ idx)
            {
                oldNode.removeChild(children[idx]);
                newNode.addChild(children[idx]);
            }

            // Repare the dynamic functions if they exists
            if(this['getNode' + key])
            {
                this['getNode' + key] = function(){ return newNode; };
                this['getNode' + key].node = newNode;
            }

            if(this['replaceNode' + key])
            {
                this['replaceNode' + key].node = newNode;
            }


            this.notify("onNodeReplaced", key);
        }
    },
    /**
     * @private
     */
    _insertNode : function(key, oldNode, newKey, newNode)
    {
        if (key === "GL2_ROOT" || oldNode === GL2.Root || newNode === GL2.Root)
        {
            throw new Error ("All insert operations with the GL2 Root node are invalid");
        }
        else
        {
            // Add this node to the map
            this.mNodes[newKey] = newNode;
            var p = oldNode.getParent();
            p.removeChild(oldNode);
            p.addChild(newNode);
            newNode.addChild(oldNode);
            this.notify("onNodeInserted", key);
        }
    },

    /**
     * @private
     * Parse the objects local scene data and sets it up for usage
     * if the system has already been loaded then it will unload
     * all the information and then reload the framework
     */
    __onLoadData : function(data, parent)
    {
        this.mSceneData = data;
        if (parent === undefined) {
            parent = GL2.Root;
        }
        var error;
        var prop;
        for(prop in data)
        {
            if(data.hasOwnProperty(prop))
            {
                error = this._loadNode(prop, data[prop], parent);
                if (error) {
                    return error;
                }
            }
        }
    },

    /**
     * @private
     * Parse the objects local scene data and sets it up for usage
     * if the system has already been loaded then it will unload
     * all the information and then reload the framework
     */
    _loadNode : function(nodeName, nodeData, parent)
    {
        var self = this;

        if(this.mNodes[nodeName])
        {
            // OPPS, you should not have done this...
            return new NGGOError(this.ERROR.DUPLICATE_KEYS,
                                 self.classname + ": node name '"
                                 + nodeName + "' is duplicated.");
        }

        // Step 1) create the new node
        var node = new GL2.Node();
        this.mNodes[nodeName] = node;
        parent.addChild(node);

        // Step 2) Create accessor methods
        nodeData.accessor = nodeData.accessor || "read";
        if(nodeData.accessor)
        {
            // flags
            var readFlag = nodeData.accessor === "read" || nodeData.accessor === "readonly" || nodeData.accessor === "readwrite" || nodeData.accessor === "readwriteonly";
            var writeFlag = nodeData.accessor === "write" || nodeData.accessor === "writeonly" || nodeData.accessor === "readwrite" || nodeData.accessor === "readwriteonly";
            var insertFlag = nodeData.accessor !== "readonly" && nodeData.accessor !== "writeonly" && nodeData.accessor !== "none" && nodeData.accessor !== "readwriteonly";

            if(readFlag)
            {
                this['getNode' + nodeName] = function(){ return node; };
                this['getNode' + nodeName].node = node;
            }

            if(writeFlag)
            {
                this['replaceNode' + nodeName] = function(newNode)
                {
                    self._replaceNode(node, newNode, nodeName);
                };
                this['replaceNode' + nodeName].node = node;
            }

            if(insertFlag)
            {
                this['insertNode' + nodeName] = function(newNode)
                {
                    self._insertNode(node, newNode, nodeName);
                };
                this['insertNode' + nodeName].node = node;
            }
        }

        // Step 3) Manage the depth value of the node
        nodeData.depth = nodeData.depth || 0;
        node.setDepth(nodeData.depth);

        // Step 4) Set the ChildrenDepthGrouped value
        if(node.childrenDepthGrouped === false)
        {
            node.setChildrenDepthGrouped(false);
        }

        // Step 5) Process any children nodes
        var prop;
        for(prop in nodeData.children)
        {
            if(nodeData.children.hasOwnProperty(prop))
            {
                // This should be a valid guy
                this._loadNode(prop, nodeData.children[prop], node);
            }
        }
    }
});
