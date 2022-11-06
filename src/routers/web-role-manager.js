const express = require('express');
const lodash = require('lodash');
const router = new express.Router();

const { RoleManager } = require('../services/RoleManager');

const PATH = '/api/v1';

const roleManager = new RoleManager();

router.get(PATH + '/roles', async (req, res) => {
  try {
    const roles = await roleManager.findRoles();
    //
    res.send(roles);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.post(PATH + '/roles', async (req, res) => {
  const roleObjs = req.body;
  //
  try {
    const roles = await roleManager.createRoles(roleObjs);
    //
    res.send(roles);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.get(PATH + '/roles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const role = await roleManager.getRole(id);
    //
    res.send(role);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

module.exports = router;