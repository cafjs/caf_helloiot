var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;

var Triggers = {
    render: function() {
        var all = this.props.triggers || [];
        return cE(rB.ListGroup, null,
                  all.map(function(x, i) {
                      return  cE(rB.ListGroupItem, {key:i},
                                 'trigger:' + i,
                                 ' value:' + JSON.stringify(x));
                  })
                 );
    }
};


module.exports = React.createClass(Triggers);
