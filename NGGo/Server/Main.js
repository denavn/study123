//////////////////////////////////////////////////////////////////////////////
/** 
 *  @date:      2011-02-27
 *  @file:      Main.js
 *  @author:    Chris Jimison
 *  Website:    http://www.notriggedgames.com
 *  Copyright:  2010, by Not Rigged Games LLC
 *              Unauthorized redistribution of source code is 
 *              strictly prohibited. Violators will be prosecuted.
 * 
 *  @brief:     The main server that will spin up other servers.  For now
 *              this game will spin up 2 servers.  The 'Game Server' and the
 *              tools server.  The tools server will handle are request
 *              for writing out data the game server uses.  This server will
 *              also act as a server monitor and if one server goes down it
 *              logs that fact and spins up a new instance of the serve
 */
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// Require block
var WebServer = require('../NodeLibs/WebServer');

//////////////////////////////////////////////////////////////////////////////
// Main Code block

// 1) Start up the game servers
WebServer.StartServer(3001);


