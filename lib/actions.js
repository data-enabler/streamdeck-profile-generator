const { actionId } = require('./ids');

/**
 * @typedef {{
 *   "ActionID": string,
 *   "LinkedTitle": boolean,
 *   "Name": string,
 *   "Settings": Record<string, unknown> | null,
 *   "State": number,
 *   "States": {
 *     "FontFamily"?: string,
 *     "FontSize"?: number,
 *     "FontStyle"?: string,
 *     "FontUnderline"?: boolean,
 *     "OutlineThickness"?: number,
 *     "ShowTitle"?: boolean,
 *     "Title"?: string,
 *     "TitleAlignment"?: string,
 *     "TitleColor"?: string,
 *   }[],
 *   "UUID": string,
 * }} Action
 */

/**
 * @param {{
 *   title: string,
 *   sceneName: string,
 *   target: 'preview'|'program',
 * }} config
 * @returns {Action}
 */
function obsScene({
  title,
  sceneName,
  target,
}) {
  return action({
    name: 'Scene',
    title,
    uuid: 'com.elgato.obsstudio.scene',
    numStates: 2,
    state: 1,
    settings: {
      'scene': sceneName,
      'target': target,
    },
  });
}

/**
 * @param {{
 *   title: string,
 *   collection: string,
 *   sceneName: string,
 *   sourceName: string,
 *   itemId?: string,
 * }} config
 * @returns {Action}
 */
function obsSource({
  title,
  collection,
  sceneName,
  sourceName,
  itemId,
}) {
  return action({
    name: 'Source Visibility',
    title,
    uuid: 'com.elgato.obsstudio.source',
    numStates: 2,
    state: 0,
    settings: {
      'collection': collection,
      'scene': sceneName,
      'sceneitemid': itemId,
      'sceneitemname': sourceName,
      'sceneitemscene': sceneName,
      'toplevelscene': sceneName,
    },
  });
}

/**
 * @param {{
 *   title?: string,
 * }} config
 * @returns {Action}
 */
function obsStudioMode({
  title = 'Studio Mode',
}) {
  return action({
    name: 'Source Visibility',
    title,
    uuid: 'com.elgato.obsstudio.studiomode',
    numStates: 2,
    state: 1,
    settings: {},
  });
}

/**
 * @param {{
 *   title: string,
 *   accountId: string,
 *   streamTitle: string,
 *   streamGame: string,
 *   streamGameId?: string,
 * }} config
 * @returns {Action}
 */
function twitchTitle({
  title,
  accountId,
  streamTitle,
  streamGame,
  streamGameId,
}) {
  if (streamTitle.length > 50) {
    throw new Error(`Twitch title "${streamTitle}" is too long to set via Stream Deck`);
  }
  return action({
    name: 'Stream/Game Title',
    title,
    uuid: 'com.elgato.twitch.streamtitle',
    numStates: 1,
    state: 0,
    settings: {
      'accountId': accountId,
      'ChannelGameID': streamGameId,
      'ChannelGameTitle': streamGame,
      'ChannelStatus': streamTitle,
    },
  });
}

/**
 * @param {{
 *   title: string,
 *   url: string,
 *   method: string,
 *   body?: string,
 * }} config
 * @returns {Action}
 */
function webRequestHttp({
  title,
  url,
  method,
  body,
}) {
  return action({
    name: 'HTTP Request',
    title,
    uuid: 'gg.datagram.web-requests.http',
    numStates: 1,
    state: 0,
    settings: {
      'url': url,
      'method': method,
      'body': body,
    },
  });
}

/**
 * @param {{
 *   title: string,
 *   url: string,
 *   body: string,
 * }} config
 * @returns {Action}
 */
function webRequestWebSocket({
  title,
  url,
  body,
}) {
  return action({
    name: 'WebSocket Message',
    title,
    uuid: 'gg.datagram.web-requests.websocket',
    numStates: 1,
    state: 0,
    settings: {
      'url': url,
      'body': body,
    },
  });
}

/**
 * @param {{
 *   title: string,
 *   path: string,
 * }} config
 * @returns {Action}
 */
function open({
  title,
  path,
}) {
  return action({
    name: 'Open',
    title,
    uuid: 'com.elgato.streamdeck.system.open',
    numStates: 1,
    state: 0,
    settings: {
      'openInBrowser': true,
      'path': path,
    },
  });
}

/**
 * @param {{
 *   title: string,
 *   hotkey: {
 *     "KeyCmd": boolean,
 *     "KeyCtrl": boolean,
 *     "KeyModifiers": number,
 *     "KeyOption": boolean,
 *     "KeyShift": boolean,
 *     "NativeCode": number,
 *     "QTKeyCode": number,
 *     "VKeyCode": number,
 *   },
 * }} config
 * @returns {Action}
 */
function hotkey({
  title,
  hotkey,
}) {
  return action({
    name: 'Hotkey',
    title,
    uuid: 'com.elgato.streamdeck.system.hotkey',
    numStates: 1,
    state: 0,
    settings: {
      "Hotkeys": [
        hotkey,
        {
          "KeyCmd": false,
          "KeyCtrl": false,
          "KeyModifiers": 0,
          "KeyOption": false,
          "KeyShift": false,
          "NativeCode": 146,
          "QTKeyCode": 33554431,
          "VKeyCode": -1
        }
      ],
    },
  });
}

/**
 * @returns {Action}
 */
function back() {
  return action({
    name: 'Open Folder',
    title: '',
    uuid: 'com.elgato.streamdeck.profile.backtoparent',
    numStates: 1,
    state: 0,
    settings: null,
  });
}

/**
 * @param {{
 *   name: string,
 *   title?: string,
 *   uuid: string,
 *   numStates: number,
 *   state: number,
 *   settings: Record<string, unknown> | null,
 * }} config
 * @returns {Action}
 */
function action({
  name,
  title,
  uuid,
  numStates,
  state,
  settings,
}) {
  return {
    'ActionID': actionId(),
    'LinkedTitle': false,
    'Name': name,
    'Settings': settings,
    'State': state,
    'States': Array.from({length: numStates}, () => ({
      'Title': title,
    })),
    'UUID': uuid,
  };
}

module.exports = {
  obsScene,
  obsSource,
  obsStudioMode,
  twitchTitle,
  webRequestHttp,
  webRequestWebSocket,
  open,
  hotkey,
  back,
  action,
};
