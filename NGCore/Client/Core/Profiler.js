////////////////////////////////////////////////////////////////////////////////
// Class Profiler
//
// Copyright (C) 2011 ngmoco:) LLC.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Class = require('./Class').Class;
var Capabilities = require("../Core/Capabilities").Capabilities;
var process = { 'test': 'test_val' };

////////////////////////////////////////////////////////////////////////////////

exports.Profiler = Class.singleton(
{
	classname: 'Profiler',
	
    currentAdapter: null,
    
	// Setting these attributes from native is not working. Hard-code these for now.
	NONE: 0,
	CPU: 1, // V8_PROFILER_MODULE_CPU,
	HEAP_STATS: 1 << 1, // V8_PROFILER_MODULE_HEAP_STATS,
	HEAP_SNAPSHOT: 1 << 16, // V8_PROFILER_MODULE_HEAP_SNAPSHOT,
	JS_CONSTRUCTORS: 1 << 2, // V8_PROFILER_MODULE_JS_CONSTRUCTORS,
	ALL: 1 | 1 << 1 | 1 << 16 | 1 << 2,
    
    noAdapter: function()
    {
        // no adapter or adapter method default
        NgLogD('No Profiler Adapter');
    },
    
    callAdapterMethod: function(methodName, args)
    {
        if(this.currentAdapter)
        {
            this.currentAdapter[methodName].apply(this, args);
        } else
        {
            this.noAdapter();
        }
    },
    
    gc: function(){ this.callAdapterMethod('gc', arguments); },
    startCPU: function(){ this.callAdapterMethod('startCPU', arguments); },
    stopCPU: function(){ this.callAdapterMethod('stopCPU', arguments); },
    startMemory: function(){ this.callAdapterMethod('startMemory', arguments); },
    stopMemory: function(){ this.callAdapterMethod('stopMemory', arguments); },
    sampleMemory: function(){ this.callAdapterMethod('sampleMemory', arguments); },
    resume: function(){ this.callAdapterMethod('resume', arguments); },
    pause: function(){ this.pause('resume', arguments); },

	initialize: function($super, properties)
	{
        NgLogD('Profiler Initialize');
		this.onAndroid = Capabilities.getPlatformOS() == 'Android';
        
        if(this.onAndroid)
        {
            this.currentAdapter = new this.AndroidAdapter(this);
        }
	},
        
    AndroidAdapter: function(parent)
    {
        // first we create our node-inspector api needed, 
        // it specifically looks for process.profiler
        process.profiler = {};
        
        function Snapshot() {}
        var maxDepth = 6;
        function parseNode(node, edge, prevPtr, depth)
        {
            function getTabs(len)
            {
                var tabs = '';
                for(i=0;i<len;i++)
                    tabs += '\t';
                    
                return tabs;
            }

            var currDepth = depth + 1;
            
            var tabs = getTabs(currDepth);
            
            /*if(currDepth >= maxDepth)
            {
                NgLogD(tabs + 'currDepth: ' + currDepth + ', returning back');
                return;
            }*/
            var data = 
            {
                name: node.name,
                size: node.size,
                totalSize: node.totalSize,
                childrenCount: node.childrenCount,
                retainersCount: node.retainersCount,
                ptr: node.ptr,
                type: node.type,
                children: []
            };
            
            var edgeData = [];
            
            if(edge)
            {
                edgeData =
                {
                    name: edge.name,
                    type: edge.type
                };
            }
            
            NgLogD(tabs + 'node info ' + JSON.stringify(data) + '\n' + tabs + 'edge info ' + JSON.stringify(edgeData));
            
            for(var i=0; i<node.childrenCount; i++)
            {
                NgLogD(tabs + 'get child at: ' + i + ' out of ' + node.childrenCount);
                var edge = node.getChild(i);
                
                NgLogD(tabs + 'comparing between prevPtr:' + prevPtr + ', edge.to.ptr:' + edge.to.ptr);
                if(!prevPtr || (edge.to.ptr !== prevPtr))
                {
                    NgLogD(tabs + 'Diving in');
                    data.children.push(parseNode(edge.to, edge, node.ptr, currDepth));
                } else
                {
                    NgLogD(tabs + 'Skipping');
                }
            }
            
            return data;
        }

        Snapshot.prototype.full_stringify = function() 
        {
            return JSON.stringify(parseNode(this.root, null, null, 0));
        }

        //adapted from WebCore/bindings/v8/ScriptHeapSnapshot.cpp
        Snapshot.prototype.stringify = function() {
          var root = this.root.getChild(0).to, i, j, count_i, count_j, node,
              lowLevels = {}, entries = {}, entry,
              children = {}, child, edge, result = {};
          for (i = 0, count_i = root.childrenCount; i < count_i; i++) {
            node = root.getChild(i).to;
            console.log('name: ' + node.name + '  childrenCount: ' + node.childrenCount + '  instancesCount: ' + node.instancesCount);
            if (node.type === 'Hidden') {
              lowLevels[node.name] = {
                count: node.instancesCount,
                size: node.size,
                type: node.name
              };
            }
            else if (node.instancesCount > 0) {
              entries[node.name] = {
                constructorName: node.name,
                count: node.instancesCount,
                size: node.size
              };
            }
            // FIXME: the children portion is too slow and bloats the results
            /*
            else {
              entry = {
                constructorName: node.name
              };
              for(j = 0, count_j = node.childrenCount; j < count_j; j++) {
                edge = node.getChild(j);
                child = edge.to;
                entry[child.ptr.toString()] = {
                  constructorName: child.name,
                  count: parseInt(edge.name, 10)
                }
              }
              children[node.ptr.toString()] = entry;
            }//*/
          }
          result.lowlevels = lowLevels;
          result.entries = entries;
          result.children = children;
          return JSON.stringify(result);
        }

        function CpuProfile() {}

        function inspectorObjectFor(node) {
          var i, count, child,
              result = {
                functionName: node.functionName,
                url: node.scriptName,
                lineNumber: node.lineNumber,
                totalTime: node.totalTime,
                selfTime: node.selfTime,
                numberOfCalls: 0,
                visible: true,
                callUID: node.callUid,
                children: []
              };
          for(i = 0, count = node.childrenCount; i < count; i++) {
            child = node.getChild(i);
            result.children.push(inspectorObjectFor(child));
          }
          return result;
        }

        CpuProfile.prototype.stringify = function() {
          return JSON.stringify(inspectorObjectFor(this.topRoot));
        }

        var heapCache = [];

        NgLogD('setting profiler functions');
        process.profiler.takeSnapshot = function(name, mode) 
        {
            var type = (mode === 'full') ? 0 : 1;
            var snapshot = NgJSTakeSnapshot( name );
          
            if(snapshot)
            {
                snapshot.__proto__ = Snapshot.prototype;
                heapCache.push(snapshot);
            }
            return snapshot;
        }

        process.profiler.getSnapshot = function(index) {
          return heapCache[index];
        }

        process.profiler.findSnapshot = function(uid) {
          return heapCache.filter(function(s) {return s.uid === uid;})[0];
        }

        process.profiler.snapshotCount = function() {
          return heapCache.length;
        }

        var cpuCache = [];

        process.profiler.startProfiling = function(name) 
        {
            NgLogD('startProfiling: ' + name);
            NgJSStartProfiling( name );
        }

        process.profiler.stopProfiling = function(name) 
        {
            NgLogD('stopProfiling: ' + name);
            var profile = NgJSStopProfiling(name);
            
            if(profile)
            {
                profile.__proto__ = CpuProfile.prototype;
                cpuCache.push(profile);
            }
            
            return profile;
        }

        process.profiler.getProfile = function(index) {
          return cpuCache[index];
        }

        process.profiler.findProfile = function(uid) {
          return cpuCache.filter(function(s) {return s.uid === uid;})[0];
        }

        process.profiler.profileCount = function() {
          return cpuCache.length;
        }
        
        // our adapter api
        this.gc = function()
        {
            NgJSGC();
        };
        
        var defaultCPUProfileName = '';
        this.startCPU = process.profiler.startProfiling;
        this.stopCPU = process.profiler.stopProfiling;
        this.startMemory = function( tag )
        {
            NgLogD('startMemory');
            parent.resume(parent.HEAP_STATS | parent.JS_CONSTRUCTORS, tag);
        };
        this.stopMemory = function( tag )
        {
            parent.pause(parent.HEAP_STATS | parent.JS_CONSTRUCTORS, tag);
        };
        this.sampleMemory = function( tag )
        {
            NgLogD('sampleMemory');
            parent.resume(parent.HEAP_SNAPSHOT, tag);
        };
        this.resume = function( flags, tag )
        {
            NgLogD("Profiler/resume: flags=" + flags + ", tag=" + tag);
            
            flags = flags | this.NONE;
            tag = tag | 0;
            if (this.onAndroid) {
                NgLogD("NgJSProfilerResume: flags=" + flags + ", tag=" + tag);
                NgJSProfilerResume(flags, tag);
            }
        };        
        this.pause = function( flags, tag )
        {
            NgLogD("Profiler/pause: flags=" + flags + ", tag=" + tag);
        
            flags = flags | this.NONE;
            tag = tag | 0;
            if (this.onAndroid) {
                NgLogD("NgJSProfilerPause: flags=" + flags + ", tag=" + tag);
                NgJSProfilerPause(flags, tag);
            }
        };
    }
});
