const express = require('express');
const lodash = require('lodash');
const router = new express.Router();
const { User } = require('../models/_User');
const { auth } = require('../middleware/auth');

const PATH = '/api/v1';

router.post(PATH + '/users', async (req, res) => {
  try {
    const user = new User(req.body);
    const token = await user.generateAuthToken();
    user.refreshTokens = user.refreshTokens.concat({ token });
    await user.save();
    //
    res.send({ user, token });
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.get(PATH + '/users', auth, async (req, res) => {
  try {
    const users = await User.find({});
    //
    res.send(users);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.get(PATH + '/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new Error("Not found!");
    }
    //
    res.send(user);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.put(PATH + '/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
    if (!user) {
      throw new Error("Not found!");
    }
    //
    res.send(user);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.delete(PATH + '/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new Error("Not found!");
    }
    //
    res.send(user);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.post(PATH + '/users/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByCredentials(email, password);
    //
    const token = await user.generateAuthToken();
    user.refreshTokens = user.refreshTokens.concat({ token });
    await user.save();
    //
    res.send({ user, token });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// ------------------------------------------------------------------------------------

router.get(PATH + '/me', auth, async (req, res) => {
  try {
    res.send(req.user);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.post(PATH + '/me/logout', auth, async (req, res) => {
  try {
    req.user.refreshTokens = lodash.filter(req.user.refreshTokens, (item) => {
      return item.token !== req.token;
    });
    //
    await req.user.save();
    //
    res.send("Logout successfully");
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});


module.exports = router;