#!/usr/bin/env node
const { hideBin } = require('yargs/helpers')
const yargs = require('yargs/yargs');

const path = require('path');

const { writeToDisk } = require('./lib/writeToDisk');

/** @typedef {import('./lib/profile').Profiles} Profiles */

yargs(hideBin(process.argv))
  .command(['run <generator>', '$0'], 'run a generator script', {}, argv => {
    try {
      const generatorPath = path.resolve(/** @type {string} */(argv.generator));
      console.log(`Loading ${generatorPath}`);
      const relativePath = path.relative(__dirname, generatorPath);
      /** @type {function(Object): Profiles} */
      const fn = require('.' + path.sep + relativePath);
      const profiles = fn(argv);
      writeToDisk(profiles);
    } catch(err) {
      console.error(err);
    }
  })
  .parse();
