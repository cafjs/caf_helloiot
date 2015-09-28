var React = require('react');
var rB = require('react-bootstrap');
var AppStore = require('../stores/AppStore');
var AppActions = require('../actions/AppActions');
var ListNotif = require('./ListNotif');
var AppStatus = require('./AppStatus');

var cE = React.createElement;

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
    handleDelayChange: function() {
        AppActions.setLocalState({
            delay: this.refs.delay.getValue()
        });
    },
    handleMsgChange: function() {
        AppActions.setLocalState({
            msg: this.refs.msg.getValue()
        });
    },
    handleIncrementChange: function() {
        AppActions.setLocalState({
            inc: this.refs.inc.getValue()
        });
    },
    doIncrement : function(ev) {
        var inc = parseInt(this.state.inc);
        AppActions.increment(inc);
    },
    doHello : function(ev) {
        var msg = this.state.msg;
        var delay = parseInt(this.state.delay);
        AppActions.iotForceHello(delay, msg);
    },
    render: function() {
        return cE("div", {className: "container-fluid"},
                  cE(rB.Panel, {header: cE(rB.Grid, null,
                                           cE(rB.Row, null,
                                              cE(rB.Col, {sm:1, xs:1},
                                                 cE(AppStatus, {
                                                        isClosed:
                                                        this.state.isClosed
                                                    })
                                                ),
                                              cE(rB.Col, {
                                                     sm: 5,
                                                     xs:10,
                                                     className: 'text-right'
                                                 },
                                                 "IoT Example"
                                                ),
                                              cE(rB.Col, {
                                                     sm: 5,
                                                     xs:11,
                                                     className: 'text-right'
                                                 },
                                                 this.state.fullName
                                                )
                                             )
                                          )
                               },
                     cE(rB.Panel, {header: "Update Counter"},
                        cE(rB.Grid, null,
                           cE(rB.Row, null,
                              cE(rB.Col, { xs:6, sm:3},
                                 "Current"
                                ),
                              cE(rB.Col, { xs:6, sm:3},
                                    cE(rB.Badge, null, this.state.counter)
                                ),
                              cE('div', {className:'clearfix visible-xs'}),
                              cE(rB.Col, { xs:6, sm: 3},
                                 cE(rB.Input, {
                                     type: 'text',
                                     value: this.state.inc,
                                     ref: 'inc',
                                     placeholder: '1',
                                     onChange : this.handleIncrementChange
                                 })
                                ),
                              cE(rB.Col, { xs:6, sm:3},
                                 cE(rB.Button, {onClick: this.doIncrement,
                                                bsStyle: 'primary'},
                                    'Increment')
                                )
                             )
                          )
                       ),
                     cE(rB.Panel, {header: "Force Hello"},
                        cE(rB.Grid, null,
                           cE(rB.Row, null,
                              cE(rB.Col, { xs:6, sm:3},
                                 cE(rB.Input, {
                                     type: 'text',
                                     value: this.state.msg,
                                     label: 'Message',
                                     ref: 'msg',
                                     placeholder: 'type a message',
                                     onChange: this.handleMsgChange
                                 })
                                ),
                              cE(rB.Col, { xs:6, sm:3},
                                 cE(rB.Input, {
                                     type: 'text',
                                     value: this.state.delay,
                                     label: 'Delay',
                                     ref: 'delay',
                                     placeholder: 'miliseconds',
                                     onChange: this.handleDelayChange
                                 })
                                )
                             ),
                           cE(rB.Row, null,
                              cE(rB.Col, { xs:6, sm:3},
                                 cE(rB.Button, {onClick: this.doHello,
                                                bsStyle: 'primary'},
                                    'Force Hello')
                                )
                             )
                          )
                       ),
                     cE(rB.Panel, {header: "Last Notifications"},
                        cE(ListNotif, {notif :this.state.notif})
                       )
                    )
                 );
    }
};

module.exports = React.createClass(MyApp);
