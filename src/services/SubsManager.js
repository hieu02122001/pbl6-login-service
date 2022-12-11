const lodash = require('lodash');
const { Subscription } = require('../models/_Subscription');
const { PackageManager } = require('./PackageManager');
const { BusinessManager } = require('./BusinessManager');
const moment = require('moment');

function SubscriptionManager(params) {};

const packageManager = new PackageManager();
const businessManager = new BusinessManager();
//

SubscriptionManager.prototype.findSubscriptions = async function(criteria, more) {
  const queryObj = {};
  //
  const isDone = lodash.get(criteria, "isDone");
  if (lodash.isBoolean(isDone)) {
    lodash.set(queryObj, "isDone", isDone);
  }
  //
  const businessId = lodash.get(criteria, "businessId");
  if (lodash.isString(businessId)) {
    lodash.set(queryObj, "businessId", businessId);
  }
  //
  const subscriptions = await Subscription.find(queryObj)
    .sort([['endTime', -1]]);
  // pagination
  const DEFAULT_LIMIT = 6;
  const page = lodash.get(criteria, "page") || 1;
  const _start = DEFAULT_LIMIT * (page -1);
  const _end = DEFAULT_LIMIT * page;
  const paginatedSubs = lodash.slice(subscriptions, _start, _end);
  //
  const output = {
    count: subscriptions.length,
    page: page,
    rows: paginatedSubs,
  }
  return output;
};

SubscriptionManager.prototype.wrapExtraToSubscriptions = async function(subsObj, more) {
  const package = await packageManager.getPackage(subsObj.packageId);
  subsObj.package = lodash.pick(package, ["name"]);
  //
  const business = await businessManager.getBusiness(subsObj.businessId);
  subsObj.business = lodash.pick(business, ["_id", "name", "email", "phone", "isActive"]);
  //
  return subsObj;
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