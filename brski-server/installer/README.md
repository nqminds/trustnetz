# Build
Run `build` to generate the script `gateway-install.sh`.

In order to cutomize the instalation script change the following:

1. The open WIFI names in `payload/installer` and if the EAP WIFI name needs to be changed then the subject in the certificate `payload/certs/registrar-tls-ca.crt` needs to be changed appropriately and subsequently the registrar end certificate `payload/certs/registrar-tls.crt` needs to be generated again using the `registrar-tla-ca.key` private key.

2. The IP addresses in `payload/installer` and `payload/dnsmasq*` files.
3. The registrar name in `payload/registrar.service`.

# Installation
Make sure that both WIFI interfaces are configured then run `gateway-install.sh`.

If custom installation is needed then copy the `payload` folder on the target machine and then run:

```bash
$ cd payload
$ sudo ./install
```
# Usage

* A device can be added to the Certificate Revocation List (CRL) list by calling the following command

```sh
sudo ./etc/hostapd/CA/local_revoke_serial_multiple_args.sh 0xd8d5be97 46fc6d2a1fbfcf48 
```
In the command above:<br>
&nbsp;&nbsp;&nbsp;&nbsp;0xd8d5be97 = LdevId certificate's serial number<br>
&nbsp;&nbsp;&nbsp;&nbsp;46fc6d2a1fbfcf48 = LdevId Subject SerialNumber<br>

* A device an be assign to one of the four available vlans id's(10, 20, 30, 40) by calling the following command:

```sh
sudo ./opt/demo-server/assign_client_to_vlan.sh 46fc6d2a1fbfcf48 10
```