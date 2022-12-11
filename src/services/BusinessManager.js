const lodash = require('lodash');
const { User } = require('../models/_User');
const { Subscription } = require('../models/_Subscription');
const { Business } = require('../models/_Business');
const { slug } = require('../utilities/Utilities');

function BusinessManager(params) {};

//

BusinessManager.prototype.findBusinesses = async function(criteria, more) {
  const queryObj = {
    isDeleted: false
  };
  // Build query
  // Id in list
  const idInList = lodash.get(criteria, "ids");
  if(idInList) {
    lodash.set(queryObj, "_id", { $in: idInList });
  }
  // Search: slug/phone/email
  let searchInfo = lodash.get(criteria, "search");
  if(searchInfo) {
    searchInfo = slug(searchInfo);
    lodash.set(queryObj, "$or", [
      { "slug": { "$regex": searchInfo } },
      { "phone": { "$regex": searchInfo } },
      { "email": { "$regex": searchInfo } },
    ])
  }
  //
  const isActive = lodash.get(criteria, "isActive");
  if (lodash.isBoolean(isActive)) {
    lodash.set(queryObj, "isActive", isActive);
  }
  //
  const businesses = await Business.find(queryObj)
    .sort([['createdAt', -1]]);
  //
  for (let i = 0; i < businesses.length; i++) {
    businesses[i] = await this.wrapExtraToBusiness(businesses[i].toJSON());
  }
  // pagination
  const DEFAULT_LIMIT = 6;
  const page = lodash.get(criteria, "page") || 1;
  const _start = DEFAULT_LIMIT * (page -1);
  const _end = DEFAULT_LIMIT * page;
  const paginatedBusinesses = lodash.slice(businesses, _start, _end);
  //
  const output = {
    count: businesses.length,
    page: page,
    rows: paginatedBusinesses,
  }
  return output;
};

BusinessManager.prototype.getBusiness = async function(businessId, more) {
  const business = await Business.findById(businessId);
  //
  if (!business) {
    throw new Error(`Not found business with id [${businessId}]!`);
  }
  //
  return await this.wrapExtraToBusiness(business.toJSON());
};

BusinessManager.prototype.wrapExtraToBusiness = async function(businessObj, more) {
  // id
  businessObj.id = lodash.get(businessObj, "_id").toString();
  // endTime of subscription
  const subs = await Subscription.find({businessId: businessObj.id}).sort([['endTime', -1]]);
  businessObj.endTime = null;
  if (subs.length > 0) {
    businessObj.endTime = subs[0].endTime;
  }
  return lodash.omit(businessObj, ["_id"]);
};

BusinessManager.prototype.createBusiness = async function(businessObj, more) {
  const PICK_FIELDS = ["name", "email", "phone"];
  businessObj = lodash.pick(businessObj, PICK_FIELDS);
  const business = new Business(businessObj);
  const output = {};
  //
  await business.save();
  output.business = business;
  //
  return output;
};

BusinessManager.prototype.updateBusiness = async function(businessId, businessObj, more) {
  const business = await Business.findByIdAndUpdate(businessId, businessObj, { new: true, runValidators: true });
  //
  if (!business) {
    throw new Error(`Not found business with id [${businessId}]!`);
  }
  //
  await business.save();
  //
  return business;
};

BusinessManager.prototype.deleteBusiness = async function(businessId, more) {
  const business = await Business.findByIdAndUpdate(businessId, {
    isDeleted: true
  }, { new: true });
  //
  if (!business) {
    throw new Error(`Not found business with id [${businessId}]!`);
  }
  //
  return business;
};

//

module.exports = { BusinessManager };