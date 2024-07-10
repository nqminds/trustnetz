---

title: BRSKI Protocol Overview
---

# Terminology

We will use the term `device` interchangeably with the term `pledge` for easier reading.

* `device`: The device wishing to onboard to the network.
* `registrar`: The principal decision-making entity in the onboarding process.
* `proxy`: A proxy to the registrar - useful if the registrar is located externally or shared between networks.
* `MASA`: The Manufacturer Authority, which issues manufacturer assurances (like iDevID) and can attest to the validity of these assurances.
* `router`: The physical router to which a device is connecting; the router may potentially host many networks.
* `onboarding network`: A constrained network used to bootstrap the onboarding process.
* `target network`: The operational network to which the device intends to attach.
* `iDevID`: A unique device certificate issued by the manufacturer.
* `LDevID`: A certificate used by the device to gain network access (EAP certificate).

# Stages Overview

- O - Factory Provisioning 
- A - Discover Onboarding Network 
- B - Discover Registrar
- C - Request Voucher
- D - Enrol the Device
- E - Join the Network
- F - Continuous Assurance of the Network 

```mermaid
sequenceDiagram
autonumber
    critical Private Network
    	Device->>Manufacturer: 0-Request iDevID
    end
```

# 0 - Factory Provisioning

The demonstrated factory provisioning flow is as follows:

* 0.1 - Device is pre-provisioned with the manufacturer's CA and URI for the manufacturer's servers.
* 0.2 - Device generates a unique public/private key pair.
* 0.3 - Device requests an iDevID from the manufacturer.
* 0.4 - The returned iDevID is installed on the device.

# A - Onboarding Discovery

There are two methods for discovering potential onboarding networks:

- A.1 - Search for public Wi-Fi networks matching a particular SSID wildcard name.
- A.2 - Search for Wi-Fi networks advertising a particular realm.

## A.1 BRSKI SSID Name Wildcard Match

The device will search for all SSIDs matching the wildcard as specified in [^FRIEL].

The device will iterate round-robin across successful pattern matches in strength order. 

Every time a device finds a viable match, it will connect to the onboarding network and attempt to discover the registrar.

## A.2 802.11u eap.arpa

The device will search for all networks supporting the `eap.arpa` realm.

The device will iterate round-robin across successful pattern matches in strength order.

Every time a device finds a viable match, it will connect to the onboarding network and attempt to discover the registrar.

## Onboarding Process

The device will prefer onboarding networks with realm support over BRSKI SSID matches. 

```mermaid
flowchart LR
    A[Start] --> B{Find<br>eap.arpa<br>Realms}
    B -- Yes --> C[Search <br>for Registrar]
    B -- No ----> E{Find<br>BRSKI<br>SSIDs}
    E -- Yes --> C[Discover<br>Registrar]
    E -- No --> A
```

# B - Discover Registrar

When the device discovers a candidate onboarding network, it will attempt to discover the registrar.

If the registrar is non-discoverable, this onboarding network will be temporarily marked as failed, and the onboarding process will proceed to the next candidate onboarding network.

The device operates either in IPV6 or IPV4 mode. The options for Registrar discovery are slightly different in each case. 

For the purposes of the NIST Build 5 demonstrator, we shall use the mDNS method of directly discovering the registrar as outlined in Appendix A [^rfc8995].

