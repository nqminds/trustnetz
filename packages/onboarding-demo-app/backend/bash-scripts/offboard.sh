#!/bin/bash
# offboard.sh

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"


EAP_TLS_CLIENT_CERT="$SCRIPT_DIR/certs/eap-tls-client.crt"
EAP_TLS_CLIENT_KEY="$SCRIPT_DIR/certs/eap-tls-client.key"
PINNED_DOMAIN_CERT="$SCRIPT_DIR/certs/pinned-domain-ca.crt"

echo "Offboarding IoT device..."


file $EAP_TLS_CLIENT_CERT

EAP_NAME=`openssl x509 -noout -issuer -in $EAP_TLS_CLIENT_CERT | sed -e 's/.*CN = \(.*\).*/\1/'`
[[ -z "$EAP_NAME" ]] && { echo "Error: No EAP name found"; exit 1; }

nmcli device disconnect wlan0

echo "Removinf connection to $EAP_NAME ..."
nmcli connection show $EAP_NAME > /dev/null

if [ $? -eq 0 ]; then
	nmcli connection delete id $EAP_NAME
fi

rm -f $PINNED_DOMAIN_CERT
rm -f $EAP_TLS_CLIENT_CERT
rm -f $EAP_TLS_CLIENT_KEY

