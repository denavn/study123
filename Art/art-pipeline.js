////////////////////////////////////////////////////////////////////////////////
/**
*  @data:      2011-06-21 
*  @file:      art-pipeline.js
*  @author:    Chris Jimison
*  Website:    http://www.ngmoco.com
*  Copyright:  2010, by ngmoco:) llc
*              Unauthorized redistribution of source code is 
*              strictly prohibited. Violators will be prosecuted.
* 
*  @brief:     
*/
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Require Block
var sys = require('sys');
var fs = require('fs');
var util = require('util');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

////////////////////////////////////////////////////////////////////////////////
/**
 * @method:         GenSpriteSheets 
 * @description:    Calls Texture Packer on all the .tps files given.  Once it
 *                  has finished running TP on the files it will return to the
 *                  callback
 * @param           {string} directory root path
 * @param           {Array} files to run TexturePacker on.  If the file is a .tps.
 * @param           {function} callback closer for when TP has been run on all 
 *                              texture packer objects
 * @return 
 */
var GenSpriteSheets = function(pathRoot, files, callback)
{
    var len = files.length;
    if(len > 0)
    {
        if(files[len-1].indexOf('.tps') != -1)
        {
            var execute = spawn('TexturePacker', [pathRoot + files[len - 1]]);
            execute.on('exit', function(code)
            {
                files.pop();
                GenSpriteSheets(pathRoot, files, callback);
            });

            execute.stdout.on('data', function(data)
            {
                console.log("<GenSpriteSheets>: " + data);
            });
        }
        else
        {
            files.pop();
            GenSpriteSheets(pathRoot, files, callback);
        }
    }
    else
    {
        callback();        
    }
};

////////////////////////////////////////////////////////////////////////////////
/**
 * @method:         FormatCocosData 
 * @description:    
 * @param 
 * @return 
 */
var FormatCocosData = function(obj)
{
    if(obj instanceof Object)
    {
        for(var prop in obj)
        {
            if(obj.hasOwnProperty(prop))
            {
                if(typeof obj[prop] == "string" && obj[prop].indexOf('{') != -1)
                {
                    obj[prop] = obj[prop].replace(/{/g, "[");
                    obj[prop] = obj[prop].replace(/}/g, "]");
                    obj[prop] = '{"data" : ' + obj[prop] + '}';
                    obj[prop] = (JSON.parse(obj[prop])).data;
                }
                else if(obj[prop] instanceof Object || obj[prop] instanceof Array)
                {
                    FormatCocosData(obj[prop]);
                }
            }
        }
    }
    else if(obj instanceof Array)
    {
        var idx = 0;
        var len = obj.length;
        for(; idx < len; ++idx)
        {
            if(typeof obj[idx] == "string" && obj[idx].indexOf('{') != -1)
            {
                obj[idx] = obj[idx].replace(/{/g, "[");
                obj[idx] = obj[idx].replace(/}/g, "]");
                
                obj[idx] = '{"data" : ' + obj[idx] + '}';
                obj[idx] = (JSON.parse(obj[idx])).data;
            }
            else if(obj[idx] instanceof Object || obj[idx] instanceof Array)
            {
                FormatCocosData(obj[idx]);
            }
        }
    }
};

////////////////////////////////////////////////////////////////////////////////
/**
 * @method:         FormatCocosInGoJSON 
 * @description:    
 *  Json format should look like so from the cocoas plist convert
 *  {
 *      "frames" : {
 *          "animationName/file.png" : {
 *              "frame" : [[x, y], [width, height]],
 *              "offset" : [x, y],
 *              "rotated" : true/false
 *              "sourceColorRect" : [[x,y], [width, height]],
 *              "sourceSize" : [width, height]
 *          }
 *      }
 *      "meta" : {
 *          "format" : number,
 *          "size : [width, heght],
 *          "textureFileName : "foo.png"
 *      }
 *  }
 *
 *  however we need the data to look like the following
 *  {
 *      "type" : {
 *          "animationName" :
 *          [
 *              {
 *                  "loc" : [x, y],
 *                  "size" : [width, height],
 *                  "off" : [x, y], 
 *                  "rot" : true/false,
 *                  "src" :
 *                  {
 *                      "loc" : [x, y],
 *                      "size" : [width, height],
 *                      "full" : [width, height]
 *                  }
 *              },
 *
 *          ]
 *      }
 *      "meta" :
 *      {
 *          "asset" : "foo.png",
 *          "size" : [0, 0];
 *      }
 *
 *
 * @param 
 * @return 
 */
