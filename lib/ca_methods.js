/*!
Copyright 2013 Hewlett-Packard Development Company, L.P.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

"use strict";
var caf = require('caf_core');
var app = require('../public/js/app.js');
var caf_comp = caf.caf_components;
var myUtils = caf_comp.myUtils;
var async = caf_comp.async;
var APP_SESSION = 'default';
var IOT_SESSION = 'iot';

exports.methods = {
    '__ca_init__' : function(cb) {
        this.state.pinInputsValue = {};
        this.state.pinOutputsValue = {};
        this.state.pinMode = {};
        this.state.bundles = {};
        this.state.iotMethodsMeta = this.$.iot.iotMethodsMeta();
        this.$.session.limitQueue(1, APP_SESSION); // only the last notification
        this.$.session.limitQueue(1, IOT_SESSION); // only the last notification
        this.state.fullName = this.__ca_getAppName__() + '#' +
            this.__ca_getName__();
        this.state.trace__iot_sync__ = 'traceSync';
        this.state.trace__iot_resume__ = 'traceResume';
        cb(null);
    },
    '__ca_resume__' : function(cp, cb) {
        // need to recreate, in case the IoT  device implementation changed.
        this.state.iotMethodsMeta = this.$.iot.iotMethodsMeta();
        cb(null);
    },
    '__ca_pulse__' : function(cb) {
        this.$._.$.log && this.$._.$.log.debug('calling PULSE!!!');
        this.$.react.render(app.main, [this.state]);
        cb(null, null);
    },
    'hello' : function(key, tokenStr, cb) {
        this.$.react.setCacheKey(key);
        this.$.iot.registerToken(tokenStr);
        this.getState(cb);
    },
    'changePinMode' : function(pin, input, floating, cb) {
        var $$ = this.$.sharing.$;
        var self = this;
        var newMode = (input ?  {
            input: true,
            internalResistor: { pullUp: this.$.props.resistorPullUp }
        } : {
            input: false,
            initialState: { high: this.$.props.initialStateHigh }
        });
        if (floating) {
            delete newMode.initialState;
        }
        
        this.deletePin(pin, function(err) {
            if (err) {
                cb(err);
            } else {
                self.state.pinMode[pin] = newMode;
                $$.fromCloud.set('meta', myUtils.deepClone(self.state.pinMode));
                self.$.session.notify(['Changed pin mode'], IOT_SESSION);
                self.getState(cb);
            }
        });
    },
    'changePinValue' : function(pin, value, cb) {
        if (this.state.pinMode[pin] && !this.state.pinMode[pin].input
            && this.state.pinMode[pin].initialState) {
            var $$ = this.$.sharing.$;
            this.state.pinOutputsValue[pin] = value;
            $$.fromCloud.set('out', myUtils.deepClone(this.state
                                                      .pinOutputsValue));
            this.$.session.notify(['Changed pin values'], IOT_SESSION);
            this.getState(cb);
        } else {
            var error = new Error('Cannot change pin value');
            error.pin = pin;
            error.pinMode = this.state.pinMode[pin];
            error.value = value;
            cb(error);
        }
    },
    'deletePin' : function(pin, cb) {
        var $$ = this.$.sharing.$;
        if (this.state.pinMode[pin]) {
            delete this.state.pinMode[pin];
            $$.fromCloud.set('meta', myUtils.deepClone(this.state.pinMode));
        }
        if (typeof  this.state.pinOutputsValue[pin] === 'boolean') {
            delete this.state.pinOutputsValue[pin];
            $$.fromCloud.set('out', myUtils.deepClone(this.state
                                                      .pinOutputsValue));
        }
        delete this.state.pinInputsValue[pin];
        this.getState(cb);
    },
    'addBundle' : function(name, bundle, cb) {
        this.state.bundles[name] = bundle;
        this.getState(cb);
    },
    'removeBundle' : function(name, cb) {
        delete this.state.bundles[name];
        this.getState(cb);
    },
    'scheduleBundle' : function(name, offset, cb) {
        var bStr = this.state.bundles[name];
        if (bStr) {
            var bundle = this.$.iot.newBundle(this.$.props.margin);
            this.$.iot.sendBundle(bundle.__iot_parse__(bStr), offset);
            this.$.session.notify(['Bundle scheduled'], IOT_SESSION);
            this.getState(cb); 
        } else {
            cb(new Error('bundle ' + name + ' not found')); 
        }
    },
    'blink' : function(pins, delay, cb) {
        var bundle = this.$.iot.newBundle();
        pins.forEach(function(pin) {
            bundle.setPin(delay, [pin, true]).setPin(delay, [pin, false]);
        });
        this.$.iot.sendBundle(bundle, this.$.iot.NOW);
        this.$.session.notify(['Pending blink'], IOT_SESSION);
        this.getState(cb);
    },
    'iotForceHaltAndRestart' : function(beforeSec, afterSec, cb) {
        var bundle = this.$.iot.newBundle()
                .haltAndRestart(beforeSec*1000, [afterSec]);
        this.$.iot.sendBundle(bundle, this.$.iot.NOW);
        this.$.session.notify(['Halt and restart'], IOT_SESSION);
        this.getState(cb);
    },
    'getState' : function(cb) {
        this.$.react.coin();
        cb(null, this.state);
    },
    'traceSync' : function(cb) {
        var $$ = this.$.sharing.$;
        var now = (new Date()).getTime();
        this.$.log.debug(this.state.fullName + ':Syncing!!:' + now);
        this.state.pinInputsValue =  myUtils.deepClone($$.toCloud.get('in'));
        this.$.session.notify(['New inputs'], APP_SESSION);
        cb(null);
    },
    'traceResume' : function(cb) {
        var now = (new Date()).getTime();
        this.$.log.debug(this.state.fullName + ':Resuming!!:' + now);
        cb(null);
    }
};


caf.init(module);

