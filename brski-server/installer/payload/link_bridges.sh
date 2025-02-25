#!/bin/bash

# This function adds an IP address to the network bridges.
add_ip_to_bridge() {
    local bridge_name="$1"
    local ip_addr="$2"
    local subnet="$3"

    # Check if the bridge exists
    if ip link show "$bridge_name" > /dev/null 2>&1; then
        # Attempt to add the IP address to the bridge
        ip addr add "${ip_addr}/${subnet}" dev "$bridge_name" 2>&1
        if [ $? -eq 0 ]; then
            echo "IP address ${ip_addr}/${subnet} added to bridge $bridge_name."
        else
            echo "Failed to add IP address to bridge $bridge_name."
        fi
    else
        echo "$bridge_name does not exist."
    fi
}

# Add IP addresses to bridges
add_ip_to_bridge brvlan10 192.168.34.1 24
add_ip_to_bridge brvlan20 192.168.35.1 24
add_ip_to_bridge brvlan30 192.168.36.1 24
add_ip_to_bridge brvlan40 192.168.37.1 24
