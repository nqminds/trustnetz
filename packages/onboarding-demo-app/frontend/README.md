# NQM BRSKI Demo System – Frontend

This is the frontend application for the NQM BRSKI Demo System. Built using Create React App, this React app provides a modern, cyberpunk-inspired interface for interacting with the backend API. It allows you to initiate device onboarding/offboarding, perform network diagnostics, and view WLAN status in real time.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Production Build](#production-build)
- [Serving with PM2](#serving-with-pm2)
- [Project Structure](#project-structure)


## Features

- **Device Onboarding/Offboarding:**  
  Trigger processes with real-time streamed logs.
  
- **Network Diagnostics (Ping):**  
  Enter an IP address and run ping tests.
  
- **WLAN Status Monitoring:**  
  Periodically fetch WLAN status to display current connectivity.
  
- **Customizable Port:**  
  Set a custom development port using a `.env` file or the `cross-env` package.
  
- **Modern UI:**  
  A sleek, responsive interface built with React.

## Prerequisites

- **Node.js (v12 or later)** and **npm**  
- Optionally, **nvm** (Node Version Manager) for managing Node.js versions
- **PM2** for process management (for production)

## Installation

**Clone the Repository:**

```bash
git clone git@github.com:nqminds/trustnetz.git
cd trustnetz/packages/onboarding-demo-app/frontend
```

**Install Dependencies:**

```bash
npm install
```

**Configure the Port (Optional):**

The `package.json start script` is already set up with `cross-env` to use port 4000:

```json
"start": "cross-env PORT=4000 react-scripts start"
```

## Development

To start the development server, run:

```bash
npm start
```

The app will be available on `http://localhost:4000`. Changes made to the source code will be hot-reloaded automatically.

## Production Build
To create an optimized production build:

```bash
npm run build
```
This will generate a `build/` directory containing static files optimized for production.

## Serving with PM2
To serve your production build using the `serve` package and manage it with PM2, follow these steps:

**Install `serve` Globally** (if not already installed):

```bash
npm install -g serve
```

**Ensure a Production Build Exists:**

```bash
npm run build
```

**Create a PM2 Ecosystem Configuration File:**

Create a file named `ecosystem.config.json` with the following content:

```json
{
  "apps": [{
    "name": "frontend",
    "script": "node_modules/serve/bin/serve.js",
    "args": "-s build -l 4000",
    "watch": false,
    "autorestart": true,
    "max_memory_restart": "1G",
    "env": {
      "NODE_ENV": "production"
    }
  }]
}
```

**Start the Frontend Using PM2:**

```bash
pm2 start ecosystem.config.json
```

**Configure PM2 to Restart on Reboot:**

```bash
pm2 startup
pm2 save
```

This will serve your production build on port `4000` (or adjust the port by modifying the `-l` flag in the configuration).

## Project Structure
```pgsql
frontend/
├── assets/
├── public/
│   └── index.html
├── src/
│   ├── App.css
│   ├── App.js
│   └── nquiringminds.svg
├── package.json
└── README.md
```