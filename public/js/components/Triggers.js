var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');

var Triggers = {
    handleTriggerBundleId: function() {
        AppActions.setLocalState({
            triggerBundleId: this.refs.triggerBundleId.getValue()
        });
    },
    handleTriggerDelay: function() {
        AppActions.setLocalState({
            triggerDelay: this.refs.triggerDelay.getValue()
        });
    },
    doRun: function() {
        var bundleId = this.refs.triggerBundleId.getValue();
        var bundle = this.props.bundles[bundleId];
        if (bundle) {
            var delay = parseInt(this.refs.triggerDelay.getValue());
            if (isNaN(delay)) {
                AppActions.setError(new Error('Invalid delay:' +
                                              this.refs.triggerDelay
                                              .getValue()));
            } else {
                AppActions.scheduleBundle(bundleId, delay);
            }
        } else {
            AppActions.setError(new Error('Invalid bundle id:' + bundleId));
        }
    },
    render: function() {
        var all = this.props.triggers || [];
        return  cE(rB.Grid, null,
                  cE(rB.Row, null,
                     cE(rB.Col, {sm:4, xs:12},
                        cE(rB.Input, {
                            type: 'text',
                            ref: 'triggerBundleId',
//                            label: 'Bundle',
                            value: this.props.triggerBundleId,
                            onChange: this.handleTriggerBundleId,
                            placeholder: 'Bundle Id'
                        })
                       ),
                     cE(rB.Col, {sm:4, xs:12},
                        cE(rB.Input, {
                            type: 'text',
                            ref: 'triggerDelay',
//                            label: 'Delay',
                            value: this.props.triggerDelay,
                            onChange: this.handleTriggerDelay,
                            placeholder: 'Delay (-1 or #msec)'
                        })
                       ),
                     cE(rB.Col, {sm:4, xs:12},
                        cE(rB.Button, {onClick: this.doRun},'Run'))
                    )
                  );
    }
};


module.exports = React.createClass(Triggers);
