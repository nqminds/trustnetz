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
$ ./install
```
