const { exec } = require("child_process");
const morgan = require("morgan");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
require("dotenv").config();
const path = require("path");

// Update emailToPublicKeys.json
const updateEmailToPublicKeysJson = (emailToPublicKeys) => {
  fs.writeFileSync(
    "emailToPublicKeys.json",
    JSON.stringify(emailToPublicKeys, null, 2)
  );
};

// Add a public key to an email address
const addPublicKeyToEmail = (email, publicKey, emailToPublicKeys) => {
  if (!emailToPublicKeys[email]) {
    emailToPublicKeys[email] = [];
  }
  emailToPublicKeys[email].push(publicKey);
};

// Save a VC for a user
const saveVCForUser = (email) => {
  // Create a VC for the user
  const vc = {
    "@context": ["https://www.w3.org/ns/credentials/v2"],
    id: `urn:uuid:${uuidv4()}`,
    type: ["VerifiableCredential", "UserCredential"],
    name: null,
    description: null,
    issuer: "urn:uuid:585df7b5-8891-4630-9f5d-a5659f3abe04",
    validFrom: "2024-08-28T14:15:50.307579Z",
    validUntil: null,
    credentialStatus: null,
    credentialSchema: {
      id: "https://github.com/nqminds/ClaimCascade/blob/claim_verifier/packages/claim_verifier/user.yaml",
      type: "JsonSchema",
    },
    credentialSubject: {
      type: "fact",
      schemaName: "user",
      id: uuidv4(),
      timestamp: 1716287268891,
      fact: {
        id: email,
        username: `${email.split("@")[0]}-user`,
        created_at: Date.now(),
        can_issue_device_type_trust: false,
        can_issue_device_trust: false,
        can_issue_manufacturer_trust: false,
      },
    },
  };

  // Save the VC to a file
  const fileName = path.join(
    __dirname,
    "..",
    "uploads",
    "vcs",
    "custom",
    `verifiable_credentials_${Date.now()}.json`
  );
  console.log("doingthis");
  fs.appendFile(fileName, JSON.stringify(vc) + "\n", (err) => {
    if (err) {
      console.error(err);
    }
  });
};

// Utility function to search VCs in a directory
const searchVCs = (dirPath, matchCriteria) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        console.error(`File read error: ${err}`);
        reject(err);
        return;
      }

      const vcFiles = files.filter((file) => file.endsWith(".json"));
      const filePromises = vcFiles.map((file) => {
        return new Promise((resolveFile) => {
          fs.readFile(path.join(dirPath, file), "utf8", (err, data) => {
            if (err) {
              console.error(`File read error: ${err}`);
              resolveFile(null);
              return;
            }

            try {
              const vc = JSON.parse(data);
              if (matchCriteria(vc)) {
                resolveFile(vc.credentialSubject.id);
              } else {
                resolveFile(null);
              }
            } catch (parseError) {
              console.error(`JSON parse error: ${parseError}`);
              resolveFile(null);
            }
          });
        });
      });

      Promise.all(filePromises).then((results) => {
        const foundId = results.find((id) => id !== null);
        resolve(foundId || null);
      });
    });
  });
};

// Function to generate route handlers
const createVCSearchHandler = (filePaths, matchCriteria) => {
  return (req, res) => {
    const searchPromises = filePaths.map((filePath) =>
      searchVCs(filePath, (vc) => matchCriteria(vc, req.query))
    );

    Promise.all(searchPromises)
      .then((results) => {
        const foundId = results.find((id) => id !== null);
        if (foundId) {
          res.status(200).json({ id: foundId });
        } else {
          res.status(404).json({ error: "VC not found" });
        }
      })
      .catch((error) => {
        console.error(`Error searching VCs: ${error}`);
        res.status(500).json({ error: "Internal server error" });
      });
  };
};

// Define the filter and map functions for each route
const filterDeviceTrust = (req) => (line) =>
  line.includes("assert(device_trust(") && line.includes(req.params.deviceId);

