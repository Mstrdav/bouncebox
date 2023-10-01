// This example integrates `hls.js`, but anything else can be used.
const context       = cast.framework.CastReceiverContext.getInstance(),
      playerManager = context.getPlayerManager();

const setStatus = ({ isLoading, error }) => {
  if (isLoading) {
    // Show the loader.
  } else {
    // Hide the loader.
  }
  if (error) {
    // Show the error message.
  } else {
    // Hide the error message.
  }
}

// Intercept loading requests.
playerManager.setMessageInterceptor(cast.framework.messages.MessageType.LOAD, event => {
  console.log('LOAD intercepted', event);
  setStatus({ isLoading: true });

  // Return a promise 
  return new Promise((resolve, reject) => {
    console.log('LOAD', event.media.entity);
    resolve(); // resolve the promise immediately
  });
});

// intercept messages and handle them
context.addCustomMessageListener('urn:x-cast:com.google.cast.sample.helloworld', function (event) {
  console.log('addCustomMessageListener', event);
  // handle message
});

playerManager.setMessageInterceptor(cast.framework.messages.MessageType.PAUSE, event => {
  console.log('PAUSE intercepted', event);
  setStatus({ isLoading: false });
  return Promise.resolve(event);
});

const options = new cast.framework.CastReceiverOptions();

// Do not load unnecessary JS files for players we don't need.
options.skipPlayersLoad = true;

// Disable the idle timeout. Note that this is something actually useful to have, but it should
// be easy to implement with some bookkeeping and `setTimeout`.
options.disableIdleTimeout = true;

// Enable basic media commands.
options.supportedCommands =
  cast.framework.messages.Command.ALL_BASIC_MEDIA;

// Optional, maximize the debug level to diagnose problems.
// context.setLoggerLevel(cast.framework.LoggerLevel.DEBUG);

context.start(options);