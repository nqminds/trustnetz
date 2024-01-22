---
slug: /
title: Introduction
---





# Build 5 scope

As with all builds running under the NIST [Trusted IoT Device Network-Layer Onboarding and Lifecycle Management](https://www.nccoe.nist.gov/projects/trusted-iot-device-network-layer-onboarding-and-lifecycle-management) project the intent of Build 5 is to practically demonstrate, both the method and value of onboarding IOT devices using automated, but trustworthy methods.

Specifically build 5 has the following key attributes

1. **BRSKI based**: as the baseline onboarding protocol, it will use the [Bootstrapping Remote Secure Key Infrastructure (BRSKI) RFC 8995]( https://datatracker.ietf.org/doc/rfc8995/)
2. **WIFI aware:** the baseline BRSKI protocol does not detail the specifics of onboarding onto WIF networks. Build 5 fills this gap by specification and demonstrating full WIFI on boarding
3. **Policy augmented**: in baseline BRSKI protocol many aspects of policy (which actor can do what) are intentionally left as implementation details. Build 5 fleshed out some detail options, demonstrating a practical way of implementing flexible policy using interoperable methods 
4. **Continuous assurance**: the NIST project targets the problem of lifecycle management; this is much more than the initial one off trustworthiness checks that happen a singular event when on boarding a device. Build 5 demonstrates a practical but interoperable way of implementing continuous assurance methods, which can be expanded over time in combination with the flexible policy approach.



## Delivery

Build 5 currently comes in two distinct version

* Build 5 V1: delivers the first two objectives. The BRSKI end to end demonstrator working with EAP TLS security on a WIFI connection
* Build 5 V2: additionally adds the second two features; it implements a continuous assurance process wiht a dynamic policy  













