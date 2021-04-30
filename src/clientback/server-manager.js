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
	    	//si getdata == a GET
	    	console.log(`data: ${data}`)
	    	var getdata = String(data).split(" ", 2);
	    	console.log(`getdata: ${getdata}`)
	    	if (getdata[0] === "GET") {
				websocket.push(socket);
				//parsing command and enpoints
				var parsing = getdata[1].split("_._/")
				var cmdp = parsing[0].split("/command=")[1].split("%20")
				var endp = parsing[1].split("endp=")[1].split(",")
				var command = "";
				cmdp.forEach(str => {
					command += str + " ";
				});					
				command = String(command)
				console.log(endp)
				console.log(`comando a ejecutar: ${command} en los endpoints ${String(endp)}`)

				socket.write(
					'HTTP/1.0 200 OK\r\n' +
					'\r\n'
					    );
				socket.write("'Connection': 'close'");
				console.log("resposta http")
//				socket.end(); // HTTP 1.0 signals end of packet by closing the socket
	    	} else {
	    		const pData = JSON.parse(data)
	    		sockets.push(socket);
	    	   	if (pData.head.id === 0) { //identifica cliente con  id 0
		    		console.log("id 0, asignando uno nuevo")
			    	db.connect((err) =>{
			    		var jstring= {ip: socket.remoteAddress, status:{alive: true, lastconnection: new Date()}} 
			   			console.log(jstring)
			    		var cliColl = db.getColl(collections[0])
			   			var sJson = JSON.stringify(jstring)
			   			console.log("insertando")
			   			db.insertDocument(cliColl, jstring).then((doc) => {
			   				//print client ID
			   				console.log(doc.insertedId);
			   				socket.write(doc.insertedId);
			   				socket["id"]=doc.insertedId;
			   				console.log(socket["id"])

			   			});
		    		});
		    	}else { //cuando el cliente ya tiene id

		    	}
	    	};
	    });
		socket.on('close', (data) => {
			//extrae ip y puerto del array de sockets
	        const index = sockets.findIndex( (o) => { 
	            return (o.remoteAddress===socket.remoteAddress) && (o.remotePort === socket.remotePort); 
	        }); 
	        //extrae ip y puerto del array de websockets
//	        const windex = websocket.findeindex( (z) =>{
//	        	return z.remoteAddress === websocket.remoteAddress) && (z.remotePort === websocket.remotePort)
//	        })
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