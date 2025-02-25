#!/bin/bash

SERIAL_NUMBER="$1"
TUNNEL_PRIVATE_GROUP_ID="$2"
LINE_NUMBER=823
CONFIG_FILE_ENABLED="/etc/freeradius/3.0/sites-enabled/default"
CONFIG_FILE_AVAILABLE="/etc/freeradius/3.0/sites-available/default"
OWNER="freerad"
GROUP="freerad"

INSERTION_BLOCK=$(cat <<EOF

        if (TLS-Client-Cert-Subject == "/C=IE/CN=ldevid-cert/serialNumber=${SERIAL_NUMBER}") {
                update reply {
                        &Tunnel-Type := 13,
                        &Tunnel-Medium-Type := 6,
                        &Tunnel-Private-Group-Id := "${TUNNEL_PRIVATE_GROUP_ID}"
                }
        }

EOF
)

TEMP_FILE=$(mktemp)
trap 'rm -f "$TEMP_FILE"' EXIT

{
    head -n $((LINE_NUMBER-1)) "$CONFIG_FILE_AVAILABLE"
    echo "$INSERTION_BLOCK"
    tail -n +$LINE_NUMBER "$CONFIG_FILE_AVAILABLE"
} > "$TEMP_FILE"


if ! sudo mv "$TEMP_FILE" "$CONFIG_FILE_AVAILABLE"; then
    echo "Failed to update the configuration file."
    exit 1
fi

if ! chown $OWNER:$GROUP "$CONFIG_FILE_AVAILABLE"; then
    echo "Failed to set the file ownership."
    exit 1
fi

# Check and recreate the symbolic link if necessary
if [ ! -L "$CONFIG_FILE_ENABLED" ] || [ "$(readlink -- "$CONFIG_FILE_ENABLED")" != "$CONFIG_FILE_AVAILABLE" ]; then
    if ! ln -sfn "$CONFIG_FILE_AVAILABLE" "$CONFIG_FILE_ENABLED" || ! chown -h $OWNER:$GROUP "$CONFIG_FILE_ENABLED"; then
        echo "Failed to recreate the symbolic link."
        exit 1
    fi
fi

chmod 640 "$CONFIG_FILE_AVAILABLE"
echo "Configuration updated successfully."

systemctl restart freeradius.service
systemctl restart hostapd@wlan1.service
systemctl restart configure-vlans.service

