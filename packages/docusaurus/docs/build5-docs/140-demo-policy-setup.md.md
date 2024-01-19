---
title: Demo Policy setup
---


import ExternalContent from '@site/src/components/externalContent.js';

The policy is an augmentation of the baseline BRSKI protocal which facilitates network owners to determine a policy to determine which devices are allowed onto the network, and which users have permissions to trust different entities. The policy is implemented as a Rust library which provides a number of methods which may be run by the registrar to determine if a manufactuer of devices is to be trusted to be contacted to validate the idevID of connecting devices, if a device is trusted to onboard to the network, and determine if a device is vulnerable. An sqlite database is used to store the data which is used to evaluate the policy. Information is submitted to the the sqlite database through verifiable credentials (VCs).

There are 4 pieces of the policy infastructure:
- a rust library which provides the functions to evaluate the policy, the functions take an idevID and the path to the sqlite database
- a REST API which is connected to a [tdx volt](https://docs.tdxvolt.com/en/introduction) and is used to sign and verify VCs, an instance runs on the registrar and an instance runs on a agent's machine which wishes to submit information to the regisrar (both connecting to the same tdx volt instance, which may run on the regisrar or another remote machine)
- a REST API which runs on the regisrar and receives VCs from agents, 

Claims are submitted through verifiable credentials which are signed by submitting the information a REST API.

The policy allows a network owner to enter the users in thier organisation and set thier permission levels so that users may trust other users to issue trust to other users or to connect devices. 

Policy augmented: in baseline BRSK protocol many aspects of policy (which actor can do what) are intentionally left as implementation details. Build 5 fleshed out some detail options, demonstrating a practical way of implementing flexible policy using interoperable methods
Continuous assurance: the NIST project targets the problem of lifecycle management; this is much more than the initial one off trustworthiness checks that happen a singular event when on boarding a device. Build 5 demonstrates a practical but interoperable way of implementing continuous assurance methods, which can be expanded over time in combination with the flexible policy approach.

<ExternalContent link="https://raw.githubusercontent.com/nqminds/nist-brski/main/packages/schemas/README.md"/>

<ExternalContent link="https://raw.githubusercontent.com/nqminds/nist-brski/nist_policy_rust_library/packages/nist_policy/README.md"/>

<ExternalContent link="https://raw.githubusercontent.com/nqminds/nist-brski/nist-registrar-server/packages/nist_vc_rest_server/README.md"/>

<ExternalContent link="https://raw.githubusercontent.com/nqminds/nist-brski/nist-registrar-server/packages/nist_registrar_server/README.md"/>

<ExternalContent link="https://raw.githubusercontent.com/nqminds/nist-brski/nist-registrar-app/packages/registrar_demo_app/README.md"/>

