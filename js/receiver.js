/*
Copyright 2020 Google LLC. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * This sample demonstrates how to build your own Receiver for use with Google
 * Cast.
 */

'use strict';


/**
 * Constants to be used for fetching media by entity from sample repository.
 */

const context = cast.framework.CastReceiverContext.getInstance();

const LOG_RECEIVER_TAG = 'BounceBox';

const namespace = 'urn:x-cast:io.github.mstrdav.bouncebox';

const DEBUG = true;

/**
 * Debug Logger
 */
const castDebugLogger = cast.debug.CastDebugLogger.getInstance();

/**
 * WARNING: Make sure to turn off debug logger for production release as it
 * may expose details of your app.
 * Uncomment below line to enable debug logger and show a 'DEBUG MODE' tag at
 * top left corner.
 */
castDebugLogger.setEnabled(DEBUG);

/**
 * Uncomment below line to show debug overlay.
 */
// castDebugLogger.showDebugLogs(DEBUG);

/**
 * Set verbosity level for Core events.
 */
castDebugLogger.loggerLevelByEvents = {
  'cast.framework.events.category.CORE': cast.framework.LoggerLevel.DEBUG,
  'cast.framework.events.category.REQUEST': cast.framework.LoggerLevel.DEBUG,
  'cast.framework.events.category.DEBUG': cast.framework.LoggerLevel.DEBUG,
  'cast.framework.events.category.FINE': cast.framework.LoggerLevel.DEBUG,
  'cast.framework.events.EventType.ALL': cast.framework.LoggerLevel.DEBUG,
  'cast.framework.system.EventType.SENDER_CONNECTED': cast.framework.LoggerLevel.DEBUG,
  'cast.framework.system.EventType.SENDER_DISCONNECTED': cast.framework.LoggerLevel.DEBUG,
};

if (!castDebugLogger.loggerLevelByTags) {
  castDebugLogger.loggerLevelByTags = {};
}

/**
 * Set verbosity level for custom tag.
 * Enables log messages for error, warn, info and debug.
 */
castDebugLogger.loggerLevelByTags[LOG_RECEIVER_TAG] =
  cast.framework.LoggerLevel.DEBUG;

// https://developers.google.com/cast/docs/reference/web_receiver/cast.framework.CastReceiverOptions#customNamespaces
const options = new cast.framework.CastReceiverOptions();
options.customNamespaces = {};
options.customNamespaces[namespace] = cast.framework.system.MessageType.JSON;
// options.disableIdleTimeout = true;

// custom message listener
// https://developers.google.com/cast/docs/reference/web_receiver/cast.framework.CastReceiverContext#addCustomMessageListener
const CML = (data) => {
  if (DEBUG) {
    console.log("custom listener");
    castDebugLogger.debug(LOG_RECEIVER_TAG,
      "Data1: " + JSON.stringify(data));
  }
  if (data.type != "message") {
    return;
  }

  const message = data.data;
  let messagePlace = document.getElementById("message");
  messagePlace.value += '\n' + message.myData;
}

context.addCustomMessageListener(namespace, CML);

// options.maxInactivity = 3600; //Development only
context.setLoggerLevel(cast.framework.LoggerLevel.DEBUG);
context.start(options);