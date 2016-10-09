var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var Pins = require('./Pins');
var Bundles = require('./Bundles');
var Events = require('./Events');
var Listeners = require('./Listeners');
var AppStatus = require('./AppStatus');
var DisplayError = require('./DisplayError');

var MyApp = {
    getInitialState: function() {
        return this.props.ctx.store.getState();
    },
    componentDidMount: function() {
        if (!this.unsubscribe) {
            this.unsubscribe = this.props.ctx.store
                .subscribe(this._onChange.bind(this));
            this._onChange();
        }
    },
    componentWillUnmount: function() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    },
    _onChange : function() {
        if (this.unsubscribe) {
            this.setState(this.props.ctx.store.getState());
        }
    },
    render: function() {
        return cE("div", {className: "container-fluid"},
                  cE(DisplayError, {
                      ctx: this.props.ctx,
                      error: this.state.error
                  }),
                  cE(rB.Panel, {
                      header: cE(rB.Grid, null,
                                 cE(rB.Row, null,
                                    cE(rB.Col, {sm:1, xs:1},
                                       cE(AppStatus, {
                                           isClosed: this.state.isClosed
                                       })),
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
                            ctx: this.props.ctx,
                            pinNumber: this.state.pinNumber,
                            pinMode: this.state.pinMode,
                            pinOutputsValue: this.state.pinOutputsValue,
                            pinInputsValue: this.state.pinInputsValue
                        })),
                     cE(rB.Panel, {header: "Bundles"},
                        cE(Bundles, {
                            ctx: this.props.ctx,
                            bundleEditor: this.state.bundleEditor,
                            bundleId: this.state.bundleId,
                            bundleMethods: this.state.iotMethodsMeta,
                            bundles: this.state.bundles
                        })),
                     cE(rB.Panel, {header: "Events"},
                        cE(Events, {
                            ctx: this.props.ctx,
                            eventLabel: this.state.eventLabel,
                            eventDelay: this.state.eventDelay
                        })),
                     cE(rB.Panel, {header: "Listeners"},
                        cE(Listeners, {
                            ctx: this.props.ctx,
                            listenerEditor: this.state.listenerEditor,
                            listenerId : this.state.listenerId,
                            listeners: this.state.listeners,
                            bundles: this.state.bundles
                        }))
                    )
                 );
    }
};

module.exports = React.createClass(MyApp);
