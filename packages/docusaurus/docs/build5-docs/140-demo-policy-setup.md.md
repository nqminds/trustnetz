---
title: Demo Policy setup
---


import ExternalContent from '@site/src/components/externalContent.js';

The policy is an augmentation of the baseline BRSKI protocal which facilitates network owners to determine a policy to determine which devices are allowed onto the network, and which users have permissions to trust different entities. The policy is implemented as a Rust library which provides a number of methods which may be run by the registrar to determine if a manufactuer of devices is to be trusted to be contacted to validate the idevID of connecting devices, if a device is trusted to onboard to the network, and determine if a device is vulnerable. An sqlite database is used to store the data which is used to evaluate the policy. Information is submitted to the the sqlite database through verifiable credentials (VCs).

The policy allows a network owner to enter the users in thier organisation and set thier permission levels so that users may trust other users to issue trust to other users or to connect devices.

**There are 5 pieces of the policy infastructure:**
- a set of **schemas** which define the structure for claims which may be submitted to claim information to the regisrar in the form of VCs
- a **rust library which provides the functions to evaluate the policy**, the functions take an idevID and the path to the sqlite database
- a **VC REST API** which is connected to a [tdx volt](https://docs.tdxvolt.com/en/introduction) and is used to sign and verify VCs, an instance runs on the registrar and an instance runs on a agent's machine which wishes to submit information to the regisrar (both connecting to the same tdx volt instance, which may run on the regisrar or another remote machine). When a claim is submitted to this REST API the route specifies the schema to use and the body contains the body of the VC claim. It verifies that the claim data matches the specified schema, and if so, returns a signed VC containing the claim information.
- a **Registrar REST API** which runs on the regisrar and receives VCs from agents, it submits the VC to the VC REST API running locally to verify that the VC was signed by an instance of the VC REST API. If it verifies sucessfully then the data in the sqlite database is updated to reflect the changes in the contents of the claim. If the entities referred to in the claim exist then it makes the changes and responds to the post request from the agent telling it as such. If the entities referred to do not exist or the request would not result in a change then it responds to the post request to inform the agent.
- a **demo web app** which may be used for demonstration purposes to act as a network owner to interactively and simply delegate trust or distrust in a manufacturer or device, binding a device to a device type, and setting a device type to vulnerable or not vulnerable by binding it to a demonstrator critical vulnerability and allowing a demonstrator to view the state of the selected manufacturer, device and device type.


<ExternalContent link="https://raw.githubusercontent.com/nqminds/nist-brski/main/packages/schemas/README.md"/>

<ExternalContent link="https://raw.githubusercontent.com/nqminds/nist-brski/nist_policy_rust_library/packages/nist_policy/README.md"/>

<ExternalContent link="https://raw.githubusercontent.com/nqminds/nist-brski/nist-registrar-server/packages/nist_vc_rest_server/README.md"/>

<ExternalContent link="https://raw.githubusercontent.com/nqminds/nist-brski/nist-registrar-server/packages/nist_registrar_server/README.md"/>

<ExternalContent link="https://raw.githubusercontent.com/nqminds/nist-brski/nist-registrar-app/packages/registrar_demo_app/README.md"/>

