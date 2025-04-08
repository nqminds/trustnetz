#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CERTS_PATH="$SCRIPT_DIR/certs"
WLAN="wlan0"
RNAME="_registrar._tcp"
DOMAIN="local"
PREQ_PATH="$SCRIPT_DIR/preq-openssl.sh"
SIGN_PATH="$SCRIPT_DIR/sign_request.sh"
PINNED_DOMAIN_CERT="$SCRIPT_DIR/certs/pinned-domain-ca.crt"
EAP_TLS_CLIENT_CERT="$SCRIPT_DIR/certs/eap-tls-client.crt"
EAP_TLS_CLIENT_KEY="$SCRIPT_DIR/certs/eap-tls-client.key"

echo "Starting onboarding process."

# Disconnect from WIFI if connected
echo "Disconnecting from WIFI newtork (if connected)..."
nmcli device disconnect $WLAN
echo "Disconnected from WIFI network."

# Connect to brski-open
echo "Connecting to brski-open..."
nmcli device wifi connect 'brski-open' ifname $WLAN

if [ $? -ne 0 ]; then
    exit 1
fi

echo "Connected to brski-open."

sleep 2

echo "Finding registrar..."

srch=`avahi-browse -d $DOMAIN -r $RNAME -t -p | grep -m 1 -E "=;$WLAN;IPv4;.+;$RNAME;$DOMAIN;.+;[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3};[0-9]{1,5};"`

# Save the current value of IFS
oldIFS=$IFS
IFS=';'
array=($srch)
IFS=$oldIFS

if [ ${#array[@]} -lt 2 ]; then
	echo "Couldn't find registrar address!"
	exit 1
fi

IP=${array[-2]}
PORT=${array[-1]}

echo "Found registrar at ip=$IP and port=$PORT."

sleep 2

echo "Running brski preq command..."
# Uncoment bellow for using brski command
# brski -c /etc/brski/config.ini preq -p $PORT -a $IP -o "$CERTS_PATH/pinned-domain-ca" -d
bash "$PREQ_PATH" "$IP" "$PORT" "$CERTS_PATH"
if [ $? -ne 0 ]; then
    exit 1
fi

file $CERTS_PATH/pinned-domain-ca.crt


echo "Running brski sign command..."
# Uncoment bellow for using brski command
# brski -c /etc/brski/config.ini sign -p $PORT -a $IP -o "$CERTS_PATH/eap-tls-client" -d
bash "$SIGN_PATH" "$IP" "$PORT" "$CERTS_PATH"
if [ $? -ne 0 ]; then
    exit 1
fi

file $CERTS_PATH/eap-tls-client.key
file $CERTS_PATH/eap-tls-client.crt

echo "Got BRSKI signed certificates"
EAP_NAME=`openssl x509 -noout -issuer -in "$CERTS_PATH/eap-tls-client.crt" | sed -e 's/.*CN = \(.*\).*/\1/'`
[[ -z "$EAP_NAME" ]] && { echo "Error: No EAP name found"; exit 1; }
sleep 2

echo "Got EAP-TLS name $EAP_NAME."

nmcli device disconnect $WLAN
echo "Disconnected from brski-open."

sleep 2
  
echo "Connecting to $EAP_NAME ..."
nmcli connection show $EAP_NAME > /dev/null

if [ $? -eq 0 ]; then
	nmcli connection delete id $EAP_NAME
fi

nmcli c add type wifi ifname $WLAN con-name $EAP_NAME \
      802-11-wireless.ssid $EAP_NAME \
      802-11-wireless-security.key-mgmt wpa-eap \
      802-1x.eap tls \
      802-1x.identity brski_pledge \
      802-1x.ca-cert $PINNED_DOMAIN_CERT \
      802-1x.client-cert $EAP_TLS_CLIENT_CERT \
      802-1x.private-key $EAP_TLS_CLIENT_KEY \
      802-1x.private-key-password s3cr3t

nmcli c up $EAP_NAME

if [ $? -ne 0 ]; then
  exit 1
fi

echo "Connected to $EAP_NAME."
echo "Onboarding process completed."

