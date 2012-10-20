//////////////////////////////////////////////////////////////////////////////
/** 
 *  @date:     <DATE>
 *  @file:      <FILE_NAME>.js
 *  @author:    Chris Jimison
 *  Website:    http://www.ngmoco.com
 *  Copyright:  2010, by NGMOCO LLC
 *              Unauthorized redistribution of source code is 
 *              strictly prohibited. Violators will be prosecuted.
 * 
 *  @brief:
 */
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// Require Block
var fs = require('fs');
var url = require('url');

//////////////////////////////////////////////////////////////////////////////
/**
 * _ModulePing:  This is the main module code that will get the init and destroy callbacks
 */
var _ModuleManifest = 
{
    Init : function()
    {
        console.log("Manifest Module started");
    },

    Destroy : function()
    {
        console.log("Ping Module stopped");
    }
};

var _MergeObjects = function(obj1, obj2)
{
    var obj3 = {};
    for (attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
};

var _LoadAssetList = function(root, list, callback) 
{
    var len = list.length;
    if(len)
    {
        fs.readFile(root.configFolder + list[len-1], function(err, data)
        {
            if(err)
            {
                callback(err);
            }
            else
            {
                try
                {
                    // Lets parse the new asset file
                    var obj = JSON.parse(data);
                    for(prop in obj)
                    {
                        if(obj.hasOwnProperty(prop))
                        {
                            if(root.mDefs[prop])
                            {
                                root.mDefs[prop] = _MergeObjects(obj[prop], root.mDefs[prop]);
                            }
                            else
                            {
                                root.mDefs[prop] = obj[prop];
                            }
                        }
                    }
                    // Objects are merged..
                    list.pop();
                    _LoadAssetList(root, list, callback);
                }
                catch(ex)
                {
                    callback(ex);
                }
            }
        });
    }
    else
    {
        callback();
    }
};

var _SetupLoadAssets = function(root, manifestList, callback)
{
    var assets = manifestList.assets;
    
    if(assets)
    {
        _LoadAssetList(root, assets, function(err)
        {
            if(err)
            {
                callback(err);
            }
            else
            {
                callback();
            }
        });
    }
    else
    {
        callback("No assets in the asset list");
    }
};

var _defaultManifestGET = function(req, res, URL)
{
    var device = URL.query.device;
    var game = URL.query.game;
    var configFolder = "../../../" + game + "/Config/";
    var x = parseInt(URL.query.screenX, 10);
    var y = parseInt(URL.query.screenY, 10);
    console.log("***** configFolder = " + configFolder); 
    console.log("***** file =  " + configFolder + "UIDefinition.json"); 
    fs.readFile(configFolder + "UIDefinition.json",'ascii',function(err, data)
    {
        var root = {};
        root.mDefs = {};
        root.configFolder = configFolder;
        root.device = device;
        root.mManifest = JSON.parse(data);
        _SetupLoadAssets(root, root.mManifest.common, function(err)
        {
            var deviceCloser = function(err)
            {
                if(err)
                {
                    console.log('****** error: ' + err);
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end("{}");
                }
                else
                {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(root.mDefs));
                }
            };
        
            if(err)
            {
                console.log(err);
            }
            else
            {
                // 2) Download the platform specific stuff
                if(root.device == "generic")
                {
                    // Generics are handled a little differently
                    // First lets pull out the screen size
                    var genericType =   "def_" + 
                                        root.x +
                                        "x" + 
                                        root.y;
                    if(root.mManifest[root.device][genericType])
                    {
                        // We can support this screen size!!!
                        _SetupLoadAssets(root, root.mManifest[root.device][genericType], deviceCloser); 
                    }
                    else
                    {
                        // NOPE.  Load the generic of the generics..
                        _SetupLoadAssets(root, root.mManifest[root.device].generic, deviceCloser);
                    }
                }
                else
                {
                    _SetupLoadAssets(root, root.mManifest[root.device], deviceCloser);
                }
            }
        });
    });
};

exports.Register = function(map)
{
    // Build up the URL Map
    map.GET.Manifest = _defaultManifestGET;
    
    map.Modules.push(_ModuleManifest);
};
