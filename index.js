var lib = {},
    AWS = require('aws-sdk'),
    ec2 = new AWS.EC2(),
    _ = require('lodash');

lib.config = {
  pollEveryMs: 60000,
  tagName: 'feature-toggle'
};

lib.featuresCache = {};

lib.start = function(instanceId, pollEveryMs) {
  if (pollEveryMs) lib.config.pollEveryMs = pollEveryMs;
  lib.config.instanceId = instanceId;

  lib.poll();
};

lib.poll = function() {
  lib.awsWrap(function(err) {
    setTimeout(lib.poll, lib.config.pollEveryMs); 
  });  
};

lib.isFeatureEnabled = function(featureName) {
  return lib.featuresCache[featureName] != null;
};

// TODO should support comma separated tags
lib.extractFeatureName = function(awsResult, tagName) {
  if (awsResult == null) return null;

  var tags = awsResult.Reservations[0].Instances[0].Tags;
  var featureName =  _.find(tags, function(tag) {
    return tag.Key == tagName;
  }).Value;
  lib.featuresCache[tagName] = featureName;
  return featureName;
};

// not TDDed
lib.awsWrap = function(done) {
  var params = {
    InstanceIds: [ lib.config.instanceId ]
  };
  ec2.describeInstances(params, function(err, data) {
    lib.extractTag(data);
    done(err);
  });
};

module.exports = lib;
