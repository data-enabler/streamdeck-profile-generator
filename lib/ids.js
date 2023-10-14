const crypto = require("crypto");

/**
 * @returns {string}
 */
function actionId() {
  // These were the the IDs in a profile I exported, so I guess they don't matter?
  return '00000000-0000-0000-0000-000000000000';
}

/**
 * @returns {string}
 */
function profileId() {
  return uuidV4();
}

/**
 * @param {string} profileId
 * @returns {string}
 */
function profileFolderId(profileId) {
  return ((profileId.replace(/-/g, '')+'000') // remove hyphens and pad length to be divisible by 5 bits
    .match(/.{5}/g) || []) // split into groups of 5 digits, since JS can't represent integers larger than 53 bits
    .map(s => parseInt(s, 16).toString(32).padStart(4, '0')) // convert to base32
    .join('')
    .substring(0, 26) // remove padding we added earlier
    .toUpperCase()
    .replace(/V/g, 'W')
    .replace(/U/g, 'V')
    +'Z' // all folder ids end in this suffix
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
  actionId,
  profileId,
  profileFolderId,
  uuidV4,
};
