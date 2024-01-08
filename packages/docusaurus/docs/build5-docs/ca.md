# Continuous assurance

The continuous assurance process is the mechanism by which the `network` continuously monitors the security posture of the connected `device` and responds appropriately

# CA command protocol

Within the BRSKI architecture, evaluation of network policy happens at the `registrar`

A many to one relationship exists between the `router` and the `registrar` 

This connection is initiated by the router. The router finds the registrar using the same mechanism the device uses (GRASP or mDNS).

The connection is a simple bi-directional TLS session.

## CA protocol authentication

The authentication method between the router an registrar is intentionally undefined. This is an implementation detail of the setup

For the purposes of this demonstrator we shall use the notion of "common ownership".

The steps for this are

1. one off event: `registrar` generates a public/private key and self signs a certificate
2. one off event: `router` generates a public private key pair and self signs a certificate
3. one off event: a VC is generated to the effect that person@email.com trust the `registrar` (public key thereof). VC is signed by private key of persons DID: **Trust**(person@email.com,`registrar`+) : `person-`
4. one off event: a VC is generated to the effect that person@email.com trust the `router` (public key thereof). VC is signed by private key of persons DID **Trust**(person@email.com,`router`+) : `person-`
5. The router attempts to connect to the registrar, using mutually authenticated TLS. The router passes the router signed VC as the initiation parameter.   The connection is ACCEPTED, IF the same person is the signatory, the same person is in both VCs and the router and registrar public keys match the certificate evidence presented in the mutually authenticated TLS





# Continuous Assurance Commands

There are two primary commands that the `router` must be able to process from the `registrar` . 

* Trust device
* Revoke Trust on device

We trust the device by sending the following VC on the CA protocol 

​	**Trust**(`device+`,`registrar`+) : `registrar-`



We revoke trust by sending the following VC

​	**Revoke**(`device+`,`registrar`+) : `registrar-`



When we revoke the trust on the device we have a number of options

1. Remove iDevID and LDevID pair from the registrar and reboot wifi
2. Change the VLAN allocation of the device to a constrained network 







# Continuous Assurance Use Cases

The following lists out the different continuous assurance use cases we want to implement and defines the method by which it is implemented.



## Network owner trusts manufacturer

> The owner of the network specifically trusts manufacture 

The following VC is inserted into the registrar

​	**Trust**(person@email.com,`manufactuer`+) : `person-`

Note if the network owner does not trust the manufacture, the registrar should NOT forward the voucher request to the manufacture. This would create information leakage. 



## Network owner trusts device

> The owner of the network specifically trusts the device being onboarded

The following VC is inserted into the registrar

​	**Trust**(person@email.com,`device`+) : `person-`



## Device has been purchased

> The device has been purchased by the person

In the simple case the manufacture (MASA), records the purchase

If device is owned by the user then we can infer the user trust the device 

​	**Purchase**(`device+`, person@email.com,) : `manufacturer-` 

​	=> **Trust**(person@email.com,`device`+) : `person-`

Or more specifically, only where the person trust the manufacture 

​	**Purchase**(`device+`, person@email.com,) : `manufacturer-` &&

​	**Trust**( person@email.com,`manufacturer+`) : `manufacturer-` 

​	=> **Trust**(person@email.com,`device`+) : `person-`



## Device no major vulnerabilities 

> The device is trusted if vulnerabilities are below a threshold 

For each device connected to the network, we need a type identifier.

There are a number of options for this, some examples are

1. A purchase invoice declaring type
2. A device owner declaration
3. An iDevID with a custom attribute
4. An intercepted MUD statement 

For the moment we will just consider 1 & 2



The purchase invoice could have the following form

​	**Purchase**(`device+`, person@email.com, `device-type`) : `manufacturer-` 

The device owner declaring could have the following form 

​	**OwnerDeclaration**(`device+`,  `device-type`) : `person-` 



From either declaration, given that the registrar has a list of accepted iDevIDs (the iDevID and the issued LDevID need to be stored at the registrar to implement the radius permission) it is possible to unique identify the `device-type`

The registrar should cache a list of SBOM declarations. These map the the device type to the SBOM statement.

​	**SBOM**(`device+`,  `device-type`, SBOM) : `manufacturer-` 



The registrar should intermittently run the CVE function against the declared SBOMs

There should be a configurable CVE threshold function.

If the threshold is not met - then a **revoke** command should be sent from the registrar to the routers. 


# Continuous Assurance Demonstrator



At any moment in time we shoud be able to see

1. All VCs that have been received by the registrar (and time received)
2. Any VCs created through inference (and time inferred)
3. Any VCs issued through the command interface (and time sent)



We should be able to delete any VC 



We should be able to manually add new VCs. And have a batch of templates to draw from 