var FormatCocosInGoJSON = function(json)
{

    var goJson = {};
    goJson.type = {}; 

    if(json.frames)
    {
        for(var prop in json.frames)
        {
            if(json.frames.hasOwnProperty(prop))
            {
                var frame = json.frames[prop];
                var nameInfo = prop.split("/");
                var animName = nameInfo[0];
                var extIdx = nameInfo[1].indexOf('.');
                var assetName = nameInfo[1].substr(0, extIdx); 
                var index = parseInt(assetName, 10);
                if(isNaN(index))
                {
                    extIdx = assetName.indexOf('_');
                    if(extIdx == -1)
                    {
                        // I know I know .. this is not the best way to format a string.
                        // sue me.  If this code hits you a screwed and the script will end
                        // so it does not need to be fast :P
                        throw "Animation data is not formated correctly.  " + 
                                "All frame data should be named <frame number>.<extension> " + 
                                "or tag_<frame number>.<extension>.  example: 001.png - 0010.png "+
                                "or foo_001.pvr - foo_0010.pvr or 1_foo.pvr - 10_foo.pvr";
                    }

                    var splitData = assetName.split('_');
                    var id1 = parseInt(splitData[0], 10);
                    var id2 = parseInt(splitData[1], 10); 
                    if(!isNaN(id1))
                    {
                        index = id1;
                    }
                    else if(!isNaN(id2))
                    {
                        index = id2;
                    }
                    else
                    {
                        throw "Animation data is not formated correctly.  " +
                              "All frame data should be named <frame number>.<extension> " +
                              "or tag_<frame number>.<extension>.  example: 001.png - 0010.png " +
                              " or foo_001.pvr - foo_0010.pvr or 1_foo.pvr - 10_foo.pvr";
                    }
                }

                goJson.type[animName] = goJson.type[animName] || [];
                
                var data = {};
                data.loc = frame.frame[0];
                data.size = frame.frame[1];
                data.rot = frame.rotated;
                data.src = {};
                data.off = frame.offset;
                data.src.loc = frame.sourceColorRect[0];
                data.src.size = frame.sourceColorRect[1];
                data.src.full = frame.sourceSize;

                goJson.type[animName][index] = data;
            }
        }
    }
    
    // if you start your frame name count at 1 instead of 0, clean that up please
    for(var goProp in goJson.type)
    {
        if(goJson.type.hasOwnProperty(goProp))
        {
            // walk the list and remove the nulls
            if(goJson.type[goProp][0] === undefined )
            {
                goJson.type[goProp].splice(0, 1);
            }
        }
    }

    if(json.metadata)
    {
        goJson.meta = {};
        goJson.meta.asset = json.metadata.textureFileName;
        goJson.meta.size = json.metadata.size;
    }

    return goJson;
};

////////////////////////////////////////////////////////////////////////////////
/**
 * @method:         ConvertCocosPlistToGoJSON 
 * @description:    Converts all Cocos2D plistFiles into our Mobage Go JSON format
 * @param           {Array} files to run TexturePacker on.  If the file is a .tps.
 * @param           {function} callback closer for when TP has been run on all 
 *                              texture packer objects
 * @return 
 */
var ConvertCocosPlistToGoJSON = function(pathRoot, files, callback)
{
    var len = files.length;
    if(len > 0)
    {
        var extIdx = files[len-1].indexOf('.plist');
        if( extIdx != -1)
        {
            var outFile = pathRoot + files[len-1].substr(0, extIdx) + ".json";
            var execute = spawn('./PlistToJSON', ['-i', pathRoot + files[len - 1], '-o', outFile]);
            execute.on('exit', function(code)
            {
                files.pop();
                // Now read the output
                fs.readFile(outFile, 'utf8', function(err, data)
                {
                    if(err)
                    {
                        throw "Could not read the cocos->json file";
                    }
                    var json = JSON.parse(data);
                    FormatCocosData(json);
                    json = FormatCocosInGoJSON(json); 
                    fs.writeFile(outFile, JSON.stringify(json), 'utf8', function(err)
                    {
                        if(err)
                        {
                            throw "Could not write the cocos->json file";
                        }
                        ConvertCocosPlistToGoJSON(pathRoot, files, callback);
                    });
                });
            });

            execute.stdout.on('data', function(data)
            {
                console.log("<ConvertCocosPlistToGoJSON>: " + data);
            });
        }
        else
        {
            files.pop();
            ConvertCocosPlistToGoJSON(pathRoot, files, callback);
        }
    }
    else
    {
        callback();        
    }
};


////////////////////////////////////////////////////////////////////////////////
/**
 * @method:         CreateGameSpriteAtlas 
 * @description:    
 * @return 
 */
