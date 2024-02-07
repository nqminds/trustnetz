# Build 5 - Demo description



The build5 demonstrator needs to able to trigger the following key events



when we say initiate (or auto), we mean there is a manual flag we can set to "breakpoint", ie stop going to the next stage automatically 

### At the device

1. Reset the device, delete everything accept iDevID
2. Initiate (or auto) onboarding network scan
   1. automatically find registrar
   2. automatically send voucher request
3. Initiate (or auto) the mutually authenticated TLS connection to registrar
4. Initiate (or auto) the enrolment stage
5. Initiate (or auto) the connection to the  operational network

> Note the breakpoint might be hard to do. Depends largely on integration with alex brski code. If hard, leave it out 

### At the Registrar

At the registrar, we need to be able to simulate the key policy events.

These are the writing of the relevant verifiable credential, into the credential source

These are principally

1. Domain trusts the manufacturer 
2. Domain trusts the specific device (iDevID)

And the equivalent "deletion of trust" - which in our case is writing in the opposite fact 

> Note we are using domain trusts instead of network owner trusts - as its essentially the same thing

### At the Registrar (continuous assurance)

specifically for the CA use case, we need these additional commands 

1. Revoke trust in device @ router (this more of a debug command to ensure the command protocol works)
2. Trigger continuous assurance check  - this manually triggers  the check on all current onboarded devices 



### Policy evaluation methods

In order to demonstrate active policy evaluation, we need to call functions (bash scripts), which would evaluate whether the policy is true. These can be simple bash script that return [`true`,`false`] or similar

These are



1. DomainTrustsManufacturer (domain+, manufacturer+)
2. DomainTrustsDevice (domain+,iDevID+)
3. DeviceIsSafe (iDevID+)

The inputs to these scripts could be the public keys, or alternatively an object identifier.





### Policy insertion points

**DomainTrustsManufacturer**

This script should be called at the Registrar before the voucher request is sent to the MASA.

If there is no trust in the manufacturer, there should be no communication to the MASA



**DomainTrustsDevice** 

This script should also be called at the Registrar before the voucher request is sent to the MASA.

We need an additional asserted VC to be implemented

- SetPromiscuousMode (true, false)

If promiscuous mode is true - we don't need to check DomainTrustsDevice

If promiscuous mode is false, we should check DomainTrustsDevice before progressing 

**DeviceIsSafe** 

Should be called before the device is enrolled (ie before the LDevID is created)

### Continuous Assurance process

When the CA check is triggered, all of the following should be checked

* DomainTrustsManufacturer
* DomainTrustsDevice (depending on promiscuous mode setting)
* DeviceIsSafe

If any of the above checks fail - we should trigger the revoke command 





# Debugging info



All components should support a verbose logging mode, that includes the result of every decision.

Plus we should write out all key information as its generated

Plus we should record teh results (addresses) of all service discovery 

The debug views should aggregate all events from

* Device

* Registrar

* MASA

* Radius

* Router

  

A view of logs should be enough. But we may decide to create more streamlined views later.