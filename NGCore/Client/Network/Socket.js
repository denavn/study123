////////////////////////////////////////////////////////////////////////////////
// Class Socket
//   Low-level (BSD-like) network API
//
// Copyright (C) 2012 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Class = require('../Core/Class').Class;
var Caps = require('../Core/Capabilities').Capabilities;

////////////////////////////////////////////////////////////////////////////////


exports.Socket = Class.subclass(
/** @lends Network.Socket.prototype */
{
	classname: 'Socket',
	
	/**
	 * @class The `Network.Socket` class enables applications to connect to a server using
	 * Transmission Control Protocol (TCP) or User Datagram Protocol (UDP) sockets, without the 
	 * additional overhead of an HTTP or HTTPS request. The current implementation is based on
	 * Internet Protocol version 4 (IPv4).
	 * 
	 * TCP is designed to ensure reliable, accurate delivery of messages, at the cost of increased
	 * latency when there is a problem sending or receiving data. Use TCP for network operations
	 * that depend on this increased accuracy. In contrast, UDP delivers messages as quickly as
	 * possible, with no error checking; messages may be dropped, arrive out of order, or contain
	 * errors. Use UDP for network operations that are more error-tolerant and depend upon low
	 * latency.
	 *
	 * Secure Sockets Layer (SSL) encryption is supported for TCP sockets. An encrypted TCP socket
	 * can connect to servers that use SSLv3 or Transport Layer Security (TLS) v1. SSLv2, which has
	 * been deprecated due to security issues, is not supported.
	 * 
	 * **Note**: `Network.Socket` is designed to support low-level network operations. Use the
	 * `{@link Network.DownloadFile}` and `{@link Network.XHR}` classes for HTTP/HTTPS requests.
	 *
	 * After creating the socket, your application should use the following methods to specify
	 * callback functions for the socket:
	 *
	 * + `{@link Network.Socket#setOnReadable}`: The function to call when there is data available
	 * to be read from the socket.
	 * + `{@link Network.Socket#setOnWritable}`: The function to call when the socket is ready to
	 * transmit data.
	 * + `{@link Network.Socket#setOnError}`: The function to call when an error occurs while
	 * transmitting data.
	 * 
	 * **Important**: Before your application creates a socket connection, it should verify that
	 * socket support is available by calling `{@link Core.Capabilities#getTcpAvailable}` (for TCP)
	 * or `{@link Core.Capabilities#getUdpAvailable}` (for UDP).
	 * @name Network.Socket
	 * @constructs Create a network socket.
	 * @augments Core.Class
	 * @example
	 * // Create a TCP socket without security (the default).
	 * var socket;
	 *
	 * if (Core.Capabilities.getTcpAvailable()) {
	 *     socket = new Network.Socket();
	 * } else {
	 *     // Use another network connection method, or report that the
	 *     // application is not supported on the current platform.
	 * }
	 * @example
	 * // If SSL is available, create a TCP socket with SSL security. Otherwise,
	 * // create a TCP socket without security.
	 * var security;
	 * var socket;
	 *
	 * if (Core.Capabilities.getTcpAvailable()) {
	 *     if (Core.Capabilities.getSslAvailable()) {
	 *         security = Network.Socket.Security.SecSSL;
	 *     } else {
	 *         security = Network.Socket.Security.SecNone;  
	 *     }
	 *     socket = new Network.Socket(Network.Socket.Protocol.TCP4, security);
	 * } else {
	 *     // Use another network connection method, or report that the
	 *     // application is not supported on the current platform.
	 * }
	 * @example
	 * // 1. Create a TCP socket, bind it to a local port selected by the device, 
	 * //    and connect it to a remote host at 10.16.10.200:9876.
	 * // 2. Write "Hello World!" to the socket.
	 * // 3. Log the remote host's response to the console, then close the socket.
	 * var tcpSocket;
	 * var readBuffer;
	 * var writeBuffer;
	 * var connected = false;
	 * var bytesRead;
	 * var server;
	 *
	 * if (Core.Capabilities.getTcpAvailable()) {
	 *     tcpSocket = new Network.Socket();
	 *     readBuffer = new Core.Buffer();
	 *     writeBuffer = new Core.Buffer();
	 *
	 *     tcpSocket.setOnWritable(function(socket) {
	 *         // Make sure we only send the message once.
	 *         if (!connected) {
	 *             connected = true;
	 *             writeBuffer.writeBytes("Hello World!");
	 *             socket.send(writeBuffer);
	 *         }
	 *     });
	 *
	 *     tcpSocket.setOnReadable(function(socket) {
	 *         bytesRead = socket.recv(readBuffer);
	 *         if (bytesRead !== 0) {
	 *             // We received data from the remote host.
	 *             // Read the data, then close the socket.
	 *             console.log("Received the following data from the socket: " + 
	 *               readBuffer.readBytes(readBuffer.getSize()));
	 *             socket.close();
	 *         }
	 *     });
	 *
	 *     tcpSocket.setOnError(function(err, socket) {
	 *         console.log("A socket error occurred: " + err.description);
	 *         // Take action based on the type of error.
	 *         switch(err.code) {
	 *             case Network.Socket.Error.NotConnected:
	 *                 // Add code to handle the error.
	 *                 break;
	 *             case Network.Socket.Error.ConnectionTimeout:
	 *                 // Add code to handle the error.
	 *                 break;
	 *             // Add code to handle other errors as needed.
	 *             default:
	 *                 // Add code to handle the error.
	 *                 break;
	 *         }
	 *     });
	 *
	 *     tcpSocket.bind(0, function(err, socket, port) {
	 *         if (err) {
	 *             console.log("Unable to bind the socket to a local port: " + 
	 *               err.description);
	 *             // Take action based on the type of error.
	 *             switch(err.code) {
	 *                 case Network.Socket.Error.AddrInUse:
	 *                     // Add code to handle the error.
	 *                     break;
	 *                 // Add code to handle other errors as needed.
	 *                 default:
	 *                     // Add code to handle the error.
	 *                     break;
	 *             }
	 *         } else {
	 *             server = {
	 *                 host: "10.16.10.200",
	 *                 port: 9876
	 *             };
	 *             socket.connect(server);
	 *         }
	 *     });
	 * } else {
	 *     // Use another network connection method, or report that the
	 *     // application is not supported on the current platform.
	 * }
	 * @param {Network.Socket.Protocol} [protocol=Network.Socket.Protocol.TCP4] The transport
	 *		protocol to use for the socket. **Note**: Call
	 *		`{@link Core.Capabilities#getTcpAvailable}` or
	 *		`{@link Core.Capabilities#getUdpAvailable}` to verify that the requested transport
	 *		protocol is supported.
	 * @param {Network.Socket.Security} [security=Network.Socket.Security.SecNone] The type of
	 *		security to use for the socket. **Note**: When using SSL, call
	 *		`{@link Core.Capabilities#getSslAvailable}` to verify that SSL is supported.
	 * @see Core.Buffer
	 * @see Core.Capabilities#getSslAvailable
	 * @see Core.Capabilities#getTcpAvailable
	 * @see Core.Capabilities#getUdpAvailable
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.6.5
	 */
	initialize: function(protocol, security)
	{
		this._protocol = (protocol === undefined)?this.Protocol.TCP4:protocol;
		this._security = (security === undefined)?this.Security.SecNone:security;
		this._isStream = (this._protocol != this.Protocol.UDP4);
		this._isServer = false;
		this._state = this.State.CLOSED;
		this._maxSndBufSize = 64*1024;
		this._curSndBufSize = this._maxSndBufSize;
		this._rcvBuf = '';
		this._rcvBufInfo = []; // each item has a form of { size:64, host:'10.1.1.2', port:5678 }
		this._EOS = false;
		this._localAddr = null;
		this._peerAddr = null;
		this._nextCbId = 0;
		this._pendingChildren = [];
		this._cb = {};
		this._onReadable = null;
		this._onWritable = null;
		this._onError = null;
		this._storeCb = function(cb) {
			var cbId = -1;
			if(cb) {
				cbId = this._nextCbId++;
				this._cb[cbId] = cb?cb:function(){};
			}
			return cbId;
		};
		this._restoreCb = function(cbId) {
			var cb = this._cb[cbId];
			delete this._cb[cbId];
			return cb;
		};
		if(this._parentId === undefined || this._childId === undefined) {
			this._parentId = -1;
			this._childId = -1;
		} else {
			this._state = this.State.READY;
			this._isServer = true;
		}

		Core.ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId, this._protocol, this._security, this._parentId, this._childId);
	},

// API

	/**
	 * Specify a value for one of the socket's configuration options. See
	 * `{@link Network.Socket#Option}` for details about the options that are supported.
	 * @example
	 * // Set the connection timeout to 10 seconds for the existing socket
	 * // 'tcpSocket'.
	 * tcpSocket.setOption(Network.Socket.Option.OpConnectionTimeout, 10000, 
	 *   function(err, soc) {
	 *     if (err) {
	 *         console.log("Unable to set the socket's connection timeout: " +
	 *           err.description);
	 *         // Take action based on the type of error.
	 *         switch(err.code) {
	 *             case Network.Socket.Error.Invalid:
	 *                 // Add code to handle the error.
	 *                 break;
	 *             // Add code to handle other errors as needed.
	 *             default:
	 *                 // Add code to handle the error.
	 *                 break;
	 *         }
	 *     } else {
	 *         // Continue using the socket object ('soc').
	 *     }
	 * });
	 * @param {Network.Socket#Option} op The configuration option to set.
	 * @param {Number} val The value to use for the configuration option.
	 * @cb {Function} cb The function to call after setting the configuration option.
	 * @cb-param {Object} err Information about the error, if any.
	 * @cb-param {Network.Socket#Error} [err.code] A code identifying the type of error.
	 * @cb-param {String} [err.description] A description of the error.
	 * @cb-param {Network.Socket} [soc] The socket whose configuration option was set.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see Network.Socket#getOption
	 * @see Network.Socket#Option
	 * @since 1.6.5
	 */
	setOption: function(op, val, cb)
	{
		var cbId = this._storeCb(cb);
		this._setOptionSendGen(op, val, '', cbId);
	},

	/**
	 * Retrieve the current value of one of the socket's configuration options. See
	 * `{@link Network.Socket#Option}` for details about the options that are supported.
	 * @example
	 * // Retrieve the connection timeout for the existing socket 'tcpSocket'.
	 * tcpSocket.getOption(Network.Socket.Option.OpConnectionTimeout,
	 *   function(err, soc, val) {
	 *     if (err) {
	 *         console.log("Unable to retrieve the socket's connection timeout: " +
	 *           err.description);
	 *         // Take action based on the type of error.
	 *         switch(err.code) {
	 *             case Network.Socket.Error.Invalid:
	 *                 // Add code to handle the error.
	 *                 break;
	 *             // Add code to handle other errors as needed.
	 *             default:
	 *                 // Add code to handle the error.
	 *                 break;
	 *         }
	 *     } else {
	 *         console.log("The current connection timeout is " + val);
	 *         // Continue using the socket object ('soc').
	 *     }
	 * });
	 * @param {Network.Socket#Option} op The configuration option to retrieve.
	 * @cb {Function} cb The function to call after retrieving the configuration option.
	 * @cb-param {Object} err Information about the error, if any.
	 * @cb-param {Network.Socket#Error} [err.code] A code identifying the type of error.
	 * @cb-param {String} [err.description] A description of the error.
	 * @cb-param {Network.Socket} [soc] The socket whose configuration option was retrieved.
	 * @cb-param {Number} val The value of the configuration option.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see Network.Socket#Option
	 * @see Network.Socket#setOption
	 * @since 1.6.5
	 */
	getOption: function(op, cb)
	{
		var cbId = this._storeCb(cb);
		this._getOptionSendGen(op, cbId);
	},

	/**
	 * Set the function to call when there is data available to be read from the socket.
	 * @example
	 * // For the existing socket 'tcpSocket', read data from the socket,
	 * // then write the data to the console.
	 * var readBuffer = new Core.Buffer();
	 *
	 * tcpSocket.setOnReadable(function(socket) {
	 *     var bytesRead = socket.recv(readBuffer);
	 *     if (bytesRead !== 0) {
	 *         // We received data from the remote host.
	 *         console.log("Received the following data from the socket: " + 
	 *           readBuffer.readBytes(readBuffer.getSize()));
	 *     }
	 * });
	 * @cb {Function} callback The function to call when there is data available to be read from the
	 *		socket.
	 * @cb-param {Network.Socket} [soc] The socket for which data is available.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see Core.Buffer
	 * @since 1.6.5
	 */
	setOnReadable: function(callback)
	{
		this._onReadable = callback;
	},

	/**
	 * Set the function to call when the socket is ready to transmit data. For TCP sockets, when
	 * this function is called for the first time, it indicates that the connection has been
	 * established.
	 * @example
	 * // If there is data available in the write buffer, write it to the 
	 * // existing socket 'tcpSocket'.
	 * var writeBuffer = new Core.Buffer();
	 * writeBuffer.writeBytes("Hello World!");
	 *
	 * tcpSocket.setOnWritable(function(socket) {
	 *     if (writeBuffer.getSize() > 0) {
	 *         tcpSocket.send(writeBuffer);
	 *     }
	 * });
	 * @cb {Function} callback The function to call when the socket is ready to transmit data.
	 * @cb-param {Network.Socket} [soc] The socket that is ready to transmit data.
	 * @cb-returns {void}
	 * @returns {void}
	 * @see Core.Buffer
	 * @since 1.6.5
	 */
	setOnWritable: function(callback)
	{
		this._onWritable = callback;
	},

	/**
	 * Set the function to call when an error occurs while transmitting data.
	 * @example
	 * // If the existing socket 'tcpSocket' experiences an error, log a message
	 * // to the console, then handle the error.
	 * tcpSocket.setOnError(function(err, socket) {
	 *     console.log("A socket error occurred: " + err.description);
	 *     // Take action based on the type of error.
	 *     switch(err.code) {
	 *         case Network.Socket.Error.NotConnected:
	 *             // Add code to handle the error.
	 *             break;
	 *         case Network.Socket.Error.ConnectionTimeout:
	 *             // Add code to handle the error.
	 *             break;
	 *         // Add code to handle other errors as needed.
	 *         default:
	 *             // Add code to handle the error.
	 *             break;
	 *     }
	 * });
	 * @cb {Function} callback The function to call when an error occurs while transmitting data.
	 * @cb-param {Object} err Information about the error.
	 * @cb-param {Network.Socket#Error} err.code A code identifying the type of error.
	 * @cb-param {String} err.description A description of the error.
	 * @cb-param {Network.Socket} [soc] The socket for which an error occurred.
	 * @cb-returns {void}
	 * @returns {void}
	 * @since 1.6.5
	 */
	setOnError: function(callback)
	{
		this._onError = callback;
	},

	/**
	 * Bind the socket to a local port.
	 * @example
	 * // Bind the existing socket 'tcpSocket' to a port number assigned by
	 * // the device. If an error occurs, log a message and handle the error.
	 * var port;
	 * tcpSocket.bind(0, function(err, soc, port) {
	 *     if (err) {
	 *         console.log("Unable to bind the socket to a local port: " + 
	 *           err.description);
	 *         // Take action based on the type of error.
	 *         switch(err.code) {
	 *             case Network.Socket.Error.AddrInUse:
	 *                 // Add code to handle the error.
	 *                 break;
	 *             // Add code to handle other errors as needed.
	 *             default:
	 *                 // Add code to handle the error.
	 *                 break;
	 *         }
	 *     } else {
	 *         // Connect the socket object ('soc') to a remote host.
	 *     }
	 * });
	 * @param {Number} port The local port number to bind to this socket. Use the value `0` to allow
	 *		the device to assign a port number.
	 * @cb {Function} [callback] The function to call after binding the socket to a port number.
	 * @cb-param {Object} err Information about the error, if any.
	 * @cb-param {Network.Socket#Error} [err.code] A code identifying the type of error.
	 * @cb-param {String} [err.description] A description of the error.
	 * @cb-param {Network.Socket} [soc] The socket that was bound to a local port.
	 * @cb-param {Number} [port] The local port number to which the socket was bound.
	 * @cb-returns {void}
	 * @returns {void}
	 * @since 1.6.5
	 */
	bind: function(port, callback)
	{
		if(this._state == this.State.CLOSED) {
			var cbId = this._storeCb(callback);
			this._bindSendGen(port, 0/*future-use*/, cbId);
		}
	},

	/**
	 * Add the socket as a member of a specified multicast group. Used only for UDP sockets.
	 * @example
	 * // Add the existing UDP socket 'udpSocket' to a multicast group, setting
	 * // the time-to-live for outgoing packets to 2. If an error occurs, log a
	 * // message and handle the error.
	 * var options = {
	 *     ttl: 2
	 * };
	 * udpSocket.addMembership("10.16.1.105", options, function(err, soc) {
	 *     if (err) {
	 *         console.log("Unable to add the socket to a multicast group: " + 
	 *           err.description);
	 *         // Take action based on the type of error.
	 *         switch(err.code) {
	 *             case Network.Socket.Error.NotConnected:
	 *                 // Add code to handle the error.
	 *                 break;
	 *             // Add code to handle other errors as needed.
	 *             default:
	 *                 // Add code to handle the error.
	 *                 break;
	 *         }
	 *     } else {
	 *         // Continue using the socket object ('soc').
	 *     }
	 * });
	 * @param {String} mcgrp The IP address of the multicast group.
	 * @param {Object} [options] Options for multicasting.
	 * @param {Boolean} [options.loop=false] Set to `true` to receive packets sent to the multicast
	 *		group.
	 * @param {Number} [options.ttl=1] The time-to-live (TTL) for outgoing packets, which controls
	 *		how many times the packet will be forwarded.
	 * @cb {Function} [callback] The function to call after adding the socket to the multicast
	 *		group.
	 * @cb-param {Object} err Information about the error, if any.
	 * @cb-param {Network.Socket#Error} [err.code] A code identifying the type of error.
	 * @cb-param {Number} [err.description] A description of the error.
	 * @cb-param {Network.Socket} [soc] The socket that was added to the multicast group.
	 * @cb-returns {void}
	 * @returns {void}
	 * @since 1.6.5
	 */
	addMembership: function(mcgrp, options, callback)
	{
		if(!this._isStream) {
			var flags = 0;
			var ttl = 1;
			if(typeof(options) == 'object') {
				if(options) {
					if(options['loop']) {
						flags |= this.MulticastFlag['loop'];
					}
					if(options['ttl']) {
						ttl = options['ttl'];
					}
				}
			} else {
				callback = options;
			}
			var cbId = this._storeCb(callback);
			this._addMembershipSendGen( mcgrp, flags, ttl, cbId );
		}
	},

	/**
	 * Remove the socket from a specified multicast group. Used only for UDP sockets.
	 * @example
	 * // Remove the existing UDP socket 'udpSocket' from a multicast group.
	 * // If an error occurs, log a message and handle the error.
	 * udpSocket.dropMembership("10.16.1.105", function(err, soc) {
	 *     if (err) {
	 *         console.log("Unable to remove the socket from a multicast group: " +
	 *           err.description);
	 *         // Take action based on the type of error.
	 *         switch(err.code) {
	 *             case Network.Socket.Error.NotConnected:
	 *                 // Add code to handle the error.
	 *                 break;
	 *             // Add code to handle other errors as needed.
	 *             default:
	 *                 // Add code to handle the error.
	 *                 break;
	 *         }
	 *     } else {
	 *         // Continue using the socket object ('soc').
	 *     }
	 * });
	 * @param {String} mcgrp The IP address of the multicast group.
	 * @cb {Function} [callback] The function to call after removing the socket from the multicast
	 *		group.
	 * @cb-param {Object} err Information about the error, if any.
	 * @cb-param {Network.Socket#Error} [err.code] A code identifying the type of error.
	 * @cb-param {Number} [err.description] A description of the error.
	 * @cb-param {Socket} [soc] The socket that was removed from the multicast group.
	 * @cb-returns {void}
	 * @returns {void}
	 * @since 1.6.5
	 */
	dropMembership: function(mcgrp, callback)
	{
		if(!this._isStream) {
			var cbId = this._storeCb(callback);
			this._dropMembershipSendGen( mcgrp, cbId );
		}
	},

	/**
	 * Connect the socket to a remote host. For TCP sockets, you must call this method before you
	 * transmit data through the socket. For UDP sockets, you can call this method to connect the
	 * socket to a remote host, or you can specify a remote host when you call
	 * `{@link Network.Socket#send}` or `{@link Network.Socket#recv}`.
	 * @example
	 * // Connect the existing socket 'tcpSocket' to a remote host at
	 * // 10.16.10.200:9876.
	 * var server = {
	 *     host: "10.16.10.200",
	 *     port: 9876
	 * };
	 * tcpSocket.connect(server);
	 * @param {Object} to Information about the remote host.
	 * @param {String} [to.cn] The remote host's fully qualified domain name (FQDN). If this 
	 *		parameter is included, and the socket is using SSL security, the FQDN will be used to
	 *		verify the common name (CN) used to generate the remote host's SSL certificate. If this
	 *		parameter is omitted, or if the socket is not using SSL, verification will be skipped.
	 *		Available since ngCore 1.7.
	 * @param {String} to.host The IP address of the remote host.
	 * @param {Number} to.port The port number of the remote host.
	 * @returns {void}
	 * @since 1.6.5
	 */
	connect: function(to)
	{
		if(this._isStream) {
			if(this._state == this.State.CLOSED) {
				this._state = this.State.CONNECTING;
				if(!to.cn) to.cn = '';
				this._connectSendGen(to.host, to.port, to.cn);
			}
		} else {
			if(this._state == this.State.CLOSED || this._state == this.State.READY) {
				if(!this._peerAddr) {
					this._state = this.State.CONNECTING;
				}
				this._connectSendGen(to.host, to.port, '');
			}
		}
	},

	/**
	 * @private
	 * Listen on a socket. (TCP only)
	 */
	listen: function()
	{
		if(this._state == this.State.CLOSED) {
			if(this._isStream) {
				var backlog = 8;
				this._state = this.State.LISTENING;
				this._listenSendGen(backlog);
			}
		}
	},

	/**
	 * @private
	 * Accept a new socket. (TCP listener only)
	 * @return Non-null Socket object is returned on success, or null on failure.
	 */
	accept: function()
	{
		var newSoc = null;
		if(this._isStream && this._state == this.State.LISTENING) {
			var child = this._pendingChildren.shift();
			if(child) {
				newSoc = new TcpServerSocket(this._protocol, this._security, child['parentId'], child['childId']);
				newSoc._peerAddr = { host:child['host'], port:child['port'] };
				newSoc._localAddr = this._localAddr;
			}
		}
		return newSoc;
	},

	/** @private */
	/*
	_dumpDigits: function(s) {
		var str = '';
		for(var i = 0; i < s.length; ++i) {
			var val = s.charCodeAt(i);
			var digit = val.toString(16);
			if(digit.length < 2) {
				digit = '0' + digit;
			}

			str += (digit + ' ');

			if((i % 8) == 7) {
				if((i % 32) == 31) {
					str += '\n';
				} else {
					str += ' ';
				}
			}
		}

		return str;
	},
	*/

	/**
	 * Send data from a buffer to a socket, removing the data from the buffer. Returns the number of
	 * characters that were written to the socket.
	 * @example
	 * // Create a new buffer that contains the string "Hello World", and send the
	 * // entire contents of the buffer using the existing TCP socket 'tcpSocket'.
	 * var writeBuffer = new Core.Buffer();
	 * writeBuffer.writeBytes("Hello World");
	 * var charsWritten = tcpSocket.send(writeBuffer);
	 * @example
	 * // Create a new buffer that contains 2,500 characters. Send the buffer's
	 * // contents in several messages that contain up to 1,000 characters each,
	 * // using the existing UDP socket 'udpSocket' and the remote host
	 * // 10.16.10.200:9876.
	 * var writeBuffer = new Core.Buffer(),
	 *     string = "";
	 * for (var i = 0; i < 2500; i++) {
	 *     string += "a";
	 * }
	 * writeBuffer.writeBytes(string);
	 *
	 * var server = {
	 *     host: "10.16.10.200",
	 *     port: 9876
	 * };
	 * var charsWritten;
	 *
	 * while (writeBuffer.getSize() > 0) {
	 *     charsWritten = udpSocket.send(writeBuffer, 1000, server);
	 *     console.log("Wrote " + charsWritten + " characters to the socket. " +
	 *       writeBuffer.getSize() + " characters left to write.");
	 * }
	 * @param {Core.Buffer} buf The buffer that contains data to be sent. The data that was written
	 *		to the socket will be removed from the buffer.
	 * @param {Number} [len=-1] The number of characters to send, or a negative number to send all 
	 *		data in the buffer. For UDP sockets, use a value less than `1400` to reduce
	 *		fragmentation at the IP layer; UDP packets larger than 2 KB will be discarded by the
	 *      receiver.
	 * @param {Object} [to] Information about the remote host. Required for UDP sockets; after the
	 *		UDP socket has connected to a remote host, the value of this parameter will be ignored.
	 *		Not used for TCP sockets.
	 * @param {String} [to.host] The IP address of the remote host.
	 * @param {Number} [to.port] The port number of the remote host.
	 * @returns {Number} The number of characters that were written to the socket.
	 * @see Core.Buffer
	 * @since 1.6.5
	 */
	send: function(buf, len, to) {
		if(this._isStream) {
			if(this._state != this.State.READY) {
				return this.Error.Invalid;
			}
		} else {
			if(this._state == this.State.CLOSED) {
				this._state = this.State.READY;
			} else {
				if(this._state != this.State.CONNECTING && this._state != this.State.READY) {
					return this.Error.Invalid;
				}
			}
		}
		if(len === undefined) {
			len = -1;
		} else {
			if(typeof(len) == 'object') {
				to = len;
				len = -1;
			}
		}
    if(len < 0 || len > buf.getSize()) {
			len = buf.getSize();
		}
		if(len > this._curSndBufSize) {
			if(!this._isStream) {
				return exports.Socket.Error.TryAgain;
			}
			len = this._curSndBufSize;
			if(!len) {
				return 0;
			}
		}
		var data = buf.readBytes(len);
		if(!to)
			to = {host:'',port:0};
		this._curSndBufSize -= data.length;
		this._sendSendGen(data, to.host, to.port);
		return data.length;
	},

	/**
	 * Read data from a socket and write it to a buffer. Returns the number of characters that were
	 * written to the buffer.
	 *
	 * If the method's return value is `0`, the remote server has closed the connection. Your
	 * application can call `{@link Network.Socket#close}` to close the socket.
	 * @example
	 * // Read all of the data from the existing TCP socket 'tcpSocket', and store 
	 * // the data in a new buffer.
	 * var readBuffer = new Core.Buffer();
	 * tcpSocket.recv(readBuffer);
	 * @example
	 * // Read all of the data from the existing UDP socket 'udpSocket', using 
	 * // the remote host 10.16.10.200:9876, and store the data in a new buffer.
	 * var readBuffer = new Core.Buffer();
	 * var server = {
	 *     host: "10.16.10.200",
	 *     port: 9876;
	 * };
	 * udpSocket.recv(readBuffer, server);
	 * @param {Core.Buffer} buf The buffer in which to write data. If the buffer already contains
	 *		data, the new data will be appended to the existing data.
	 * @param {Number} [len=-1] The number of bytes to read, or a negative number to read all
	 *		available data. Used only for TCP sockets.
	 * @param {Object} [from] Information about the remote host. Required for UDP sockets; after the
	 *		UDP socket has connected to a remote host, the value of this parameter will be ignored.
	 *		Not used for TCP sockets.
	 * @param {String} [from.host] The IP address of the remote host.
	 * @param {Number} [from.port] The port number of the remote host.
	 * @returns {Number} The number of characters that were written to the buffer.
	 * @see Core.Buffer
	 * @since 1.6.5
	 */
	recv: function(buf, len, from) {
		if(this._state != this.State.READY && this._state != this.State.CLOSING) {
			return this.Error.Invalid;
		}
		if(len === undefined) {
			len = -1;
		} else {
			if(typeof(len) == 'object') {
				from = len;
				len = -1;
			}
		}
		var orgSize = buf.getSize();
		if(this._isStream) {
			if(!this._rcvBuf.length) {
				return this._EOS? 0:exports.Socket.Error.TryAgain;
			}
			if(len < 0 || len >= this._rcvBuf.length) {
				buf.writeBytes(this._rcvBuf);
				this._rcvBuf = '';
			} else {
				buf.writeBytes(this._rcvBuf.slice(0, len));
				this._rcvBuf = this._rcvBuf.slice(len);
			}
			if(from) {
				from['host'] = this._peerAddr['host'];
				from['port'] = this._peerAddr['port'];
			}
		} else {
			if(!this._rcvBufInfo.length)
			{
				this._rcvBuf = ''; // for just in case.
				return exports.Socket.Error.TryAgain;
			}
			var info = this._rcvBufInfo.shift();
			len = info['size'];
			if(len > 0) {
				buf.writeBytes(this._rcvBuf.slice(0, len));
				this._rcvBuf = this._rcvBuf.slice(len);
			}
			if(from) {
				from['host'] = info['host'];
				from['port'] = info['port'];
			}
		}
		if(buf.getSize() > 0) {
			this._updateSendGen( this.UpdateId.U_SizeRcvd, buf.getSize(), '' );
		}
		return buf.getSize() - orgSize;
	},

	/**
	 * Initiate a graceful shutdown process for the socket. For TCP sockets, call this method prior
	 * to calling `{@link Network.Socket#close}`. Do not call this method on UDP sockets.
	 *
	 * If the shutdown process is successful, the following steps occur:
	 *
	 * 1. The remote server notifies the socket that it has closed the connection.
	 * 2. The socket executes the callback function defined by calling
	 * `{@link Network.Socket#setOnReadable}`. This callback function will normally include a call
	 * to the method `{@link Network.Socket#recv}`.
	 * 3. The `{@link Network.Socket#recv}` method returns the value `0`, indicating that the
	 * application can close the socket by calling `{@link Network.Socket#close}`.
	 * @deprecated Since ngCore 1.8. Because of device limitations, it is not possible to complete a
	 *		graceful shutdown on many devices. This method may be removed in a future version of
	 *		ngCore.
	 * @returns {void}
	 * @since 1.6.5
	 */
	shutdown: function() {
		if(this._state == this.State.READY) {
			this._state = this.State.CLOSING;
			this._shutdownSendGen(0/*not used*/);
		}
	},

	/**
	 * Close the socket. Do not reuse the `Network.Socket` object after calling this method.
	 *
	 * **Note**: Calling this method closes the socket immediately. If you need to close the
	 * connection more gracefully, add code to your app that notifies the remote server that the
	 * connection is closing, and add code to your server that acknowledges the notification. The
	 * app can then close the connection after it receives the acknowledgement.
	 * @returns {void}
	 * @since 1.6.5
	 */
	close: function() {
		this._closeSendGen();
		this._state = this.State.CLOSED;
		Core.ObjectRegistry.unregister(this);
	},

	/**
	 * Retrieve the socket's current state.
	 * @example
	 * // Retrieve the state of the existing TCP socket 'tcpSocket', and
	 * // take an action based on the current state.
	 * var state = tcpSocket.getState();
	 * switch (state) {
	 *     case Network.Socket.State.READY:
	 *         // Your code here.
	 *         break;
	 *     case Network.Socket.State.CLOSED:
	 *         // Your code here.
	 *         break;
	 *     // Continue through each enumerated value that you want to test.
	 *     default:
	 *         // Your code here.
	 *         break;
	 * }
	 * @returns {Network.Socket#State} The socket's current state.
	 * @since 1.6.5
	 */
	getState: function() {
		return this._state;
	},

	/**
	 * Retrieve the number of bytes that can be written to the socket's send buffer before it 
	 * reaches its maximum size.
	 * @returns {Number} The send buffer's writable size, in bytes.
	 * @since 1.6.5
	 */
	getSizeWritable: function() {
		return this._curSndBufSize;
	},

	/**
	 * Retrieve the number of bytes that are available to be read from the socket.
	 * @returns {Number} The size of the socket's available data, in bytes.
	 * @since 1.6.5
	 */
	getSizeReadable: function() {
		return this._rcvBuf.length;
	},

	/**
	 * Retrieve the address of the remote server for a TCP socket. The value `null` will be returned
	 * if the connection has not been established.
	 * @returns {Object} The remote server's address, or null if the socket is not yet active. The
	 *		"host" property contains the IP address, and the "port" property contains the port
	 *		number.
	 * @since 1.6.5
	 */
	getPeerAddr: function() {
		return this._peerAddr;
	},

	/**
	 * Retrieve the local address for the socket. For TCP sockets, the value `null` will be returned
	 * if the connection has not been established. For UDP sockets, the value `null` will be
	 * returned if no data has been received.
	 * @returns {Object} The local address, or null if the socket is not yet active. The "host"
	 *		property contains the IP address, and the "port" property contains the port number.
	 * @since 1.6.5
	 */
	getLocalAddr: function() {
		return this._localAddr;
	},

// Receivers

	_onSetOptionCbRecv: function( cmd )
	{
		var obj = {};
		if(this._onSetOptionCbRecvGen(cmd, obj)) {
			if(obj['cbId'] >= 0) {
				var cb = this._restoreCb(obj['cbId']);
				var err = obj['errCode']? { code:obj['errCode'], description:obj['errStr'] }:null;
				cb(err, this);
			}
		}
	},

	_onGetOptionCbRecv: function( cmd )
	{
		var obj = {};
		if(this._onGetOptionCbRecvGen(cmd, obj)) {
			if(obj['cbId'] >= 0) {
				var cb = this._restoreCb(obj['cbId']);
				var err = obj['errCode']? { code:obj['errCode'], description:obj['errStr'] }:null;
				cb(err, this, obj['numVal']);
			}
		}
	},

	_onBindCbRecv: function( cmd )
	{
		var obj = {};
		if(this._onBindCbRecvGen(cmd, obj)) {
			var notifyUdpWritable = false;
			if(!obj['errCode']) {
				this._localAddr = { host: obj['lhost'], port: obj['lport'] };
				if(!this._isStream && this._state == this.State.CLOSED) {
					this._state = this.State.READY;
					notifyUdpWritable = true;
				}
			}
			if(obj['cbId'] >= 0) {
				var cb = this._restoreCb(obj['cbId']);
				var err = obj['errCode']? { code:obj['errCode'], description:obj['errStr'] }:null;
				cb(err, this, obj['lport']);
			}
			if(notifyUdpWritable && this._state == this.State.READY /* checking if still in ready state */) {
				if(this._onWritable && this._curSndBufSize == this._maxSndBufSize ) {
						this._onWritable(this);
				}
			}
		}
	},

	/*
	 * @status Not tested yet
	 */
	_onConnectRecv: function( cmd )
	{
		if(this._state == this.State.CONNECTING) {
			this._state = this.State.READY;
			var obj = {};
			if(this._onConnectRecvGen(cmd, obj)) {
				// {String} obj['rhost'] Dotted-decimal IP address of peer's.
				// {Number} obj['rport'] Peer's port number.
				this._peerAddr = { host: obj['rhost'], port: obj['rport'] };
				if(this._onWritable && this._curSndBufSize == this._maxSndBufSize) {
					this._onWritable(this);
				}
			}
		}
	},

	/*
	 * @status Not tested yet
	 */
	_onAcceptRecv: function( cmd )
	{
		var obj = {};
		if(this._onAcceptRecvGen(cmd, obj)) {
			// {String} obj['rhost'] Dotted-decimal IP address of peer's.
			// {Number} obj['rport'] Peer's port number.
			// {Number} obj['parentId'] Parent socket ID.
			// {Number} obj['childId'] Child socket ID.
			this._pendingChildren.push({
				host: obj['rhost'],
				port: obj['rport'],
				parentId: obj['parentId'],
				childId: obj['childId']
			});
			if(this._onReadable) {
				this._onReadable(this);
			}
		}
	},

	/*
	 * @status Not tested yet
	 */
	_onReceiveRecv: function( cmd )
	{
		var obj = {};
		if(this._onReceiveRecvGen(cmd, obj)) {
			// {String} obj['buf'] Received data.
			// {String} obj['rhost'] Dotted-decimal IP address of peer's.
			// {Number} obj['rport'] Peer's port number.
			var rlen = obj['buf'].length;
			if(rlen > 0) {
				this._rcvBuf += obj['buf'];
			}
			if(this._isStream) {
				if(!rlen) {
					this._EOS = true;
				}
			} else {
				this._rcvBufInfo.push({ size:rlen, host:obj['rhost'], port:obj['rport'] });
			}
			if(this._onReadable) {
				this._onReadable(this);
			}
		}
	},

	/*
	 * @status Not tested yet
	 */
	_onErrorRecv: function( cmd )
	{
		var obj = {};
		if(this._onErrorRecvGen(cmd, obj)) {
			var err = obj['errCode']? { code:obj['errCode'], description:obj['errStr'] }:null;
			if(this._onError && err) {
				this._onError(err, this);
			}
		}
	},

	_onUpdateRecv: function( cmd )
	{
		var obj = {};
		if(this._onUpdateRecvGen(cmd, obj)) {
			// {Number} obj[ "updateId" ]
			// {Number} obj[ "val" ]
			// {String} obj[ "optional" ]
			switch(obj['updateId']) {
				case this.UpdateId.U_SizeSent:
					this._curSndBufSize += obj['val'];
					if(this._onWritable && this._curSndBufSize == this._maxSndBufSize) {
						if(this._state == this.State.READY) {
							this._onWritable(this);
						}
					}
					break;
				default:
					NgLogE('Unknown OnUpdate ID ' + obj['updateId']);
					break;
			}
		}
	},
	

	_onMembershipCbRecv: function( cmd )
	{
		var obj = {};
		if(this._onMembershipCbRecvGen(cmd, obj)) {
			if(obj['cbId'] >= 0) {
				var cb = this._restoreCb(obj['cbId']);
				var err = obj['errCode']? { code:obj['errCode'], description:obj['errStr'] }:null;
				cb(err, this);
			}
		}
	},


	/**
	 * Enumeration for transport protocols that a socket can use.
	 * @name Protocol
	 * @fieldOf Network.Socket#
	 */
	/**
	 * User Datagram Protocol (UDP) over Internet Protocol version 4 (IPv4).
	 * @name Protocol.UDP4
	 * @fieldOf Network.Socket#
	 * @constant
	 */
	/**
	 * Transmission Control Protocol (TCP) over Internet Protocol version 4 (IPv4).
	 * @name Protocol.TCP4
	 * @fieldOf Network.Socket#
	 * @constant
	 */

	/**
	 * Enumeration for types of security that a socket can use.
	 * @name Security
	 * @fieldOf Network.Socket#
	 */
	/**
	 * No security.
	 * @name Security.SecNone
	 * @fieldOf Network.Socket#
	 * @constant
	 */
	/**
	 * Secure Sockets Layer (SSL) security, using SSLv3 or TLSv1. Available only for TCP sockets.
	 * @name Security.SecSSL
	 * @fieldOf Network.Socket#
	 * @constant
	 */

	/**
	 * Enumeration for socket states.
	 * @name State
	 * @fieldOf Network.Socket#
	 */
	/**
	 * The socket is closed.
	 * @name State.CLOSED
	 * @fieldOf Network.Socket#
	 * @constant
	 */
	/**
	 * The socket is connecting to a remote host.
	 * @name State.CONNECTING
	 * @fieldOf Network.Socket#
	 * @constant
	 */
	/**
	 * The socket is listening for connections. Used only for TCP sockets.
	 * @name State.LISTENING
	 * @fieldOf Network.Socket#
	 * @private
	 * @constant
	 */
	/**
	 * The socket is connected and is ready for reading and writing.
	 * @name State.READY
	 * @fieldOf Network.Socket#
	 * @constant
	 */
	/**
	 * The socket is closing. Used only for TCP sockets.
	 * @name State.CLOSING
	 * @fieldOf Network.Socket#
	 * @constant
	 */

	/**
	 * Enumeration for the names of configuration options for the socket.
	 *
	 * **Note**: Do not change the enumerated values themselves. To change an option's value, call
	 * `{@link Network.Socket#setOption}`, and use the `op` parameter to specify which option to
	 * change. To retrieve an option's value, call `{@link Network.Socket#getOption}`, and use the
	 * `op` parameter to specify which option to retrieve.
	 * @name Option
	 * @fieldOf Network.Socket#
	 */
	/**
	 * The size of the socket's send buffer. The default size is 65,536 bytes.
	 * @name Option.OpSendBufSize
	 * @fieldOf Network.Socket#
	 * @constant
	 */
	/**
	 * The size of the socket's receive buffer. The default size is 65,536 bytes.
	 * @name Option.OpRecvBufSize
	 * @fieldOf Network.Socket#
	 * @constant
	 */
	/**
	 * Indicates whether to send outgoing messages immediately rather than combining small messages
	 * into a single packet. Accepts the values `0`, to disable the option, or `1`, to enable the
	 * option. This option is enabled by default.
	 * @name Option.OpNoDelay
	 * @fieldOf Network.Socket#
	 * @constant
	 */
	/**
	 * The timeout value, in milliseconds, for establishing a connection. The default timeout is
	 * 30,000 milliseconds (30 seconds).
	 * @name Option.OpConnectionTimeout
	 * @fieldOf Network.Socket#
	 * @constant
	 */
	/**
	 * The timeout value, in milliseconds, for shutting down a connection. Used only for TCP
	 * sockets. The default timeout is 10,000 milliseconds (10 seconds).
	 * @name Option.OpShutdownTimeout
	 * @fieldOf Network.Socket#
	 * @constant
	 */
	/**
	 * Indicates whether other sockets will be allowed to bind to the same port as this socket,
	 * provided that this socket is not active. Accepts the values `0`, to disable the option, or
	 * `1`, to enable the option. This option is disabled by default.
	 * @name Option.OpReuseAddr
	 * @fieldOf Network.Socket#
	 * @constant
	 */

	/**
	 * Enumeration for types of socket errors.
	 * @name Error
	 * @fieldOf Network.Socket#
	 */
	/**
	 * An unknown error occurred.
	 * @name Error.Unknown
	 * @fieldOf Network.Socket#
	 * @constant
	 */
	/**
	 * The requested operation is invalid, or an invalid parameter was specified.
	 * @name Error.Invalid
	 * @fieldOf Network.Socket#
	 * @constant
	 */
	/**
	 * The requested operation is not supported.
	 * @name Error.NotSupported
	 * @fieldOf Network.Socket#
	 * @constant
	 */
	/**
	 * The socket is not currently available for the requested operation.
	 * @name Error.TryAgain
	 * @fieldOf Network.Socket#
	 * @constant
	 */
	/**
	 * The requested address for the socket is already in use.
	 * @name Error.AddrInUse
	 * @fieldOf Network.Socket#
	 * @constant
	 */
	/**
	 * The device does not have enough memory available for the requested operation.
	 * @name Error.NoMemory
	 * @fieldOf Network.Socket#
	 * @constant
	 */
	/**
	 * The socket is not connected.
	 * @name Error.NotConnected
	 * @fieldOf Network.Socket#
	 * @constant
	 */
	/**
	 * The connection timed out.
	 * @name Error.ConnectionTimeout
	 * @fieldOf Network.Socket#
	 * @constant
	 */
	/**
	 * The attempt to shut down the socket timed out. Used only for TCP sockets.
	 * @name Error.ShutdownTimeout
	 * @fieldOf Network.Socket#
	 * @constant
	 */
	/**
	 * The SSL handshake failed.
	 * @name Error.SSLError
	 * @fieldOf Network.Socket#
	 * @constant
	 */
	/**
	 * The remote host is unreachable.
	 * @name Error.Unreachable
	 * @fieldOf Network.Socket#
	 * @constant
	 */

// {{?Wg Generated Code}}
	
	// Enums.
	Protocol:
	{ 
		UDP4: 0,
		TCP4: 1
	},
	
	Security:
	{ 
		SecNone: 0,
		SecSSL: 1
	},
	
	State:
	{ 
		CLOSED: 0,
		CONNECTING: 1,
		LISTENING: 2,
		READY: 3,
		CLOSING: 4
	},
	
	Option:
	{ 
		OpSendBufSize: 0,
		OpRecvBufSize: 1,
		OpNoDelay: 2,
		OpConnectionTimeout: 3,
		OpShutdownTimeout: 4,
		OpReuseAddr: 5
	},
	
	Error:
	{ 
		Unknown: -1,
		Invalid: -2,
		NotSupported: -3,
		TryAgain: -4,
		AddrInUse: -5,
		NoMemory: -6,
		NotConnected: -7,
		ConnectionTimeout: -8,
		ShutdownTimeout: -9,
		SSLError: -10,
		Unreachable: -11,
		ConnectionRefused: -12
	},
	
	/** @private Enumeration for multicast flags. */
	MulticastFlag:
	{ 
		McLoop: 0x00000001
	},
	
	/** @private Enumeration for update ID. */
	UpdateId:
	{ 
		U_NOP: 0,
		U_SizeSent: 1,
		U_SizeRcvd: 1
	},
	
	///////
	// Class constants (for internal use only):
	_classId: 360,
	// Method create = -1
	// Method setOption = 2
	// Method getOption = 3
	// Method bind = 4
	// Method connect = 5
	// Method listen = 6
	// Method send = 7
	// Method shutdown = 8
	// Method close = 9
	// Method addMembership = 10
	// Method dropMembership = 11
	// Method update = 12
	// Method onSetOptionCb = 13
	// Method onGetOptionCb = 14
	// Method onBindCb = 15
	// Method onConnect = 16
	// Method onAccept = 17
	// Method onReceive = 18
	// Method onError = 19
	// Method onUpdate = 20
	// Method onMembershipCb = 21
	
	/** 
	 * Command dispatch.
	 * @private
	 */
	$_commandRecvGen: (function() { var h = (function ( cmd )
	{
		var cmdId = Core.Proc.parseInt( cmd.shift(), 10 );
		
		if( cmdId > 0 )	// Instance Method.
		{
			var instanceId = Core.Proc.parseInt( cmd.shift(), 10 );
			var instance = Core.ObjectRegistry.idToObject( instanceId );
			
			if( ! instance )
			{
				NgLogE("Object instance could not be found for command " + cmd + ". It may have been destroyed this frame.");
				return;
			}
			
			switch( cmdId )
			{
				
				case 13:
					instance._onSetOptionCbRecv( cmd );
					break;
				case 14:
					instance._onGetOptionCbRecv( cmd );
					break;
				case 15:
					instance._onBindCbRecv( cmd );
					break;
				case 16:
					instance._onConnectRecv( cmd );
					break;
				case 17:
					instance._onAcceptRecv( cmd );
					break;
				case 18:
					instance._onReceiveRecv( cmd );
					break;
				case 19:
					instance._onErrorRecv( cmd );
					break;
				case 20:
					instance._onUpdateRecv( cmd );
					break;
				case 21:
					instance._onMembershipCbRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in Socket._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in Socket._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[360] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_onSetOptionCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 4 )
		{
			NgLogE("Could not parse due to wrong argument count in Socket.onSetOptionCb from command: " + cmd );
			return false;
		}
		
		obj[ "opId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "opId" ] === undefined )
		{
			NgLogE("Could not parse opId in Socket.onSetOptionCb from command: " + cmd );
			return false;
		}
		
		obj[ "cbId" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "cbId" ] === undefined )
		{
			NgLogE("Could not parse cbId in Socket.onSetOptionCb from command: " + cmd );
			return false;
		}
		
		obj[ "errCode" ] = Core.Proc.parseInt( cmd[ 2 ] );
		if( obj[ "errCode" ] === undefined )
		{
			NgLogE("Could not parse errCode in Socket.onSetOptionCb from command: " + cmd );
			return false;
		}
		
		obj[ "errStr" ] = Core.Proc.parseString( cmd[ 3 ] );
		if( obj[ "errStr" ] === undefined )
		{
			NgLogE("Could not parse errStr in Socket.onSetOptionCb from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_onGetOptionCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 6 )
		{
			NgLogE("Could not parse due to wrong argument count in Socket.onGetOptionCb from command: " + cmd );
			return false;
		}
		
		obj[ "opId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "opId" ] === undefined )
		{
			NgLogE("Could not parse opId in Socket.onGetOptionCb from command: " + cmd );
			return false;
		}
		
		obj[ "numVal" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "numVal" ] === undefined )
		{
			NgLogE("Could not parse numVal in Socket.onGetOptionCb from command: " + cmd );
			return false;
		}
		
		obj[ "strVal" ] = Core.Proc.parseString( cmd[ 2 ] );
		if( obj[ "strVal" ] === undefined )
		{
			NgLogE("Could not parse strVal in Socket.onGetOptionCb from command: " + cmd );
			return false;
		}
		
		obj[ "cbId" ] = Core.Proc.parseInt( cmd[ 3 ] );
		if( obj[ "cbId" ] === undefined )
		{
			NgLogE("Could not parse cbId in Socket.onGetOptionCb from command: " + cmd );
			return false;
		}
		
		obj[ "errCode" ] = Core.Proc.parseInt( cmd[ 4 ] );
		if( obj[ "errCode" ] === undefined )
		{
			NgLogE("Could not parse errCode in Socket.onGetOptionCb from command: " + cmd );
			return false;
		}
		
		obj[ "errStr" ] = Core.Proc.parseString( cmd[ 5 ] );
		if( obj[ "errStr" ] === undefined )
		{
			NgLogE("Could not parse errStr in Socket.onGetOptionCb from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_onBindCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 5 )
		{
			NgLogE("Could not parse due to wrong argument count in Socket.onBindCb from command: " + cmd );
			return false;
		}
		
		obj[ "lhost" ] = Core.Proc.parseString( cmd[ 0 ] );
		if( obj[ "lhost" ] === undefined )
		{
			NgLogE("Could not parse lhost in Socket.onBindCb from command: " + cmd );
			return false;
		}
		
		obj[ "lport" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "lport" ] === undefined )
		{
			NgLogE("Could not parse lport in Socket.onBindCb from command: " + cmd );
			return false;
		}
		
		obj[ "cbId" ] = Core.Proc.parseInt( cmd[ 2 ] );
		if( obj[ "cbId" ] === undefined )
		{
			NgLogE("Could not parse cbId in Socket.onBindCb from command: " + cmd );
			return false;
		}
		
		obj[ "errCode" ] = Core.Proc.parseInt( cmd[ 3 ] );
		if( obj[ "errCode" ] === undefined )
		{
			NgLogE("Could not parse errCode in Socket.onBindCb from command: " + cmd );
			return false;
		}
		
		obj[ "errStr" ] = Core.Proc.parseString( cmd[ 4 ] );
		if( obj[ "errStr" ] === undefined )
		{
			NgLogE("Could not parse errStr in Socket.onBindCb from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_onConnectRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in Socket.onConnect from command: " + cmd );
			return false;
		}
		
		obj[ "rhost" ] = Core.Proc.parseString( cmd[ 0 ] );
		if( obj[ "rhost" ] === undefined )
		{
			NgLogE("Could not parse rhost in Socket.onConnect from command: " + cmd );
			return false;
		}
		
		obj[ "rport" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "rport" ] === undefined )
		{
			NgLogE("Could not parse rport in Socket.onConnect from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_onAcceptRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 4 )
		{
			NgLogE("Could not parse due to wrong argument count in Socket.onAccept from command: " + cmd );
			return false;
		}
		
		obj[ "rhost" ] = Core.Proc.parseString( cmd[ 0 ] );
		if( obj[ "rhost" ] === undefined )
		{
			NgLogE("Could not parse rhost in Socket.onAccept from command: " + cmd );
			return false;
		}
		
		obj[ "rport" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "rport" ] === undefined )
		{
			NgLogE("Could not parse rport in Socket.onAccept from command: " + cmd );
			return false;
		}
		
		obj[ "parentId" ] = Core.Proc.parseInt( cmd[ 2 ] );
		if( obj[ "parentId" ] === undefined )
		{
			NgLogE("Could not parse parentId in Socket.onAccept from command: " + cmd );
			return false;
		}
		
		obj[ "childId" ] = Core.Proc.parseInt( cmd[ 3 ] );
		if( obj[ "childId" ] === undefined )
		{
			NgLogE("Could not parse childId in Socket.onAccept from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_onReceiveRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 3 )
		{
			NgLogE("Could not parse due to wrong argument count in Socket.onReceive from command: " + cmd );
			return false;
		}
		
		obj[ "buf" ] = Core.Proc.parseBinary( cmd[ 0 ] );
		if( obj[ "buf" ] === undefined )
		{
			NgLogE("Could not parse buf in Socket.onReceive from command: " + cmd );
			return false;
		}
		
		obj[ "rhost" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "rhost" ] === undefined )
		{
			NgLogE("Could not parse rhost in Socket.onReceive from command: " + cmd );
			return false;
		}
		
		obj[ "rport" ] = Core.Proc.parseInt( cmd[ 2 ] );
		if( obj[ "rport" ] === undefined )
		{
			NgLogE("Could not parse rport in Socket.onReceive from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_onErrorRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in Socket.onError from command: " + cmd );
			return false;
		}
		
		obj[ "errCode" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "errCode" ] === undefined )
		{
			NgLogE("Could not parse errCode in Socket.onError from command: " + cmd );
			return false;
		}
		
		obj[ "errStr" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "errStr" ] === undefined )
		{
			NgLogE("Could not parse errStr in Socket.onError from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_onUpdateRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 3 )
		{
			NgLogE("Could not parse due to wrong argument count in Socket.onUpdate from command: " + cmd );
			return false;
		}
		
		obj[ "updateId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "updateId" ] === undefined )
		{
			NgLogE("Could not parse updateId in Socket.onUpdate from command: " + cmd );
			return false;
		}
		
		obj[ "val" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "val" ] === undefined )
		{
			NgLogE("Could not parse val in Socket.onUpdate from command: " + cmd );
			return false;
		}
		
		obj[ "optional" ] = Core.Proc.parseString( cmd[ 2 ] );
		if( obj[ "optional" ] === undefined )
		{
			NgLogE("Could not parse optional in Socket.onUpdate from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_onMembershipCbRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 3 )
		{
			NgLogE("Could not parse due to wrong argument count in Socket.onMembershipCb from command: " + cmd );
			return false;
		}
		
		obj[ "cbId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "cbId" ] === undefined )
		{
			NgLogE("Could not parse cbId in Socket.onMembershipCb from command: " + cmd );
			return false;
		}
		
		obj[ "errCode" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "errCode" ] === undefined )
		{
			NgLogE("Could not parse errCode in Socket.onMembershipCb from command: " + cmd );
			return false;
		}
		
		obj[ "errStr" ] = Core.Proc.parseString( cmd[ 2 ] );
		if( obj[ "errStr" ] === undefined )
		{
			NgLogE("Could not parse errStr in Socket.onMembershipCb from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId, proto, sec, parentId, childId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x168ffff, [ +__objectRegistryId, +proto, +sec, +parentId, +childId ] );
	},
	
	/** @private */
	_setOptionSendGen: function( opId, numVal, strVal, cbId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1680002, this, [ +opId, +numVal, Core.Proc.encodeString( strVal ), +cbId ] );
	},
	
	/** @private */
	_getOptionSendGen: function( opId, cbId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1680003, this, [ +opId, +cbId ] );
	},
	
	/** @private */
	_bindSendGen: function( lport, flags, cbId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1680004, this, [ +lport, +flags, +cbId ] );
	},
	
	/** @private */
	_connectSendGen: function( rhost, rport, cn )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1680005, this, [ Core.Proc.encodeString( rhost ), +rport, Core.Proc.encodeString( cn ) ] );
	},
	
	/** @private */
	_listenSendGen: function( backlog )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1680006, this, [ +backlog ] );
	},
	
	/** @private */
	_sendSendGen: function( buf, rhost, rport )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1680007, this, [ Core.Proc.encodeBinary( buf ), Core.Proc.encodeString( rhost ), +rport ] );
	},
	
	/** @private */
	_shutdownSendGen: function( how )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1680008, this, [ +how ] );
	},
	
	/** @private */
	_closeSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x1680009, this );
	},
	
	/** @private */
	_addMembershipSendGen: function( mcgrp, flags, ttl, cbId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x168000a, this, [ Core.Proc.encodeString( mcgrp ), +flags, +ttl, +cbId ] );
	},
	
	/** @private */
	_dropMembershipSendGen: function( mcgrp, cbId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x168000b, this, [ Core.Proc.encodeString( mcgrp ), +cbId ] );
	},
	
	/** @private */
	_updateSendGen: function( updateId, val, optional )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x168000c, this, [ +updateId, +val, Core.Proc.encodeString( optional ) ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId, proto, sec, parentId, childId ) {}
	
	// setOption: function( opId, numVal, strVal, cbId ) {}
	
	// getOption: function( opId, cbId ) {}
	
	// bind: function( lport, flags, cbId ) {}
	
	// connect: function( rhost, rport, cn ) {}
	
	// listen: function( backlog ) {}
	
	// send: function( buf, rhost, rport ) {}
	
	// shutdown: function( how ) {}
	
	// close: function(  ) {}
	
	// addMembership: function( mcgrp, flags, ttl, cbId ) {}
	
	// dropMembership: function( mcgrp, cbId ) {}
	
	// update: function( updateId, val, optional ) {}
	
	// _onSetOptionCbRecv: function( cmd ) {}
	// _onGetOptionCbRecv: function( cmd ) {}
	// _onBindCbRecv: function( cmd ) {}
	// _onConnectRecv: function( cmd ) {}
	// _onAcceptRecv: function( cmd ) {}
	// _onReceiveRecv: function( cmd ) {}
	// _onErrorRecv: function( cmd ) {}
	// _onUpdateRecv: function( cmd ) {}
	// _onMembershipCbRecv: function( cmd ) {}
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});

TcpServerSocket = exports.Socket.subclass(
{
	classname: 'TcpServerSocket',
	initialize: function($super, protocol, security, parentId, childId)
	{
		this._parentId = parentId;
		this._childId = parentId;
		$super(protocol, security);
	}
});

// vim: ts=2:sw=2:noexpandtab:
