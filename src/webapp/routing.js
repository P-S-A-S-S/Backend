const express = require('express');
const fs = require('fs');
const https = require('https');
const fetch = require('node-fetch');
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
    const server = https.createServer(options, app).listen(port, () => {
        console.log("Servidor actiu en el port", port);
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
};

exports.startBackend = startBackend;