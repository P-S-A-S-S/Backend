var net = require('net');
var server = net.createServer(function(socket) {
        console.log(socket.remoteAddress)
        socket.write('Echo server\r\n');
//muestra por consola el texto entrante
        socket.on('data', function(data) {
                console.log('Received: ' + data);
        });
        socket.pipe(socket);
});

server.listen(1337, '0.0.0.0');