> Discovery of the registrar **MAY** also be performed with DNS-based Service Discovery by searching for the service "_brski-registrar._tcp.example.com". In this case, the domain "example.com" is discovered as described in [[RFC6763](https://www.rfc-editor.org/rfc/rfc8995.html#RFC6763)], [Section 11](https://www.rfc-editor.org/rfc/rfc6763#section-11) ([Appendix A.2](https://www.rfc-editor.org/rfc/rfc8995.html#IPv4dhcp) of this document suggests the use of DHCP parameters).

Specifically:

* Device obtains an IP address via DHCP as per A.2 [^rfc8995].
* Device listens for service announcement `"_brski-registrar._tcp.example.com"` as per Appendix B [^rfc8995].
* Device secures IP address of candidate Registrar.
* Device attempts to initiate voucher request.

## Discover Registrar (Full Options)

TBD: Outline the full list of methods for discovering the registrar.

# C - Request Voucher Registrar

**Preconditions:** Before we initiate the Request Voucher, we assume the following conditions are met:

* `device` is provisioned with a valid `iDevID`.
* `device` has connected to a candidate `onboarding network`.
* `device` has a valid IP address on the `onboarding network`.
* `device` has discovered the IP address of a candidate `registrar` (or a `proxy`).

**Post Conditions (Success):** If the voucher request is successful:

* `device` is in possession of a valid `voucher`.

* where the tests that need to pass are

  * voucher has not been revoked, which requires:

    * behaviour of IoT device bound by MUD descriptor

    * No requests to blacklisted domains / IP addresses

    * Manufacturer is trusted

    * Device is trusted or is owned by a user who is trusted to connect devices


## C - Request Voucher Overview (Basic)

The complete flow of the voucher request process is as follows:

- C.0 `device` creates a partially authenticated TLS connection with registrar.
- C.1 `device` constructs `voucher request` construct request and signs it with `iDevID` private key.
- C.2 `device` sends `voucher request` to `registrar`.
- C.3 `registrar` validates `voucher request`.
- C.4 `registrar` forwards `voucher request` to `MASA`.
- C.5 `MASA` validates `voucher request`.
- C.6 `MASA` signs `voucher`.
- C.7 `MASA` returns `voucher` to `registrar`.
- C.8 `registrar` validates `voucher`.
- C.9 `registrar` returns voucher to `device`.
- C.10. `device` validates `voucher`.

```mermaid
  %%{init: {
    'themeVariables': {
      'noteBkgColor': '#BB2528',
      'noteTextColor': '#fff'
    }
  }
}%%

%%{init:{'themeCSS': 'g:nth-of-type(1) .note { stroke:blue;fill: crimson; }; ' }}%%
 
    
sequenceDiagram
    participant device
    participant registrar
    participant MASA
   
    device->>registrar: C.0 partially authenticated TLS 
    activate device 
    Note right of device: C.1 prepare and <br> sign Voucher<br> Request (VR)
    device->>-registrar: C.2 send VR
  
  	

 activate registrar    
    Note right of registrar:C.3 validate VR
    registrar->>-MASA: C.4 forward VR
    
    activate MASA
    Note right of MASA: C.5 validate VR
    deactivate MASA
  
    activate MASA
    Note right of MASA:C.6 sign voucher (V)
    deactivate MASA
    
 	MASA->>registrar :C.7 return V
 	
 	 activate registrar
    Note right of registrar:C.8 validate V
    deactivate registrar
    
    registrar->>device : C.9 return V
    
    activate device 
    Note right of device:C.10 validate V
    deactivate device 
```

## 3 - Request Voucher Overview (Advanced Policy)

Validation processes exist at stages:

- C.1
- C.3
- C.5
- C.8
- C.10

At each of these stages, there is the option to evaluate and enforce a policy decision.

C.3 and C.8 are validation and policy enforcement points implemented at the registrar and therefore ideal for implementing the core networking policy.

# D - Enrol the Device

Enrolling the device consists of the following steps:

- D.0 - Fully authenticate the TLS connection, using iDevID (using the pinned cert in the voucher response).
- D.1 - Generate LDevID public/private key pair.
- D.2 - Device constructs the CSR request for enrolment, which includes the iDeviD and is signed by iDeviD.
- D.3 - Device sends the CSR to the registrar (over the authenticated TLS session).
- D.4 - The registrar validates the CSR request.
- D.5 - The registrar constructs the certificate response (LDevID).
- D.6- The registrar returns the certificate to the device.
- D.7 - The device saves the LDevID (network credentials) locally ready to attach to the network.

```mermaid
  %%{init: {
    'themeVariables': {
      'noteBkgColor': '#BB2528',
      'noteTextColor': '#fff'
    }
  }
}%%

%%{init:{'themeCSS': 'g:nth-of-type(1) .note { stroke:blue;fill: crimson; }; ' }}%%
 
    
sequenceDiagram
    participant device
    participant registrar
 
    device->>registrar: D.0 fully authenticated TLS connection 
    activate device 
    Note right of device: D.1 gen LDevID+/- key pairs
    Note right of device: D.2 prepare CSR
    device->>-registrar: D.3 send CSR
  
  	activate registrar    
    Note right of registrar: D.4 validate CSR
    deactivate registrar
    
    activate registrar
    Note right of registrar: D.5 construct and sign certificate
    deactivate registrar

 	registrar->>device : D.6 return certificate

    
    activate device 
    Note right of device: D.7 install certificate locally 
    deactivate device 
```

# E - Join the Network

Joining the network can be triggered by the device as soon as the device is in possession of a valid LDevID (or other network credential).

The router will receive the network connection request. It may confer with the registrar to check that the device is adequately permissioned to join the network. Typically, this may be performed through the RADIUS interface.

```mermaid
    
sequenceDiagram
    participant device
    participant router
    participant registrar
 
    
    device->>router: 
    
    router->>registrar: E.2 check permission
    note right of router: This is often <br>implemented by <br>RADIUS protocol 
    registrar->>router: E.3 respond permission
    router->>device: E.4 accept connection 
```

# F Continuous Assurance of the Network

```mermaid

    
sequenceDiagram
    participant device
    participant router
    participant registrar
    participant external-sources 
 
    external-sources -)registrar: F.0 attempt connection
    registrar-)router:F.1 attempt connection
    
    alt CMD to device
		router->>device: F.2A ask device to remove itself
		device->>router: F.3A confirm
		note right of router: This is an <br>unreliable process<br>can't trust device
		
	else manage at router
		router->>router: F.2B check permission
		note right of router: Router manages<br> through ejection<br> or subnets
	
	end
     
    
    router->>registrar: F.4 respond with status
    router->>external-sources: F.5 respond with status
```

For the full details of the continuous assurance process, see the reference document [Continuous Assurance](22-certificates.md).

# Appendix: Key References

[^rfc8995]: https://datatracker.ietf.org/doc/rfc8995/
[^FRIEL]: https://ftp.kaist.ac.kr/ietf/draft-friel-brski-over-802dot11-00.txt
[^EMU]: https://datatracker.ietf.org/doc/draft-richardson-emu-eap-onboarding/