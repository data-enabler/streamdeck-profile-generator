const { createWriteStream } = require('fs');

const JsZip = require('jszip');

const { profileFolderId } = require('./ids');
const { topLevelManifest } = require('./profile');

/** @typedef {import('./profile').Profile} Profile */
/** @typedef {import('./profile').Profiles} Profiles */

/**
 * @param {Profiles} profiles
 */
async function writeToDisk({
  mainProfile, additionalProfiles,
}) {
  const zip = new JsZip();
  const rootDir = zip.folder(`${mainProfile.uuid}.sdProfile`);
  assertNotNull(rootDir);
  rootDir.file('manifest.json', JSON.stringify(topLevelManifest(mainProfile)));
  const profilesDir = rootDir.folder('Profiles');
  assertNotNull(profilesDir);
  for (const profile of [mainProfile, ...additionalProfiles]) {
    const profileDir = profilesDir.folder(profileFolderId(profile.uuid));
    assertNotNull(profileDir);
    profileDir.file('manifest.json', JSON.stringify(profile.manifest));
  }
  const filename = `${mainProfile.name}.streamDeckProfile`;
  zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
    // @ts-ignore This is what jszip's documentation says to do, and it works
    .pipe(createWriteStream(filename))
    .on('finish', () => console.log(`${filename} created`));
}

/**
 * @param {JsZip | null} x
 * @returns {asserts x is JsZip}
 */
function assertNotNull(x) {
  if (x == null) {
    throw new Error();
  }
}

module.exports = {
  writeToDisk,
};