var CreateGameSpriteAtlas = function(root, files, json, callback)
{
    var len = files.length;
    if(len > 0)
    {
        if(files[len-1].indexOf('.json') != -1)
        {
            var fileName = files[len-1];
            console.log("<CreateGameSpriteAtlas> Processing JSON file : " + fileName);
            fs.readFile(root + files[len - 1], 'utf8', function(err, data)
            {
                if(!err)
                {
                    // 1) Parse the JSON file
                    var animation = JSON.parse(data);
                     
                    // Lets go though all the frames
                    var name = (fileName.split("."))[0];
                    json[name] = animation;
                    files.pop(); 
                    CreateGameSpriteAtlas(root, files, json, callback);
                }
                else
                {
                    callback(json, "ERROR READING FILE");
                }
            });
        }
        else
        {
            files.pop();
            CreateGameSpriteAtlas(root, files, json, callback);
        }
    }
    else
    {
        callback(json);
    }
};

var ConvertMotionXMLtoJSON = function(root, files, callback)
{
    var len = files.length;
    if(len > 0)
    {
        var extIdx = files[len-1].indexOf('.xml');
        if(extIdx != -1)
        {
            var fileName = files[len-1];
            console.log("<ConvertMotionXMLtoJSON> Processing XML file : " + fileName);
            var outFile = files[len-1].substr(0, extIdx) + ".json";
            var execute = spawn('./MotionXMLToJSON', ['-i', root + files[len - 1], '-o', root + outFile]);

            execute.on('exit', function(code)
            {
                files.pop();
                ConvertMotionXMLtoJSON(root, files, callback);
            });

            execute.stdout.on('data', function(data)
            {
                console.log("<ConvertMotionXMLtoJSON>: " + data);
            });
        }
        else
        {
            files.pop();
            ConvertMotionXMLtoJSON(root, files, callback);
        }
    }
    else
    {
        callback();
    }
};

var CreateMotionSheet = function(root, files, json, callback)
{
    var len = files.length;
    if(len > 0)
    {
        var extIdx = files[len-1].indexOf('.json');
        if(extIdx != -1)
        {
            var fileName = files[len-1];
            fs.readFile(root + files[len - 1], 'utf8', function(err, data)
            {
                if(!err)
                {
                    var motionName = files[len-1].substr(0, extIdx);
                    var obj = JSON.parse(data);
                    json[motionName] = obj;
                }
                files.pop();
                CreateMotionSheet(root, files, json, callback);
            });
        }
        else
        {
            files.pop();
            CreateMotionSheet(root, files, json, callback);
        }
    }
    else
    {
        callback();
    }

};

////////////////////////////////////////////////////////////////////////////////
// Jake Tasks


task('generate_sprite_sheets', [], function(params)
{
    console.log("**** Gerenerting Sprite Sheets");
    // Setp 1) Create a list of tps files to run the command
    fs.readdir('./SpriteSheets', function(err, files)
    {
        if(err)
        {
            console.log("Fail to read the path" + "./SpriteSheets");
            complete();
        }
        else
        {
            GenSpriteSheets('./SpriteSheets/', files, function()
            {
                complete();
            });
        }
    });
}, true);

task('convert_cocos_sprite_sheets', [], function(params)
{
    console.log("**** Converting cocos sprite sheets to JSON");
    // Setp 1) Create a list of tps files to run the command
    fs.readdir('./SpriteSheets', function(err, files)
    {
        if(err)
        {
            console.log("Fail to read the path" + "./SpriteSheets");
            complete();
        }
        else
        {
            ConvertCocosPlistToGoJSON('./SpriteSheets/', files, function()
            {
                complete();
            });
        }
    });
}, true);

task('generate_sprite_sheets_json', [], function(params)
{
    console.log("**** Generating Game Sprite Sheet Data");
    // Setp 1) Create a list of tps files to run the command
    fs.readdir('./SpriteSheets', function(err, files)
    {
        if(err)
        {
            console.log("Fail to read the path" + "./SpriteSheets");
            complete();
        }
        else
        {
            var jsonOBJ = {};
            jsonOBJ.atlas = {};
            CreateGameSpriteAtlas('./SpriteSheets/', files, jsonOBJ.atlas, function(json, err)
            {
                // Lets write out the JSON file
                if(err)
                {
                    console.log(err);
                    complete();
                }
                else
                {
                    // write the JSON Obj to file
                    fs.writeFile("./SpriteSheets/spritedata.json", JSON.stringify(jsonOBJ), 'utf8', function(err)
                    {
                        if(err)
                        {
                            console.log("Writing to file error: " + "./SpriteSheets/spritedata.json");
                            console.log(err);
                        }
                        complete();
                    });
                }
            });
        }
    });
}, true);

