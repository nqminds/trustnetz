#!/bin/bash

echo "Installing brski package..."

# Download brski
wget -O /tmp/brski_0.2.6_arm64.deb https://github.com/nqminds/brski/releases/download/0.2.6/brski_0.2.6_arm64.deb
if [ $? -ne 0 ]; then
    echo "Failed to download brski. Please check your internet connection."
    exit 1
fi

# Install brski
dpkg -i /tmp/brski_0.2.6_arm64.deb
if [ $? -ne 0 ]; then
    echo "Failed to install brski. Please check for any dpkg errors."
    exit 1
fi

# Copy certificates (if necessary)
cp -r /opt/demo-server/certs/* /etc/brski

# Clean up
rm /tmp/brski_0.2.6_arm64.deb

echo "brski installation completed."