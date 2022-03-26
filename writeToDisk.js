const JsZip = require('jszip');
const { createWriteStream } = require('fs');

/** @typedef {import('./lib').Profile} Profile */

/**
 * @param {{
 *   mainProfile: Profile,
 *   additionalProfiles: Profile[],
 * }} profiles
 */
async function writeToDisk({
  mainProfile, additionalProfiles,
}) {
  const zip = new JsZip();
  const rootDir = zip.folder(`${mainProfile.uuid}.sdProfile`);
  assertNotNull(rootDir);
  rootDir.file('manifest.json', JSON.stringify(mainProfile.manifest));
  const profilesDir = rootDir.folder('Profiles');
  assertNotNull(profilesDir);
  for (const profile of additionalProfiles) {
    const profileDir = profilesDir.folder(`${profile.uuid}.sdProfile`);
    assertNotNull(profileDir);
    profileDir.file('manifest.json', JSON.stringify(profile.manifest));
  }
  const filename = `${mainProfile.manifest.Name}.streamDeckProfile`;
  zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
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

exports.writeToDisk = writeToDisk;
