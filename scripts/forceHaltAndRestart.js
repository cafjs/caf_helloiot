#!/usr/bin/env node

var caf_cli = require('caf_cli');
var fs = require('fs');
var path = require('path');

var token = fs.readFileSync(path.resolve(__dirname, '../iot/lib/token'),
                            {encoding:'utf8'}).trim();
var beforeSec = parseInt(process.argv[2]);

var afterSec = parseInt(process.argv[3]);

var caURL = 'https://root-helloiot.cafjs.com';

var cli = new caf_cli.Session(caURL, 'foo-ca1', {
            from : 'foo-ca1',
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
