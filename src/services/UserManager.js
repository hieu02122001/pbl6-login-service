const lodash = require('lodash');
const { User } = require('../models/_User');
const { Business } = require('../models/_Business');
const { RoleManager } = require('./RoleManager');
const jwt = require('jsonwebtoken');
const rabbitMQ = require('../config/RabbitMQ');

function UserManager(params) {
  this._businessManager = params.businessManager
};

const roleManager = new RoleManager();
//
const createChannelRabbitMQ = new rabbitMQ.RabbitMQ();

UserManager.prototype.findUsers = async function(criteria, more) {
  const queryObj = {
    isDeleted: false
  };
  //
  const users = await User.find(queryObj);
  for (let i = 0; i < users.length; i++) {
    users[i] = await this.wrapExtraToUser(users[i].toJSON(), more);
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
  return await this.wrapExtraToUser(user.toJSON(), more);
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
    if (more && more.forGenerateToken === true) {
      userObj.role = role.name
    } else {
      userObj.role = {
        id: role._id,
        name: role.name
      }
    }
  }
  // business
  let businesses = lodash.get(userObj, "businesses");
  if (lodash.isArray(businesses) && businesses.length > 0) {
    if (more && more.forGenerateToken === true) {
      userObj.businessId = businesses[0];
    } else {
      const criteria = {};
      criteria.ids = lodash.map(businesses, function(item) {
        return item._id;
      });
      businesses = await this._businessManager.findBusinesses(criteria);
      businesses.rows = lodash.map(businesses.rows, function(item) {
        return lodash.pick(item, ["id", "name", "email", "phone"]);
      });
      userObj.businesses = businesses.rows;
    }
  }
  return lodash.omit(userObj, ["_id", "roleId"]);
};

UserManager.prototype.createUser = async function(userObj, more) {
  // check if roleId is valid
  await roleManager.getRole(userObj.roleId);
  // omit businessId
  const businessId = userObj.businessId;
  userObj = lodash.omit(userObj, "businessId");
  let user = new User(userObj);
  await user.save();
  // attach business to user
  const userId = lodash.get(user, "_id").toString();
  try {
    user = await this.attachBusinessToUser(userId, businessId);
  } catch (error) {
    await User.findByIdAndDelete(userId);
    throw error;
  }
  //
  const output = {};
  //
  if (more && more.generateAuthToken === true) {
    const token = await this.generateAuthToken(user._id);
    user.refreshTokens = user.refreshTokens.concat({ token });
    //
    output.token = token;
  };
  //
  output.user = user;
  //
  // const message = {
  //   "Id": user.id,
  //   "Name": user.firstName + " " + user.lastName,
  //   "Email": user.email
  // }
  // const severity = 'UserCreatedIntergrationEvent';
  // const exchange = 'booking';
  
  // createChannelRabbitMQ.createChannelRabbitMQ(severity, exchange, message);
  //
  return output;
};

UserManager.prototype.generateAuthToken = async function(userId, more) {
  const user = await this.getUser(userId, { forGenerateToken: true });
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

UserManager.prototype.attachBusinessToUser = async function (userId, businessId) {
  await this._businessManager.getBusiness(businessId);
  await this.getUser(userId);
  //
  await Business.findByIdAndUpdate(businessId, {
    $push: { users: userId }
  }, { new: true });
  //
  return await User.findByIdAndUpdate(userId, {
    $push: { businesses: businessId }
  }, { new: true })
};
//

module.exports = { UserManager };