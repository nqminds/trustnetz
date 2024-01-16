#!/bin/bash
# offboard.sh

echo "Offboarding IoT device..."


file /opt/demo-server/certs/eap-tls-client.crt

EAP_NAME=`openssl x509 -noout -issuer -in "/opt/demo-server/certs/eap-tls-client.crt" | sed -e 's/.*CN = \(.*\).*/\1/'`
[[ -z "$EAP_NAME" ]] && { echo "Error: No EAP name found"; exit 1; }

nmcli device disconnect wlan0

echo "Removinf connection to $EAP_NAME ..."
nmcli connection show $EAP_NAME > /dev/null

if [ $? -eq 0 ]; then
	nmcli connection delete id $EAP_NAME
fi

rm -f /opt/demo-server/certs/pinned-domain-ca.crt
rm -f /opt/demo-server/certs/eap-tls-client.crt
rm -f /opt/demo-server/certs/eap-tls-client.key

