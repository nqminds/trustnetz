# Raspberry Pi Deployment Guide

This guide explains how to set up the application to run automatically on a Raspberry Pi using PM2 and Node.js.

## Prerequisites
- Raspberry Pi running Raspberry Pi OS (latest recommended)
- Internet connection
- Basic terminal knowledge

## Installation Steps

### Install NVM (Node Version Manager)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
```

### Install Node.js

```bash
nvm install 18.20.2
nvm use 18.20.2
nvm alias default 18.20.2
```

### Install PM2


```bash
npm install -g pm2
```

## Application Setup

### Start Applications with PM2

```bash
# Backend
cd packages/onboarding-demo-app/backend
npm install
pm2 start ecosystem.config.json
# Frontend
cd packages/onboarding-demo-app/frontend
npm install
pm2 start ecosystem.config.json
```

## Auto-Start Configuration

### Configure PM2 Startup

```bash
pm2 startup systemd -u $USER --hp $HOME
```

Run the command `that PM2 outputs`, which will look like:

```bash
## Example output
sudo env PATH=$PATH:/home/nqm-perfect-pi/.nvm/versions/node/v18.20.2/bin /home/nqm-perfect-pi/.nvm/versions/node/v18.20.2/lib/node_modules/pm2/bin/pm2 startup systemd -u nqm-perfect-pi --hp /home/nqm-perfect-pi
```

Save PM2 Process List

```bash
pm2 save
```

## Verification

### Test Reboot

```bash
sudo reboot
```
### Check Status After Reboot

```bash
pm2 list
```
### View Logs (if needed)

```bash
pm2 logs `<app name or id>`
```
