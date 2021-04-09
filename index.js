const api = require('./src/webapp/routing');
const srvSock = require('./src/clientback/server-manager')
api.startBackend();
srvSock.startSockets();