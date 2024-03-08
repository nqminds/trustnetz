#!/bin/bash
# local_revoke.sh

# Check if a certificate file path is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 /path/to/client_cert.pem"
    exit 1
fi

CLIENT_CERT="$1"
CA_CONFIG="/etc/hostapd/CA/ca.conf"
CA_CERT="/etc/brski/registrar-tls-ca.crt"
CRL="/etc/hostapd/CA/crl.crt"
COMBINED_CA_CRL="/etc/hostapd/CA/registrar-tls-ca-and-crl.crt"

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
    sudo systemctl restart hostapd@wlan1.service
fi
