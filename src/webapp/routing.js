const express = require('express');
function startBackend(){
    const app = express();
    const port = 5000;
    const public = express.static('public')
    app.get('/', public);
    app.get('*', (req, res)=>{
        res.send("Error 404: Bro esta pagina no existe XD")
    });
    app.listen(port, () => {
        console.log("Servidor actiu en el port", port);
    });
};

exports.startBackend = startBackend;