const crypto = require('crypto');

/** @typedef {Record<string, unknown>} Action */
/**
 * @typedef {Record<string, unknown> & {
 *   "Name": string,
 *   "Actions": Record<string, Action>,
 * }} Manifest
 */
/**
 * @typedef {{
 *   manifest: Manifest,
 *   uuid: string,
 * }} Profile
 */

/**
 * @param {{
 *   title: string,
 *   collection: string,
 *   sceneName: string,
 * }} config
 * @returns {Action}
 */
function obsScene({
  title,
  collection,
  sceneName,
}) {
  return action({
    name: 'Scene',
    title,
    uuid: 'com.elgato.streamdeck.obs.scene',
    numStates: 2,
    state: 1,
    settings: {
      'sceneCollection': collection,
      'sceneId': collection + sceneName,
      'sceneItemId': '',
      'sourceId': ''
    },
  });
}

/**
 * @param {{
 *   title: string,
 *   collection: string,
 *   sceneName: string,
 *   sourceName: string,
 * }} config
 * @returns {Action}
 */
function obsSource({
  title,
  collection,
  sceneName,
  sourceName,
}) {
  return action({
    name: 'Scene',
    title,
    uuid: 'com.elgato.streamdeck.obs.source',
    numStates: 2,
    state: 0,
    settings: {
      'sceneCollection': collection,
      'sceneId': collection + sceneName,
      'sceneItemId': '',
      'sourceId': collection + sourceName,
    },
  });
}

/**
 * @param {{
 *   title: string,
 *   accountId: string,
 *   streamTitle: string,
 *   streamGame: string,
 * }} config
 * @returns {Action}
 */
function twitchTitle({
  title,
  accountId,
  streamTitle,
  streamGame,
}) {
  return action({
    name: 'Stream/Game Title',
    title,
    uuid: 'com.elgato.twitch.streamtitle',
    numStates: 1,
    state: 0,
    settings: {
      'accountId': accountId,
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
 * @param {Profile} profile
 * @returns {Action}
 */
function folder(profile) {
  return action({
    name: 'Create Folder',
    title: profile.manifest.Name,
    uuid: 'com.elgato.streamdeck.profile.openchild',
    numStates: 1,
    state: 0,
    settings: {
      'ProfileUUID': profile.uuid,
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
 *   title: string,
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
    'Name': name,
    'Settings': settings,
    'State': state,
    'States': Array.from({length: numStates}, () => ({
      'FFamily': '',
      'FSize': '',
      'FStyle': '',
      'FUnderline': '',
      'Image': '',
      'Title': title,
      'TitleAlignment': 'top',
      'TitleColor': '',
      'TitleShow': ''
    })),
    'UUID': uuid,
  };
}

/**
 * @param {{
 *   name: string,
 *   actions: (Action | null | undefined)[][]
 * }} config
 * @returns {Profile}
 */
function profile({
  name,
  actions,
}) {
  /** @type {Manifest} */
  const manifest = {
    'Name': name,
    'Actions': {},
  };
  actions.forEach((row, rowNum) => {
    row.forEach((action, colNum) => {
      if (!action) {
        return;
      }
      manifest['Actions'][`${colNum},${rowNum}`] = action;
    });
  });
  return {
    manifest,
    uuid: uuidV4(),
  };
}

/**
 * Less-cryptic version of
 * https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript/2117523#2117523
 * @returns {string}
 */
function uuidV4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.randomFillSync(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

module.exports = {
  obsScene,
  obsSource,
  twitchTitle,
  webRequestHttp,
  webRequestWebSocket,
  open,
  hotkey,
  folder,
  back,
  profile,
};
