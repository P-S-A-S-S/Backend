const net = require("net");
const fs = require ("fs");
<<<<<<< Updated upstream
const encrypt = require('./crypto/crypto');
const mongoCli = require ('mongodb').MongoClient;
=======
const mongoCli = require ("mongodb").MongoClient;
>>>>>>> Stashed changes
const url = 'mongodb://127.0.0.1:27017'; //url a mongo
const split = require ("split");
const http = require ("http");
function startSockets() {
	const server = net.createServer();
	const port = 1234;
	const host = "0.0.0.0";
	const tout = 3000; //ms para timeout
	//let secret = []; array secretos para cada cli(?)
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
<<<<<<< Updated upstream
	    	console.log(`${clientAddress}: ${data}`); //output mensaje cliente
	    	const pData = JSON.parse(data)
	    	const hash = encrypt.encrypt('Hello World!');
			console.log(hash);
	    	socket.write(`toma secret ${hash}`)
	    	console.log(pData); //strin a Json
	    	if (pData.id === 0) { //identifica cliente con  id 0
	    		console.log("id 0, asignando uno nuevo")
	    		mongoCli.connect(url, function(err, db) { //connecta mongo cli
	  				if (err) throw err;
	  				var dbo = db.db("data");
	  				//var myobj = {"id": 0, "so": "lin", "lIp": "10.5.0.6", "command": "x", "oPut": "testtesttesttest"}
	  				dbo.collection("clients").insertOne(pData, function(err, res) { //insert
	    				if (err) throw err;
	    				console.log("1 document inserted");
	    				db.close();
	  				});
				}); 
	    	};
//			mongoCli.connect(url, function(err, db) { //consulta
//				if (err) throw err;
//				var dbo = db.db("data");
//				dbo.collection("clients").find({}).toArray(function(err, result) {
//					if (err) throw err;
//					console.log(result);
//					db.close();
//		  		});
//			}); 
//	    	socket.write(``)
=======
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
		    		mongoCli.connect(url, function(err, db) { //connecta mongo cli
		  				if (err) throw err;
		  				var dbo = db.db("data");
		  				//var myobj = {"id": 0, "so": "lin", "lIp": "10.5.0.6", "command": "x", "oPut": "testtesttesttest"}
		  				dbo.collection("clients").insertOne(pData, function(err, res) { //insert
		    				if (err) throw err;
		    				console.log("1 document inserted");
		    				db.close();
		  				});
					}); 
		    	};
				mongoCli.connect(url, function(err, db) { //consulta
					if (err) throw err;
					var dbo = db.db("data");
					dbo.collection("clients").find({}).toArray(function(err, result) {
						if (err) throw err;
						console.log(result);
						db.close();
			  		});
				}); 
		    	socket.write(``);
			};
	    	
>>>>>>> Stashed changes
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
//var crypto = require("crypto");
//secret.push(crypto.randomBytes(20).toString('hex'));