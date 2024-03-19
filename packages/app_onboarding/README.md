# App Onboarding
Contains source code for application onboarding use case

## main.rs
REST API to run on app server - accepts connections where the TLS peer certificate is signed by the MPR  
Currently logs requests to file, and returns OK status

## gen_app_cert.sh
Generates ECC key and self-signed certificate of application server containing its IP address

## ping.sh
Sends POST request containing current time and thermal_zone0 temperature to app via TLS
