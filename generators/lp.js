const { resolve, dirname } = require('path');

const { obsScene, back, obsStudioMode, open } = require('../lib/actions');
const { repeat } = require('../lib/arrays');
const { profile, folder } = require('../lib/profile');

const { detocsStopRecording, nextPromoHotkey, detocsScreenshot, detocsStartRecording, detocsClip15s, overlayToggle, prepActions, parseConfig } = require('./lp-common');

/** @typedef {import('../lib/profile').Profile} Profile */
/** @typedef {import('../lib/profile').Profiles} Profiles */
/** @typedef {import('./lp-common').LpConfig} LpConfig */

const DEVICE_WIDTH = 5;
const DEVICE_HEIGHT = 3;

/**
 * @param {{parsedConfig: LpConfig, configFile: string}} params
 * @returns {Profiles}
 */
function generateProfiles({
  parsedConfig: {
    name,
    eventName,
    twitchAccountId,
    obsCollection: collection,
    crossfadeScript,
    idleScene,
    commentaryScene = 'commentators',
    commentarySource,
    breakScene,
    endScene,
    games,
  },
  configFile,
}) {
  const defaultIdle = obsScene({ title: 'Idle', target: 'program', sceneName: idleScene });
  const brb = obsScene({ title: 'BRB', target: 'program', sceneName: breakScene });
  const goodbye = obsScene({ title: 'Goodbye', target: 'program', sceneName: endScene });
  const players = obsScene({ title: 'Players', target: 'program', sceneName: 'players' });
  const wideShot = obsScene({ title: 'Venue', target: 'program', sceneName: 'venue' });
  const commentary = obsScene({ title: 'Commentary', target: 'program', sceneName: commentaryScene });
  const info = obsScene({ title: 'Info', target: 'program', sceneName: 'info' });
  const promo = obsScene({ title: 'Promo', target: 'program', sceneName: 'promo' });
  const shill = obsScene({ title: 'Shill', target: 'program', sceneName: 'shill' });
  const replay = obsScene({ title: 'Replay', target: 'program', sceneName: 'replay' });
  const crossfade = crossfadeScript ? open({ title: 'Crossfade', path: resolve(dirname(configFile), crossfadeScript) }) : null;

  const toggleCommentators = overlayToggle({
    title: 'Toggle\nCommentator\nNames',
    obsCollection: collection,
    overlayScene: commentaryScene,
    overlaySource: commentarySource,
    overlayId: commentarySource ? undefined : 'commentators',
  });

  const prepActions1 = prepActions(
    games.slice(0, DEVICE_WIDTH),
    breakScene,
    twitchAccountId,
    eventName,
    detocsStopRecording()
  );
  const prepFolder1 = profile({ name: 'Prep', actions: prepActions1 });
  const prepActions2 = prepActions(
    games.slice(DEVICE_WIDTH, DEVICE_WIDTH * 2),
    breakScene,
    twitchAccountId,
    eventName,
    detocsStopRecording()
  );
  const prepFolder2 = profile({ name: 'Prep', actions: prepActions2 });
  const gameProfiles = games.map(game => {
    const scoreboard = obsScene({
      title: game.name,
      target: 'program',
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
      target: 'program',
      sceneName: game.idleScene,
    });
    const actions = [
      ...repeat(DEVICE_HEIGHT - 3, [null, replay, crossfade, obsStudioMode({})]),
      [players, commentary, toggleCommentators, promo, nextPromoHotkey()],
      [toggleScoreboard, wideShot, detocsStopRecording(), shill, detocsScreenshot()],
      [scoreboard, idle, detocsStartRecording(), info, detocsClip15s()],
    ];
    actions[0][0] = back();
    return profile({ name: game.name, actions });
  });

  const mainProfile = profile({
    name, actions: [
      [folder(prepFolder1), folder(prepFolder2), ...repeat(DEVICE_WIDTH - 5, null), detocsStopRecording(), brb, goodbye],
      ...repeat(DEVICE_HEIGHT - 3, []),
      gameProfiles.slice(DEVICE_WIDTH, DEVICE_WIDTH * 2).map(folder),
      gameProfiles.slice(0, DEVICE_WIDTH).map(folder),
    ]
  });

  return {
    mainProfile,
    additionalProfiles: [prepFolder1, prepFolder2, ...gameProfiles],
  };
}

module.exports = (argv) => generateProfiles(parseConfig(argv));
