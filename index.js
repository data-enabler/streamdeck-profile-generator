#!/usr/bin/env node
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

const detocsStartRecording = webRequestHttp({
  title: 'Start\nRecording',
  method: 'GET',
  url: 'http://localhost:58587/start',
});
const detocsStopRecording = webRequestHttp({
  title: 'Stop\nRecording',
  method: 'GET',
  url: 'http://localhost:58587/stop',
});
const detocsClip15s = webRequestHttp({
  title: 'Clip',
  method: 'GET',
  url: 'http://localhost:58590/clip?seconds=15',
});
const detocsScreenshot = webRequestHttp({
  title: 'Screenshot',
  method: 'GET',
  url: 'http://localhost:58590/screenshot',
});
const nextPromoHotkey = hotkey({
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
  obsCollection: collection,
  idleScene,
  commentaryScene = 'commentators',
  commentarySource,
  breakScene,
  endScene,
  games,
}) {
  const defaultIdle = obsScene({ title: 'Idle', collection, sceneName: idleScene });
  const brb = obsScene({ title: 'BRB', collection, sceneName: breakScene });
  const goodbye = obsScene({ title: 'Goodbye', collection, sceneName: endScene });
  const wideShot = obsScene({ title: 'Venue', collection, sceneName: 'venue' });
  const commentary = obsScene({ title: 'Commentary', collection, sceneName: commentaryScene });
  const info = obsScene({ title: 'Info', collection, sceneName: 'info' });
  const promo = obsScene({ title: 'Promo', collection, sceneName: 'promo' });
  const shill = obsScene({ title: 'Shill', collection, sceneName: 'shill' });

  const toggleCommentators = overlayToggle({
    title: 'Toggle\nCommentator\nNames',
    obsCollection: collection,
    overlayScene: commentaryScene,
    overlaySource: commentarySource,
    overlayId: commentarySource ? undefined : 'commentators',
  });

  const prepActions1 = prepActions(
    games.slice(0, 5),
    collection,
    breakScene,
    twitchAccountId,
    eventName,
    detocsStopRecording,
  );
  const prepFolder1 = profile({ name: 'Prep', actions: prepActions1});
  const prepActions2 = prepActions(
    games.slice(5, 10),
    collection,
    breakScene,
    twitchAccountId,
    eventName,
    detocsStopRecording
  );
  const prepFolder2 = profile({ name: 'Prep', actions: prepActions2});
  const gameProfiles = games.map(game => {
    const scoreboard = obsScene({
      title: game.name,
      collection,
      sceneName: game.scoreboardScene,
    });
    const toggleScoreboard = overlayToggle({
      title: 'Toggle\nScorebaord',
      obsCollection: collection,
      overlayScene: game.scoreboardScene,
      overlaySource: game.scoreboardSource,
      overlayId: game.scoreboardId,
    });
    const idle = !game.idleScene ? defaultIdle : obsScene({
      title: 'Idle',
      collection,
      sceneName: game.idleScene,
    });
    return profile({ name: game.name, actions: [
      [ back(), commentary, toggleCommentators, promo, nextPromoHotkey ],
      [ toggleScoreboard, wideShot, detocsStopRecording, shill, detocsScreenshot ],
      [ scoreboard, idle, detocsStartRecording, info, detocsClip15s ],
    ]});
  });

  const mainProfile = profile({ name, actions: [
    [folder(prepFolder1), folder(prepFolder2), detocsStopRecording, brb, goodbye],
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
function fiveASide({
  name,
  obsCollection: collection,
  idleScene,
  commentaryScene = 'commentators',
  commentarySource,
  breakScene,
  endScene,
  games,
}) {
  const teamNyCards = [
    [ 'B RICH', '4' ],
    [ 'FEAR', '7' ],
    [ 'HAEZL', '12' ],
    [ 'MR FLUBBS', '9' ],
    [ 'PEPPERBEEF2SPICY', '10' ],
  ];
  const teamAtlCards = [
    [ 'ABSTRACT', '3' ],
    [ 'DEUTSCHNOZZLE', '5' ],
    [ 'DEZ IS TRASH', '6' ],
    [ 'GENGHIS DON', '8' ],
    [ 'RUNITBACKEDDIE', '11' ],
  ];

  /**
   * @param {[string, string]} nameAndId
   * @returns {Action}
   */
  function playerCard(nameAndId) {
    return obsSource({
      title: nameAndId[0],
      collection,
      sceneName: "player cards",
      sourceName: nameAndId[0],
      itemId: nameAndId[1],
    });
  }

  const idle = obsScene({ title: 'Idle', collection, sceneName: idleScene });
  const player1 = obsScene({ title: 'Player 1', collection, sceneName: 'player 1' });
  const player2 = obsScene({ title: 'Player 2', collection, sceneName: 'player 2' });
  const wideShot = obsScene({ title: 'Wide', collection, sceneName: 'players' });
  const venue = obsScene({ title: 'Venue', collection, sceneName: 'venue' });
  const commentary = obsScene({ title: 'Commentary', collection, sceneName: commentaryScene || 'commentators' });
  const info = obsScene({ title: 'Info', collection, sceneName: 'info' });
  const cards = obsScene({ title: 'Cards', collection, sceneName: 'player cards' });
  const promo = obsScene({ title: 'Promo', collection, sceneName: 'promo' });
  const promoVid = obsScene({ title: 'Promo\nVid', collection, sceneName: 'promo video' });
  const announce = obsScene({ title: 'Announce', collection, sceneName: 'announcement' });
  const brb = obsScene({ title: 'Break', collection, sceneName: breakScene });
  const goodbye = obsScene({ title: 'Goodbye', collection, sceneName: endScene });

  const toggleCommentators = overlayToggle({
    title: 'Toggle\nCommentator\nNames',
    obsCollection: collection,
    overlayScene: commentaryScene,
    overlaySource: commentarySource,
    overlayId: commentarySource ? undefined : 'commentators',
  });

  const game = games[0];
  const scoreboard = obsScene({
    title: game.name,
    collection,
    sceneName: game.scoreboardScene,
  });
  const toggleScoreboard = overlayToggle({
    title: 'Toggle\nScorebaord',
    obsCollection: collection,
    overlayScene: game.scoreboardScene,
    overlaySource: game.scoreboardSource,
    overlayId: game.scoreboardId,
  });

  const mainProfile = profile({ name, actions: [
    [ player1, player2, null, ...teamNyCards.map(playerCard)],
    [ venue, commentary, toggleCommentators, ...teamAtlCards.map(playerCard)],
    [ toggleScoreboard, wideShot, detocsStopRecording, info, cards, promo, promoVid, nextPromoHotkey ],
    [ scoreboard, idle, detocsStartRecording, detocsClip15s, detocsScreenshot, announce, brb, goodbye ],
  ]});

  return {
    mainProfile,
    additionalProfiles: [],
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

const generators = {
  "fiveASide": fiveASide
};
let generateFn = generateProfiles;
const generatorName = process.argv[3];
if (generatorName) {
  generateFn = generators[generatorName];
  if (!generateFn) {
    console.error(`Generation function ${generatorName} not found`);
    exit(1);
  }
}

const config = JSON.parse(readFileSync(configFile, { encoding: 'utf8'}));
const profiles = generateFn(config);
writeToDisk(profiles);
