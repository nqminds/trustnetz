To demo the system there are 2 apps, one controls the pledge device, the other allows you to submit information to the registrar and view the state of the registrar.

## Build 5 Web application - Pledge

On the supplied devices, the app can be accesed as follow:

Remotley at [https://openport.io/l/36701/Hml13gRqlf8l8006](https://openport.io/l/36701/Hml13gRqlf8l8006) or locally at [http://pledge.local:8082/](http://pledge.local:8082/)


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


# Build 5 Registrar Web Application

The Registrar Demo App is a web-based user interface running on the access point which allows you to send sign and send verifiable credential claims as if you were a network owner.

On the supplied devices, the app can be accessed as follows:

Remotely at [https://openport.io/l/21423/5FbFMfRa0Nx9RG0i](https://openport.io/l/21423/5FbFMfRa0Nx9RG0i) or locally at [http://registrar.local:3002/](http://registrar.local:3002/)


![Web based UI displaying control panel buttons and, list of VCs and information about manufacturer, device and device type](app-page.png)

The app is split into 3 panels, the left-most panel allows you to select, from the registrar's database, a manufacturer, a device, and a device type. The information on the middle panel reflects the information in the database on the selected entities. The right panel displays all the verifiable credential (VC) claims submitted to the registrar and the response the registrar responded with upon receiving the claim.

When a device attempts to onboard onto the access point the policy is checked on the registrar using the rust library functions, these 3 methods check the following 3 queries:

1) if the device manufacturer (the issuer of the device's IdevID) has been trusted by the network owner or someone with permissions to trust manufacturers
2) if the device is trusted by someone with permissions to permit connection of devices
3) if the device type bound to the device has any vulnerabilities above the set threshold - for the demo policy we have set if the device type has any High or Critical severity vulnerabilities as the threshold.

If the manufacturer is not found in the database it is added, and returns that it is not trusted, likewise, if the device is not found by the method used to check it's trust it is also added to the database, and an entry binding it to it's manufacturer is inserted. If the device has not been bound to a device type, which must currently be done by a sufficiently permissioned user through the UI, then the vulnerability check assumes the device is vulnerable. 

Select the device of interest using the **Select Device** selection box, the device for the demo system is 12345, which is the serial number of the device:

![Alt text](device-selection.png)

You can see the present state of the select device on the right, it has name 12345, manufacturer is `manufacturer`, the manufacturer is Trusted, the device type is Raspberry Pi, it is not vulnerable, and it is not trusted.

![Alt text](device-info.png)

In order for the device to be allowed onto the network, the device must display the following boolean values:

```bash
manufacturerTrusted: True
vulnerable: False
trusted: True
```

If any of these are in the opposite boolean state the device will be kicked off the network at the next policy evaluation, which occurs once a minute.

If a new device onboards onto the router, the policy enforcement software will run on the router and contact the registrar to test the policy using the idevID, in doing so an entry for manufacturer (the idevID issuer) and the device will be entered into the registrar's database, and the device will be bound to that manufacturer. Initially both will be untrusted.

Using this demo app a human agent takes the role of the network owner and may grant (or revoke) trust to a manufacturer and, seperately, to a device. They may also bind the device to a device type in the registrar's database by selecting the device type and clicking the `Set Device Type` button, which ties a device to a device type. This is required for a device to be permitted to stay connected to the network, as it is used to determine if the device is vulnerable or not.
