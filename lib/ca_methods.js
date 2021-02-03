// Modifications copyright 2020 Caf.js Labs and contributors
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

'use strict';
const assert = require('assert');
const caf = require('caf_core');
const app = require('../public/js/app.js');
const caf_comp = caf.caf_components;
const myUtils = caf_comp.myUtils;
const async = caf_comp.async;
const json_rpc = caf.caf_transport.json_rpc;
const APP_SESSION = 'default';
const IOT_SESSION = 'iot';

const isTopicPresent = (all, topic) =>
    Object.keys(all).some((x) => (all[x].topic === topic));

const filterByTopic = (all, topic) =>
    Object.keys(all).filter((x) => (all[x].topic === topic));


const wrapTopic = function(prefix, forumPrefix, topic) {
    if (topic.indexOf(forumPrefix) === 0) {
        return topic;
    } else {
        const newTopic = json_rpc.joinName(prefix, topic);
        try {
            json_rpc.splitName(newTopic); // throws if invalid name
            return newTopic;
        } catch (ex) {
            json_rpc.splitName(topic);
            return topic;
        }
    }
};

const notifyIoT = function(self, msg) {
    const $$ = self.$.sharing.$;
    const notif = {msg: msg, fromCloud: $$.fromCloud.dump()};
    self.$.session.notify([notif], IOT_SESSION);
};

const notifyWebApp = (self, msg) => self.$.session.notify([msg], APP_SESSION);

