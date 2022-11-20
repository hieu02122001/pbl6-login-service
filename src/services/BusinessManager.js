const lodash = require('lodash');
const { User } = require('../models/_User');
const { Business } = require('../models/_Business');

function BusinessManager(params) {};

//

BusinessManager.prototype.findBusinesses = async function(criteria, more) {
  const queryObj = {
    isDeleted: false
  };
  // Build query
  let idInList = lodash.get(criteria, "ids");
  if(idInList) {
    //
    lodash.set(queryObj, "_id", { $in: idInList });
  }
  //
  const businesses = await Business.find(queryObj);
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
  return lodash.omit(businessObj, ["_id"]);
};

BusinessManager.prototype.createBusiness = async function(businessObj, more) {
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