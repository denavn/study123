var http = require('http');
var url = require('url');
var fs = require('fs');

var modules = {};

var _LoadModules = function(callback)
{
    // Now lets load up in custom Modules
    fs.readFile('./WebModules.json', function (err, data) 
    {
        if (!err)
        { 
            try
            {
                // Lets throw the config file into JSON
                var jsonData = JSON.parse(data);
            
                // Ok the data parsed.  Lets try and load each module!
                var len = jsonData.Modules.length;
                var theErr = false;
                for(var idx = 0; idx < len; ++idx)
                {
                    var modName = jsonData.Modules[idx].require;
                    console.log("***** Loading module: " +  jsonData.Modules[idx].name);
                    try
                    {
                        //clearCached(jsonData.Modules[idx].require);
                        var module = require("./Modules/" + jsonData.Modules[idx].require);
                        // Looks good so far!
                        try
                        {
                            module.Register(modules);
                            modules.Names.push(jsonData.Modules[idx].name);
                        }
                        catch(ex)
                        {
                            console.log("***** ERROR: Module failed to load.");
                            console.log("***** This is not a critical but server maynot work as expected");
                            theErr = true;
                        }

                    }
                    catch(ex)
                    {
                        console.log("***** ERROR: Modules does not exists");
                        console.log("***** This is not a critical but server maynot work as expected");
                        console.log(ex);
                        theErr = true;
                    }
                }
                callback(theErr);
            }
        
            catch(ex)
            {
                // exception at this level should bring down the server
                console.log("***** Server failed to start. Exception throw");
                console.log(ex);
                console.log("Server Exit");
                callback(err);
            }
        }
    });
};

var _ServerHalt = function(req, res, URL)
{
    console.log("Request made to halt the server .. now how do I do that?");
    res.writeHead(404, {'Content-Type' : 'application/json'});
    res.end("Currently Unsupported request");
};

var _ServerModules = function(req, res, URL)
{
    console.log("**** Request for loaded Modules");
    try
    {
        var moduleNames = JSON.stringify(modules.Names);
        res.writeHead(200, {'Content-Type' : 'application/json'});
        res.end(moduleNames);
    }
    catch(ex)
    {
        console.log("***** ERROR: Request _ServerModules");
        console.log(ex);
        res.writeHead(404, {'Content-Type' : 'application/json'});
        res.end('{ "error" : "Error getting server modules" }');
    }
};

var _ServerModulesReload = function(req, res, URL)
{
    // shut down any running modules
    var idx;
    var len = modules.Modules.length;
    for(idx = 0; idx < len; ++idx)
    {
        modules.Modules[idx].Destroy();
    }
    
    // Reload the module map
    _LoadModules(function(err)
    {
    
        // and start the modules back up
        len = modules.Modules.length;
    
        for(idx = 0; idx < len; ++idx)
        {
            modules.Modules[idx].Init();
        }
        _ServerModules(req, res, URL);
    });
};

var _Register = function()
{
    modules.GET.WebServer = {};
    modules.GET.WebServer.Halt = _ServerHalt;
    modules.GET.WebServer.LoadedModules = _ServerModules;
    modules.GET.WebServer.ReloadModules = _ServerModulesReload;
};

var _PrepareModuleMap = function()
{
    modules.GET = {};
    modules.POST = {};
    modules.PUT = {};
    modules.DELETE = {};
    modules.Names = [];
    modules.Modules = [];
};

exports.WebServer = 
{
    StartServer : function(port)
    {
        // 1) Prepare the module map
        _PrepareModuleMap();
        
        // 2) Register the Local Server map
        _Register();
        
        // 3) Load all external modules
        _LoadModules( function(err)
        {
            // and start the modules back up
            var len = modules.Modules.length;
        
            for(var idx = 0; idx < len; ++idx)
            {
                modules.Modules[idx].Init();
            }

            console.log("*** Starting Server on port " + port);
            http.createServer(function(req, res)
            {
                // Pull out the URL
                var requestURL = url.parse(req.url, true);
            
                console.log("*** request url = " + requestURL.pathname + " method: " + req.method);
                // break the url up into chunks
                var bits =  requestURL.pathname.split('/');
                var bitsLen = bits.length;
                var handle = modules[req.method];
            
                var bitIdx = 0;
                for(bitIdx = 0; bitIdx < bitsLen; ++bitIdx)
                {
                    if(handle && bits[bitIdx])
                    {
                        handle = handle[bits[bitIdx]];
                        if(!handle)
                        {
                            console.log("Don't know what to do...");
                            // This is a 404 problem
                            res.writeHead(404, {'Content-Type': 'text/plain'});
                            res.end('WebServer: Page not found\n');
                            return;
                        }
                    }
                }
                try
                {
                    console.log("*** calling the handle");
                    handle(req, res, requestURL);
                }
                catch(ex)
                {
                    // so the requested function handle does not exists (for example pulling a root page)
                    // or the url is just all bad.  No matter what just throw a 404
                    res.writeHead(404, {'Content-Type': 'text/plain'});
                    res.end('Page not found\n');
                }
            }).listen(port);
        });
    }
};
