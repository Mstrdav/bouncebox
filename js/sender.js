const applicationID = "C6BFAEE3";
var session = null;

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
 * Initialization
 */
const initializeCastApi = function () {
    console.log('initializeCastApi');
    var sessionRequest = new chrome.cast.SessionRequest(applicationID);
    var apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener, chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED);
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
        log(errorInfo);
    }
}
