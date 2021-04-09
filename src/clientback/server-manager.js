const net = require("net");
const fs = require ("fs");


function startSockets() {
	const server = net.createServer();
	const port = 1234;
	const host = "0.0.0.0";
	const tout = 3000 //ms para timeout
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
	    	console.log(JSON.stringify(`${data}`)); //strin a Json
		});
		//Timeout
		socket.setTimeout(tout);
		socket.on('timeout', () => {
	  		console.log('socket timeout');
			socket.end();
		});
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