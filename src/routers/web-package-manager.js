const express = require('express');
const lodash = require('lodash');
const router = new express.Router();

const { PackageManager } = require('../services/PackageManager');

const PATH = '/api/v1';

const packageManager = new PackageManager();

router.get(PATH + '/packages', async (req, res) => {
  try {
    const packages = await packageManager.findPackages();
    //
    res.send(packages);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.post(PATH + '/packages', async (req, res) => {
  const packageObjs = req.body;
  //
  try {
    const packages = await packageManager.createPackages(packageObjs);
    //
    res.send(packages);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.get(PATH + '/packages/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const package = await packageManager.getPackage(id);
    //
    res.send(package);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

module.exports = router;