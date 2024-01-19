
### How to build the package

First add server_arm64 and server_x86 to opt/demo-server
```sh
# from root dir
dpkg-deb --build brski-demo-app-deb
```

### Instal package
The installation script should install the correct binaries based on the system is installed on.
```sh
sudo dpkg -i brski-demo-app-deb.deb
# enter port number
```

### Install Brski
Make the brski installation script executable
```sh
sudo chmod +x /opt/demo-server/bash-scripts/install_brski.sh
```

Run the brski installation script:
```sh
sudo /opt/demo-server/bash-scripts/install_brski.sh
```

### Check status

```sh
systemctl status demo-server.service
```

### Start/Stop service

```sh
# To start the service
sudo systemctl start demo-server.service

# To stop the service
sudo systemctl stop demo-server.service

```

### enable/disable service on reboot

```sh
# To enable the service to start on boot
sudo systemctl enable demo-server.service

# To disable the service from starting on boot
sudo systemctl disable demo-server.service

```
### Uninstall

```sh
sudo systemctl disable demo-server.service
sudo dpkg -r demo-server   
sudo rm /etc/systemd/system/demo-server.service

```

### Check it has been successfully uninstalled:

```sh
ls /opt/ | grep demo-server
ls /etc/systemd/system/ | grep demo-server
```

### If demo-server still present

```sh
sudo -rm -r /opt/demo-server
```