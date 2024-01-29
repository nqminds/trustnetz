# Build 5 Web application

## Build

Download the most recent arm64 debian package [release](https://github.com/nqminds/nist-brski/releases/tag/v0.0.1)

```sh
wget https://github.com/nqminds/nist-brski/releases/download/v0.0.1/brski-demo-app-deb_arm64.deb
```
Then please follow the installation instructions found in the [nist-brski](https://github.com/nqminds/nist-brski/blob/main/debian-brski/README.md) repository.


During installation, a **PORT** number must be specified for the service.

To publish the demo app locally, please follow the methods below.
    
1. Install avahi-deamon
```sh
sudo apt install avahi-daemon
```

2. Create a new  service for the app and add it to ```/etc/avahi/services/demo-server.service``` 
```htmlbars=
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
 <name replace-wildcards="yes">%h Demo Server</name>
  <service>
   <type>_demo-server._tcp</type>
   <port>YOUR_CHOSEN_PORT_NUMBER</port>
  </service>
</service-group>

```

2. Restart the deamon

```sh
sudo service avahi-daemon restart
```

3. Advertise the new service 

```sh
avahi-publish -s demo-server _demo-server._tcp  YOUR_CHOSEN_PORT_NUMBER
```

4. Publish using openport

```sh
sudo YOUR_CHOSEN_PORT_NUMBER --http-forward --restart-on-reboot --daemonize
```

On the supplied devices, the app can be accesed as follow:

Remotley at [http://openport.io:36701/](http://openport.io:36701/) or locally at [http://http://192.168.1.159/:8082](http://http://192.168.1.159/:8082)


## Usage

### Onboarding Process:
![Onboarding](https://github.com/ionut-cmd/tmp_img_storage/blob/main/onboard.png?raw=true)

#### Onboard Button

Initiates the onboarding process for an IoT device, connecting it to a secure network.
**Start Onboarding:** The application begins the onboarding process.

**Disconnects from Wi-Fi:** If the device is currently connected to any Wi-Fi network, it attempts to disconnect.

If the device is not active on a network, it may show an error but will proceed with the process.

**Connects to brski-open Network:** The device connects to an open Wi-Fi network named brski-open to discover the registrar.

**Finds Registrar:** The app looks for the registrar's IP address and port.

**Runs BRSKI Commands:** It executes the BRSKI (Bootstrapping Remote Secure Key Infrastructures) process, which includes:

*Sending a voucher* request to the registrar.
*Signing certificates* with the registrar's information.
*Receives Certificates:* The app retrieves signed certificates necessary for secure communication.

**Disconnects from brski-open:** After obtaining the certificates, the device disconnects from the brski-open network.

**Connects to registrar-tls-ca Network:** It connects to a secure network named registrar-tls-ca, which uses the obtained certificates for secure EAP-TLS authentication.

**Completes Onboarding:** The onboarding process is completed, and the device is now securely connected to the registrar-tls-ca network.


### Offboarding Process:
![Onboarding](https://github.com/ionut-cmd/tmp_img_storage/blob/main/offboard.png?raw=true)


#### Offboard Button

When you want to remove the IoT device from the secure network and delete its network profile, you use this button. Here's the offboarding sequence:


**Begins Offboarding:** The application starts the offboarding process for the IoT device.

**Disconnects from Network:** The device is disconnected from the current network (registrar-tls-ca).

**Removes Connection Profile:** The network connection profile for registrar-tls-ca is deleted from the device, ensuring it no longer automatically connects to this network.

**Completes Offboarding:** The device is now offboarded, and the secure connection profile is successfully removed.


### The same functionality is directly accessible through scripts

For onboarding/offboarding we can run the following commands:

Onboard
```sh
sudo ./opt/demo-server/bash-scripts/onboard.sh
```


Offboard
```sh
sudo ./opt/demo-server/bash-scripts/offboard.sh
```























