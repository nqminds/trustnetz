const express = require("express");
const { exec } = require("child_process");
const morgan = require("morgan");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const app = express();
const port = 3001;
const {
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
} = require("./utils/utils");

const tokenToEmail = {};

var claimCascadeInProgress = false;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Load emailToPublicKeys.json
let emailToPublicKeys = {};
try {
  emailToPublicKeys = JSON.parse(fs.readFileSync("emailToPublicKeys.json"));
} catch (err) {
  console.error(err);
  // Exit the process if the file cannot be read
  process.exit(1);
}

// Utility function to handle claim cascade
const runClaimCascade = () => {
  return new Promise((resolve, reject) => {
    exec("sh run_claim_cascade.sh", (err) => {
      claimCascadeInProgress = false;
      if (err) {
        console.error(err);
        reject("Error running claim cascade");
      } else {
        resolve();
      }
    });
  });
};

// Utility function to read and process the output file
const readAndProcessFile = (filePath, filterFn, mapFn) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error(`File read error: ${err}`);
        reject("Internal server error");
        return;
      }

      const trustVCs = data.split("\n").filter(filterFn).map(mapFn);

      // Ensure each object in trustVCs is unique based on specific criteria
      const uniqueTrustVCs = trustVCs.reduce((acc, vc) => {
        if (
          !acc.find(
            (existing) =>
              existing.username === vc.username &&
              existing.timestamp === vc.timestamp
          )
        ) {
          acc.push(vc);
        }
        return acc;
      }, []);

      // Sort by username, then timestamp
      uniqueTrustVCs.sort((a, b) => {
        if (a.username < b.username) return -1;
        if (a.username > b.username) return 1;
        return a.timestamp - b.timestamp;
      });

      resolve(uniqueTrustVCs);
    });
  });
};

// Function to create a route handler
const createTrustVCRouteHandler = (filterFn, mapFn) => {
  return async (req, res) => {
    try {
      await waitForClaimCascade(); // Wait for claim cascade to finish
      claimCascadeInProgress = true;

      await runClaimCascade(); // Ensure the claim cascade is complete

      const filePath = path.join(__dirname, "output", "output_db.pl");
      const result = await readAndProcessFile(filePath, filterFn(req), mapFn);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(error);
    } finally {
      claimCascadeInProgress = false; // Ensure the flag is reset
    }
  };
};

// Function to parse device string into an object
const parseDeviceString = (str) => {
  const obj = {};
  const pairs = str.split(", ");
  pairs.forEach((pair) => {
    const [key, value] = pair.split(": ");
    obj[key] = value;
  });
  return obj;
};

// Function to transform device data into the desired structure
const transformDeviceData = (device) => {
  return {
    deviceInfo: {
      ID: device.DeviceId,
      Name: device.Name,
      IDevID: device.Idevid,
      "Created At": device.CreatedAtDevice,
    },
    manufacturerInfo: {
      ID: device.ManufacturerId,
      Name: device.Manufacturer,
      "Created At": device.CreatedAtManufactured,
    },
    deviceTypeInfo: {
      ID: device.DeviceTypeId,
      Name: device.DeviceType,
      "Created At": device.CreatedAtDeviceType,
    },
  };
};

// Function to wait for claimCascadeInProgress to be false
const waitForClaimCascade = async () => {
  if (claimCascadeInProgress) {
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!claimCascadeInProgress) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }
};

// Middleware
app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

// Route to upload a verifiable credential
app.post("/upload/verifiable_credential", (req, res) => {
  const vc = req.body.vc;

  // TODO: Validation and verification of the VC?

  // Save the VC to a file
  const fileName = `./uploads/vcs/custom/verifiable_credentials_${Date.now()}.json`;
  fs.appendFile(fileName, JSON.stringify(vc) + "\n", (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.status(200).send("Verifiable credential saved");
  });
});

// Trigger bash script to run claim cascade
app.get("/claim_cascade", async (_req, res) => {
  try {
    await waitForClaimCascade(); // Wait if claim cascade is in progress
    claimCascadeInProgress = true;

    await runClaimCascade(); // Execute the claim cascade script

    res.status(200).send("Claim cascade complete");
  } catch (error) {
    res.status(error.status || 500).send(error.message);
  } finally {
    claimCascadeInProgress = false; // Ensure the flag is reset
  }
});

app.post("/sign_in", async (req, res) => {
  const { email, publicKey } = req.body;

  // Generate a token for the email address
  const token = uuidv4();
  tokenToEmail[token] = { email, publicKey };

  // Send an email to the email address
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "Sign in to CAHN Demo",
    text: `Click the following link to sign in: http://localhost:3001/sign_in/verify/${token}`,
  };

  await transporter.sendMail(mailOptions);
  res.send("Email sent").status(200);
});

