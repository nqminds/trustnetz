# EAP config
## EAP-TLS Network Configuration on RaspberryPi 4B using the RT5370 Wireless Adapter


### Install tools
   
    
```sh
sudo apt install dnsmasq
```
   
```sh 
sudo apt install hostapd
```

### Edit or add /etc/dnsmasq.conf
  
```sh
sudo nano /etc/dnsmasq.conf
```
   
```bash
# Set the Wireless interface
interface=wlan1

# Set DHCP IP pool range
dhcp-range=10.0.0.10,10.0.0.20,255.255.255.0,24h

# Set the gateway IP address
# dhcp-option=3,192.168.1.1
dhcp-option=3,10.0.0.1

# Set DNS server address
dhcp-option=6,172.31.191.225

# Disable DNS server capability
port=0
```

### Save the new configuration
    
```sh
sudo dnsmasq -C /etc/dnsmasq.conf
```
    
### Configure the wlan interface which will be used to interact with the wifi clients
    
```sh
sudo nano /usr/local/bin/wlan0staticip.sh
```
add

```bash
ifconfig wlan1 10.0.0.1 netmask 255.255.255.0
```

Make the file executable:

```sh
sudo chmod +x wlan1staticip.sh
```

### Create the task to run this script at every reboot
    
```sh
sudo crontab -e
```

add

```bash
@reboot /usr/local/bin/wlan1staticip.sh
```

### Set up the hostapd configuration
    
```sh
sudo nano /etc/hostapd/hostapd.conf
```
    
```shell=
# Set country code
country_code=GB

# Set wireless interface
interface=wlan1

# Set network name
ssid=TEST_EAP-TLS

# Set channel
channel=6

# Set driver
driver=nl80211

logger_stdout=1
logger_stdout_level=2
logger_syslog=1
logger_syslog_level=2


# Require IEEE 802.1X authorization & EAP
ieee8021x=1
auth_algs=3
wpa=2
wpa_key_mgmt=WPA-EAP
rsn_pairwise=CCMP

# The own IP address of the access point (used as NAS-IP-Address)
own_ip_addr=10.0.0.1

# RADIUS authentication server
auth_server_addr=127.0.0.1
auth_server_port=1812
auth_server_shared_secret=p@ssw0rd!

# RADIUS accounting server
#acct_server_addr=40.0.0.10
#acct_server_port=1813
#acct_server_shared_secret=p@ssw0rd!


# RADIUS SERVER
# INTEGRATED EAP SERVER
# Use integrated EAP server instead of external RADIUS authentication server
eap_server=1

# Path for EAP server user database
eap_user_file=/etc/hostapd/eap_user

# CA certificate (PEM or DER file) for EAP-TLS/PEAP/TTLS
ca_cert=/etc/hostapd/CA/ca_and_crl.pem
# Server certificate (PEM or DER file) for EAP-TLS/PEAP/TTLS

server_cert=/etc/hostapd/home_certs/server.pem

# Private key matching with the server certificate for EAP-TLS/PEAP/TTLS
# This may point to the same file as server_cert if both certificate and key
# are included in a single file. PKCS#12 (PFX) file (.p12/.pfx) can also be
# used by commenting out server_cert and specifying the PFX file as the
# private_key.
private_key=/etc/hostapd/home_certs/server.key

# Passphrase for private key
private_key_passwd=12345

# Enable CRL verification.
# Note: hostapd does not yet support CRL downloading based on CDP. Thus, a
# valid CRL signed by the CA is required to be included in the ca_cert file.
# This can be done by using PEM format for CA certificate and CRL and
# concatenating these into one file. Whenever CRL changes, hostapd needs to be
# restarted to take the new CRL into use.
# 0 = do not verify CRLs (default)
# 1 = check the CRL of the user certificate
# 2 = check all CRLs in the certificate path
check_crl=2

# Fragment size for EAP methods
fragment_size=1400


# RADIUS AUTHENTICATION SERVER CONFIGURATION
radius_server_clients=/etc/hostapd/radius_clients
radius_server_auth_port=1812
```
    
### Radius server configuration

Create radius configuration file

```sh
sudo nano /etc/hostapd/radius_clients
```

add

```shell=
# RADIUS client configuration for the RADIUS server
127.0.0.1	p@ssw0rd!
```

### Add user database

```sh
sudo nano /etc/hostapd/eap_user
```

```shell= 
# HOSTAPD USER DATABASE FOR INTEGRATED EAP SERVER
# Phase 1
# username    authentication
* TLS
"identity name"		TLS
```

### Apply ip forwarding for wlan1(RT5370 Wireless Adapter)

```sh
sudo nano /etc/sysctl.conf
```

add or uncoment

```shell=
net.ipv4.ip_forward = 1
```

### Disable the RPI's network manager

```sh
sudo nano /etc/NetworkManager/NetworkManager.conf
```

add

```shell=
[keyfile]
unmanaged-devices=interface-name:wlan1

```

restart the network manager

```sh
sudo systemctl restart NetworkManager
```


### Unmask and e
Implementation based in part on methods as discussed in [Transforming Your Raspberry Pi into a Secure Enterprise Wi-Fi Controller with 802.1x Authentication](https://myitrambles.com/transforming-your-raspberry-pi-into-a-secure-enterprise-wi-fi-controller-with-802-1x-authentication/)