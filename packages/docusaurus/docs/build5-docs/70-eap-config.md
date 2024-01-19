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
sudo nano /usr/local/bin/wlan1staticip.sh
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


### Unmask and enable the service

```sh
sudo systemctl unmask hostapd
sudo systemctl enable hostapd
```

Start hostapd

```sh
sudo systemctl start hostapd
sudo systemctl status hostapd
```

Start hostapd in debugg mode
```sh
sudo hostapd -dd /etc/hostapd/hostapd.conf
```


Check status

```sh
sudo systemctl status hostapd
```

Start Dnsmasq

```sh
sudo system ctl start dnsmasq
sudo systemctl status dnsmasq
```

### Generate CA and Radius server certificates

```sh 
# Certificate Authority:
# Gen private key: 
sudo openssl genrsa -out ca.key 2048
# Gen CA.pem cert: 
sudo openssl req -x509 -new -nodes -key ca.key -sha256 -days 1024 -out ca.pem

# Server:
# Gen private key: 
sudo openssl genrsa -out server.key 2048
# Gen server cert sign request: 
sudo openssl req -new -key server.key -out server.csr
# Gen server.pem certificate: 
sudo openssl x509 -req -in server.csr -CA ca.pem -CAkey ca.key -CAcreateserial -out server.pem -days 1000 -sha256
```

### CA and Radius certificates could also be done by running this script

```shell=
#!/bin/bash


#cd /path/to/your/certificate/directory

# Certificate Authority
echo "Generating CA..."
sudo openssl genrsa -out ca.key 2048
sudo openssl req -x509 -new -nodes -key ca.key -sha256 -days 1024 -out ca.pem \
-subj "/C=GB/ST=Hampshire/L=Southampton/O=nqminds_ca/OU=unit one/CN=ca/emailAddress=ca@nquiringminds.com"

# Server
echo "Generating Server Certificates..."
sudo openssl genrsa -out server.key 2048
sudo openssl req -new -key server.key -out server.csr \
-subj "/C=GB/ST=Hampshire/L=Southampton/O=nqminds_server/OU=unit one/CN=server/emailAddress=server@nquiringminds.com"
sudo openssl x509 -req -in server.csr -CA ca.pem -CAkey ca.key -CAcreateserial -out server.pem -days 1000 -sha256

echo "Certificates generation completed."

```

### Generate Device certificate
```sh
# Gen private key: 
sudo openssl genrsa -out client.key 2048
# Gen cert sign request:
sudo openssl req -new -key client.key -out client.csr
# Gen client.pem certificate:
sudo openssl x509 -req -in client.csr -CA ca.pem -CAkey ca.key -CAcreateserial -out client.pem -days 365 -sha256
```

 PERMISSIONS SHOULD BE:
 
```sh 
sudo chown user:user /path/to/client.key
sudo chmod 600 /path/to/client.key
sudo chown user:user /path/to/client.pem
sudo chmod 600 /path/to/client.pem
```

### Install ca.pem certificate to the trusted list

Add the certificate to 
```sh
sudo cp ca.pem /usr/local/share/ca-certificates/ca.pem
``` 
and then run

```sh
sudo update-ca-certificates
```

### Check if has been linked

```sh
ls -l /etc/ssl/certs | grep ca.pem
```

### Manually link the certificate if the certificate is not present at /etc/ssl/certs/

```sh
sudo ln -s /usr/local/share/ca-certificates/ca.pem /etc/ssl/certs/ca.pem
```

### Generating the device certificates can also be done by running the following script

```shell=
#!/bin/bash

# Change to your desired directory
cd /home/nqm-pi-tls/Desktop/TEST_TLS/

# Client
echo "Generating Client Certificates..."
sudo openssl genrsa -out client.key 2048
sudo openssl req -new -key client.key -out client.csr \
-subj "/C=GB/ST=Hampshire/L=Southampton/O=client ltd/OU=unit one/CN=client/emailAddress=client@nquiringminds.com"
sudo openssl x509 -req -in client.csr -CA ca.pem -CAkey ca.key -CAcreateserial -out client.pem -days 365 -sha256

# Set certificate permissions
echo "Setting permissions..."
# Replace $USER with the your user
sudo chown $USER:$USER client.key client.pem
sudo chmod 600 client.key client.pem

# Add CA certificate to the system
echo "Adding CA certificate to the system..."
sudo cp ca.pem /usr/local/share/ca-certificates/ca.pem
sudo update-ca-certificates

echo "Client certificate generation and configuration completed."

```


## CRL (Certificate Revocation List). REVOKE A DEVICE CERTIFICATE:

### Make ca config file:
```sh
sudo nano ca.conf /etc/hostapd/CA

```
add

```shell=
[ ca ]
default_ca = CA_default

[ CA_default ]
database = /etc/hostapd/CA/index.txt
new_certs_dir = /etc/hostapd/CA/newcerts
certificate = /etc/hostapd/ca.pem
private_key = /etc/hostapd/ca.key
crlnumber = /etc/hostapd/CA/crlnumber
serial = /etc/hostapd/CA/serial

default_md = sha256
default_crl_days = 30
default_days = 365
policy = policy_match


[ policy_match ]
countryName = supplied
stateOrProvinceName = supplied
organizationName = supplied
organizationalUnitName = optional
commonName = supplied
emailAddress = optional

```
### Add necessary files


```sh
sudo mkdir /etc/hostapd/CA

# Initialise an index file:
sudo touch /etc/hostapd/CA/index.txt

#Create a serial file to keep track of the next serial number to use for new certificates or CRLs:
echo '1000' | sudo tee /etc/hostapd/CA/serial

# Create a crl number file:
sudo touch /etc/hostapd/CA/crlnumber

#Increment the number to 1:
echo '01' | sudo tee /etc/hostapd/CA/crlnumber

```

