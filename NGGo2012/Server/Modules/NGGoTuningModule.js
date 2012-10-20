////////////////////////////////////////////////////////////////////////////////
/**
 *  @data:      2011-07-06 
 *  @file:      FileWatchModule.js
 *  @author:    Chris Jimison
 *  Website:    https://developer.mobage.com/
 *  Copyright:  2010, by ngmoco:) llc
 *              Unauthorized redistribution of source code is 
 *              strictly prohibited. Violators will be prosecuted.
 * 
 *  @brief:     
 */
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Require Block
var fs = require('fs');

//////////////////////////////////////////////////////////////////////////////
/**
 * Helper function for creating UUID values
 */
function createUUID()
{
    var result, i, j;
    result = '';
    for(j=0; j<32; j++)
    {
        if( j == 8 || j == 12|| j == 16|| j == 20) 
        {
            result = result + '-';
        }
        i = Math.floor(Math.random()*16).toString(16).toUpperCase();
        result = result + i;
    }
    return result;
}

//////////////////////////////////////////////////////////////////////////////
/**
 * _ModulePing:  This is the main module code that will get the init and destroy callbacks
 */

function TuningFileModule()
{
    this.mFile = "";
}

TuningFileModule.prototype.Init = function()
{
    console.log("Preference Tunable Module started");
    this.mRequests = {};
    this.longPollTimeout = 8000;
    this.mData = "";
    this.mFile = "";
};

TuningFileModule.prototype.Destroy = function()
{
    console.log("Preference Tunable  stopped");
};

TuningFileModule.prototype.onDataChanged = function()
{
    for(var key in this.mRequests)
    {
        if(this.mRequests.hasOwnProperty(key))
        {
            this.mRequests[key].res.writeHead(200, {'Content-Type': 'application/json'});
            this.mRequests[key].res.end('{"changed" : true}\n');
            delete this.mRequests[key];
        }
    }
};

TuningFileModule.prototype.getData = function()
{
    return this.mData;
};
    
TuningFileModule.prototype.reloadDataFile = function(callback)
{
    var self = this;
    // Let load the file up
    fs.readFile(this.mFile, function(err, data)
    {
        if(!err)
        {
            self.mData = data;
        }
        callback(err);
    });
};

TuningFileModule.prototype.loadDataFile = function(file, callback)
{
    this.mFile = file;
    this.reloadDataFile(callback);
};

var _WatchLocalFile = function(req, res, URL, module)
{
    var file = URL.query.file;
    module.loadDataFile(file, function(err)
    {
        if(err)
        {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end('{"message" : "Error loading the file :' + file +'" }\n');
        }
        else
        {
            fs.watchFile(file, function(curr, prev)
            {
                module.reloadDataFile( function(err)
                {
                    if(err)
                    {
                        console.log("ERROR reloading the file");
                    }
                    else
                    {
                        if (curr.mtime - prev.mtime)
                        {
                            module.onDataChanged();
                        }
                    }
                });
            });
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end('{"message" : "Watch enabled on the following file :' + file +'" }\n');
        }
    });
};

var _PollForChanges = function(req, res, URL, module)
{
    var key = createUUID();
    var obj = {};
    obj.res = res;
    obj.req = req;
    obj.URL = URL;
    
    module.mRequests[key] = obj;
    setTimeout(function()
    {
        // Check if a changed has clear this request out already 
        if(module.mRequests[key])
        {
            delete module.mRequests[key];
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end('{"changed" : false}\n');

        }
    }, module.longPollTimeout);
};

var _Data = function(req, res, URL, module)
{
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(module.getData());
};

var _ForceUpdate = function(req, res, URL, module)
{
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end('{"message" : "Forced data refresh for any polling requests"}\n');
    module.onDataChanged();
};

exports.Register = function(map)
{
    var cameraModule = new TuningFileModule();
    map.GET.Camera = function(req, res, URL){ _Data(req, res, URL, cameraModule); };
    map.GET.Camera.PollForChanges = function(req, res, URL){ _PollForChanges(req, res, URL, cameraModule); };
    map.GET.Camera.WatchLocalFile = function(req, res, URL){_WatchLocalFile(req, res, URL, cameraModule); };
    map.GET.Camera.ForceUpdate = function(req, res, URL){_ForceUpdate(req, res, URL, cameraModule); };
    
    var preferenceModule = new TuningFileModule();
    map.GET.Preference = function(req, res, URL){ _Data(req, res, URL, preferenceModule); };
    map.GET.Preference.PollForChanges = function(req, res, URL){ _PollForChanges(req, res, URL, preferenceModule); };
    map.GET.Preference.WatchLocalFile = function(req, res, URL){_WatchLocalFile(req, res, URL, preferenceModule); };
    map.GET.Preference.ForceUpdate = function(req, res, URL){_ForceUpdate(req, res, URL, preferenceModule); };

    // Build up the URL Map
    map.Modules.push(cameraModule);
    map.Modules.push(preferenceModule);
};
