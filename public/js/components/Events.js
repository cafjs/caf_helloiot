var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');

var Events = {
    handleEventDelay: function() {
        AppActions.setLocalState(this.props.ctx, {
            eventDelay: this.refs.eventDelay.getValue()
        });
    },
    handleEventLabel: function() {
        AppActions.setLocalState(this.props.ctx, {
            eventLabel: this.refs.eventLabel.getValue()
        });
    },
    doRun: function() {
        var delay = parseInt(this.refs.eventDelay.getValue());
        if (isNaN(delay)) {
            AppActions.setError(this.props.ctx,
                                new Error('Invalid delay:' +
                                          this.refs.eventDelay.getValue()));
        } else {
            var label  = this.refs.eventLabel.getValue();
            if (label) {
                AppActions.triggerEvent(this.props.ctx, label, delay);
            } else {
                AppActions.setError(this.props.ctx, new Error('Missing label'));

            }
        }
    },
    launchEvent : function(ev) {
        if (ev.key === 'Enter') {
            this.doRun();
        }
    },
    render: function() {
        return  cE(rB.Grid, null,
                  cE(rB.Row, null,
                     cE(rB.Col, {sm:4, xs:12},
                        cE(rB.Input, {
                            type: 'text',
                            ref: 'eventLabel',
                            value: this.props.eventLabel,
                            onChange: this.handleEventLabel,
                            placeholder: 'Topic'
                        })
                       ),
                     cE(rB.Col, {sm:4, xs:12},
                        cE(rB.Input, {
                            type: 'text',
                            ref: 'eventDelay',
                            value: this.props.eventDelay,
                            onChange: this.handleEventDelay,
                            onKeyDown: this.launchEvent,
                            placeholder: 'Delay (msec)'
                        })
                       ),
                     cE(rB.Col, {sm:4, xs:12},
                        cE(rB.Button, {onClick: this.doRun},'Run'))
                    )
                  );
    }
};


module.exports = React.createClass(Events);
