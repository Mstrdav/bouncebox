// const applicationID = "C6BFAEE3";
var session = null;
var cctx = null;

var remotePlayer = null;
var remotePlayerController = null;

var namespace = 'urn:x-cast:io.github.mstrdav.cast.bouncebox';

/**
 * Listener to notify when sessions become available
 * @param session chrome.cast.Session
 */
const sessionListener = function (session) {
    console.log('New session ID:' + session.sessionId);
    session = session;
    // session.addUpdateListener(sessionUpdateListener);
    // session.addMessageListener(namespace, receiverMessage);
}

/**
 * Listener to notify when receiver is available
 * @param receiverAvailability chrome.cast.ReceiverAvailability
 */
const receiverListener = function (receiverAvailability) {
    if (receiverAvailability === chrome.cast.ReceiverAvailability.AVAILABLE) {
        console.log("receiver found");
    }
}

/**
 * Callback function for init success
 */
const onInitSuccess = function () {
    console.log("init success");
    cctx = cast.framework.CastContext.getInstance();

    // provide cast options
    var castOptions = new cast.framework.CastOptions();
    castOptions.receiverApplicationId = applicationID || chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
    castOptions.androidReceiverCompatible = false;
    castOptions.autoJoinPolicy = chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED;
    castOptions.language = 'fr-FR';
    castOptions.resumeSavedSession = true;

    cctx.setOptions(castOptions);
    console.log("cast options set");

    // credentials
    let credentials = new chrome.cast.CredentialsData("{\"userId\":\"Coolin\"}");
    cctx.setLaunchCredentialsData(credentials);
    console.log("credentials set");

    // add event listeners
    cctx.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, function (event) {
        console.log("session state changed");
        console.log(event);
    });

    // create remote player and controller
    remotePlayer = new cast.framework.RemotePlayer();
    remotePlayerController = new cast.framework.RemotePlayerController(remotePlayer);
    console.log("remote player created");

    // event on remote player state change
    remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED, function (event) {
        console.log("is connected changed");
        console.log(event);
    });
}

/**
 * Generic error callback function
 * @param e A chrome.cast.Error object
 */
const onError = function (e) {
    console.log("Error: " + e);
}

/**
 * Initialization
 */
const initializeCastApi = function () {
    console.log('initializeCastApi');
    var sessionRequest = new chrome.cast.SessionRequest(applicationID || chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
    var apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener, chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED);
    chrome.cast.initialize(apiConfig, onInitSuccess, onError);
};

/**
 * Subscribe to Google Cast Api Available
 * @param loaded API loaded or not
 * @param errorInfo error information
 */
window['__onGCastApiAvailable'] = function (loaded, errorInfo) {
    if (loaded) {
        initializeCastApi();
    } else {
        console.log(errorInfo);
    }
}
