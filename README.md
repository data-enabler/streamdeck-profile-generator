# streamdeck-profile-generator

This is a proof-of-concept app for programmatically generating Elgato Stream Deck profiles.

## Installation

This is a [Node.js](https://nodejs.org) project; before you can use this script, you must install its dependencies by running the following after cloning/downloading this repository:

```npm install```

## Usage

In order to use the generator, you must write a JavaScript module that provides your profile data.
Your module should export a single function that returns a `Profiles` object (see [profile.js](lib/profile.js) for what fields this object requires).
There are example scripts in the [generators](generators) directory.

Run the generator like so:

```node index.js [path-to-your-generator-script]```

(Advanced usage): Any additional command line arguments that are included when running the generator will be passed to your function as an object.
This is useful if you want to make your script configurable at runtime.

After generating the profile, simply double-click the resulting `.streamDeckProfile` file to load it.

## Examples

Simple example:

```node index.js generators\simple-example.js```

More complex real-world example with a script used by Lunar Phase:

```node index.js generators\lp.js --config example.json```
