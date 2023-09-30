const applicationID = "C6BFAEE3";

window["__onGCastApiAvailable"] = function (isAvailable) {
    if (isAvailable) {
        console.log("Cast APIs are available");
        initializeCastApi();
    } else {
        console.log("Cast APIs not available");
    }

    function initializeCastApi() {
        var applicationID = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
        var sessionRequest = new chrome.cast.SessionRequest(applicationID);

        var sessionListener = function (e) {
            console.log("New session ID:" + e.sessionId);
            session = e;
            if (session.media.length != 0) {
                console.log("Found " + session.media.length + " sessions.");
            }
        };

        var receiverListener = function (e) {
            if (e === "available") {
                console.log("Chromecast was found on the network.");
            } else {
                console.log("There are no Chromecasts available.");
            }
        };

        var apiConfig = new chrome.cast.ApiConfig(
            sessionRequest,
            sessionListener,
            receiverListener
        );

        var onInitSuccess = function () {
            console.log("Initialization succeeded");

            // provide cast options
            cast.framework.CastContext.getInstance().setOptions({
                receiverApplicationId: applicationID,
                autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
            });

            var button = document.getElementById("castButton");
            button.style.display = "block";

            // add event listeners to cast framework
            cast.framework.CastContext.getInstance().addEventListener(
                cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
                function (event) {
                    switch (event.sessionState) {
                        case cast.framework.SessionState.SESSION_STARTED:
                        case cast.framework.SessionState.SESSION_RESUMED:
                            console.log("SESSION_STARTED");
                            // log session info
                            console.log(
                                cast.framework.CastContext.getInstance().getCurrentSession()
                            );
                            break;
                        case cast.framework.SessionState.SESSION_ENDED:
                            console.log("SESSION_ENDED");
                            break;
                    }
                }
            );

            // send message to receiver
            // create new input element
            var input = document.createElement("input");
            input.type = "text";
            input.value = "Hello Receiver!";
            input.id = "messageInput";
            input.style.display = "block";
            document.body.appendChild(input);

            // create new button element
            var button = document.createElement("button");
            button.innerHTML = "Send Message";
            button.id = "messageButton";
            button.style.display = "block";
            document.body.appendChild(button);

            // add event listener to button
            button.addEventListener("click", function () {
                var message = document.getElementById("messageInput").value;
                console.log("Sending message: " + message);
                cast.framework.CastContext.getInstance().getCurrentSession().sendMessage("urn:x-cast:com.google.cast.sample.helloworld", message);
            });
        };

        var onError = function (message) {
            console.log("Error: " + message);
        }

        chrome.cast.initialize(apiConfig, onInitSuccess, onError);
    }
};
