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

`check_device_vulnerable` finds the device type which has been set as the type of the device and checks whether that device type has any `High` or `Critical` severity vulnerabilities. It returns a boolean which states if the device (`subject_name` in the idevid) is vulnerable. 