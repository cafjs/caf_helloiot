var AppConstants = require('../constants/AppConstants');

var lateBundle = function(state) {
    if (state.lastLateBundleDismissed !== state.lastBundleIndex) {
        var acks = state.acks || [];
        return acks.some(function(x) {
            return ((x.index === state.lastBundleIndex) && (!x.result));
        });
    } else {
        return false;
    }
};

var AppReducer = function(state, action) {
    if (typeof state === 'undefined') {
        return  {pinMode: {}, pinInputsValue:{}, pinOutputsValue:{},
                 bundleMethods:[], bundles:[], bundleEditor: null,
                 triggers:[], power: {}, isClosed: false,
                 lastLateBundleDismissed: -1};
    } else {
        switch(action.type) {
        case AppConstants.APP_UPDATE:
        case AppConstants.APP_NOTIFICATION:
            var newState = Object.assign({}, state, action.state);
            if (lateBundle(newState)) {
                var extra = {
                    lastLateBundleDismissed: newState.lastBundleIndex,
                    error:  new Error('The last bundle was late, and it ' +
                                      'was ignored by the device. Please, ' +
                                      'increase the delay')
                };
                return Object.assign(newState, extra);
            } else {
                return newState;
            }
        case AppConstants.APP_ERROR:
            return Object.assign({}, state, {error: action.error});
        case AppConstants.WS_STATUS:
            return Object.assign({}, state, {isClosed: action.isClosed});
        default:
            return state;
        }
    };
};

module.exports = AppReducer;
