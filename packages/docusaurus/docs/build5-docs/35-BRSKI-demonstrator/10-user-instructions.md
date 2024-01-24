 

## Build 5 Web application

There is a web application from which the onboarding and offboarding can easily be triggered.

This is accessible from the internal webserver 

http://192.168.20.113:8082 

:::danger TODO

Ionut: add screen shot of demo sever here with basic instructions 

:::





The same functionality is directly accessible through scripts 

## **IOT Gateway**

  \- Hostname: nqm-britannic-brski

  \- Network IPs: [192.168.20.117/24](http://192.168.20.117/24), [192.168.49.4/29](http://192.168.49.4/29)

  \- Account: brski

  \- Password: 1234554321

  \- Type: sudo privileges

  \- Service: Use sudo systemctl status nist-demo.service to check the status of the brski gateway code service

  \- Logs:

   $ sudo journalctl -u nist-demo.service -b

   $ sudo journalctl -u [hostapd@wlx1cbfce651dc4.service](mailto:hostapd@wlx1cbfce651dc4.service) -b

   $ sudo journalctl -u [hostapd@wlx1cbfce699b7f.service](mailto:hostapd@wlx1cbfce699b7f.service) -b

   $ sudo journalctl -u [dnsmasq@wlx1cbfce651dc4.service](mailto:dnsmasq@wlx1cbfce651dc4.service) -b

   $ sudo journalctl -u [dnsmasq@wlx1cbfce699b7f.service](mailto:dnsmasq@wlx1cbfce699b7f.service) -b

 

## **IOT Pledge**

  \- Hostname: nqm-benign-brski

  \- Network IPs: [192.168.20.113/24](http://192.168.20.113/24)

  \- Account: brski

  \- Password: 1234554321

  \- Type: sudo privileges

  \- Onboarding: To test the boarding run as follows:

   $ cd /home/alexandru/demo-server/bash-scripts

   $ sudo ./onboard.sh

  \- Offboarding: To test the offboarding run as follows:

   $ cd /home/alexandru/demo-server/bash-scripts

   $ sudo ./offboard.sh

