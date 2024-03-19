# Factory Use Case
Contains source code for provisioning of unique idevids

## main.rs
Contains server-side REST API to run on MPR

## gen_mpr_cert.sh
Generates ECC key and self-signed certificate of MPR containing its IP address

## get_idevid.sh
Sends CSR signed with key stored on TPM to MPR and saves the response which, if successful will be the idevid
