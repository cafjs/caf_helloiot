var AppConstants = require('../constants/AppConstants');
var json_rpc = require('caf_transport').json_rpc;
var caf_cli =  require('caf_cli');

var updateF = function(store, state) {
    var d = {
        type: AppConstants.APP_UPDATE,
        state: state
    };
    store.dispatch(d);
};

var errorF =  function(store, err) {
    var d = {
        type: AppConstants.APP_ERROR,
        error: err
    };
    store.dispatch(d);
};

var notifyF = function(store, message) {
    var getNotifData = function(msg) {
        return json_rpc.getMethodArgs(msg)[0];
    };

    var d = {
        type: AppConstants.APP_NOTIFICATION,
        state: getNotifData(message)
    };
    store.dispatch(d);
};

var wsStatusF =  function(store, isClosed) {
    var d = {
        type: AppConstants.WS_STATUS,
        isClosed: isClosed
    };
    store.dispatch(d);
};

var AppActions = {
    initServer(ctx, initialData) {
        updateF(ctx.store, initialData);
    },
    async init(ctx) {
        try {
            var tok =  caf_cli.extractTokenFromURL(window.location.href);
            var data = await ctx.session.hello(ctx.session.getCacheKey(), tok)
                    .getPromise();
            updateF(ctx.store, data);
        } catch (err) {
            errorF(ctx.store, err);
        }
    },
    setLocalState(ctx, data) {
        updateF(ctx.store, data);
    },
    resetError(ctx) {
        errorF(ctx.store, null);
    },
    setError(ctx, err) {
        errorF(ctx.store, err);
    },
    message(ctx, msg) {
        console.log('message:' + JSON.stringify(msg));
        // refresh state
        AppActions.getState(ctx);
    },
    closing(ctx, err) {
        console.log('Closing:' + JSON.stringify(err));
        wsStatusF(ctx.store, true);
    }
};

['changePinMode', 'changePinValue', 'deletePin', 'getState','addBundle',
 'removeBundle','scheduleBundle','addListener', 'removeListener',
 'triggerEvent'].forEach(function(x) {
     AppActions[x] = async function() {
         var args = Array.prototype.slice.call(arguments);
         var ctx = args.shift();
         try {
             var data = await ctx.session[x].apply(ctx.session, args)
                     .getPromise();
             updateF(ctx.store, data);
         } catch (err) {
             errorF(ctx.store, err);
         }
     };
 });

module.exports = AppActions;
