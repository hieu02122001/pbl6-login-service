const lodash = require('lodash');
const { Package } = require('../models/_Package');

function PackageManager(params) {};

//

PackageManager.prototype.findPackages = async function(criteria, more) {
  const queryObj = {};
  //
  const packages = await Package.find(queryObj)
    .sort([["_id", 1]]);
  const output = {
    rows: packages,
    count: packages.length
  }
  return output;
};

PackageManager.prototype.getPackage = async function(packageId, more) {
  const package = await Package.findById(packageId);
  //
  if (!package) {
    throw new Error(`Not found package with id [${packageId}]!`);
  }
  //
  return package;
};

PackageManager.prototype.createPackages = async function(packageObjs, more) {
  const packages = await Package.create(packageObjs);
  //
  return packages;
};

//

module.exports = {
  PackageManager
}