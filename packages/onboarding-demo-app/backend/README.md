# Demo Server API for BRSKI

This project provides a Node.js-based API for managing a BRSKI demonstration system on a Raspberry Pi. It exposes endpoints to retrieve WLAN status, perform ping tests, and run onboard/offboard bash scripts with streaming output.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)


## Features

- **WLAN Status:** Retrieves WLAN status using the `iw` command.
- **Ping:** Performs ping tests on a given IP address using a specified network interface.
- **Onboard/Offboard Scripts:** Runs bash scripts (with sudo privileges) for device onboarding/offboarding, with real-time, streaming log output.
- **Streaming Responses:** Sends output data as it’s generated from the bash scripts.
- **CORS & JSON Parsing:** Uses Express middleware to enable CORS and JSON request parsing.

## Prerequisites

- **Node.js and npm:** Install Node.js (v12 or later) and npm.
- **Bash & sudo:** The bash scripts need proper execution permissions.  
  *Tip:* Configure passwordless sudo for the scripts in `/etc/sudoers` so your Node.js process can run them non-interactively.
- **PM2:** PM2 is used to manage and auto-restart the API service.
  
Install PM2 globally by running:

```bash
npm install -g pm2
```
## Installation
Clone the Repository:

```bash
git clone git@github.com:nqminds/trustnetz.git
cd trustnetz
```
### Install Dependencies:

```bash
npm install
```

### Configure the API:

Edit the `config.json` file with appropriate paths and values:

```json
{
  "port": 4002,
  "onboardingScriptPath": "./bash-scripts/onboard.sh",
  "offboardingScriptPath": "./bash-scripts/offboard.sh",
  "onboardingLogFilePath": "./onboarding_log_file.txt",
  "offboardingLogFilePath": "./offboarding_log_file.txt",
  "interface": "wlan0"
}
```
Ensure that the referenced bash scripts exist, have execution permissions, and that any paths are correctly set.

## API Endpoints

### GET `/api/wlan0-status`

* **Description**: Retrieves WLAN status for the interface specified in `config.json` using the command `iw <interface> link`.

* **Response**: Plain text output containing WLAN status information.

**Example Response**:

```vbnet
Connected to MyNetwork (SSID "registrar-tls-ca")
signal: -50 dBm  
...
```


### GET `/api/ping`
* **Description**: Executes a ping test to a given IP address using a specified network interface.

* **Parameters**:

    * `ip` (required): The target IP address.

    * `interface` (required): The network interface to use for ping.

* **Response**: Plain text output of the ping results.

**Example Request**:

```vbnet
GET /api/ping?ip=8.8.8.8&interface=wlan0
POST /api/onboard
```

### POST `/api/onboard`

* **Description**: Runs the onboarding bash script with sudo privileges. Logs from the execution are streamed in real time.

* **Response**: A streamed plain text response including both STDOUT and STDERR data, followed by the process exit code.

* **Usage**: Trigger this endpoint to initiate the device `onboarding` process.

### POST `/api/offboard`

* **Description**: Runs the offboarding bash script with sudo privileges. Outputs are streamed as they are generated.

* **Response**: A streamed plain text response including both STDOUT and STDERR data, followed by the process exit code.

* **Usage**: Trigger this endpoint to initiate the device `offboarding` process.
