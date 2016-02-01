var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var BundleEditor = require('./BundleEditor');


var Bundles = {
    render: function() {
        var bundleIds = Object.keys(this.props.bundles);
        return cE("div", {className: "container-fluid"},
                  cE(BundleEditor, {
                      bundleIdEditor: this.props.bundleIdEditor,
                      bundleMethods: this.props.bundleMethods,
                      bundles: this.props.bundles
                  }),
                  cE(rB.Grid, null,
                     cE(rB.Row, null,
                        cE(rB.Col, {sm:4, xs:12},
                           cE(rB.Input, {
                               type: 'text',
                               ref: 'Id',
                               label: 'Bundle Id',
                               value: this.props.bundleId,
                               onChange: this.handlebundleId,
                               placeholder: 'Id'
                           })
                          ),
                        cE(rB.Col, {sm:4, xs:12},
                           cE(rB.ButtonGroup, null,
                              cE(rB.Button, {onClick: this.doEdit}, 'Edit'),
                              cE(rB.Button, {onClick: this.doDelete,
                                             bsStyle : 'danger'}, 'Delete'))
                          )
                       ),
                     cE(rB.Row, null,
                        cE(rB.Col, {sm:4, xs:12},
                           cE(rB.ListGroup, null,
                              bundleIds.map(function(x, i) {
                                  return  cE(rB.ListGroupItem, {key:i},
                                             'id:' + x,
                                             ' value:' + this.props.bundles(x));
                              })
                             )
                          )
                       )
                    )
                 );
    }
};


module.exports = React.createClass(Bundles);
