const express = require('express');
const cors = require('cors');
const { exec, spawn } = require('child_process');
const path = require('path');
const { 
  port,
  onboardingScriptPath,
  offboardingScriptPath,
  interface

 } = require('./config.json');

const app = express();
const PORT = port|| 8082;


// Middleware
app.use(cors());
app.use(express.json());

// API Endpoints
app.get('/api/wlan0-status', (req, res) => {
  exec(`nmcli -t -f GENERAL,IP4 dev show ${interface}`, (error, stdout, stderr) => {
    if (error) {
      console.error('WLAN Status Error:', error);
      return res.status(500).json({ error: 'Failed to get WLAN status' });
    }
    res.send(stdout);
  });
});

app.get('/api/ping', (req, res) => {
  const { ip, interface: iface } = req.query;
  
  if (!ip || !iface) {
    return res.status(400).json({ error: 'Both IP address and interface are required' });
  }

  exec(`ping -c 3 -I ${iface} ${ip}`, (error, stdout, stderr) => {
    if (error) {
      console.error('Ping Error:', error);
      return res.status(500).json({ error: 'Ping failed' });
    }
    res.send(stdout);
  });
});


app.post('/api/onboard', (req, res) => {
  // Set headers for streaming
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked'
  });

  const child = spawn('bash', [onboardingScriptPath], {
    stdio: ['ignore', 'pipe', 'pipe'] // Capture stdout and stderr
  });

  // Stream stdout
  child.stdout.on('data', (data) => {
    res.write(`STDOUT: ${data}`);
  });

  // Stream stderr
  child.stderr.on('data', (data) => {
    res.write(`STDERR: ${data}`);
  });

  // Handle completion
  child.on('close', (code) => {
    res.end(`\nProcess exited with code ${code}`);
  });

  // Handle errors
  child.on('error', (err) => {
    console.error('Onboard Error:', err);
    res.end(`\nError: ${err.message}`);
  });
});

app.post('/api/offboard', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked'
  });

  const child = spawn('bash', [offboardingScriptPath], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  child.stdout.on('data', (data) => {
    res.write(`STDOUT: ${data}`);
  });

  child.stderr.on('data', (data) => {
    res.write(`STDERR: ${data}`);
  });

  child.on('close', (code) => {
    res.end(`\nProcess exited with code ${code}`);
  });

  child.on('error', (err) => {
    console.error('Offboard Error:', err);
    res.end(`\nError: ${err.message}`);
  });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});