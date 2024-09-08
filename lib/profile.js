/**
 * @fileoverview Types and helper functions for Stream Deck profiles
 */

const { action } = require('./actions');
const { profileId } = require('./ids');

/** @typedef {import('./actions').Action} Action */

/**
 * @typedef {{
 *   "Controllers": {
 *     "Actions": Record<string, Action>,
 *     "Type": "Keypad",
 *   }[],
 * }} ProfileManifest
 */

/**
 * @typedef {{
 *   name: string,
 *   manifest: ProfileManifest,
 *   uuid: string,
 * }} Profile - can be created with the profile() function
 */

/**
 * @typedef {Object} Profiles
 * @property {Profile} mainProfile - the base layout
 * @property {Profile[]} additionalProfiles - all of the layouts that are referenced via folders
 */

/**
 * @typedef {{
 *   "Device"?: {
 *     "Model": string,
 *     "UUID": ''
 *   },
 *   "Name": string,
 *   "Pages": {
 *     "Current": string,
 *     "Pages": string[],
 *   },
 *   "Version": '2.0'
 * }} TopLevelManifest
 */

/**
 * @param {Profile} profile
 * @returns {Action}
 */
function folder(profile) {
  return action({
    name: 'Create Folder',
    title: profile.name,
    uuid: 'com.elgato.streamdeck.profile.openchild',
    numStates: 1,
    state: 0,
    settings: {
      'ProfileUUID': profile.uuid,
    },
  });
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
  /** @type {Record<string, Action>} */
  const byCoordinate = {};
  actions.forEach((row, rowNum) => {
    row.forEach((action, colNum) => {
      if (!action) {
        return;
      }
      byCoordinate[`${colNum},${rowNum}`] = action;
    });
  });
  return {
    name,
    uuid: profileId(),
    manifest: {
      'Controllers': [
        {
          'Actions': byCoordinate,
          'Type': 'Keypad',
        },
      ],
    },
  };
}

/**
 * @param {Profile} mainProfile
 * @returns {TopLevelManifest}
 */
function topLevelManifest(mainProfile) {
  return {
    "Name": mainProfile.name,
    "Pages": {
      "Current": mainProfile.uuid,
      "Pages": [
        mainProfile.uuid,
      ],
    },
    "Version": "2.0",
  }
}

module.exports = {
  folder,
  profile,
  topLevelManifest,
}
