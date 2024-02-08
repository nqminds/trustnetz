# Implementation notes

:::danger TODO: Awaiting input from Steve on Wisekeys
:::
## Code repositories



The respective code repositories and relevant documentation are to be found here 

* Wisekey: https://github.com/sclark-wisekey/NCCoE
* BRSKI core: https://github.com/nqminds/brski 
* NIST BRSKI demonstrator: https://github.com/nqminds/nist-brski

We will consider each of the primary factory provisioning steps in turn

1. **Vanilla firmware creation**:
2. **iDevID provisioning**: 
3. **iDevID utilisation**: 





## **Vanilla firmware creation**:

Practically this is an SD card, that can be inserted into a PI

This Card must contain

1. PI boot up environment
2. Interface code to wisekey TPM 
3. Any startup operations to activate TPM
4. iDevID provisioning code 
5. The auto start logic for the iDevID provisioning code
6. The MCR as an immutable resource that the iDevID provisioning code can use 

> Note: can this be an partition - rather than a full SD card. makes demo easier 



## **iDevID provisioning**: 

The iDevID provisioning code comes from  https://github.com/sclark-wisekey/NCCoE

The MCR in firmware creation, must be linked to the manufacturer iDevID signing service. For the purpose of this demo, this is a the demo wisekey CA. Specifically

* the MCR public key must match the wisekey CA service private key
* the MCR address/domain must be where the wisekey CA service  is hosted 

If no valid iDevID is found when this process starts, it should attempt to initiated the process (essentially a CSR request)

We can be fairly flexible how this is done. 

If the provisioning process is successful

1. iDevID must validate 
2. iDevID must contain MASA address ??



We need to agree an API or storage location to communicate the iDevID between the provisioning and utilisation phases. 

The APIs the utilisation process uses to sign the CSR for the IDevID cert, need to be the same that the utilisation phase will use 





## **iDevID utilisation**: 

The base code is to be found here https://github.com/nqminds/brski 

Specifically we need the following integration points



#### IDevID sourcing

Utilisation phase needs the full iDeviD cert. We need the to agree the API or folder location 

We then need to change XXXX code to change where this is sourced in the current code base 



#### C.0 partial TLS

The partial TLS establishment, needs access to the iDevID signing key.

https://github.com/nqminds/brski/blob/main/src/brski/http/httplib_wrapper.cpp#L264

> NOTE: the complexity here is BRSKI uses a slightly non standard TLS process - where this initial stage C.0 is only partially authenticate. We need to work out how to map it 

#### C.1: voucher signing 

We need to use the TPM stored iDevID- to sign the voucher request

I think it is these CCM signing functions that need to change

https://github.com/nqminds/brski/blob/585badfd80921df08baeaa1fba9f0945e4b55825/src/voucher/voucher.c#L875

In theory if we use wolfssl configured to use wisekey this would happen automatically

If not, we need to change this signing functions with wisekey functions. 





## General notes 

The bindings to the dependent SSL functions are defined in the following header file 

https://github.com/nqminds/brski/blob/main/src/voucher/crypto.h

There are two implementation: an Open SSL binding 

https://github.com/nqminds/brski/blob/main/src/voucher/crypto_ossl.c

And an optional (not fully complete) wolfssl binding 

https://github.com/nqminds/brski/blob/main/src/voucher/crypto_wssl.c



## Physical setup and installation

> What do we need to know here  ??



