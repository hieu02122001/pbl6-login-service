const lodash = require('lodash');
const { Role } = require('../models/_Role');

function RoleManager(params) {};

//

RoleManager.prototype.findRoles = async function(criteria, more) {
  const queryObj = {};
  //
  const roles = await Role.find(queryObj);
  const output = {
    rows: roles,
    count: roles.length
  }
  return output;
};

RoleManager.prototype.getRole = async function(roleId, more) {
  const role = await Role.findById(roleId);
  //
  if (!role) {
    throw new Error(`Not found role with id [${roleId}]!`);
  }
  //
  return role;
};

RoleManager.prototype.createRoles = async function(roleObjs, more) {
  const roles = await Role.create(roleObjs);
  //
  return roles;
};

//

module.exports = {
  RoleManager
}