### Create a new CRL certificate

```sh
sudo openssl ca -gencrl -out /etc/hostapd/CA/crl.pem -config /etc/hostapd/CA/ca.conf
```


### Revoke the client’s certificate

```sh
sudo openssl ca -revoke /path/to/client_cert.pem -config /etc/hostapd/CA/ca.conf
```

### Update the CRL

```sh
sudo openssl ca -gencrl -out /etc/hostapd/CA/crl.pem -config /etc/hostapd/CA/ca.conf
```

### Concatenate CA certificate and CRL

```sh
sudo sh -c 'cat /etc/hostapd/ca.pem /etc/hostapd/CA/crl.pem > /etc/hostapd/CA/ca_and_crl.pem'
```

### Verify if the certificate has been revoked

```sh
openssl verify -extended_crl -verbose -CAfile ca_and_crl.pem -crl_check client_re.pem
```

or by 

```sh
openssl crl -in ca_and_crl.pem -text -noout
```
If succesfful the output should be:

```sh
error 23 at 0 depth lookup: certificate revoked
error /etc/hostapd/CA/client_re.pem: verification failed
```
### Update hostapd.conf

```shell=
ca_cert=/etc/hostapd/CA/ca_and_crl.pem
```

### Restart hostapd

```sh
sudo systemctl restart hostapd
```

### Before trying to reconect the device using a revoked certificate we must flush the network to remove any stored credentials

```sh
# Add the necessary SSID at the end
sudo nmcli con delete id "TEST_EAP-TLS"
```

### Device script for onboarding the network:

```shell=
#!/bin/bash

# Network configuration
SSID="TEST_EAP-TLS"
INTERFACE="wlan0"

# Certificate and key paths
CA_CERT="/etc/ssl/certs/ca.pem"
CLIENT_CERT="/path/to/client.pem"
CLIENT_KEY="/path/to/client.key"

# User key password
USER_KEY_PASSWORD="12345"

# Create a new Wi-Fi connection with EAP-TLS authentication
echo "Configuring $SSID connection..."
nmcli con add type wifi ifname "$INTERFACE" con-name "$SSID" ssid "$SSID" \
    wifi-sec.key-mgmt "wpa-eap" \
    802-1x.eap "tls" \
    802-1x.identity "identity name" \
    802-1x.ca-cert "$CA_CERT" \
    802-1x.client-cert "$CLIENT_CERT" \
    802-1x.private-key "$CLIENT_KEY" \
    802-1x.private-key-password "$USER_KEY_PASSWORD"

# Activate the connection
echo "Connecting to $SSID..."
nmcli con up id "$SSID"

# Wait for a brief moment to allow the connection to establish 
sleep 5

# Check the connection status
if nmcli -t -f GENERAL.STATE con show "$SSID" | grep -q "activated"; then
    echo "Connected to $SSID successfully."
else
    echo "Connection to $SSID failed."
fi

```

## Local Revoke Script

### Create new bash script

```sh
sudo nano local_revoke.sh
```

Add

```shell=
#!/bin/bash

# Check if a certificate file path is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 /path/to/client_cert.pem"
    exit 1
fi

CLIENT_CERT="$1"
CA_CONFIG="/etc/hostapd/CA/ca.conf"
CA_CERT="/etc/hostapd/CA/ca.pem"
CRL="/etc/hostapd/CA/crl.pem"
COMBINED_CA_CRL="/etc/hostapd/CA/ca_and_crl.pem"

# Revoke the client certificate
sudo openssl ca -revoke "$CLIENT_CERT" -config "$CA_CONFIG"

# Update the CRL
sudo openssl ca -gencrl -out "$CRL" -config "$CA_CONFIG"

# Concatenate CA certificate and CRL
sudo sh -c "cat $CA_CERT $CRL > $COMBINED_CA_CRL"

# Verify if the certificate has been revoked
if sudo openssl verify -extended_crl -verbose -CAfile "$COMBINED_CA_CRL" -crl_check "$CLIENT_CERT"; then
    echo "Certificate revocation verification failed. Not restarting hostapd."
else
    echo "Certificate has been revoked. Restarting hostapd..."
    # Restart hostapd
    sudo systemctl restart hostapd
fi

```

Make script executable:

```sh
sudo chmod +x local_revoke.sh
```


### Add device LDevID to the CRL list

```sh
 sudo ./local_revoke.sh device.pem
```

When checking the CRL it should add the device SR to the Revoked Certificates:

```sh 
openssl crl -in ca_and_crl.pem -text -noout
```

```
Certificate Revocation List (CRL):
        Version 2 (0x1)
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: C = GB, ST = Hampshire, L = basingstoke, O = nquiringminds ltd, OU = unit home, CN = home_ca, emailAddress = home_ca@nquiringminds.com
        Last Update: Jan 17 14:06:41 2024 GMT
        Next Update: Feb 16 14:06:41 2024 GMT
        CRL extensions:
            X509v3 CRL Number: 
                3
Revoked Certificates:
    Serial Number: 6038A82CB21B3E5F3147517B3601D0E3A19522AF
        Revocation Date: Jan 16 11:57:57 2024 GMT
    Serial Number: 690C87AE80386DA41F90D47A53A5EBDD809563AB
        Revocation Date: Jan 17 14:06:41 2024 GMT
    Signature Algorithm: sha256WithRSAEncryption
```


Implementation based in part on methods discussed in [Transforming Your Raspberry Pi into a Secure Enterprise Wi-Fi Controller with 802.1x Authentication](https://myitrambles.com/transforming-your-raspberry-pi-into-a-secure-enterprise-wi-fi-controller-with-802-1x-authentication/)