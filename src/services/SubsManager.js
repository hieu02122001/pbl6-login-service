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
  subscriptionObj.startTime = subscriptionObj.startTime || new Date();
  // set endTime
  subscriptionObj.endTime = moment(subscriptionObj.startTime).add(package.months, "months");
  // convert to ISOString
  subscriptionObj.startTime = subscriptionObj.startTime.toISOString();
  subscriptionObj.endTime = subscriptionObj.endTime.toISOString();
  // const subscription = await Subscription.create(subscriptionObj);
  //
  return "subscription";
};

//

module.exports = {
  SubscriptionManager
}