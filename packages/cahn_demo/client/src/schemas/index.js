"use strict";

const device_trust = require("./device_trust.json");
const device = require("./device.json");
const device_type = require("./device_type.json");
const device_type_trust = require("./device_type_trust.json");
const has_sbom = require("./has_sbom.json");
const is_of_device_type = require("./is_of_device_type.json");
const manufactured = require("./manufactured.json");
const manufacturer = require("./manufacturer.json");
const manufacturer_trust = require("./manufacturer_trust.json");
const sbom_vulnerability = require("./sbom_vulnerability.json");
const sbom = require("./sbom.json");
const user = require("./user.json");

module.exports = {
  device_trust,
  device,
  device_type,
  device_type_trust,
  has_sbom,
  is_of_device_type,
  manufactured,
  manufacturer,
  manufacturer_trust,
  sbom_vulnerability,
  sbom,
  user,
};
