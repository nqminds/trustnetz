#!/bin/bash
# local_revoke_serial_multiple_args.sh

# Check if at least two serial numbers are provided and the number of arguments is even
if [ "$#" -lt 2 ] || [ $(( $# % 2 )) -ne 0 ]; then
    echo "Usage: $0 unique_serial_number1 serialNumber1 [unique_serial_number2 serialNumber2 ...]"
    exit 1
fi

CA_DIR="/etc/hostapd/CA"
CA_CONFIG="$CA_DIR/ca.conf"
CRL="$CA_DIR/crl.crt"
CA_CERT="/etc/brski/registrar-tls-ca.crt"
COMBINED_CA_CRL="$CA_DIR/registrar-tls-ca_and_crl.crt"
INDEX_FILE="$CA_DIR/index.txt"
REVOCATION_DATE=$(date +"%y%m%d%H%M%SZ")
update_crl=false

while [ "$#" -gt 0 ]; do
    UNIQUE_SERIAL="$1"
    SERIAL_NUMBER="$2"
    shift 2

    # Convert and pad the UNIQUE_SERIAL number to the correct format
    UNIQUE_SERIAL=$(echo "$UNIQUE_SERIAL" | sed 's/^0x//' | tr '[:lower:]' '[:upper:]' | sed 's/^0*//')

    UNIQUE_SERIAL=$(printf '%016s' "$UNIQUE_SERIAL" | tr ' ' '0')

    SERIAL_NUMBER=$(echo "$SERIAL_NUMBER" | tr '[:lower:]' '[:upper:]')

    # Check if the serial number already exists in index.txt
    if grep -q "$UNIQUE_SERIAL" "$INDEX_FILE"; then
        echo "Serial Number $UNIQUE_SERIAL already exists in index.txt. Skipping addition."
    else
        # Add entry to the index.txt file
        echo "Adding revocation entry to index.txt for certificate with serials $UNIQUE_SERIAL and $SERIAL_NUMBER..."
        printf "R\t99991231235959Z\t%s\t%s\tunknown\t/C=IE/CN=ldevid-cert/serialNumber=%s\n" "$REVOCATION_DATE" "$UNIQUE_SERIAL" "$SERIAL_NUMBER" | sudo tee -a "$INDEX_FILE"
            # Update the CRL
        echo "Updating CRL..."
        sudo openssl ca -gencrl -out "$CRL" -config "$CA_CONFIG"

        # Concatenate CA certificate and CRL
        echo "Updating combined CA and CRL file..."
        sudo sh -c "cat $CA_CERT $CRL > $COMBINED_CA_CRL"

        update_crl=true
    fi
done

if [ "$update_crl" = true ]; then

    echo "Certificates have been revoked. Restarting hostapd..."
    # Restart hostapd
    sudo systemctl restart hostapd@wlan1.service
    sudo systemctl restart freeradius.service
fi
