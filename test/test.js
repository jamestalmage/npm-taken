'use strict';
var assert = require('assert');
var npmTaken = require('../');
var nock = require('nock');

describe('npm-taken', function() {
  var HTTPS_URL = 'https://registry.alternate.com';
  var HTTP_URL = 'http://registry.http-alternate.com';

  var mainRegistry;
  var httpsAlternate = nock(HTTPS_URL);
  var httpAlternate = nock(HTTP_URL);

  before(function() {
    if (!nock.isActive()) {
      nock.activate();
    }
    mainRegistry = nock('https://registry.npmjs.com');
  });

  afterEach(function() {
    mainRegistry.done();
    httpsAlternate.done();
    httpAlternate.done();
  });

  after(function() {
    nock.cleanAll();
    nock.restore();
  });

  it('returns descriptor if module name is taken', function(done) {
    mainRegistry.get('/taken').reply(200, {description:'this module is taken'});

    npmTaken('taken', function(err, taken) {
      assert.ifError(err);
      assert(taken);
      assert.equal(taken.description, 'this module is taken');
      done();
    });
  });

  it('returns false if module is not taken', function(done) {
    mainRegistry.get('/not-taken').reply(404, 'Not Found');

    npmTaken('not-taken', function(err, taken) {
      assert.ifError(err);
      assert.strictEqual(false, taken);
      done();
    });
  });

  it('allows an alternate https registry', function(done) {
    httpsAlternate.get('/https-alternate').reply(200, {description: 'https-alternate exists'});

    npmTaken('https-alternate', HTTPS_URL + '/', function(err, taken) {
      assert.ifError(err);
      assert(taken);
      assert.equal(taken.description, 'https-alternate exists');
      done();
    });
  });

  it('allows an alternate https registry (no trailing slash)', function(done) {
    httpsAlternate.get('/no-slash').reply(200, {description: 'no-slash exists'});

    npmTaken('no-slash', HTTPS_URL, function(err, taken) {
      assert.ifError(err);
      assert(taken);
      assert.equal(taken.description, 'no-slash exists');
      done();
    });
  });

  it('allows an alternate http registry', function(done) {
    httpAlternate.get('/http-alternate').reply(200, {description: 'http-alternate exists'});

    npmTaken('http-alternate', HTTP_URL, function(err, taken) {
      assert.ifError(err);
      assert(taken);
      assert.equal(taken.description, 'http-alternate exists');
      done();
    });
  });

  it('fails with a bad alternate url', function() {
    assert.throws(function() {
      npmTaken('bad-url', 'this is not an url!',  function() {}) ;
    }, /not a valid registry url/);
  });

  it('reports an error if unknown status code', function(done) {
    mainRegistry.get('/unknown-status').reply(504);

    npmTaken('unknown-status', function(err, res) {
      assert(err);
      assert(/status code/i.test(err.message), 'validate error message');
      done();
    });
  });

  it('reports a JSON parsing error', function(done) {
    mainRegistry.get('/bad-json').reply(200, 'this is not good json data');

    npmTaken('bad-json', function(err, res) {
      assert(err);
      assert(err instanceof SyntaxError);
      done();
    });
  });

  it('handles scoped packages', function(done) {
    mainRegistry.get('/@scope-name%2fpackage-name').reply(200, {description:'this is a scoped package'});

    npmTaken('@scope-name/package-name', function(err, taken) {
      assert.ifError(err);
      assert(taken);
      assert.equal(taken.description, 'this is a scoped package');
      done();
    });
  });
});

describe('some real world tests', function() {
  this.timeout(15000);

  it('"which" is an existing npm package', function(done) {
    npmTaken('which', function(err, taken) {
      assert.ifError(err);
      assert(taken);
      done();
    });
  });

  it('"@james.talmage/npm-safe-name" is an existing scoped npm package', function(done) {
    npmTaken('@james.talmage/npm-safe-name', function(err, taken) {
      assert.ifError(err);
      assert(taken);
      done();
    });
  });

  it('non-existing test name', function(done) {
    var name = 'npm-taken-some-non-existent-name-plus-random-' +
                Math.floor(Math.random() * 100000000);

    npmTaken(name, function(err, taken) {
      assert.ifError(err);
      assert.strictEqual(taken, false);
      done();
    });
  });
});