task('convert_motion_xml_json', [], function(params)
{
    console.log("**** Converting Motion XML to JSON");
    // Setp 1) Create a list of tps files to run the command
    fs.readdir('./Motions', function(err, files)
    {
        if(err)
        {
            console.log("Fail to read the path" + "./SpriteSheets");
            complete();
        }
        else
        {
            ConvertMotionXMLtoJSON('./Motions/', files, function()
            {
                complete();
            });
        }
    });
}, true);

task('generate_motion_sheet_json', [], function(params)
{
    console.log("**** Creating Game Motion Sheet");
    // Setp 1) Create a list of tps files to run the command
    fs.readdir('./Motions', function(err, files)
    {
        if(err)
        {
            console.log("Fail to read the path" + "./Motions");
            complete();
        }
        else
        {
            var motionJSON = {};
            CreateMotionSheet('./Motions/', files, motionJSON, function()
            {
                // Lets write the motion data out
                fs.writeFile('./Motions/motiondata.json', JSON.stringify(motionJSON), 'utf8', function(err)
                {
                    if(err)
                    {
                        console.log("Failed to write the modtiondata.json file");
                    }
                    complete();
                });
            });
        }
    });
}, true);

task('merge_atlas_motion_json', [], function(params)
{
    console.log("**** Merging Sprite and Motion Data");
    // 1) Read the SpriteSheet Data
    fs.readFile('./SpriteSheets/spritedata.json', 'utf8', function(err, sdat)
    {
        var writeSprites = true;
        var sprites;
        // 2) Read the MotionSheet Data
        if(err)
        {
            writeSprites = false;
        }
        else
        {
            sprites = JSON.parse(sdat);
        }
        fs.readFile('./Motions/motiondata.json', 'utf8', function(err, mdata)
        {
            var mot; 
            var writeMotion = true;
            if(err)
            {
                writeMotion = false;
            }
            else
            {
                mot = JSON.parse(mdata);
            }

            // 3) merge the two objects
            var mergeObj = {};
            if(writeSprites)
            {
                mergeObj.atlas = sprites.atlas;
            }

            if(writeMotion)
            {
                mergeObj.motions = mot;
            }

            var rez = JSON.stringify(mergeObj);
            fs.writeFile("./animdata.json", rez, 'utf8', function(err)
            {
                complete();
            });
        });
    });

}, true);


task('move_sprite_sheets', [], function(params)
{
    console.log("**** Moving Animation Data");
    // Step 0) Copy the Sprite Definition over to the configs file
     var execute = spawn('mv', ['./animdata.json', '../Config/animdata.json']);
     execute.on('exit', function(code)
     {
        var child = exec('cp SpriteSheets/*.png ../Content/', function(error, stdout, stderr)
        {
            console.log('<move_sprite_sheets>: ' + stdout);
            complete();
        });
     });
}, true);

task('move_sprites', [], function(params)
{
    console.log("**** Moving Sprite Assets");
    // Step 0) Copy the Sprite Definition over to the configs file
    var child = exec('cp Sprites/*.png ../Content/', function(error, stdout, stderr)
    {
        console.log('<move_sprites>: ' + stdout);
        complete();
    });
}, true);

task('move_UI', [], function(params)
{
    console.log("**** Moving UI Assets");
    // Step 0) Copy the Sprite Definition over to the configs file
    var child = exec('cp UI/*.png ../Content/', function(error, stdout, stderr)
    {
            console.log('<move_UI>: done');
        complete();
    });
}, true);

task('move_music', [], function(params)
{
    console.log("**** Moving Music Assets");
    // Step 0) Copy the Sprite Definition over to the configs file
    var child = exec('cp Music/* ../Content/', function(error, stdout, stderr)
    {
            console.log('<move_music>: done');
        complete();
    });
}, true);

task('clean_generated_files', [], function(params)
{
    console.log("**** cleaning generated Assets");
    // Step 0) Copy the Sprite Definition over to the configs file
    var child = exec('rm Motions/motiondata.json', function(error, stdout, stderr)
    {
        child = exec('rm SpriteSheets/spritedata.json', function(error, stdout, stderr)
        {
            child = exec('rm animdata.json', function(error, stdout, stderr)
            {
                console.log('<clean_generated_files>: done');
                complete();
            });
        });
    });
}, true);




task('default', 
[
    'clean_generated_files',
    'generate_sprite_sheets', 
    'convert_cocos_sprite_sheets', 
    'generate_sprite_sheets_json', 
    'convert_motion_xml_json', 
    'generate_motion_sheet_json', 
    'merge_atlas_motion_json', 
    'move_sprite_sheets', 
    'move_sprites', 
    'move_UI',
    'move_music',
], function (params)
{
    console.log("Art Pipeline complete");    
});


