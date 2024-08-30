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

const tokenToEmail = {};

var claimCascadeInProgress = false;

// Load emailToPublicKeys.json
let emailToPublicKeys = {};
try {
  emailToPublicKeys = JSON.parse(fs.readFileSync("emailToPublicKeys.json"));
} catch (err) {
  console.error(err);
  // Exit the process if the file cannot be read
  process.exit(1);
}

// Update emailToPublicKeys.json
const updateEmailToPublicKeys = () => {
  fs.writeFileSync(
    "emailToPublicKeys.json",
    JSON.stringify(emailToPublicKeys, null, 2)
  );
};

// Add a public key to an email address
const addPublicKeyToEmail = (email, publicKey) => {
  if (!emailToPublicKeys[email]) {
    emailToPublicKeys[email] = [];
  }
  emailToPublicKeys[email].push(publicKey);
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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

// Takes a Prolog query and returns the result
app.get("/prolog_query", (req, res) => {
  const query = req.query.query;

  logger.info(`GET /prolog_query with query=${query}`);

  // Escape quotes in the Prolog query
  const escapedQuery = query.replace(/'/g, "\\'").replace(/"/g, '\\"');

  // Execute Prolog query
  const command = `swipl -s ./output/output.pl -g "attach_db('./output/output_db'), ${escapedQuery}, halt."`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(400).json({ error: "Bad request" });
    }

    // Parse the output from Prolog (assuming Prolog outputs in JSON or another structured format)
    const result = stdout.trim();

    res.json(result);
  });
});
// Trigger bash script to run claim cascade
app.get("/claim_cascade", async (_req, res) => {
  if (claimCascadeInProgress) {
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!claimCascadeInProgress) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });
  }

  claimCascadeInProgress = true;

  exec("sh run_claim_cascade.sh", (err, _stdout, _stderr) => {
    claimCascadeInProgress = false;
    if (err) {
      logger.error(err);
      res.status(500).send(err);
      return;
    }
    res.status(200).send("Claim cascade complete");
  });
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
    addPublicKeyToEmail(email, publicKey);
    updateEmailToPublicKeys();
  } catch (err) {
    console.error(err);
    return res.send("Error saving public key").status(500);
  }

  return res.send("Sign in successful").status(200);
});

app.get("/all_devices_data", (req, res) => {
  // Command to run Prolog query and retrieve data for all devices
  const command = `
    swipl -s ./output/output.pl -g "attach_db('./output/output_db.pl'), db:output_all_device_data(DeviceDataList), write(current_output, DeviceDataList), halt."`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Execution error: ${error}`);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (stderr) {
      console.error(`Standard error: ${stderr}`);
      return res.status(400).json({ error: "Bad request" });
    }

    // Clean and parse the Prolog output
    const cleanOutput = stdout.slice(1, -1); // Remove square brackets
    const deviceSections = cleanOutput
      .split(/ENTRY\(|\),ENTRY\(|\)$/)
      .filter(Boolean);

    // Convert each string section into an object
    const parseDeviceString = (str) => {
      const obj = {};
      const pairs = str.split(", ");
      pairs.forEach((pair) => {
        const [key, value] = pair.split(": ");
        obj[key] = value;
      });
      return obj;
    };

    // Transform each device string into an object
    const devicesArray = deviceSections.map(parseDeviceString);

    // Transform data into the desired structure
    const transformDeviceData = (device) => ({
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
    });

    const transformedDevices = devicesArray.map(transformDeviceData);

    // Send the transformed data as JSON response
    res.status(200).json(transformedDevices);
  });
});

app.get("/device/:deviceId", (req, res) => {
  // Device specific data
  const deviceId = req.params.deviceId;

  // Command to run Prolog query and retrieve data for a specific device
  const command = `swipl -s ./output/output.pl -g "attach_db('./output/output_db.pl'), db:output_device_data(\\"${deviceId}\\", DeviceData), write(current_output, DeviceData), halt."`;

  console.log("command :>> ", command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Execution error: ${error}`);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (stderr) {
      console.error(`Standard error: ${stderr}`);
      return res.status(400).json({ error: "Bad request" });
    }

    // Clean and parse the Prolog output
    let str = stdout;

    // Replace "N/A" with null
    str = str.replace(/: N\/A/g, ": null");

    // Function to format string to valid JSON
    function formatToJSON(str) {
      // Add quotes around keys and values
      return str
        .replace(/(\w+):/g, '"$1":') // Add quotes around keys
        .replace(/: (\w+(-\w+)?)/g, (match, p1) => {
          // Check if the value is a number or null
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
    // Convert string to JSON object
    let jsonStr = "{" + formatToJSON(str) + "}";

    // Parse the JSON string
    let jsonObject;
    try {
      jsonObject = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Error parsing JSON:", e);
    }

    res.status(200).json(jsonObject);
  });
});

