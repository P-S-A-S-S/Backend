const net = require("net");
const fs = require ("fs");
const mongoCli = require ('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/' //url a mongo

function startSockets() {
	const server = net.createServer();
	const port = 1234;
	const host = "0.0.0.0";
	const tout = 3000 //ms para timeout
	//let secret = []; array secretos para cada cli(?)
	let sockets = [];



	server.listen(port, host, () => {
		console.log(`TCP server listening on ${host}:${port}`);
	});

	server.on("connection", (socket) => {
		var clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
		console.log(`new client connected: ${clientAddress}`);
		sockets.push(socket);
		console.log(sockets.length);
		socket.on("data", (data) => {
	    	console.log(`${clientAddress}: ${data}`); //output mensaje cliente
	    	const pData = JSON.parse(data)
	    	console.log(pData.id); //strin a Json
	    	mongoCli.connect(url, function(err, db) {
	  			if (err) throw err;
	  			var dbo = db.db("data");
	  			var myobj = {"id": 0, "so": "lin", "lIp": "192.168.207.222", "command": "x", "oPut": "testtesttesttest"}
	  			dbo.collection("clients").insertOne(myobj, function(err, res) {
	    			if (err) throw err;
	    			console.log("1 document inserted");
	    			db.close();
	  			});
			}); 
	    });
		//Timeout
		//socket.setTimeout(tout);
		//socket.on('timeout', () => {
	  	//	console.log('socket timeout');
		//	socket.end();
		//});
		//salida
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
//var crypto = require("crypto");
//secret.push(crypto.randomBytes(20).toString('hex'));