const lodash = require('lodash');
const { User } = require('../models/_User');
const { RoleManager } = require('./RoleManager');
const jwt = require('jsonwebtoken');

function UserManager(params) {};

const roleManager = new RoleManager();
//

UserManager.prototype.findUsers = async function(criteria, more) {
  const queryObj = {
    isDeleted: false
  };
  //
  const users = await User.find(queryObj);
  for (let i = 0; i < users.length; i++) {
    users[i] = await this.wrapExtraToUser(users[i].toJSON());
  }
  //
  const output = {
    rows: users,
    count: users.length
  }
  return output;
};

UserManager.prototype.getUser = async function(userId, more) {
  const user = await User.findById(userId);
  //
  if (!user) {
    throw new Error(`Not found user with id [${userId}]!`);
  }
  //
  return await this.wrapExtraToUser(user.toJSON());
};

UserManager.prototype.wrapExtraToUser = async function(userObj, more) {
  // id
  userObj.id = lodash.get(userObj, "_id").toString();
  // gender
  userObj.gender = userObj.gender ? "Male" : "Female";
  // role
  const roleId = lodash.get(userObj, "roleId");
  if (roleId) {
    const role = await roleManager.getRole(roleId);
    userObj.role = {
      id: role._id,
      name: role.name
    }
  }
  return lodash.omit(userObj, ["_id", "roleId"]);
};

UserManager.prototype.createUser = async function(userObj, more) {
  // check if roleId is valid
  await roleManager.getRole(userObj.roleId);
  //
  const user = new User(userObj);
  const output = {};
  //
  if (more && more.generateAuthToken === true) {
    const token = await this.generateAuthToken(user._id);
    user.refreshTokens = user.refreshTokens.concat({ token });
    //
    output.token = token;
  };
  //
  await user.save();
  output.user = user;
  //
  return output;
};

UserManager.prototype.generateAuthToken = async function(userId, more) {
  const user = await this.getUser(userId);
  const AUTH_KEY = 'this is a super pro vip powerful secret key';
  //
  const token = jwt.sign({
  ...user
  }, AUTH_KEY, {expiresIn: 864000});
  //
  return token;
};

UserManager.prototype.updateUser = async function(userId, userObj, more) {
  const user = await User.findByIdAndUpdate(userId, userObj, { new: true, runValidators: true });
  //
  if (!user) {
    throw new Error(`Not found user with id [${userId}]!`);
  }
  //
  return user;
};

UserManager.prototype.deleteUser = async function(userId, more) {
  const user = await User.findByIdAndUpdate(userId, {
    isDeleted: true
  }, { new: true });
  //
  if (!user) {
    throw new Error(`Not found user with id [${userId}]!`);
  }
  //
  return user;
};

//

module.exports = { UserManager };