app.get("/manufacturer/:manufacturerId", (req, res) => {
  // Device specific data
  const manufacturerId = req.params.manufacturerId;

  // Command to run Prolog query and retrieve data for a specific device
  const command = `
    swipl -s ./output/output.pl -g "attach_db('./output/output_db.pl'), db:output_manufacturer_data(\\"${manufacturerId}\\", ManufacturerData), write(current_output, ManufacturerData), halt."`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Execution error: ${error}`);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (stderr) {
      console.error(`Standard error: ${stderr}`);
      return res.status(400).json({ error: "Bad request" });
    }

    res.status(200).json(JSON.parse(stdout));
  });
});

app.get("/deviceType/:deviceTypeId", (req, res) => {
  // Device type specific data
  const deviceTypeId = req.params.deviceTypeId;

  // Command to run Prolog query and retrieve data for a specific device
  const command = `
    swipl -s ./output/output.pl -g "attach_db('./output/output_db.pl'), db:output_device_type_data(\\"${deviceTypeId}\\", DeviceTypeData), write(current_output, DeviceTypeData), halt."`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Execution error: ${error}`);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (stderr) {
      console.error(`Standard error: ${stderr}`);
      return res.status(400).json({ error: "Bad request" });
    }

    res.status(200).json(JSON.parse(stdout));

    // res.status(200).json(jsonObject);
  });
});

app.get("/trust_vc/device/:deviceId", async (req, res) => {
  const deviceId = req.params.deviceId;

  if (claimCascadeInProgress) {
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!claimCascadeInProgress) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });
  }

  claimCascadeInProgress = true;

  // Run claim cascade
  exec("sh run_claim_cascade.sh", (err) => {
    claimCascadeInProgress = false;
    if (err) {
      console.error(err);
      return res.status(500).send("Error running claim cascade");
    }

    // Define the file path
    const filePath = path.join(__dirname, "output", "output_db.pl");

    // Read and process the file
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error(`File read error: ${err}`);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Extract the relevant lines with device_trust
      const trustVCs = data
        .split("\n")
        .filter(
          (line) =>
            line.includes("assert(device_trust(") && line.includes(deviceId)
        )
        .map((line) => {
          const [authoriserId, timestamp, device_id] = line
            .replace("assert(device_trust(", "")
            .replace(")).", "")
            .split(",");

          // Clean up extra characters and return an object
          return {
            authoriserId: authoriserId.trim().replace(/['"]/g, ""),
            timestamp: timestamp.trim(),
            deviceId: device_id.trim().replace(/['"]/g, "").replace(")", ""),
          };
        });

      // Ensure each object in trustVCs is unique, based on username, and timestamp
      const uniqueTrustVCs = [];
      trustVCs.forEach((vc) => {
        const existingVC = uniqueTrustVCs.find(
          (existing) =>
            existing.username === vc.username &&
            existing.timestamp === vc.timestamp
        );
        if (!existingVC) {
          uniqueTrustVCs.push(vc);
        }
      });

      // Sort by username, then timestamp
      uniqueTrustVCs.sort((a, b) => {
        if (a.username < b.username) {
          return -1;
        }
        if (a.username > b.username) {
          return 1;
        }
        return a.timestamp - b.timestamp;
      });

      res.status(200).json(uniqueTrustVCs);
    });
  });
});

