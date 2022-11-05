const lodash = require('lodash');
const { User } = require('../models/_User');

function UserManager(params) {

};

//

UserManager.prototype.findUsers = async function(criteria, more) {
  const queryObj = {
    isDeleted: false
  };
  //
  const users = await User.find(queryObj);
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
  return user;
};

UserManager.prototype.createUser = async function(userObj, more) {
  const user = new User(userObj);
  const output = {};
  //
  if (more && more.generateAuthToken === true) {
    const token = await user.generateAuthToken();
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

module.exports = { UserManager };