const lodash = require('lodash');
const { Subscription } = require('../models/_Subscription');
const { PackageManager } = require('./PackageManager');
const moment = require('moment');

function SubscriptionManager(params) {};

const packageManager = new PackageManager();
//

SubscriptionManager.prototype.findSubscriptions = async function(criteria, more) {
  const queryObj = {};
  //
  const subscriptions = await Subscription.find(queryObj);
  const output = {
    rows: subscriptions,
    count: subscriptions.length
  }
  return output;
};

SubscriptionManager.prototype.wrapExtraToSubscriptions = async function(userObj, more) {
  const package = await packageManager.getPackage(userObj.packageId);
  userObj.package = lodash.pick(package, ["name"]);
  //
  return userObj;
}

SubscriptionManager.prototype.getSubscription = async function(subscriptionId, more) {
  const subscription = await Subscription.findById(subscriptionId);
  //
  if (!subscription) {
    throw new Error(`Not found subscription with id [${subscriptionId}]!`);
  }
  //
  return subscription;
};

SubscriptionManager.prototype.createSubscription = async function(subscriptionObj, more) {
  const package = await packageManager.getPackage(subscriptionObj.packageId);
  const startTime = subscriptionObj.startTime || new Date();
  // set endTime
  const endTime = moment(startTime).add(package.months, "months").startOf('day');
  // convert to ISOString
  subscriptionObj.startTime = startTime;
  subscriptionObj.endTime = endTime.toISOString();
  //
  subscriptionObj.price = package.price;
  //
  const subscription = await Subscription.create(subscriptionObj);
  await subscription.save();
  //
  return subscription;
};

//

module.exports = {
  SubscriptionManager
}