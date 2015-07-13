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
      proto = http;
    }
    if (!match[2]) {
      opt_registry = opt_registry + '/';
    }
  }

  nameValidator.validate(packageName);
  proto.get(opt_registry + packageName, function(res) {
    if (res.statusCode === 404) {
      return cb(null, false);
    }
    if (res.statusCode === 200) {
      res.pipe(concat(function(body) {
        try {
          cb(null, JSON.parse(body));
        } catch (e) {
          cb(e);
        }
      })).on('error', cb);
      return;
    }
    return cb(
      new Error('Confusing Status Code From Registry: ' +
        res.statusCode + ' ' + res.statusMessage
      ),
      res
    );
  }).on('error', cb);
};