const mapDeviceTrust = (line) => {
  const [authoriserId, timestamp, deviceId] = line
    .replace("assert(device_trust(", "")
    .replace(")).", "")
    .split(",");

  return {
    authoriserId: authoriserId.trim().replace(/['"]/g, ""),
    timestamp: timestamp.trim(),
    deviceId: deviceId.trim().replace(/['"]/g, "").replace(")", ""),
  };
};

const filterDeviceTypeTrust = (req) => (line) =>
  line.includes("assert(device_type_trust(") &&
  line.includes(req.params.deviceTypeId);

const mapDeviceTypeTrust = (line) => {
  const [authoriserId, timestamp, deviceTypeId] = line
    .replace("assert(device_type_trust(", "")
    .replace(")).", "")
    .split(",");

  return {
    authoriserId: authoriserId.trim().replace(/['"]/g, ""),
    timestamp: timestamp.trim(),
    deviceTypeId: deviceTypeId.trim().replace(/['"]/g, "").replace(")", ""),
  };
};

const filterManufacturerTrust = (req) => (line) =>
  line.includes("assert(manufacturer_trust(") &&
  line
    .replace("assert(manufacturer_trust(", "")
    .replace(")).", "")
    .includes(req.params.manufacturerId);

const mapManufacturerTrust = (line) => {
  const [authoriserId, timestamp, manufacturerId] = line
    .replace("assert(manufacturer_trust(", "")
    .replace(")).", "")
    .split(",");

  return {
    authoriserId: authoriserId.trim().replace(/['"]/g, ""),
    timestamp: timestamp.trim().replace(/['"]/g, ""),
    manufacturerId: manufacturerId.trim().replace(/['"]/g, "").replace(")", ""),
  };
};

// Define the file paths
const customVCPath = path.join(__dirname, "..", "uploads", "vcs", "custom");
const deviceTrustVCPath = path.join(
  __dirname,
  "..",
  "uploads",
  "vcs",
  "claims",
  "device_trust"
);
const deviceTypeTrustVCPath = path.join(
  __dirname,
  "..",
  "uploads",
  "vcs",
  "claims",
  "device_type_trust"
);
const manufacturerTrustVCPath = path.join(
  __dirname,
  "..",
  "uploads",
  "vcs",
  "claims",
  "manufacturer_trust"
);

// Define the criteria for matching VCs
const matchDeviceTrust = (vc, query) =>
  vc.credentialSubject?.fact?.authoriser_id === query.authoriserId &&
  vc.credentialSubject?.fact?.created_at === Number(query.timestamp) &&
  vc.credentialSubject?.fact?.device_id === query.deviceId;

const matchDeviceTypeTrust = (vc, query) =>
  vc.credentialSubject?.fact?.authoriser_id === query.authoriserId &&
  vc.credentialSubject?.fact?.created_at === Number(query.timestamp) &&
  vc.credentialSubject?.fact?.device_type_id === query.deviceTypeId;

const matchManufacturerTrust = (vc, query) =>
  vc.credentialSubject?.fact?.authoriser_id === query.authoriserId &&
  vc.credentialSubject?.fact?.created_at === Number(query.timestamp) &&
  vc.credentialSubject?.fact?.manufacturer_id === query.manufacturerId;

module.exports = {
  updateEmailToPublicKeysJson,
  addPublicKeyToEmail,
  saveVCForUser,
  createVCSearchHandler,
  filterDeviceTrust,
  mapDeviceTrust,
  filterDeviceTypeTrust,
  mapDeviceTypeTrust,
  filterManufacturerTrust,
  mapManufacturerTrust,
  matchDeviceTrust,
  matchDeviceTypeTrust,
  matchManufacturerTrust,
  manufacturerTrustVCPath,
  customVCPath,
  deviceTrustVCPath,
  deviceTypeTrustVCPath,
};
