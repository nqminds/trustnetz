---
title: Claim Cascade Design
---

## Generation and storage of key-pairs for Signing of VCs

The claim cascade system is designed such that users or automated agents may sign claims with their private key (stored locally or stored on a remote server which for signs the claims on the user's behalf), the only requirement for the VC to be verifiable is that public key paired with the private key which was used to perform the signing will need to be securely shared in a trusted way with the system, such that the public key can be tied to a particular user's identity. 

This will be achieved by utilising an authentication server which can be sent a request to generate a VC binding a public key to a user's identity, this request will contain the public key and a users credentials, in the most simple case, an email address. These credentials will then be verified, for example in the case of email; the user will receive an email which contains a link they must click to prove their identity, once that is completed the authentication server will sign a VC with it's own private key, which is trusted bt the system, binding the user's identity to that public key. This can be submitted to the system by the user to allow them to submit further VCs signed with their private key.

The management of their keys then becomes an implementation detail which can be specified by the user, private-public key pairs may be ephemeral and generated 

## Receipt of VCs

VCs will be submitted to a particular Claim Cascade node (running on a router / access point for example) through a HTTPS REST API endpoint. The VC will then be stored in an append only return as a received VC on that node using an Event Sourcing pattern. This means that once received a record of all the VCs received will be maintained and if our trust basis or verification basis changes one could regenerate the entire state of the system from the received VCs.

## Verification of VCs

Once a new VC has been received it will be stored on the node and a verifier process will start, which runs on that VC to verify that the VC was signed by the issuer (the VC issuer is specified in the VC) and has not been tampered with, this requires the verifier to have access to the public key of the issuer, which requires it to have been communicated through a trusted method to the node, or for the node to have access to, and trust, a server which has a record of the pubic key of the issuer. Once a VC is verified it may be passed onto the next stage of the process, which is the trust engine, it may also at this stage be signed by the node's public key as a VC and communicated to other nodes on the system, so they can process the information claimed within. 

## Trust Engine

The verification step above merely checks that the VC was signed by the issuer contained within and that it has not been altered since signing, it doesn't say anything about whether the issuer of that VC is trusted to be making claims to this node. The trust engine's purpose is to resolve whether we should trust the information contained within the VC and use the information contained within to perform inference. The details of the algorithm to use to determine if we trust the VC issuer is still in development and discussion but the idea is to use the following information to infer whether the issuer is to be trusted:
- which other users trust or distrust the issuer, and the trust we have in those users
- which claims this issuer has submitted in the past

## Trusted VC to Inference Environment

The VCs which are trusted are then passed to a utility which generates the code in Prolog for the information contained within the VC. The VCs which may be submitted here come in 4 types:

- schema - this defines the schema for a fact which may be submitted, for example, for a fact that a device has a vulnerability the schema defines how that fact is structured, i.e. what fields are associated with this fact and any constraints on the values which may be entered for each field. 
- fact - this defines a fact which should be added to the inferencing environment to be reasoned about, the fact structure should match a schema submitted to the system, for example a fact that a device has a vulnerability
- retraction - a statement that a user retracts a previously submitted fact, used to retract falsely submitted information
- rule - this defines a rule, which defines the logic used for inference, for example a rule may be that a device is not allowed to connect to this wifi router if it has a vulnerability with a score higher than a certain threshold. 

Using these building blocks one may build any general inferencing system.