const { readFileSync } = require('fs');
const { exit } = require('process');
const {
  profile,
  folder,
  obsScene,
  obsSource,
  back,
  hotkey,
  twitchTitle,
  webRequestHttp,
  webRequestWebSocket
} = require('./lib');
const { writeToDisk } = require('./writeToDisk');

/** @typedef {import('./lib').Profile} Profile */
/** @typedef {import('./lib').Action} Action */

/**
 * @param {{
 *   name: string,
 *   eventName: string,
 *   twitchAccountId: string,
 *   obsCollection: string,
 *   idleScene: string,
 *   commentaryScene?: string,
 *   commentarySource?: string,
 *   breakScene: string,
 *   endScene: string,
 *   games: {
 *     name: string,
 *     title: string,
 *     scoreboardId?: string,
 *     twitchId: string,
 *     scoreboardScene: string,
 *     scoreboardSource?: string,
 *     idleScene?: string,
 *     breakScene?: string,
 *   }[];
 * }} config
 * @returns {{
 *   mainProfile: Profile,
 *   additionalProfiles: Profile[],
 * }}
 */
function generateProfiles({
  name,
  eventName,
  twitchAccountId,
  obsCollection,
  idleScene,
  commentaryScene = 'commentators',
  commentarySource,
  breakScene,
  endScene,
  games,
}) {
  const defaultIdle = obsScene({
    title: 'Idle',
    collection: obsCollection,
    sceneName: idleScene,
  });
  const brb = obsScene({
    title: 'BRB',
    collection: obsCollection,
    sceneName: breakScene,
  });
  const goodbye = obsScene({
    title: 'Goodbye',
    collection: obsCollection,
    sceneName: endScene,
  });
  const wideShot = obsScene({
    title: 'Venue',
    collection: obsCollection,
    sceneName: 'venue',
  });
  const commentary = obsScene({
    title: 'Commentary',
    collection: obsCollection,
    sceneName: commentaryScene || 'commentators',
  });
  const info = obsScene({
    title: 'Info',
    collection: obsCollection,
    sceneName: 'info',
  });
  const promo = obsScene({
    title: 'Promo',
    collection: obsCollection,
    sceneName: 'promo',
  });
  const shill = obsScene({
    title: 'Shill',
    collection: obsCollection,
    sceneName: 'shill',
  });
  const toggleCommentators = overlayToggle({
    title: 'Toggle\nCommentator\nNames',
    obsCollection,
    overlayScene: commentaryScene,
    overlaySource: commentarySource,
    overlayId: commentarySource ? undefined : 'commentators',
  });
  const startRecording = webRequestHttp({
    title: 'Start\nRecording',
    method: 'GET',
    url: 'http://localhost:58587/start',
  });
  const stopRecording = webRequestHttp({
    title: 'Stop\nRecording',
    method: 'GET',
    url: 'http://localhost:58587/stop',
  });
  const clip = webRequestHttp({
    title: 'Clip',
    method: 'GET',
    url: 'http://localhost:58590/clip?seconds=15',
  });
  const screenshot = webRequestHttp({
    title: 'Screenshot',
    method: 'GET',
    url: 'http://localhost:58590/screenshot',
  });
  const nextPromo = hotkey({
    title: 'Next\nPromotion',
    hotkey: {
      "KeyCmd": false,
      "KeyCtrl": false,
      "KeyModifiers": 4,
      "KeyOption": true,
      "KeyShift": false,
      "NativeCode": 221,
      "QTKeyCode": 93,
      "VKeyCode": 221
    },
  });

  const prepActions1 = prepActions(
    games.slice(0, 5),
    obsCollection,
    breakScene,
    twitchAccountId,
    eventName,
    stopRecording,
  );
  const prepFolder1 = profile({ name: 'Prep', actions: prepActions1});
  const prepActions2 = prepActions(
    games.slice(5, 10),
    obsCollection,
    breakScene,
    twitchAccountId,
    eventName,
    stopRecording,
  );
  const prepFolder2 = profile({ name: 'Prep', actions: prepActions2});
  const gameProfiles = games.map(game => {
    const scoreboard = obsScene({
      title: game.name,
      collection: obsCollection,
      sceneName: game.scoreboardScene,
    });
    const toggleScoreboard = overlayToggle({
      title: 'Toggle\nScorebaord',
      obsCollection,
      overlayScene: game.scoreboardScene,
      overlaySource: game.scoreboardSource,
      overlayId: game.scoreboardId,
    });
    const idle = !game.idleScene ? defaultIdle : obsScene({
      title: 'Idle',
      collection: obsCollection,
      sceneName: game.idleScene,
    });
    return profile({ name: game.name, actions: [
      [ back(), commentary, toggleCommentators, promo, nextPromo ],
      [ toggleScoreboard, wideShot, stopRecording, shill, screenshot ],
      [ scoreboard, idle, startRecording, info, clip ],
    ]});
  });

  const mainProfile = profile({ name, actions: [
    [folder(prepFolder1), folder(prepFolder2), stopRecording, brb, goodbye],
    gameProfiles.slice(5, 10).map(folder),
    gameProfiles.slice(0, 5).map(folder),
  ]});

  return {
    mainProfile,
    additionalProfiles: [ prepFolder1, prepFolder2, ...gameProfiles ],
  };
}

/**
 * @param {{
 *   title: string,
 *   obsCollection: string,
 *   overlayScene: string,
 *   overlaySource?: string,
 *   overlayId?: string,
 * }} params
 * @returns {Action|null}
 */
function overlayToggle({
  title,
  obsCollection,
  overlayScene,
  overlaySource,
  overlayId,
}) {
  return overlayId && webRequestWebSocket({
      title,
      url: 'ws://localhost:58585',
      body: JSON.stringify({ 'namespace': overlayId, 'type': 'toggle' }, null, 2)
    })
    || overlaySource && obsSource({
      title,
      collection: obsCollection,
      sceneName: overlayScene,
      sourceName: overlaySource
    })
    || null;
}

function prepActions(games, obsCollection, breakScene, twitchAccountId, eventName, stopRecording) {
  const prepActions = transpose(
    games.map((game, index) => {
      const gameBreak = obsScene({
        title: `Pre-${game.name}`,
        collection: obsCollection,
        sceneName: game.breakScene || breakScene,
      });
      const twitchUpdate = twitchTitle({
        title: game.name,
        accountId: twitchAccountId,
        streamTitle: `${eventName}: ${game.title}`,
        streamGame: game.twitchId,
      });
      return [null, gameBreak, twitchUpdate];
    })
  );
  if (prepActions.length == 0) {
    prepActions[0] = [];
  }
  prepActions[0][0] = back();
  prepActions[0][4] = stopRecording;
  return prepActions;
}

/**
 * @template {unknown[][]} T
 * @param {T} matrix
 * @returns {T}
 */
function transpose(matrix) {
  if (matrix.length == 0) {
    return matrix;
  }
  return /** @type {T} */(matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex])));
}

const configFile = process.argv[2];
if (!configFile) {
  console.error('Please provide a path to a config file');
  exit(1);
}
const config = JSON.parse(readFileSync(configFile, { encoding: 'utf8'}));
const profiles = generateProfiles(config);
writeToDisk(profiles);
