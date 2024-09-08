const { back, obsStudioMode, website } = require('../lib/actions');
const { repeat } = require('../lib/arrays');
const { profile, folder } = require('../lib/profile');

/** @typedef {import('../lib/profile').Profiles} Profiles */

/** @type {function(Object): Profiles} */
module.exports = (argv) => {
  // Actions
  const openRepo = website({
    title: 'Open Repo',
    url: 'https://github.com/data-enabler/streamdeck-profile-generator',
  });
  const studioMode = obsStudioMode({ title: 'Studio\nMode' });

  // Profiles
  const folderProfile1 = profile({
    name: 'Folder 1',
    actions: [
      [back(), openRepo],
    ],
  });

  return {
    mainProfile: profile({
      name: 'Example',
      actions: [
        [folder(folderProfile1), null, studioMode],
        [...repeat(3, openRepo)],
      ],
    }),
    additionalProfiles: [folderProfile1],
  };
};
