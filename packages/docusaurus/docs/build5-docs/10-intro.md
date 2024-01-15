---
slug: /
title: Terminology
---

# Terminology

We will use the term `device` interchangeably with the term `pledge` for easier reading

* `device`: the device wishing to onboard to the network 

* `registrar`: the principle decision making entity on the on boarding process

* `proxy`: a proxy to the registrar - useful if the registrar is located externally of shared between networks 

* `MASA`: the manufacturer authority, which issues manufacturer assurances (like iDevID) and can attest to the validity of these assurances

* `router`:  the physical router to which a device is connecting, the router will potentially host many networks

* `onboarding network`: a constrained network which is used to bootstrap the onboarding process

* `target network`: the operational network to which the device is intending to attach to 

* `iDevID`: a unique device certificate, issued by the manufacture

* `LDevID`: a certificate used by the device to get network accesss (EAP certificate)

  

# Stages Overview

- 0 - Factory provisioning 
- 1 - Discover onboarding network 
- 2 - Discover registrar
- 3 - Request voucher
- 4 - Enrol the device
- 5 - Join the network
- 6 - Continuous assurance of the network 



```mermaid
sequenceDiagram
autonumber
    critical Private Network
    	Device->>Manufactuer: 0-Request iDevID
    end
```



# 0 - Factory Provisioning

The demonstrated factory provisioning flow is as follows

* 0.1 - Device is pre-provisioned with the manufactures' CA and URI for manufactures' servers
* 0.2 - Device generates a unique public/private key pair
* 0.3 - Device requests an iDevID from the manufacturer
* 0.4 - Returned iDevID is installed on the device



# 1 - Onboarding discovery

There are two methods for discovering potential on boarding networks:

- 1.1 - Search for public WIFIs matching a particular SSID wildcard name
- 1.2 - Search for WIFIs advertising a particular realm

## 1.1 BRSKI%ssidname wildcard match

The device will search for all SSIDs matching the wildcard as specified in [^FRIEL]

The device will iterate round robin across successful pattern matches in strength order. 

Every time an device finds a viable match it will connect to the onboarding network and attempt to discover the registrar.

## 1.2 802.11u eap.arpa

The device will search for all networks supporting the `eap.arpa` realm

The device will iterate round robin across successful pattern matches in strength order.

Every time an device finds a viable match it will connect to the onboarding network and attempt to discover the registrar.



## Onboarding process

The device will prefer onboarding networks with realm support over BRSKI SSID match. 



```mermaid
flowchart LR
    A[Start] --> B{Find<br>eap.arpa<br>Realms}
    B -- Yes --> C[Search <br>for Registrar]
    B -- No ----> E{Find<br>BRSKI<br>SSIDs}
    E -- Yes --> C[Discover<br>Registrar]
    E --No --> A
```



# 2 - Discover Registrar

When the device has a discovered a candidate onboarding network it will attempt to discover the registrar.

If the registrar is non discoverable, this onboarding network will be temporarily marked as failed, and the onboarding process will proceed to the next  candidate onboarding network.

The device operates either in IPV6 or IPV4 mode. The options for Registrar discovery are slightly different in each case. 

For the purposes of the NIST Build 5 demonstrator we shall use the mDNS method of directly discovering the registrar as outlined in Appendix A [^rfc8995]

