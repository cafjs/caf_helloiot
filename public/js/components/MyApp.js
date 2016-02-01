var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppStore = require('../stores/AppStore');
var AppActions = require('../actions/AppActions');
var Pins = require('./Pins');
var Bundles = require('./Bundles');
var Triggers = require('./Triggers');
var Power = require('./Power');
var AppStatus = require('./AppStatus');
var DisplayError = require('./DisplayError');

var MyApp = {
    getInitialState: function() {
        return AppStore.getState();
    },
    componentDidMount: function() {
        AppStore.addChangeListener(this._onChange);
    },
    componentWillUnmount: function() {
        AppStore.removeChangeListener(this._onChange);
    },
    _onChange : function(ev) {
        this.setState(AppStore.getState());
    },
    render: function() {
        return cE("div", {className: "container-fluid"},
                  cE(DisplayError, {
                      error: this.state.error
                  }),
                  cE(rB.Panel, {
                      header: cE(rB.Grid, null,
                                 cE(rB.Row, null,
                                    cE(rB.Col, {sm:1, xs:1},
                                       cE(AppStatus, {
                                           isClosed: this.state.isClosed
                                       })
                                      ),
                                    cE(rB.Col, {
                                        sm: 5,
                                        xs:10,
                                        className: 'text-right'
                                    }, "IoT Example"),
                                    cE(rB.Col, {
                                        sm: 5,
                                        xs:11,
                                        className: 'text-right'
                                    }, this.state.fullName)
                                   )
                                )
                  },
                     cE(rB.Panel, {header: "Pins"},
                        cE(Pins, {
                            pinNumber: this.state.pinNumber,
                            pinMode: this.state.pinMode,
                            pinOutputsValue: this.state.pinOutputsValue,
                            pinInputsValue: this.state.pinInputsValue
                        })),
                     cE(rB.Panel, {header: "Bundles"},
                        cE(Bundles, {
                            bundleIdEditor: this.state.bundleIdEditor,
                            bundleMethods: this.state.bundleMethods,
                            bundles: this.state.bundles
                        })),
                     cE(rB.Panel, {header: "Triggers"},
                        cE(Triggers, {
                            bundles: this.state.bundles,
                            triggers: this.state.triggers,
                            triggerBundleId: this.state.triggerBundleId,
                            triggerDelay: this.state.triggerDelay
                        })),
                     cE(rB.Panel, {header: "Power Management"},
                        cE(Power, {power: this.state.power})
                       )
                    )
                 );
    }
};

module.exports = React.createClass(MyApp);
