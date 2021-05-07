const sendCommands = (cmd, endp) =>{
    fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cmd: {cmd},
            endp: {endp}
        })
    });
};
    