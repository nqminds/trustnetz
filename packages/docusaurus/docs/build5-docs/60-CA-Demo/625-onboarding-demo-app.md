# Build 5 Web application

## Build

Download the most recent arm64 debian package [release](https://github.com/nqminds/nist-brski/releases/tag/v0.0.1)

```sh
wget https://github.com/nqminds/nist-brski/releases/download/v0.0.1/brski-demo-app-deb_arm64.deb
```
Then please follow the installation instructions found in the [nist-brski](https://github.com/nqminds/nist-brski/blob/main/debian-brski/README.md) repository.


During installation, a <span style="color:#ff0000;">PORT</span> number must be specified for the service.

For publishing the demo-app localy please follow the instructions bellow
    
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

Remotley at [http://openport.io:36701/](http://openport.io:36701/) or locally at [http://192.168.20.113:8082](http://192.168.20.113:8082)


## Usage

### Onboarding Process
![Onboarding](https://github.com/ionut-cmd/tmp_img_storage/blob/main/onboard.png?raw=true)

#### Onboard Button

Initiates the onboarding process for an IoT device, connecting it to a secure network



![Onboarding](https://github.com/ionut-cmd/tmp_img_storage/blob/main/offboard.png?raw=true)





