exports.methods = {

    // Called by the framework

    async __ca_init__() {
        this.state.pinInputsValue = {};
        this.state.pinOutputsValue = {};
        this.state.pinMode = {};
        this.state.bundles = {};
        this.state.listeners = {};
        this.state.iotMethodsMeta = this.$.iot.iotMethodsMeta();
        this.$.session.limitQueue(1, APP_SESSION); // only the last notification
        this.$.session.limitQueue(1, IOT_SESSION); // only the last notification
        this.state.fullName = this.__ca_getAppName__() + '#' +
            this.__ca_getName__();
        this.state.trace__iot_sync__ = 'traceSync';
        this.state.trace__iot_resume__ = 'traceResume';
        this.state.lastBundleIndex = null;
        const rule = this.$.security.newSimpleRule('handleListener'); //anybody
        this.$.security.addRule(rule);
        return [];
    },
    async __ca_resume__(cp) {
        // need to recreate, in case the IoT  device implementation changed.
        this.state.iotMethodsMeta = this.$.iot.iotMethodsMeta();
        return [];
    },
    async __ca_pulse__() {
        this.$.log && this.$.log.debug('calling PULSE!!!');
        this.$.react.render(app.main, [this.state]);
        return [];
    },

    // Called by the web app

    async hello(key, tokenStr) {
        this.$.react.setCacheKey(key);
        this.$.iot.registerToken(tokenStr);
        return this.getState();
    },
    async changePinMode(pin, input, floating) {
        try {
            const $$ = this.$.sharing.$;
            const newMode = (input ? {
                input: true,
                internalResistor: { pullUp: this.$.props.resistorPullUp }
            } : {
                input: false,
                initialState: { high: this.$.props.initialStateHigh }
            });
            if (floating) {
                delete newMode.initialState;
            }
            await this.deletePin(pin);
            this.state.pinMode[pin] = newMode;
            $$.fromCloud.set('meta', myUtils.deepClone(this.state.pinMode));
            notifyIoT(this, 'Changed pin mode');
            return this.getState();
        } catch (err) {
            return [err];
        }
    },
    async changePinValue(pin, value) {
        if (this.state.pinMode[pin] && !this.state.pinMode[pin].input
            && this.state.pinMode[pin].initialState) {
            const $$ = this.$.sharing.$;
            this.state.pinOutputsValue[pin] = value;
            $$.fromCloud.set('out', myUtils.deepClone(this.state
                                                      .pinOutputsValue));
            notifyIoT(this, 'Changed pin values');
            return this.getState();
        } else {
            const error = new Error('Cannot change pin value');
            error.pin = pin;
            error.pinMode = this.state.pinMode[pin];
            error.value = value;
            return [error];
        }
    },
    async deletePin(pin) {
        const $$ = this.$.sharing.$;
        if (this.state.pinMode[pin]) {
            delete this.state.pinMode[pin];
            $$.fromCloud.set('meta', myUtils.deepClone(this.state.pinMode));
        }
        if (typeof this.state.pinOutputsValue[pin] === 'boolean') {
            delete this.state.pinOutputsValue[pin];
            $$.fromCloud.set('out', myUtils.deepClone(this.state
                                                      .pinOutputsValue));
        }
        delete this.state.pinInputsValue[pin];
        return this.getState();
    },
    async addBundle(name, bundle) {
        this.state.bundles[name] = bundle;
        return this.getState();
    },
    async removeBundle(name) {
        delete this.state.bundles[name];
        return this.getState();
    },
    async scheduleBundle(name, offset) {
        const bStr = this.state.bundles[name];
        if (bStr) {
            const bundle = this.$.iot.newBundle(this.$.props.margin);
            this.state.lastBundleIndex = this.$.iot
                .sendBundle(bundle.__iot_parse__(bStr), offset);
            notifyIoT(this, 'Bundle scheduled');
            return this.getState();
        } else {
            return [new Error('bundle ' + name + ' not found')];
        }
    },
    async triggerEvent(label, offset) {
        try {
            const topic = wrapTopic(this.__ca_getName__(),
                                   this.$.pubsub.FORUM_PREFIX, label);
            const msg = JSON.stringify({
                time: (new Date()).getTime(),
                offset: offset
            });
            this.$.pubsub.publish(topic, msg);
            return this.getState();
        } catch (err) {
            // security check
            return [err];
        }
    },
    async addListener(id, topic, bundleName, offset) {
        topic = wrapTopic(this.__ca_getName__(),
                          this.$.pubsub.FORUM_PREFIX, topic);
        const present = isTopicPresent(this.state.listeners, topic);
        this.state.listeners[id] = {
            topic: topic, bundleName: bundleName, offset: offset || 0
        };
        if (!present) {
            this.$.pubsub.subscribe(topic, 'handleListener');
        }
        return this.getState();
    },
    async removeListener(id) {
        const topic = this.state.listeners[id] &&
              this.state.listeners[id].topic;
        if (topic) {
            delete this.state.listeners[id];
            const present = isTopicPresent(this.state.listeners, topic);
            if (!present) {
                this.$.pubsub.unsubscribe(topic);
            }
        }
        return this.getState();
    },
    async getState() {
        this.$.react.coin();
        return [null, this.state];
    },

    //Called by the pubsub plugin

    async handleListener(topic, msg, from) {
        if (topic.indexOf(this.$.pubsub.FORUM_PREFIX) !== 0) {
            assert(topic.indexOf(from) === 0,
                   'caller ' + from + ' incompatible with topic ' + topic);
        }

        const all = filterByTopic(this.state.listeners, topic);
        if (all.length > 0) {
            const action = JSON.parse(msg);
            const now = (new Date()).getTime();
            const baseOffset = Math.max(action.offset - (now - action.time), 0);
            for (let id of all) {
                try {
                    const listener = this.state.listeners[id];
                    let offset = baseOffset;
                    if (typeof listener.offset === 'number') {
                        if (listener.offset === this.$.iot.NOW) {
                            offset = listener.offset;
                        } else {
                            offset = offset + listener.offset;
                        }
                    }
                    await this.scheduleBundle(listener.bundleName, offset);
                } catch (err) {
                    return [err];
                }
            }
            return this.getState();
        } else {
            return [];
        }
    },

    // Called by the IoT device

    async traceSync() {
        const $$ = this.$.sharing.$;
        const now = (new Date()).getTime();
        this.$.log.debug(this.state.fullName + ':Syncing!!:' + now);
        this.state.pinInputsValue = myUtils.deepClone($$.toCloud.get('in'));
        notifyWebApp(this, 'New inputs');
        return [];
    },
    async traceResume() {
        const now = (new Date()).getTime();
        this.$.log.debug(this.state.fullName + ':Resuming!!:' + now);
        return [];
    }
};

caf.init(module);