app.post("/check_key", (req, res) => {
  const { email, publicKey } = req.body;

  // Check if the private key is in the emailToPublicKeys.json file
  if (
    emailToPublicKeys[email] &&
    emailToPublicKeys[email].includes(publicKey)
  ) {
    return res.status(200).send("Private key approved");
  }

  return res.status(401).send("Private key not approved");
});

app.get("/sign_in/verify/:token", (req, res) => {
  const token = req.params.token;
  if (!tokenToEmail[token]) {
    return res.send("Invalid token").status(400);
  }

  // Save to email to public keys json file
  const email = tokenToEmail[token].email;
  const publicKey = tokenToEmail[token].publicKey;

  try {
    // Save the public key to the email address
    // TODO: change to VC saving

    // If the user doesn't exist in the emailToPublicKeys.json file, create a VC for the user
    if (!emailToPublicKeys[email]) {
      saveVCForUser(email);
    }
    addPublicKeyToEmail(email, publicKey, emailToPublicKeys);
    updateEmailToPublicKeysJson(emailToPublicKeys);
  } catch (err) {
    console.error(err);
    return res.send("Error saving public key").status(500);
  }

  return res.send("Sign in successful").status(200);
});

// Route to get all devices data
app.get("/all_devices_data", async (req, res) => {
  try {
    await waitForClaimCascade(); // Wait for claim cascade to finish
    claimCascadeInProgress = true;

    const command = `swipl -s ./output/output.pl -g "attach_db('./output/output_db.pl'), db:output_all_device_data(DeviceDataList), write(current_output, DeviceDataList), halt."`;
    const stdout = await runPrologCommand(command);

    // Clean and parse the Prolog output
    const cleanOutput = stdout.slice(1, -1); // Remove square brackets
    const deviceSections = cleanOutput
      .split(/ENTRY\(|\),ENTRY\(|\)$/)
      .filter(Boolean);

    // Transform each device string into an object
    const devicesArray = deviceSections.map(parseDeviceString);

    // Transform data into the desired structure
    const transformedDevices = devicesArray.map(transformDeviceData);

    // Send the transformed data as JSON response
    res.status(200).json(transformedDevices);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  } finally {
    claimCascadeInProgress = false; // Ensure the flag is reset
  }
});
// Function to format Prolog output to valid JSON
function formatToJSON(str) {
  return str
    .replace(/(\w+):/g, '"$1":') // Add quotes around keys
    .replace(/: (\w+(-\w+)?)/g, (match, p1) => {
      if (/^\d+$/.test(p1)) {
        return `: ${p1}`; // Number values remain unquoted
      }
      if (p1 === "true" || p1 === "false") {
        return `: ${p1}`; // Boolean values remain unquoted
      }
      return `: "${p1}"`; // String values get quoted
    })
    .replace(/: "null"/g, ": null"); // Handle "null" as null
}

