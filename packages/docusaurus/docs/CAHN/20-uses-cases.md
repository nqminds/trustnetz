---
title: Use Cases
---

In this section we will summarise the high level use cases we hope to address with CAHN. 

## Terminology

Before enumerating the use cases it is useful to establish some common terminology

* **Candidate device**: the physical device which is attempting to connect to the network
* **Onboarded device:** the device which is physically connected to the network 
* **Device owner**: the person or organisation which is the legal owner of the device.
* **Target network**: the logical network the device is trying to join
* **Onboarding network**: a constrained logical network that can be used to negotiate the onboarding process
* **Physical network**: an instance of a physical network, which may host either/both of the target and onboarding networks
* **Network owner**:  the person or organisation which is the legal owner of the device.

## Use case overview

The use cases listed below define at a the highest level, what we are trying to achieve, with the new architecture. 

## UC: Zero touch on boarding

The candidate device will establish a full connection to the onboarding network with no physical intervention by the device owner or network owner.

The objective is to define the protocols that allow this connection to be established using information and credentials available before the physical onboarding event.

The precise conditions under which the device is onboarded are outlined in the policy use case.  

## UC: Network independent identity

We would like to be able to onboard a device to multiple network types and instances using the same principle identity. 

The key attributes used to determine the success of the network, should be independent of the network instance. 

## UC: Continuous Assurance

The security posture of the device should be continuously evaluated in the background and the device be ejected from the network should the policy evaluation fail.

The precise conditions under which the device is off boarded are outlined in the policy use case. 

 

## UC: Policy management 

It should be easy for the network owner to actively manage and change the current policy for the target network.

The policy should be extensible, and flexible, capable of supporting many security features and business models 



## UC: Policy dimensions (onboarding)

To test the extensibility of the policy framework we have some very concrete polices in scope. 

These are listed at a high level as follows.

1. Device owner is trusted by network owner 
2. Manufacturer recognisees provenance of device (it was made by this manufacturer)
3. Manufacturer recognised specific device identity (this device came off the factory process)
4. Network owner trusts manufacturer (will allow checks to be made)
5. Network owner trusts specific device identity
6. Network owner trust device type
7. Network owner has "payment credentials" for device owner
8. Network owner accepts testing credentials presented for device type
9. Network owner accepts testing credentials presented for device instance
10. Network owner accepts  the MUD descriptor for this device (type)
11. Network owner accepts the MUD descriptor and places it on an appropriate subnet
12. Network owner accepts SBOM of device
13. Network owner accepts SBOM and validates it conforms to export restriction
14. Network owner accepts SBOM and validates it conforms to license restriction
15. Network owner accepts SBOM and validates that identified vulnerabilities are below threshold 



## UC: Policy dimensions (continuous assurance)

Most of the onboarding checks can be assessed continuously, using a zero trust approach .

The appropriate assurance tests are listed below.



1. Device owner is **no longer** trusted by network owner: e.g. they are no longer a customer
2. Manufacturer  **no longer** recognises provenance of device (it was made by this manufacturer): e.g it has been identified that a signing key has become compromised 
3. Manufacturer  **no longer**  recognises specific device identity (this device came off the factory process). e.g it has been identified that a signing key has become compromised 
4. Network owner **no longer** trusts manufacturer (will allow checks to be made). e.g company has been acquired, or government has stipulated that it cannot be trusted. 
5. Network owner **no longer**  trusts specific device identity. e.g. device has been reported stolen
6. Network owner **no longer** trust device type  e.g. device type has been discontinued and no longer supported 
7. Network owner **no longer**  has "payment credentials" for device owner  e.g. device owner has not paid his bill
8. Network owner **no longer**  accepts testing credentials presented for device type e.g. faults has been found in testing procedure 
9. Network owner **no longer**  accepts testing credentials presented for device instance e.g. faults has been found in testing procedure 
10. Network owner **no longer**  accepts  the MUD descriptor for this device (type) e.g. network security policy has changed 
11. Network owner  **no longer**   accepts the MUD descriptor and places it on an appropriate subnet e.g. network security policy has changed 
12. Network owner **no longer**  accepts SBOM of device e.g. device security policy has changed 
13. Network owner **no longer**  accepts SBOM and validates it conforms to export restriction. e.g. export restrictions have changed 
14. Network owner **no longer**  accepts SBOM and validates it conforms to license restriction. e.g. license restrictions have changed 
15. Network owner **no longer**  accepts SBOM and validates that identified vulnerabilities are below threshold . e.g. new vulnerabilities have been disclosed 

## UC: Ease of integration

The enhanced identity and policy enforcement mechanisms of CAHN should be easy to retro fit onto existing networks  

## UC: Networks in scope

The CAHN security policy should work with multiple network types. Currently in scope. 

1. 5G CRAN network 
2. WIFI network
3. Lora WAN network 
4. Satellite network 

Additionally we may consider application layer networks such as SSH or VPN connections which can be established virtually.







