# Nist Policy

This Rust library contains the functions to check the Nist policy is met before proceeding with various parts of the BRSKI onboarding flow.

All 3 functions takes 2 arguments, an X509 certificate object (the idevid) and a path to an sqlite database on the disk, the sqlite database should be created and managed by the registrar's Rest API server, which takes in claims of information in the form of VCs.

## check_manufacturer_trusted

`check_manufacturer_trusted` checks if a manufacturer has been trusted by a user who has `can_issue_trust` rights. It returns a boolean which states if the manufacturer (`issuer` in the idevid) is trusted. 

If the manufacturer doesn't exist in the manufacturer table, it will add an entry for that manufacturer with the name being the issuer contained in the idevid, and id being a randomly generated uuid, and the current datetime as the `created_at` field. 


## check_device_trusted

`check_device_trusted` first checks that the manufacturer is trusted using the check_manufacturer_trusted method, if this is true then it checks if a device has been trusted by a user who has `can_issue_connection_rights` rights. It returns a boolean which states if the device (`subject_name` in the idevid) is trusted. 

If the device doesn't exist in the device table, it will add an entry for the device. It uses the subject_name field of the idevid as the device's `name`, generates a random uuid for the `id` field, and the current datetime as the `created_at` field.

## check_device_vulnerable

`check_device_vulnerable` finds the device type which has been set as the type of the device and checks whether that device type has an SBOM bound to it, if not it is considered vulnerable, if it does, then it checks the vulnerability score of that SBOM to see if it's lower than the set threshold value. It returns a boolean which states if the device (`subject_name` in the idevid) is vulnerable. 

## check_device_mud

Checks if the device has a mud file, and outputs the `name` field of the mud file bound to the device type of the device, if the device type has an associated mud file.

## check_for_blacklisted_requests

This function uses a tcpdump log file created with `stdbuf -o0 tcpdump --interface wlan1 >> log.txt` where `wan1` is the network interface running the brski secure wifi, it checks in the file if any requests to blacklisted IP addresses have been made in the last X minutes.

It takes as arguments:
- file path to log file
- ip address of device
- list of blacklisted ip addresses to search for 
- number of minutes in the past to check for blacklisted requests
