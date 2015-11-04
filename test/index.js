var expect = require('chai').expect,
    sinon = require('sinon'),
    lib = require('../index');

describe('isFeatureEnabled', function() {

  it('exists', function() {
    expect(lib.isFeatureEnabled).to.exist;
  });

  it('returns true if the feature is enabled', function() {
    lib.featuresCache = { 'feature-toggle': 'feature-name-here' };
    expect(lib.isFeatureEnabled('feature-toggle')).to.be.true;
  });

  it('returns false if the feature is not enabled', function() {
    lib.featuresCache = {};
    expect(lib.isFeatureEnabled('feature-toggle')).to.be.false;
  });

});

describe('featuresCache', function() {
  
  it('exists', function() {
    expect(lib.featuresCache).to.exist;
  });

  it('is populated when a tag is extracted from the api call result', function() {
    var awsResult = {
      Reservations: [{
        Instances: [{
          Tags: [{
            Key: 'feature-toggle', Value: 'feature-name-here'
          }]  
        }]
      }]
    }, tagName = 'feature-toggle';
    lib.extractFeatureName(awsResult, 'feature-toggle');
    expect(lib.featuresCache['feature-toggle']).to.equal('feature-name-here');
  });

});

describe('extractFeatureName', function() {
  
  it('exists', function() {
    expect(lib.extractFeatureName).to.exist;
  })

  it('returns the value of a tag', function() {
    var awsResult = {
      Reservations: [{
        Instances: [{
          Tags: [{
            Key: 'feature-toggle', Value: 'feature-name-here'
          }]  
        }]
      }]
    }, tagName = 'feature-toggle';
    var featureName = lib.extractFeatureName(awsResult, 'feature-toggle');
    expect(featureName).to.equal('feature-name-here');
  });

  it('returns null if no result is passed', function() {
    var featureName = lib.extractFeatureName(undefined, 'feature-toggle');
    expect(featureName).to.equal(null);
  });

});

describe('config', function() {

  it('exists', function() {
    expect(lib.config).to.exist;
  });

  it('has a default value for poll interval', function() {
    expect(lib.config.pollEveryMs).to.be.a('number'); 
  });

  it('has a default value for the tag name', function() {
    expect(lib.config.tagName).to.be.a('String'); 
  });

});

describe('start', function() {

  beforeEach(function() {
    sinon.stub(lib, 'poll'); 
  });

  afterEach(function() {
    lib.poll.restore();
  });

  it('exists', function() {
    expect(lib.start).to.exist; 
  });

  it('sets the instance id', function() {
    lib.start('instance-id');
    expect(lib.config.instanceId).to.equal('instance-id');
  });

  it('calls poll', function() {
    lib.start();
    expect(lib.poll.calledOnce).to.be.true;
  }); 

  it('overrides the default value for poll interval if passed', function() {
    lib.start('instanceId', 42);
    expect(lib.config.pollEveryMs).to.equal(42); 
  });

});

describe('poll', function() {

  var clock;

  beforeEach(function() {
    clock = sinon.useFakeTimers(); 
    sinon.stub(lib, 'awsWrap').yields();
  });

  afterEach(function() {
    clock.restore();
    lib.awsWrap.restore();
  });

  it('exists', function() {
    expect(lib.poll).to.exist;
  });

  it('polls the server\'s tags', function() {
    lib.config.pollEveryMs = 1;
    lib.poll();  
    expect(lib.awsWrap.calledOnce).to.be.true;
    clock.tick(1);
    expect(lib.awsWrap.calledTwice).to.be.true;
  });

});