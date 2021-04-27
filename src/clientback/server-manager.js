const net = require("net");
const fs = require ("fs");
// Importem les funcions getDB, getColl(collectionName), getDocuments(collectionName, filter), connect((err) => {...}) (connecta la base de dades), getPrimeryKey(_id) (retorna el ObjectID de _id)
// Per recollir els documents del obecte Promise retornat per getDocuments, cal passarli la funcio .then( (docs) => {...}));
const db = require('../database/config.js');
// Llistat amb els noms de les colleccions
const collections = ['client', 'comanda', 'user'];
const encrypt = require('./crypto/crypto');
const split = require ("split");
const http = require ("http");
function startSockets() {
	const server = net.createServer();
	const port = 1234;
	const host = "0.0.0.0";
	const tout = 3000; //ms para timeout
	let sockets = [];
	let websocket = [];
	server.listen(port, host, () => {
		console.log(`TCP server listening on ${host}:${port}`);
	});
	server.on("connection", (socket) => {
		var clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
		console.log(`new client connected: ${clientAddress}`);
		console.log(sockets.length);
		socket.on("data", (data) => {
	    	console.log(`${clientAddress}: ${data}`); //output mensaje cliente
	    	const pData = JSON.parse(data)
	    	console.log(pData.id); //strin a Json
	    	socket.write(`ok`)
	    	console.log(pData); //strin a Json
	    	if (pData.id === 0) { //identifica cliente con  id 0
	    		console.log("id 0, asignando uno nuevo")
	    	};	
	    	const hash = encrypt.encrypt('Hello World!');
			console.log(hash);
	    	socket.write(`toma secret ${hash}`)
			var getdata = String(data).split(" ", 2);
			console.log(getdata)
			if (getdata[0] === "GET") {
				websocket.push(socket);
				var precmd = String(getdata[1]).split("/command=", 2);
				var cmd = String(precmd[1]).split("%20");
				var rcmd = "";
				cmd.forEach(str => {
					rcmd += str + " ";
				});
				rcmd = String(rcmd)
				console.log(`comando a ejecutar: ${rcmd}`)
				socket.write(
					'HTTP/1.0 200 OK\r\n' +
					'\r\n'
					    );
				socket.write("'Connection': 'close'");
				socket.end(); // HTTP 1.0 signals end of packet by closing the socket
			} else {
				sockets.push(socket);
				console.log(`${clientAddress}: ${data}`); //output mensaje cliente
		    	const pData = JSON.parse(data)
		    	socket.write(`ok`)
		    	console.log(pData); //strin a Json
		    	if (pData.id === 0) { //identifica cliente con  id 0
		    		console.log("id 0, asignando uno nuevo")
		    	};
			};
	    });
		socket.on('close', (data) => {
	        const index = sockets.findIndex( (o) => { 
	            return (o.remoteAddress===socket.remoteAddress) && (o.remotePort === socket.remotePort); 
	        }); 
	        if (index !== -1) sockets.splice(index, 1); 
			sockets.forEach((sock) => { 
				sock.write(`${clientAddress} disconnected\n`); 
			}); 
			console.log(`connection closed: ${clientAddress}`); 
	    }); 
		// Gestor d'errors 
		socket.on("error", (err) => { 
			console.log(`Error occurred in ${clientAddress}: ${err.message}`); 
		}); 
	});
};
exports.startSockets = startSockets;
//secret.push(crypto.randomBytes(20).toString('hex'));