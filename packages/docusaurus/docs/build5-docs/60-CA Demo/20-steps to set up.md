---
title: Instructions to set up on registrar
---

Follow these steps on the machine acting as the registrar in order to run the Continous Assurance workflow.

### Step 1
Install V0.14.* of [the volt](https://docs.tdxvolt.com/en/clients/web).

### Step 2
Clone the [nist-brski github repo](https://github.com/nqminds/nist-brski)


### Step 3
Install node v18 & npm, I'd suggest installed nvm with `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash` and then using `nvm install 18` followed by `nvm use 18`.

### Step 4
Navigate to the following 4 directories and run `npm install` in each of them:
- `nist-brski/packages/schemas`
- `nist-brski/packages/nist_vc_rest_server`
- `nist-brski/packages/nist_registrar_server`
- `nist-brski/packages/registrar_demo_app`

### Step 5



```
// tdxvolt.service
[Unit]
Description=tdxVolt

[Service]
ExecStart=/home/registrar/volt-0.14/bin/volt run -i @registrar14 -l /home/registrar/volt-0.14/battery
WorkingDirectory=/home/registrar/volt
Environment="TDXVOLT_LOG_LEVEL=DEBUG"
Environment="TDXVOLT_LOG_DEBUG=all,-database,-policy"
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```
//vc-server.service
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

```
// registrar-rest-server.service
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

```
// registrar-app.service
[Unit]
Description=Registrar React App
After=registrar-rest-server.service

[Service]
ExecStart=/home/registrar/.nvm/versions/node/v18.19.0/bin/node /home/registrar/Documents/nist-brski/packages/registrar_demo_app/server.js
WorkingDirectory=/home/registrar/Documents/nist-brski/packages/registrar_demo_app
Restart=on-failure

[Install]
WantedBy=multi-user.target
```


```
sudo openport 3002 --restart-on-reboot --daemonize
```