// Given the {authoriserId, timestamp, deviceId} return the id of the vc in the filesystem that has a matching credentialSubject
// Search /uploads/vcs/custom and /uploads/vcs/device_trust
app.get("/VC_ID/device_trust", (req, res) => {
  const { authoriserId, timestamp, deviceId } = req.query;
  console.log("authoriserId :>> ", authoriserId);
  console.log("timestamp :>> ", timestamp);
  console.log("deviceId :>> ", deviceId);
  // Define the file paths
  const customVCPath = path.join(__dirname, "uploads", "vcs", "custom");
  const deviceTrustVCPath = path.join(
    __dirname,
    "uploads",
    "vcs",
    "claims",
    "device_trust"
  );

  const searchVCs = (dirPath) => {
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
                console.log("file :>> ", file);
                const vc = JSON.parse(data);
                console.log("vc :>> ", vc);
                if (
                  vc.credentialSubject &&
                  vc.credentialSubject.fact &&
                  vc.credentialSubject.fact.authoriser_id === authoriserId &&
                  vc.credentialSubject.fact.created_at === Number(timestamp) &&
                  vc.credentialSubject.fact.device_id === deviceId
                ) {
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

  Promise.all([searchVCs(customVCPath), searchVCs(deviceTrustVCPath)])
    .then(([customVCId, deviceTrustVCId]) => {
      const foundId = customVCId || deviceTrustVCId;
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
});

app.get("/VC_ID/device_type_trust", (req, res) => {
  const { authoriserId, timestamp, deviceTypeId } = req.query;

  // Define the file paths
  const customVCPath = path.join(__dirname, "uploads", "vcs", "custom");
  const deviceTypeTrustVCPath = path.join(
    __dirname,
    "uploads",
    "vcs",
    "claims",
    "device_type_trust"
  );

  const searchVCs = (dirPath) => {
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
                if (
                  vc.credentialSubject &&
                  vc.credentialSubject.fact &&
                  vc.credentialSubject.fact.authoriser_id === authoriserId &&
                  vc.credentialSubject.fact.created_at === Number(timestamp) &&
                  vc.credentialSubject.fact.device_type_id === deviceTypeId
                ) {
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

  Promise.all([searchVCs(customVCPath), searchVCs(deviceTypeTrustVCPath)])
    .then(([customVCId, deviceTypeTrustVCId]) => {
      const foundId = customVCId || deviceTypeTrustVCId;
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
});

app.get("/trust_vc/device_type/:deviceTypeId", async (req, res) => {
  const deviceTypeId = req.params.deviceTypeId;

  if (claimCascadeInProgress) {
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!claimCascadeInProgress) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });
  }

  claimCascadeInProgress = true;

  // Run claim cascade
  exec("sh run_claim_cascade.sh", (err) => {
    claimCascadeInProgress = false;
    if (err) {
      console.error(err);
      return res.status(500).send("Error running claim cascade");
    }

    // Define the file path
    const filePath = path.join(__dirname, "output", "output_db.pl");

    // Read and process the file
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error(`File read error: ${err}`);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Extract the relevant lines with device_type_trust
      const trustVCs = data
        .split("\n")
        .filter(
          (line) =>
            line.includes("assert(device_type_trust(") &&
            line.includes(deviceTypeId)
        )
        .map((line) => {
          const [authoriserId, timestamp, device_type_id] = line
            .replace("assert(device_type_trust(", "")
            .replace(")).", "")
            .split(",");

          // Clean up extra characters and return an object
          return {
            authoriserId: authoriserId.trim().replace(/['"]/g, ""),
            timestamp: timestamp.trim(),
            deviceTypeId: device_type_id
              .trim()
              .replace(/['"]/g, "")
              .replace(")", ""),
          };
        });

      // Ensure each object in trustVCs is unique, based on username, and timestamp
      const uniqueTrustVCs = [];
      trustVCs.forEach((vc) => {
        const existingVC = uniqueTrustVCs.find(
          (existing) =>
            existing.username === vc.username &&
            existing.timestamp === vc.timestamp
        );
        if (!existingVC) {
          uniqueTrustVCs.push(vc);
        }
      });

      // Sort by username, then timestamp
      uniqueTrustVCs.sort((a, b) => {
        if (a.username < b.username) {
          return -1;
        }
        if (a.username > b.username) {
          return 1;
        }
        return a.timestamp - b.timestamp;
      });

      res.status(200).json(uniqueTrustVCs);
    });
  });
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
