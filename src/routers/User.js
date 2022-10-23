const express = require('express');
const router = new express.Router();
const { User } = require('../models/_User');

router.post('/users', async (req, res) => {
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

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    //
    res.send(users);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.get('/users/:id', async (req, res) => {
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

router.put('/users/:id', async (req, res) => {
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

router.delete('/users/:id', async (req, res) => {
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

router.post('/users/login', async (req, res) => {
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

module.exports = router;