var fs = require('fs');

var _frmGameConfigInfo =  null;

var _Module =
{
    Init : function()
    {
        console.log("File System Module started");
        // We need to load the info for this module
        fs.readFile('./FileRequestModule.json', function(err, data)
        {
            if(!err)
            {
                try
                {
                    _frmGameConfigInfo = JSON.parse(data);
                }
                catch(ex)
                {
                    console.log("could not parse data:\n" + ex);
                }
            }
            else
            {
                console.log("We have a problem loading the file request log");
            }
        });
    },

    Destroy : function()
    {
        console.log("File System Module stopped");
    }
};

////////////////////////////////////////////////////////////////////////
/**
 * URL = http://<Server>/fs/Content
 * Type = GET
 * 
 * Gets the listing of all the "Content" files.  These will an unfiltered list
 * @param req
 * @param res
 * @param URL
 */
var _GetContent = function(req, res, URL)
{
    var content = {};
    
    if(_frmGameConfigInfo)
    {
        var dir = _frmGameConfigInfo.GameRootDir + "/Content";
    
    }
    else
    {
        content.files =
        [
            "foo.png",
            "bar.png",
            "foo.wav",
            "bar.wav"
        ];
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(content));
};

////////////////////////////////////////////////////////////////////////
/**
 * URL = http://<Server>/fs/Code
 * Type = GET
 * 
 * Gets the listing of all the "Code files" files.  This is a filtered list
 * of JSON and JS based files
 * @param req
 * @param res
 * @param URL
 */
var _GetCode = function(req, res, URL)
{
    var code =
    {
        "files" : 
        [
            "foo.js",
            "bar.js"
        ]
    };
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(content));
};

////////////////////////////////////////////////////////////////////////
/**
 * URL = http://<Server>/fs/Config
 * Type = GET
 * 
 * Gets the listing of all the "Content" files.  These will an unfiltered list
 * @param req
 * @param res
 * @param URL
 */
var _GetConfig = function(req, res, URL)
{
    var configs =
    {
        "files" : 
        [
            "foo.json",
            "bar.json"
        ]
    };
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(content));

};

exports.Register = function(map)
{
    map.GET.fs = function(req, res, URL)
    {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end('{"message" : "I am easy but not THAT easy"}\n');
    };
    
    map.GET.fs.Content = _GetContent;
    map.GET.fs.Code = _GetCode;
    map.GET.fs.Config = _GetConfig;

    map.Modules.push(_Module);
};