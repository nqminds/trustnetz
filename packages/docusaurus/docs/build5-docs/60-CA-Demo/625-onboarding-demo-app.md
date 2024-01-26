# Build 5 Web application

### Build

Download the most recent debina package release for arm64 from https://github.com/nqminds/nist-brski/releases/tag/v0.0.1 

```sh
wget https://github.com/nqminds/nist-brski/releases/download/v0.0.1/brski-demo-app-deb_arm64.deb
```
Then please follow the installation instructions found [here.] (https://github.com/nqminds/nist-brski/blob/main/debian-brski/README.md)


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
   <port>8082</port>
  </service>
</service-group>

```

Can be accessed remotley at [http://openport.io:36701/](http://openport.io:36701/) or locally at [http://192.168.20.113:8082](http://192.168.20.113:8082)


### Usage
![Onboarding](https://github.com/ionut-cmd/tmp_img_storage/blob/main/onboard.png?raw=true)

![Onboarding](https://github.com/ionut-cmd/tmp_img_storage/blob/main/offboard.png?raw=true)


