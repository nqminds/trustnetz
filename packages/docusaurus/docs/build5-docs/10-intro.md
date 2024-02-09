---
slug: /
title: Introduction
---


# Build 5 Scope

As with all builds running under the NIST [Trusted IoT Device Network-Layer Onboarding and Lifecycle Management](https://www.nccoe.nist.gov/projects/trusted-iot-device-network-layer-onboarding-and-lifecycle-management) project, the intent of Build 5 is to practically demonstrate both the method and value of onboarding IoT devices using automated yet trustworthy methods.

Specifically, Build 5 has the following key attributes:

1. **BRSKI based**: As the baseline onboarding protocol, it will utilize the [Bootstrapping Remote Secure Key Infrastructure (BRSKI) RFC 8995](https://datatracker.ietf.org/doc/rfc8995/).
2. **Wi-Fi aware**: While the baseline BRSKI protocol does not detail the specifics of onboarding onto Wi-Fi networks, Build 5 fills this gap by specifying and demonstrating full Wi-Fi onboarding.
3. **Policy augmented**: In the baseline BRSKI protocol, many aspects of policy (which actor can do what) are intentionally left as implementation details. Build 5 fleshes out some detailed options, demonstrating a practical way of implementing flexible policy using interoperable methods.
4. **Continuous assurance**: The NIST project targets the problem of lifecycle management, which is much more than the initial one-off trustworthiness checks that occur as a singular event when onboarding a device. Build 5 demonstrates a practical but interoperable way of implementing continuous assurance methods, which can be expanded over time in combination with the flexible policy approach.

## Delivery

Build 5 currently comes in two distinct versions:

* Build 5 V1: Delivers the first two objectives. The BRSKI end-to-end demonstrator works with EAP TLS security on a Wi-Fi connection.
* Build 5 V2: Additionally adds the second two features; it implements a continuous assurance process with dynamic policy.

