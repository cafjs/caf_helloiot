#!/usr/bin/env node

var caf_cli = require('caf_cli');
var fs = require('fs');
var path = require('path');

if (process.argv.length !== 6) {
    console.log('Usage: forceHaltAndRestart <tokenFile> <deviceName> <beforeSec> <afterSec>');
    process.exit(1);
}

var token = fs.readFileSync(path.resolve(__dirname, process.argv[2]),
                            {encoding:'utf8'}).trim();

var deviceName = process.argv[3];

var beforeSec = parseInt(process.argv[4]);

var afterSec = parseInt(process.argv[5]);

var caURL = 'http://root-helloiot.vcap.me';

var cli = new caf_cli.Session(caURL, deviceName, {
            from : deviceName,
            token : token,
            session : 'default',
            log: function(msg) {
                console.log(msg);
            }
        });

cli.onclose = function(err) {
    console.log('Closing');
    if (err) {
        console.log(JSON.stringify(err));
    }
};

cli.onmessage = function(msg) {
    console.log(msg);
};

cli.onopen = function() {
    cli.iotForceHaltAndRestart(beforeSec, afterSec, function(err, data) {
        console.log((new Date()).getTime());
        if (err) {
            console.log(JSON.stringify(err));
        } else {
            console.log(JSON.stringify(data));
        }
        cli.close();
    });
};
