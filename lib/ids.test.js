const assert = require('assert');
const { profileFolderId } = require('./ids');

/**
 * Elgato staff refuse to elaborate on how these hashes are generated [1], so we
 * have to reverse-engineer the folder name encoding and test against IDs pulled
 * from exported profiles.
 *
 * Honestly, I don't know what was wrong with their old method of just using the
 * UUID as the folder name.
 *
 * [1]: https://www.reddit.com/r/StreamDeckSDK/comments/10w512n/inside_a_streamdeckprofile_file/
 */
const PROFILE_ID_HASHES = {
  '33860c96-e0d7-48dd-a8cc-471a027a4822': '6E30P5N0QT4DRA6C8SD04VI848Z',
  'e4f228ae-b631-4b80-a552-76f65595373e': 'SJP2HBLM655O19AIERR5B59N7OZ',
  '0767bac7-4a41-40c3-bdf9-921c2f20ff97': '0TJRLHQA850C7FFPI8E2V87WISZ',
  'ff328353-96b5-42ac-b90c-8c63c2a397cb': 'WSP86KSMML1APE8CHHHS58SNPCZ',
  '32270b97-45f4-4ba4-9e91-b67277d7ef22': '68JGN5Q5VH5Q97KHMPP7FLWF48Z',
  'd8efb2ec-7317-4fc0-9153-52ca5e22eede': 'R3NR5R3J2T7S14AJAB55S8NEROZ',
  '8bd54075-e1e1-4cd4-98c0-75509b029b43': 'HFAK0TF1S56D9660EL89M0KR8CZ',
  '5abecb50-4b82-4e9e-a087-1fc3bc990deb': 'BAWCMK2BG979T8473W1RP68DTCZ',
  '74e4444c-9eae-4d7e-95df-f21b1e3ac26a': 'EJI48J4VLP6NT5EWV8DHSEM2D8Z',
};

for (const [uuid, hash] of Object.entries(PROFILE_ID_HASHES)) {
  assert.strictEqual(profileFolderId(uuid), hash);
}
