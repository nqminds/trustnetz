const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const morgan = require("morgan");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = 3001;

const tokenToEmail = {};

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

const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    // Only accept json files
    if (file.mimetype === "application/json") {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

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

// Upload verifiable credentials
app.post("/upload", upload.single("file"), (req, res) => {
  console.log(req.file);
  res.send("File uploaded successfully");
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
app.get("/claim_cascade", (_req, res) => {
  exec("sh run_claim_cascade.sh", (err, _stdout, _stderr) => {
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
    addPublicKeyToEmail(email, publicKey);
    updateEmailToPublicKeys();
  } catch (err) {
    console.error(err);
    return res.send("Error saving public key").status(500);
  }

  return res.send("Sign in successful").status(200);
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
