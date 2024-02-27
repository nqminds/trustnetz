---
title: Instructions to set up on registrar
---

Follow these steps on the machine acting as the registrar in order to run the Continuous Assurance workflow.

### Install TDX Volt
Install V0.14.* of [the volt](https://docs.tdxvolt.com/en/clients/web).


### Create a volt to host the VC toolchain
[Follow the instructions to create a volt with an alias](https://docs.tdxvolt.com/en/how-to/create-volt) in this demo I have used the alias `@registrar14`.

For example I have used:

```
/home/registrar/volt-0.14/bin/volt create -n "Your Volt Name" -a yourVoltAlias -k /path/to/keyfile
```

Your keyfile will then be populated with the private key generated for the volt, you can then securely copy this to your local machine to connect to the volt with the fusebox. The config will be logged to the terminal on creation, you can also use `/home/registrar/volt-0.14/bin/volt config` to list all the volts on your machine, which should produce something like:
```
----------------------------------------
uuid: 89e124fb-1e5e-46f4-aae8-f0fa8035e180
alias: yourVoltAlias
name: Your Volt Name
location: /home/registrar/Public/tdxVolt/battery/volt/89e124fb-1e5e-46f4-aae8-f0fa8035e180

----------------------------------------
```

And you can use this command with either the alias (prepended with an `@` symbol) or uuid get the config details for the volt you have created with:

`./volt config -i @yourVoltAlias`

You can then paste this config into your fusebox running on your local machine, along with loading the keyfile to remotely connect to your newly created volt.

### Clone the nist-brski github repo
Clone the [nist-brski github repo](https://github.com/nqminds/nist-brski)


### Install npm
Install node v18 & npm, I'd suggest installed nvm with `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash` followed by running `source ~/.bashrc` to load nvm into your current shell. You can then use `nvm install 18` followed by `nvm use 18` to install node version 18 and set it as the active node version.

### Install verfiable credential schemas toolchain
Run `npm i -g @nqminds/verifiable-schemas-toolchain` to install the verifiable credentail schema toolchain globally.


### npm install packages
Navigate to the following 4 directories and run `npm install` in each of them:
- `nist-brski/packages/schemas`
- `nist-brski/packages/nist_vc_rest_server`
- `nist-brski/packages/nist_registrar_server`
- `nist-brski/packages/registrar_demo_app`

### Setup service to run the volt
We use systemd to setup the services which need to run in order for the system to work. It allows processes to be started at boot-time and the order to be specified. 

Here we will create a service to run the volt when the pc is booted.

Files for services are located in `/etc/systemd/system`. 

In this directory create a file titled `tdxvolt.service` with the following contents:

```bash
# tdxvolt.service
[Unit]
Description=tdxVolt

[Service]
ExecStart=/home/registrar/volt-0.14/bin/volt run -i @registrar14 -l /home/registrar/volt-0.14/battery
WorkingDirectory=/home/registrar/volt-0.14
Environment="TDXVOLT_LOG_LEVEL=DEBUG"
Environment="TDXVOLT_LOG_DEBUG=all,-database,-policy"
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Where `/home/registrar/volt-0.14` is the directory where the volt is installed, `@registrar14` is the alias of your volt, and `/home/registrar/volt-0.14/battery` is the location of your [volt battery](https://docs.tdxvolt.com/en/reference/battery) on disk. This service will start your volt running.

Run the service you've just created with `systemctl start tdxvolt.service` you can check it has run correctly with `systemctl status tdxvolt.service`.

### Create user on volt
Then using the config of the volt and the private key you can connect to that volt from a fusebox instance running on another machine running on the local network and use that to create an identity from which to run the VC toolchain.

### Export volt config to a file
Export the volt config for that user to a json file, like volt-config.json, an example is shown below

```bash
{
  "volt": {
    "id": "84a00cfb254319--a7292599dfa-e8788-4d",
    "display_name": "registrar 14",
    "address": "192.168.1.153:38617",
    "ca_pem": "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----\n"
  },
  "client_name": "registrar",
  "credential": {
    "client_id": "427-c5-3380-f58e2cc30-d3eaa827835090",
    "key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
    "ca": "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----\n",
    "bindIp": "192.168.1.153",
    "cert": "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----\n"
  }
}
```

### Run the VC schemas through the VC toolchain
Open the `nist-brski/packages/schemas` directory in your clone of the github repository and follow the instructions in the README.md file.

In brief:
- run `npm i -g @nqminds/verifiable-schemas-toolchain` - this installs the VC toolchain cmd-line utilities globally
- run `npm run prepare` - this verifies the schemas and outputs up the ./output directory
- run `schemaTools init --config volt-config.json` where `volt-config.json` is the path to your volt config file exported on the previous step. This initialises the schemas directory on the volt.
- run `volt up ./output/* schemas` this uploads the output files to the schema directory on the volt, which means your volt is ready to be used with the VC toolchain to sign and verify VCs.

### Add the location of the volt config file to the VC REST API's config
Open the config.json file in `nist-brski/packages/nist_vc_rest_server/config.json` and enter the path to the volt config file.

```
{
  "voltConfigPath": "../volt-config.json"
}
```

### Setup service to run VC REST API
Here we will create a service to run the VC REST API when the machine is booted.

In the `/etc/systemd/system` directory create a file titled `vc-server.service` with the following contents:

```bash
# vc-server.service
[Unit]
Description=VC Rest Server
After=tdxvolt.service

[Service]
ExecStart=/home/registrar/.nvm/versions/node/v18.19.0/bin/node /home/registrar/Documents/nist-brski/packages/nist_vc_rest_server/bin/vc-server.js
WorkingDirectory=/home/registrar/Documents/nist-brski/packages/nist_vc_rest_server
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Where `/home/registrar/.nvm/versions/node/v18.19.0/bin/node` is the path to the node binary on your PC, `/home/registrar/Documents/nist-brski/packages/nist_vc_rest_server/bin/vc-server.js` is the full path to the `nist-brski/packages/nist_vc_rest_server/bin/vc-server.js` file on the registrar machine. This service will start the VC REST API server running on the machine on port `3000`. `After=tdxvolt.service` makes sure it runs after the volt has been started.

Run the service you've just created with `systemctl start vc-server.service` you can check it has run correctly with `systemctl status vc-server.service`.

### Set up script to restart services if the IP address changes
If the IP address of the registrar changes then the tdx volt needs to be restarted to run on the new IP address, and the volt config needs to be updated.

We have implemented a bash script which watches the IP address of the `network interface` which is connecting the registrar to to the internet and the `volt config file` being used for the VC REST API Server. This script updates the IP address in the volt config file if it doesn't match the IP address of the network interface on it's initial run or if the IP address changes at a later time while the script is running.

You will need to run `sudo apt-get install jq` to install [jq](https://linuxhint.com/bash_jq_command/) which is used to parse json files in bash.

In order for this script to work you also need to make sure that the user running the script has the necessary sudo privileges without a password prompt for these specific systemctl commands. You can configure sudo by editing the sudoers file using the `visudo` command:

```bash
sudo visudo
```

Add the following lines to allow the user to run systemctl restart commands without a password prompt:

```bash
your_username ALL=(ALL) NOPASSWD: /bin/systemctl restart tdxvolt.service
your_username ALL=(ALL) NOPASSWD: /bin/systemctl restart vc-server.service
your_username ALL=(ALL) NOPASSWD: /bin/systemctl restart registrar-rest-server.service
your_username ALL=(ALL) NOPASSWD: /bin/systemctl restart registrar-app.service
```

We can set this script to run as a service so that the volt should always be running on the correct IP address and the VC REST API should always be instantiated with the correct volt config.

```bash
# restart-on-ip-change.service
[Unit]
Description=Restart Volt update volt config file and start dependant services on IP address change

[Service]
ExecStart=/home/registrar/Documents/nist-brski/packages/handle_IP_addr_changes/restart_on_IP_changes.sh eth0 /home/registrar/Documents/nist-brski/packages/nist_vc_rest_server/volt-config.json
WorkingDirectory=/home/registrar/Documents/nist-brski/packages/handle_IP_addr_changes
Restart=on-failure
User=registrar
Group=registrar

[Install]
WantedBy=multi-user.target
```

Where `/home/registrar/Documents/nist-brski/packages/handle_IP_addr_changes/restart_on_IP_changes.sh` is the path to the script in the cloned github repo, `eth0` is the network interface we are using to connect to the internet from the registrar machine, this can be found using `ifconfig` on linux, and `/home/registrar/Documents/nist-brski/packages/nist_vc_rest_server/volt-config.json` is the path to the `volt-config.json` file being used for the VC REST API server we exported earlier.

Run the service you've just created with `systemctl start restart-on-ip-change.service` you can check it is running correctly with `systemctl status restart-on-ip-change.service`.

### Setup service to run Registrar REST API
Now we will setup a service to run the registrar REST API, this is the API that receives VCs from agents which wish to make claims to the registrar.

First open the config.json file in `nist-brski/packages/nist-registrar-server/config.json` and enter the path to the sqlite database file you would like to use, it's created if it doesn't exist and populated with some demo data. Also set the address that the VC Rest API is running at, it should be `http://localhost:3000` by default.

```
{
  "sqliteDBPath": "../MyLocalDatabase.sqlite",
  "nistVcRestServerAddress": "http://localhost:3000"
}
```

Now add a `registrar-rest-server.service` to the `/etc/systemd/system` directory with the following contents:

```bash
# registrar-rest-server.service
[Unit]
Description=Registrar Rest Server
After=vc-server.service

[Service]
ExecStart=/home/registrar/.nvm/versions/node/v18.19.0/bin/node /home/registrar/Documents/nist-brski/packages/nist_registrar_server/bin/run-server.js
WorkingDirectory=/home/registrar/Documents/nist-brski/packages/nist_registrar_server
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

This sets up the service to run the registrar REST API after the vc-server service has started.

Run the service you've just created with `systemctl start registrar-rest-server.service` you can check it has run correctly with `systemctl status registrar-rest-server.service`.

### Set up the service to run the demo web app
We will now set up the service to run the web app with the UI to sign and submit VCs to the registrar server.

Navigate to `packages/registrar_demo_app` in your cloned github repo and open the `server.js` file in there, make sure that the 2 constants on lines 6 and 7 point to the addresses of your 2 running server.js, and the `port` on line 11 sets the port on the machine that the app webserver runs from.

```javascript {6-7,11} showLineNumbers
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const express = require('express');

const VCRestAPIAddress = "http://localhost:3000";
const RegistrarAPIAddress = "http://localhost:3001";

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3002

```

Now add a `registrar-app.service` to the `/etc/systemd/system` directory with the following contents:

```bash
# registrar-app.service
[Unit]
Description=Registrar React App
After=registrar-rest-server.service

[Service]
ExecStart=/home/registrar/.nvm/versions/node/v18.19.0/bin/node server.js
WorkingDirectory=/home/registrar/Documents/nist-brski/packages/registrar_demo_app
Restart=on-failure
User=registrar
Group=registrar
Environment=PATH=/home/registrar/.nvm/versions/node/v18.19.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

[Install]
WantedBy=multi-user.target
```

This sets up a service to run the app after the registrar rest server service has run.

Run the service you've just created with `systemctl start registrar-app.service` you can check it has run correctly with `systemctl status registrar-app.service`.

The web app should now be running on your selected port on the machine.

### Share port with openport
You can now [use openport service to open share the port with the openport application](https://openport.readthedocs.io/en/latest/usage.html) like so:


```
sudo openport 3002 --restart-on-reboot --daemonize
```

Where 3002 is the port you are running the web app from.