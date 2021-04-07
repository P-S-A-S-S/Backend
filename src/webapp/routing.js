const express = require('express');
const fs = require('fs');
const https = require('https');

function startBackend(){
    const app = express();
    const port = 5000;
    const public = express.static('public');
    const options = {
        key: fs.readFileSync('./certs/server.key'),
        cert: fs.readFileSync('./certs/server.crt'),
    };
    const server = https.createServer(options, app).listen(port, () => {
        console.log("Servidor actiu en el port", port);
    });
    app.get('/', public);
    app.get('/consolelog', (req, res)=>{
        console.log("Esto se ejecuta en la consola del servidor");
        res.send("Accion realizada.");
    });
    app.get('*', (req, res)=>{
        res.send("Error 404: Bro esta pagina no existe XD")
    });
};

exports.startBackend = startBackend;