> Discovery of the registrar **MAY** also be performed with DNS-based Service Discovery by searching for the service "_brski-registrar._tcp.example.com". In this case, the domain "example.com" is discovered as described in [[RFC6763](https://www.rfc-editor.org/rfc/rfc8995.html#RFC6763)], [Section 11](https://www.rfc-editor.org/rfc/rfc6763#section-11) ([Appendix A.2](https://www.rfc-editor.org/rfc/rfc8995.html#IPv4dhcp) of this document suggests the use of DHCP parameters).



Specifically:

* Device obtains an IP address via DHCP as per A.2  [^rfc8995]
* Device listens for service announcement `"_brski-registrar._tcp.example.com"` as per  Appendix B [^rfc8995]
* Device secures IP address of candidate Registrar
* Device attempts to initiate voucher request



## Discover Registrar (full options)

TBD: outline the full list of methods for discovering registrar 







# 3 - Request Voucher Registrar

**Preconditions:** before we initiate the Request Voucher we assume the following conditions are met.

* `device` is provisioned with a valid `iDevID`

* `device` has connected to a candidate `onboarding network`

* `device` has a valid IP address on the  `onboarding network`

* `device` has discovered the IP address of a candidate `registrar` (or a `proxy`)

  

**Post conditions (success):** if the voucher request is successful IF

* `device` is in posession of a valid `voucher` 

* where the voucher tests that need to pass are

  * x

  * y

  * z




## 3 - Request Voucher overview (basic)

The complete flow of the voucher request process is as follows 

- 3.1 `device` constructs `voucher request` construct request and sign it with `iDevID` private key
- 3.2 `device` sends `voucher request` to `registrar` 
- 3.3 `registrar` validates `voucher request` 
- 3.4 `registrar` forwards `voucher request` to `MASA` 
- 3.5 `MASA` validates `voucher request`
- 3.6 `MASA` signs `voucher`
- 3.7 `MASA` returns `voucher` to `registrar`
- 3.8 `registrar` validates `voucher`
- 3.9 `registrar` returns voucher to `device`
- 3.10. `device` validates `voucher`



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
   
    activate device 
    Note right of device: 3.1 prepare and <br> sign Voucher<br> Request (VR)
    device->>-registrar: 3.2 send VR
  
  	activate registrar    
    Note right of registrar: 3.3 validate VR
    registrar->>-MASA: 3.4 forward VR
    
    activate MASA
    Note right of MASA: 3.5 validate VR
    deactivate MASA
  
    activate MASA
    Note right of MASA: 3.6 sign voucher (V)
    deactivate MASA
  
    
    
 	MASA->>registrar : 3.7 return V
 	
 	activate registrar
    Note right of registrar: 3.8 validate V
    deactivate registrar
    
    registrar->>device : 3.9 return V
    
    activate device 
    Note right of device: 3.10 validate V
    deactivate device 
        
    

```





## 3 - Request Voucher overview (advanced policy )

Validation processes exist at statges

- 3.1
- 3.3
- 3.5
- 3.8
- 3.10

At each of these stages there is the option to evaluate and enforce a policy decision

3.3 and 3.8 are validation and policy enforcement points implemented at the registrar and therefore ideal for implementing the core netwoking policy 



# 4 Enrol the device

Enrolling the device is relatively simple, consisting of the following steps

- 4.1 - device constructs the CSR request for enrolment, which includes the iDeviD
- 4.2 - device sends the CSR to the registrar (over the authenticated TLS session)
- 4.3 - the registrar validates the CSR request
- 4.4 - the registrar constructs the certificate response (LDevID)
- 4.5 - the registrar returns the certificate to the device
- 4.6 - the device saves the LDevID (network credentials) locally ready to attach to the network 





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
 
   
    activate device 
    Note right of device: 4.1 prepare CSR
    device->>-registrar: 4.2 send CSR
  
  	activate registrar    
    Note right of registrar: 4.3 validate CSR
    deactivate registrar
    
    activate registrar
    Note right of registrar: 4.4 construct and sign certificate
    deactivate registrar

    
    
 	registrar->>device : 4.5 return certificate

    
    activate device 
    Note right of device: 4.6 install cerificate locally 
    deactivate device 
        
    

```



# 5 Join the network 

Joining the network can be triggered by the device as soon as the the device is in posssions of a a valid LDevID (or other network credential)

The router will receive the network connection request. It may confer with the registrar, to check that the device is adequately permissioned to join the network. Typically this maybe be performed through the RADIUS interface. 



```mermaid
    
sequenceDiagram
    participant device
    participant router
    participant registrar
 
    
    device->>router: 5.1 attempt connection
    router->>registrar: 5.2 check permission
    note right of router: this is often <br>implemented by <br>RADIUS protocl 
    registrar->>router: 5.3 respond permission
    router->>device: 5.4 accept connection 
    
   

```



# 6 Continuous assurance of the network





```mermaid

    
sequenceDiagram
    participant device
    participant router
    participant registrar
    participant external
 
    external -)registrar: 6.0 attempt connection
    registrar-)router: 6.1 attempt connection
    
    alt CMD to device
		router->>device: 6.2A ask device to remove itself
		device->>router: 6.3A confirm
		note right of router: this is an <br>unreliable process<br>cant trust device
		
	else manage at router
		router->>router: 6.2B check permission
		note right of router: router manages<br> through ejection<br> or subnets
	
	end
     
    
    router->>registrar: 6.4 respond with status
    router->>external : 6.5 respond with status
    
   

```



For the full detail of the continuous assurance process, see reference document [Continuous Assurance](20-ca.md)



# Appendix: key references



[^rfc8995]: https://datatracker.ietf.org/doc/rfc8995/

[^FRIEL]: https://ftp.kaist.ac.kr/ietf/draft-friel-brski-over-802dot11-00.txt

[^EMU]: https://datatracker.ietf.org/doc/draft-richardson-emu-eap-onboarding/