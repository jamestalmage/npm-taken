'use strict';
var nameValidator = require('npm-safe-name');
var http = require('http');
var https = require('https');
var concat = require('concat-stream');

var DEFAULT_REGISTRY = 'https://registry.npmjs.com/';

module.exports = function (packageName, opt_registry, cb) {
  var proto = https;
  if ('function' === typeof opt_registry) {
    cb = opt_registry;
    opt_registry = DEFAULT_REGISTRY;
  } else {
    var match = /^http(s)?:\/\/.*?(\/)?$/i.exec(opt_registry);

    if (!match) {
      throw new Error(opt_registry + ' is not a valid registry url');
    }

    if (!match[1]) {
      // alternate is http instead of https
      proto = http;
    }

    if (!match[2]) {
      // allow users to provide alternate registries with or without trailing slash
      opt_registry = opt_registry + '/';
    }
  }

  // validate the package name, and escape it if it is scoped
  if (nameValidator.validate(packageName).scope) {
    // https://github.com/npm/npm/blob/b50be6aff34a739ca43de65f546e743d1a9975b9/lib/utils/map-to-registry.js#L16
    packageName = packageName.replace('/', '%2f');
  }

  proto.get(opt_registry + packageName, function(res) {
    if (res.statusCode === 404) {
      // No existing package
      return cb(null, false);
    }
    if (res.statusCode === 200) {
      // Try and parse the JSON response
      res.pipe(concat(function(body) {
        try {
          cb(null, JSON.parse(body));
        } catch (e) {
          cb(e);
        }
      })).on('error', cb);
      return;
    }

    // Not sure what other codes mean, so just fail.
    // If they start implementing redirects, that will need to be addressed.
    return cb(
      new Error('Confusing Status Code From Registry: ' +
        res.statusCode + ' ' + res.statusMessage
      ),
      res
    );
  }).on('error', cb);
};
