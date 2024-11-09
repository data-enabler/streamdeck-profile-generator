const { readFileSync } = require('fs');
const path = require('path');

const { webRequestWebSocket, obsSource, obsScene, twitchTitle, back, webRequestHttp, hotkey } = require('../lib/actions');
const { transpose } = require('../lib/arrays');

/** @typedef {import('../lib/actions').Action} Action */
/** @typedef {import('../lib/profile').Profiles} Profiles */

/**
 * @typedef {{
 *   name: string;
 *   deviceWidth: number;
 *   deviceHeight: number;
 *   eventName: string;
 *   twitchAccountId: string;
 *   obsCollection: string;
 *   crossfadeScript?: string;
 *   idleScene: string;
 *   commentaryScene?: string;
 *   commentarySource?: string;
 *   breakScene: string;
 *   endScene: string;
 *   games: {
 *       name: string;
 *       title: string;
 *       scoreboardId?: string;
 *       twitchId: string;
 *       twitchGameId?: string;
 *       scoreboardScene: string;
 *       scoreboardSource?: string;
 *       idleScene?: string;
 *       breakScene?: string;
 *   }[];
 * }} LpConfig
 */

const detocsStartRecording = () => webRequestHttp({
  title: 'Start\nRecording',
  method: 'POST',
  url: 'http://localhost:58587/start',
});

const detocsStopRecording = () => webRequestHttp({
  title: 'Stop\nRecording',
  method: 'POST',
  url: 'http://localhost:58587/stop',
});

const detocsStartGroup = () => webRequestHttp({
  title: 'Start\nGroup',
  method: 'POST',
  url: 'http://localhost:58587/startGroup',
});

const detocsEndGroup = () => webRequestHttp({
  title: 'End\nGroup',
  method: 'POST',
  url: 'http://localhost:58587/endGroup',
});

const detocsClip15s = () => webRequestHttp({
  title: 'Clip',
  method: 'POST',
  url: 'http://localhost:58590/clip?seconds=15',
});

const detocsScreenshot = () => webRequestHttp({
  title: 'Screenshot',
  method: 'POST',
  url: 'http://localhost:58590/screenshot',
});

const detocsIncrementP1 = () => webRequestHttp({
  title: 'P1++',
  method: 'POST',
  url: 'http://localhost:58586/incrementScore?player=1',
});

const detocsIncrementP2 = () => webRequestHttp({
  title: 'P2++',
  method: 'POST',
  url: 'http://localhost:58586/incrementScore?player=2',
});

const nextPromoHotkey = () => hotkey({
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

/**
 * @param {{
 *   name: string,
 *   title: string,
 *   scoreboardId?: string,
 *   twitchId: string,
 *   twitchGameId?: string,
 *   scoreboardScene: string,
 *   scoreboardSource?: string,
 *   idleScene?: string,
 *   breakScene?: string,
 * }[]} games
 * @param {string} breakScene
 * @param {string} twitchAccountId
 * @param {string} eventName
 * @param {Action} stopRecording
 * @returns {(Action | null)[][]}
 */
function prepActions(games, breakScene, twitchAccountId, eventName, stopRecording) {
  const prepActions = transpose(
    games.map((game) => {
      const gameBreak = obsScene({
        title: `Pre-${game.name}`,
        target: 'program',
        sceneName: game.breakScene || breakScene,
      });
      const twitchUpdate = twitchTitle({
        title: game.name,
        accountId: twitchAccountId,
        streamTitle: `${eventName}: ${game.title}`,
        streamGame: game.twitchId,
        streamGameId: game.twitchGameId,
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
 * @param {Object} argv
 * @return {{parsedConfig: LpConfig, configFile: string}}
 */
function parseConfig(argv) {
  const { config } = argv;
  if (typeof config !== 'string') {
    throw new Error('--config must be provided');
  }
  console.log(`Using config ${path.resolve(config)}`);
  /** @type {LpConfig} */
  const parsedConfig = JSON.parse(readFileSync(config, { encoding: 'utf8'}));
  return {parsedConfig, configFile: config};
}

module.exports = {
  detocsStartRecording,
  detocsStopRecording,
  detocsStartGroup,
  detocsEndGroup,
  detocsClip15s,
  detocsScreenshot,
  detocsIncrementP1,
  detocsIncrementP2,
  nextPromoHotkey,
  overlayToggle,
  prepActions,
  parseConfig,
};
