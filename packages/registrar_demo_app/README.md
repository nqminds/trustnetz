This is the NIST Registrar Demo App 

## Setup

### Step 1
Run the [Volt, VC Rest API and Registrar Rest API following the instructions](https://github.com/nqminds/nist-brski/blob/main/packages/nist_registrar_server/README.md).

### Step 2
Configure the app to use the address of the VC Rest API and registrar Rest API and a user as the claim making user from the SQlite database. 

You can do this by setting these 2 constants in server.js:
```js
const VCRestAPIAddress = "http://localhost:3000";
const RegistrarAPIAddress = "http://localhost:3001";
```

And the user constant in src/config.js:
```js
const user = "Nick";
```

### Step 3
Run the app with `npm run dev`

Open the webpage in the browser. You should be able select the manufacturer, device and device_type of interest and push the buttons to sign and submit VCs to the Registrar Rest API. The information on the selected entities should be visable on the right panel, and the middle panel should show a log of the VCs submitted and the responses of the Registrar server API.

![Alt text](app-screenshot.png)