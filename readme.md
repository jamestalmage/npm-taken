# npm-taken 

Find out if a module name is already in the npm registry.

[![Build Status](https://travis-ci.org/jamestalmage/npm-taken.svg?branch=master)](https://travis-ci.org/jamestalmage/npm-taken)
[![Coverage Status](https://coveralls.io/repos/jamestalmage/npm-taken/badge.svg?branch=master&service=github)](https://coveralls.io/github/jamestalmage/npm-taken?branch=master)
[![Code Climate](https://codeclimate.com/github/jamestalmage/npm-taken/badges/gpa.svg)](https://codeclimate.com/github/jamestalmage/npm-taken)
[![Dependency Status](https://david-dm.org/jamestalmage/npm-taken.svg)](https://david-dm.org/jamestalmage/npm-taken)
[![devDependency Status](https://david-dm.org/jamestalmage/npm-taken/dev-status.svg)](https://david-dm.org/jamestalmage/npm-taken#info=devDependencies)

[![NPM](https://nodei.co/npm/npm-taken.png)](https://nodei.co/npm/npm-taken/)

## Usage

```js
var npmTaken = require('npm-taken');

npmTaken('my-awesome-package-name', function(err, taken) {
  if (err) {
    // Uh Oh! Something bad happened...
  }
  if (taken === false) {
    // It's not taken... Hurry, make something cool!
  }
  if (taken) {
    // somebody beat you to it!
    // taken will be an object containing all kinds of metadata about the existing package.
  }
});
```

## API

### npmTaken(packageName, [registryUrl,] callback)

#### packageName

*Required*  
Type: `string`

The package name you want.

#### registryUrl

*Optional*  
Type: `string`

Use an alternate registry to perform the lookup.
Default is `https://registry.npmjs.com/`.

#### callback

*Optional*  
Type: `function(err, response)`

Will be called with:

- `err`: if there was some problem communicating with the registry, `null` otherwise.
- `response`: will be `false` if the name is available, otherwise it will be an object containing metadata about the existing module.

## License

MIT © [James Talmage](http://github.com/jamestalmage)
