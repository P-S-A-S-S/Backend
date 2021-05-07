const express = require('express');
const fs = require('fs');
const https = require('https');
const http = require('http');
const fetch = require('node-fetch');
const ws = require('ws');
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })


function startBackend(){
    const app = express();
    const port = 5000;
    const public = express.static('public');
    const options = {
        key: fs.readFileSync('./certs/server.key'),
        cert: fs.readFileSync('./certs/server.crt'),
    };
    const server = https.createServer(options, app);
    const wss = new ws.Server({ server });
    wss.on('connection', (ws) => {
        //connection is up, let's add a simple simple event
        ws.on('message', (message) => {
    
            //log the received message and send it back to the client
            console.log('received: %s', message);
            ws.send(`Hello, you sent -> ${message}`);
        });
    
        //send immediatly a feedback to the incoming connection    
        ws.send('Hi there, I am a WebSocket server');
    });
    app.get('/', public);
    app.get('/consolelog', (req, res)=>{
        console.log("Esto se ejecuta en la consola del servidor");
        res.send("Accion realizada.");
    });
    app.get('/command=:cmd/endp=:hosts', async (req, res)=>{
        let resdata = await fetch(`http://localhost:1234/command=${req.params.cmd}_._/endp=${req.params.hosts}`).then(res =>{
            return res.text()
        }).then(body =>{
            console.log("Console log dintre del fetch: ",body)
            return body
        });
        console.log("Console log fora del fetch:", resdata)
        res.send(resdata)
    });
    app.post('/sendcommands', urlencodedParser,async (req, res) =>{
        let command = req.body.cmd
        let endpoints = req.body.endp
        console.log("CMD: ", command, "\nENDP: ", endpoints)
        let resdata = await fetch(`http://localhost:1234/command=${command}_._/endp=${endpoints}`).then(res =>{
            return res.text()
        }).then(body =>{
            console.log("Console log dintre del fetch: ",body)
            return body
        });
        console.log("Console log fora del fetch:", resdata)
        res.send(resdata)
    })
    app.get('*', (req, res)=>{
        res.send("Error 404: Bro esta pagina no existe XD")
    });
    server.listen(port, () => {
        console.log(`Server started on port ${server.address().port} :)`);
    });
};

exports.startBackend = startBackend;