#!/bin/bash

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <interface> <json_file_path>"
  exit 1
fi

interface="$1"
json_file_path="$2"

# Check if the JSON file exists
if [ ! -f "$json_file_path" ]; then
  echo "Error: JSON file '$json_file_path' not found."
  exit 1
fi

# Function to get the current IP address for the specified interface
get_ip_address() {
  ifconfig "$interface" | grep -oP 'inet \K[\d.]+'
}

# Function to update the JSON file with the new IP address
update_json_file() {
  local old_ip="$1"
  local new_ip="$2"
  local json_path="$3"

  # Use jq to update the JSON file
  jq --arg old_ip "$old_ip" --arg new_ip "$new_ip" \
    '. | walk(if type == "string" then gsub($old_ip; $new_ip) else . end)' \
    "$json_path" > "$json_path.tmp" && mv "$json_path.tmp" "$json_path"
}

# Function to perform additional actions after updating the JSON file
post_update_actions() {
  echo "Performing post-update actions..."
  sudo systemctl restart tdxvolt.service
  sudo systemctl restart vc-server.service
  sudo systemctl restart registrar-rest-server.service
  sudo systemctl restart registrar-app.service
}

# Initialize the current IP address
current_ip=$(get_ip_address)

if [ -z "$current_ip" ]; then
  echo "Error: Unable to retrieve initial IP address for interface '$interface'"
  exit 1
fi

echo "Initial IP address for $interface: $current_ip"

# Check if the IP address in the JSON file matches the current IP address
json_ip=$(jq -r '.volt.address' "$json_file_path")
json_ip_without_port="${json_ip%%:*}"

if [ "$json_ip_without_port" != "$current_ip" ]; then
  echo "IP address in JSON file doesn't match current IP address. Updating..."
  
  # Update the JSON file
  update_json_file "$json_ip_without_port" "$current_ip" "$json_file_path"
  
  # Perform additional actions after updating the JSON file
  post_update_actions
fi

# Read the JSON file and update IP addresses
while true; do
  sleep 5  # Adjust the sleep duration as needed

  new_ip=$(get_ip_address)

  if [ -n "$new_ip" ] && [ "$new_ip" != "$current_ip" ]; then
    echo "IP address has changed from $current_ip to $new_ip"
    
    # Update the JSON file
    update_json_file "$current_ip" "$new_ip" "$json_file_path"
    
    # Perform additional actions after updating the JSON file
    post_update_actions
    
    current_ip="$new_ip"
  fi
done
