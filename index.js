var lib = {},
    AWS = require('aws-sdk'),
    ec2 = new AWS.EC2(),
    _ = require('lodash');

lib.config = {
  pollEveryMs: 60000,
  tagName: 'feature-toggle'
};

lib.featuresCache = [];

lib.start = function(instanceId, pollEveryMs) {
  if (pollEveryMs) lib.config.pollEveryMs = pollEveryMs;
  lib.config.instanceId = instanceId;

  lib.poll();
};

lib.poll = function() {
  lib.awsWrap(function(err) {
    if (err) console.log(err);
    setTimeout(lib.poll, lib.config.pollEveryMs); 
  });  
};

lib.isFeatureEnabled = function(featureName) {
  return lib.featuresCache.indexOf(featureName) > -1;
};

lib.extractFeaturesNames = function(awsResult) {
  if (awsResult == null) return null;

  var tags = awsResult.Reservations[0].Instances[0].Tags;
  var value =  _.find(tags, function(tag) {
    return tag.Key == lib.config.tagName;
  });

  var featuresNames = [];
  if (value && value.Value != '') featuresNames = value.Value.split(',');
  lib.featuresCache = featuresNames;
  return featuresNames;
};

// not TDDed
lib.awsWrap = function(done) {
  var params = {
    InstanceIds: [ lib.config.instanceId ]
  };
  ec2.describeInstances(params, function(err, data) {
    lib.extractFeaturesNames(data);
    done(err);
  });
};

module.exports = lib;
