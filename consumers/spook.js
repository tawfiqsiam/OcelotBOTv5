/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 22/09/2019
 * ╚════ ║   (ocelotbotv5) spook
 *  ════╝
 */
process.env["NODE_CONFIG_DIR"] = "../config";
const   config          = require('config'),
        amqplib         = require('amqplib'),
        https           = require('https'),
        fs              = require('fs'),
        ws              = require('ws'),
        tracer          = require('dd-trace'),
        StatsD          = require('node-dogstatsd').StatsD;


async function init(){
    const statsd = new StatsD();
    tracer.init({
        analytics: true
    });

    const server = https.createServer({
        key: fs.readFileSync('/home/peter/privkey.pem'),
        cert: fs.readFileSync('/home/peter/cert.pem')
    });
    const wss = new ws.Server({server});

    server.listen(8234);
    let con = await amqplib.connect(config.get("RabbitMQ.host"));
    let channel = await con.createChannel();

    channel.assertQueue('spook');

    channel.consume('spook', function(msg){
        const str = msg.content.toString();
        console.log("Processing new spook.");
        let spook = JSON.parse(msg.content);
        console.log(spook.spookerUsername+" -> "+spook.spookedUsername);
        console.log("Got "+wss.clients.size+" clients.");
        wss.clients.forEach(function(client){
            if(!client.filter || client.filter === spook.server) {
                statsd.increment('ocelotbot.spook.messages');
                console.log("Sending to client with filter "+client.filter);
                client.send(str);
            }
        });

        channel.ack(msg);
    });

    wss.on('connection', function(ws){
        console.log("Received Connection");
        statsd.increment('ocelotbot.spook.connections');
        ws.on('message', function(data){
            console.log("Filter set to "+data);
            ws.filter = data;
        });

        ws.on('close', function(){
            console.log("Connection closed");
            statsd.decrement('ocelotbot.spook.connections');
        });
    });
}

init();
