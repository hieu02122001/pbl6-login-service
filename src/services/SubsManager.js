const lodash = require('lodash');
const { Subscription } = require('../models/_Subscription');
const { User } = require('../models/_User');
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
  if(more && more.pagination === false) {
    return {
      count: subscriptions.length,
      rows: subscriptions
    }
  }
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
  subsObj = subsObj.toJSON();
  const package = await packageManager.getPackage(subsObj.packageId);
  subsObj.package = lodash.pick(package, ["name"]);
  //
  const business = await businessManager.getBusiness(subsObj.businessId);
  subsObj.business = lodash.pick(business, ["_id", "name", "email", "phone", "isActive"]);
  //
  subsObj.price = new Intl.NumberFormat('vi-VI').format(subsObj.price);
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
  const businessId = lodash.get(subscriptionObj, "businessId");
  const business = await businessManager.getBusiness(businessId);
  // check if business has local User
  if (business.users.length === 0) {
    throw new Error("Business doesn't have Local Admin");
  }
  //
  const oldSubs = await this.findSubscriptions({ 
    businessId,
    isDone: false
  });
  //
  let startTime = new Date();
  if (oldSubs.count > 0) {
    const newestSub = oldSubs.rows[0];
    startTime = newestSub.endTime;
  }
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
  // active business
  await businessManager.updateBusiness(businessId, { isActive: true });
  //
  return subscription;
};

SubscriptionManager.prototype.checkExpiredSubs = async function() {
  const currentTime = new Date();
  let expiredCount = 0;
  const expiredList = [];
  //
  const availableSubs = await this.findSubscriptions({ isDone: false }, { pagination: false });
  for (const i in availableSubs.rows) {
    const sub = availableSubs.rows[i];
    if(sub.endTime < currentTime) {
      expiredCount++;
      // de-active business 
      const business = await businessManager.updateBusiness(sub.businessId, { isActive: false });
      // done subscription
      await Subscription.findByIdAndUpdate(sub._id, { isDone: true }, { new: true, runValidators: true });
      // remove User token
      const user = await User.findOne({
        businessId: sub.businessId,
        roleId: "636723c71f1cbcef36804e82"
      });
      user.refreshTokens = [];
      user.save();
      //
      expiredList.push(business.name + " of " + user.fullName);
    }
  }
  return {
    expiredCount,
    expiredList
  }
};

//

module.exports = {
  SubscriptionManager
}