// Function to run Prolog command and handle output
async function runPrologCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution error: ${error}`);
        return reject({ status: 500, message: "Internal server error" });
      }
      if (stderr) {
        console.error(`Standard error: ${stderr}`);
        return reject({ status: 400, message: "Bad request" });
      }
      resolve(stdout);
    });
  });
}

// Route to get device-specific data
app.get("/device/:deviceId", async (req, res) => {
  const deviceId = req.params.deviceId;
  try {
    await waitForClaimCascade(); // Wait for claim cascade to finish
    claimCascadeInProgress = true;

    const command = `swipl -s ./output/output.pl -g "attach_db('./output/output_db.pl'), db:output_device_data(\\"${deviceId}\\", DeviceData), write(current_output, DeviceData), halt."`;
    const stdout = await runPrologCommand(command);

    let str = stdout.replace(/: N\/A/g, ": null"); // Replace "N/A" with null
    let jsonStr = "{" + formatToJSON(str) + "}"; // Convert string to valid JSON
    let jsonObject;

    try {
      jsonObject = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Error parsing JSON:", e);
      return res.status(500).json({ error: "Error parsing JSON" });
    }

    res.status(200).json(jsonObject);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  } finally {
    claimCascadeInProgress = false; // Ensure the flag is reset
  }
});

// Route to get manufacturer-specific data
app.get("/manufacturer/:manufacturerId", async (req, res) => {
  const manufacturerId = req.params.manufacturerId;
  try {
    await waitForClaimCascade(); // Wait for claim cascade to finish
    claimCascadeInProgress = true;

    const command = `swipl -s ./output/output.pl -g "attach_db('./output/output_db.pl'), db:output_manufacturer_data(\\"${manufacturerId}\\", ManufacturerData), write(current_output, ManufacturerData), halt."`;
    const stdout = await runPrologCommand(command);
    const jsonObject = JSON.parse(stdout);

    res.status(200).json(jsonObject);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  } finally {
    claimCascadeInProgress = false; // Ensure the flag is reset
  }
});

// Route to get device type-specific data
app.get("/deviceType/:deviceTypeId", async (req, res) => {
  const deviceTypeId = req.params.deviceTypeId;
  try {
    await waitForClaimCascade(); // Wait for claim cascade to finish
    claimCascadeInProgress = true;

    const command = `swipl -s ./output/output.pl -g "attach_db('./output/output_db.pl'), db:output_device_type_data(\\"${deviceTypeId}\\", DeviceTypeData), write(current_output, DeviceTypeData), halt."`;
    const stdout = await runPrologCommand(command);
    const jsonObject = JSON.parse(stdout);

    res.status(200).json(jsonObject);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  } finally {
    claimCascadeInProgress = false; // Ensure the flag is reset
  }
});

// Create routes with the generated handlers
app.get(
  "/VC_ID/device_trust",
  createVCSearchHandler([customVCPath, deviceTrustVCPath], matchDeviceTrust)
);
app.get(
  "/VC_ID/device_type_trust",
  createVCSearchHandler(
    [customVCPath, deviceTypeTrustVCPath],
    matchDeviceTypeTrust
  )
);
app.get(
  "/VC_ID/manufacturer_trust",
  createVCSearchHandler(
    [customVCPath, manufacturerTrustVCPath],
    matchManufacturerTrust
  )
);

// Create routes with the generated handlers
app.get(
  "/trust_vc/device/:deviceId",
  createTrustVCRouteHandler(filterDeviceTrust, mapDeviceTrust)
);
app.get(
  "/trust_vc/device_type/:deviceTypeId",
  createTrustVCRouteHandler(filterDeviceTypeTrust, mapDeviceTypeTrust)
);
app.get(
  "/trust_vc/manufacturer/:manufacturerId",
  createTrustVCRouteHandler(filterManufacturerTrust, mapManufacturerTrust)
);

app.get("/user_settings/:emailAddress", async (req, res) => {
  try {
    await waitForClaimCascade(); // Wait if claimCascadeInProgress is true
    claimCascadeInProgress = true;
    await runClaimCascade();

    const emailAddress = req.params.emailAddress;
    const filePath = path.join(__dirname, "output", "output_db.pl");

    fs.readFile(filePath, "utf-8", (err, data) => {
      claimCascadeInProgress = false;

      if (err) {
        return res.status(500).send("Unable to read the file");
      }

      const lines = data.split("\n");
      let userInfo = null;

      for (const line of lines) {
        const userMatch = line.match(/assert\(user\((.+)\)\)\./);
        if (userMatch) {
          const userFields = userMatch[1].split(",");
          const userEmail = userFields[4].replace(/['"]+/g, "");

          if (userEmail === emailAddress) {
            userInfo = {
              canIssueDeviceTrust: userFields[0].trim() === "true",
              canIssueDeviceTypeTrust: userFields[1].trim() === "true",
              canIssueManufacturerTrust: userFields[2].trim() === "true",
              created_at: parseFloat(userFields[3].trim()),
              email: userEmail,
              username: userFields[5].replace(/['"]+/g, "").trim(),
            };
            break;
          }
        }
      }

      if (userInfo) {
        return res.json(userInfo);
      } else {
        return res.status(404).send("User not found");
      }
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/user_settings", async (req, res) => {
  const {
    emailAddress,
    canIssueDeviceTrust,
    canIssueManufacturerTrust,
    canIssueDeviceTypeTrust,
  } = req.body;

  const customVCPath = path.join(__dirname, "uploads", "vcs", "custom");

  const searchVCs = (dirPath) => {
    return new Promise((resolve, reject) => {
      fs.readdir(dirPath, (err, files) => {
        if (err) {
          return reject(err);
        }

        const vcFiles = files.filter((file) => file.endsWith(".json"));
        const filePromises = vcFiles.map((file) => {
          return new Promise((resolveFile) => {
            fs.readFile(path.join(dirPath, file), "utf8", (err, data) => {
              if (err) {
                return resolveFile(null);
              }

              try {
                const vc = JSON.parse(data);
                if (
                  vc.credentialSubject &&
                  vc.credentialSubject.schemaName === "user" &&
                  vc.credentialSubject.fact.id === emailAddress
                ) {
                  resolveFile(vc.credentialSubject.id);
                } else {
                  resolveFile(null);
                }
              } catch (parseError) {
                resolveFile(null);
              }
            });
          });
        });

        Promise.all(filePromises).then((results) => {
          const foundIds = results.filter((id) => id !== null);
          resolve(foundIds);
        });
      });
    });
  };

  const vcIds = await searchVCs(customVCPath);

  const retractionVCs = [];
  const searchRetractionVCs = (dirPath, vcIds) => {
    return new Promise((resolve, reject) => {
      fs.readdir(dirPath, (err, files) => {
        if (err) {
          return reject(err);
        }

        const vcFiles = files.filter((file) => file.endsWith(".json"));
        const filePromises = vcFiles.map((file) => {
          return new Promise((resolveFile) => {
            fs.readFile(path.join(dirPath, file), "utf8", (err, data) => {
              if (err) {
                return resolveFile(null);
              }

              try {
                const vc = JSON.parse(data);
                if (
                  vc.credentialSubject &&
                  vc.credentialSubject.type === "retraction" &&
                  vc.credentialSubject.claim_id &&
                  vcIds.includes(vc.credentialSubject.claim_id)
                ) {
                  retractionVCs.push(vc);
                }
                resolveFile(null);
              } catch (parseError) {
                resolveFile(null);
              }
            });
          });
        });

        Promise.all(filePromises).then(() => {
          resolve();
        });
      });
    });
  };

  await searchRetractionVCs(customVCPath, vcIds);

  const unretractedVCs = vcIds.filter(
    (vcId) =>
      !retractionVCs.some(
        (retraction) => retraction.credentialSubject.claim_id === vcId
      )
  );

  const createRetractionVC = (vcId) => {
    return {
      "@context": ["https://www.w3.org/ns/credentials/v2"],
      id: `urn:uuid:${uuidv4()}`,
      type: ["VerifiableCredential", "RetractionCredential"],
      issuer: `urn:uuid:${uuidv4()}`,
      credentialSubject: {
        type: "retraction",
        claim_id: vcId,
        timestamp: Date.now(),
      },
    };
  };

  for (const unretractedVCId of unretractedVCs) {
    const retractionVC = createRetractionVC(unretractedVCId);
    const retractionVCPath = path.join(
      customVCPath,
      `User_retraction_${Date.now()}.json`
    );
    fs.writeFileSync(retractionVCPath, JSON.stringify(retractionVC, null, 2));
  }

  const newVC = {
    "@context": ["https://www.w3.org/ns/credentials/v2"],
    id: `urn:uuid:${uuidv4()}`,
    type: ["VerifiableCredential", "UserCredential"],
    name: null,
    description: null,
    issuer: `urn:uuid:${uuidv4()}`,
    validFrom: new Date().toISOString(),
    validUntil: null,
    credentialStatus: null,
    credentialSchema: {
      id: "test",
      type: "JsonSchema",
    },
    credentialSubject: {
      type: "fact",
      schemaName: "user",
      id: uuidv4(),
      timestamp: Date.now(),
      fact: {
        can_issue_device_trust: canIssueDeviceTrust,
        can_issue_manufacturer_trust: canIssueManufacturerTrust,
        can_issue_device_type_trust: canIssueDeviceTypeTrust,
        created_at: Date.now(),
        id: emailAddress,
        username: `${emailAddress.split("@")[0]}-user`,
      },
    },
  };

  const newVCPath = path.join(customVCPath, `User_VC_${Date.now()}.json`);
  fs.writeFileSync(newVCPath, JSON.stringify(newVC, null, 2));

  try {
    await runClaimCascade();
    res.status(200).json({
      message: "User settings updated and VCs generated successfully.",
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Reusable function to get users based on a regex pattern
async function getUsersByPattern(filePath, regexPattern) {
  await waitForClaimCascade(); // Wait if claimCascadeInProgress is true
  claimCascadeInProgress = true;

  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf-8", (err, data) => {
      claimCascadeInProgress = false;
      if (err) {
        return reject("Unable to read the file");
      }

      const lines = data.split("\n");
      const users = [];

      for (const line of lines) {
        let match;
        while ((match = regexPattern.exec(line)) !== null) {
          users.push(match[4].replace(/['"]+/g, ""));
        }
      }

      resolve(users);
    });
  });
}

// Function to handle the response based on regex pattern
const handlePermissionRequest = async (regexPattern, req, res) => {
  try {
    const filePath = path.join(__dirname, "output", "output_db.pl");
    const users = await getUsersByPattern(filePath, regexPattern);
    res.json(users);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Route to get users that can issue device trust
app.get("/permissions/device", (req, res) => {
  const regexPattern = /user\(true,([^,]*),([^,]*),([^,]*),([^,]*),([^,]*)\)/g;
  handlePermissionRequest(regexPattern, req, res);
});

// Route to get users that can issue manufacturer trust
app.get("/permissions/manufacturer", (req, res) => {
  const regexPattern = /user\(([^,]*),true,([^,]*),([^,]*),([^,]*),([^,]*)\)/g;
  handlePermissionRequest(regexPattern, req, res);
});

// Route to get users that can issue device type trust
app.get("/permissions/device_type", (req, res) => {
  const regexPattern = /user\(([^,]*),([^,]*),true,([^,]*),([^,]*),([^,]*)\)/g;
  handlePermissionRequest(regexPattern, req, res);
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
