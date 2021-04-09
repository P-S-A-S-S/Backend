const net = require("net");
const server = net.createServer();
const port = 1232;
const host = "0.0.0.0";

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
    	console.log(`${clientAddress}: ${data}`);
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
	// gestiona la sortida de clients 
//	socket.on('close', (data) => { 
//		letindex = sockets.findIndex((o) => { 
//			o.remoteAddress === socket.remoteAddress && o.remotePort === socket.remotePort; 
//	    }) 
//		if (index !== -1) sockets.splice(index, 1); 
//			sockets.forEach((sock) => { 
//				sock.write(`${clientAddress} disconnected\n`); 
//	        }); 
//		console.log(`connection closed: ${clientAddress}`);
//	});
	// Gestor d'errors 
	socket.on("error", (err) => { 
		console.log(`Error occurred in ${clientAddress}: ${err.message}`); 
	}); 
});
