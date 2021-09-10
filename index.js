const { mkdirSync, writeFileSync, readFileSync } = require('fs');
const { join } = require('path');
const { exit } = require('process');
const {
  profile,
  folder,
  obsScene,
  back,
  hotkey,
  twitchTitle,
  webRequestHttp,
  webRequestWebSocket
} = require('./lib');

/** @typedef {import('./lib').Profile} Profile */
/** @typedef {import('./lib').Action} Action */

/**
 * @param {{
 *   name: string,
 *   eventName: string,
 *   twitchAccountId: string,
 *   obsCollection: string,
 *   idleScene: string,
 *   breakScene: string,
 *   endScene: string,
 *   games: {
 *     name: string,
 *     title: string,
 *     scoreboardId: string,
 *     twitchId: string,
 *     scoreboardScene: string,
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
    sceneName: 'commentators',
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
  const toggleCommentators = webRequestWebSocket({
    title: 'Toggle\nCommentator\nNames',
    url: 'ws://localhost:58585',
    body: JSON.stringify({ 'namespace': 'commentators', 'type': 'toggle' }, null, 2),
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

  const prepActions = transpose(
    games.slice(0, 5).map((game, index) => {
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
      })
      return [ null, gameBreak, twitchUpdate ];
    })
  );
  prepActions[0][0] = back();
  const prepFolder = profile({ name: 'Prep', actions: prepActions});
  const gameProfiles = games.map(game => {
    const scoreboard = obsScene({
      title: game.name,
      collection: obsCollection,
      sceneName: game.scoreboardScene,
    });
    const toggleScoreboard = webRequestWebSocket({
      title: 'Toggle\nScorebaord',
      url: 'ws://localhost:58585',
      body: JSON.stringify({ 'namespace': game.scoreboardId, 'type': 'toggle' }, null, 2),
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
    [folder(prepFolder), wideShot, brb, goodbye],
    gameProfiles.slice(5, 10).map(folder),
    gameProfiles.slice(0, 5).map(folder),
  ]});

  return {
    mainProfile,
    additionalProfiles: [ prepFolder, ...gameProfiles ],
  };
}

/**
 * @template {unknown[][]} T
 * @param {T} matrix
 * @returns {T}
 */
function transpose(matrix) {
  return /** @type {T} */(matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex])));
}

/**
 * @param {{
 *   mainProfile: Profile,
 *   additionalProfiles: Profile[],
 * }} profiles
 */
function writeToDisk({
  mainProfile,
  additionalProfiles,
}) {
  const rootDir = `${mainProfile.uuid}.sdProfile`;
  const profilesDir = join(rootDir, 'Profiles');
  mkdirSync(rootDir);
  mkdirSync(profilesDir);
  writeFileSync(join(rootDir, 'manifest.json'), JSON.stringify(mainProfile.manifest));
  for (const profile of additionalProfiles) {
    const profileDir = join(profilesDir, `${profile.uuid}.sdProfile`);
    mkdirSync(profileDir);
    writeFileSync(join(profileDir, 'manifest.json'), JSON.stringify(profile.manifest));
  }
}

const configFile = process.argv[2];
if (!configFile) {
  console.error('Please provide a path to a config file');
  exit(1);
}
const config = JSON.parse(readFileSync(configFile, { encoding: 'utf8'}));
const profiles = generateProfiles(config);
writeToDisk(profiles);
