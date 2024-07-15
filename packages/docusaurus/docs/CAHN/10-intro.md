---
slug: /
title: Introduction
---

Nquiringminds is developing Continuous Assurance for Heterogeneous Networks (CAHN). New technology that underpins network-of-networks, with novel identity models and zero-trust security. [[1](https://www.ukri.org/news/major-future-telecoms-research-boost-announced/#:~:text=UKRI%20is%20investing%20%C2%A370,foundational%20role%20in%20communication%20networks.)]

Nick Allott, CEO of NquiringMinds comments: “Our concept of continuous assurance, builds on some innovative work that has been developed within NIST" [[2](https://www.nccoe.nist.gov/projects/trusted-iot-device-network-layer-onboarding-and-lifecycle-management)]

CAHN will develop new architectures working across networks. It will use advanced nations of identity and distributed credentials, combined with dynamic (AI) reasoning to dynamically infer trustworthiness and assurance. We will work with many different use case and endpoints, with use cases that include Digital Secure by Design hardware silicon to protect against memory vulnerabilities developed with ARM and University of Cambridge. [[3](https://www.dsbd.tech/)][[4](https://www.arm.com/architecture/cpu/morello)]

## Verifiable Credential Technology

CAHN will be a system which can take in information from many sources and through many channels through the use of Verifiable Credential (VC) technology. With traditional secure communication, such as online banking, the channel by which you communicate information is secured (e.g. the https connection made to your online banking provider of choice, established via standard PKI technology). Using verifiable credentials you instead secure the information you are communicating itself by using PKI technology to sign the packets of information. The advantages of this approach are:

- the information can come via unsecured or out-of-band mechanisms and the information's content can still be tamper-proof and it's source may be cryptographically attested to and verified.

- the provenance of the information may be attested to and tracked, VCs themselves may be signed and attested to as VC recursively, which may be utilised as a method to attest to the mechanism and routes by which the information came into the system.

- By storing the data as VCs then the provenance of each piece of information's origin is maintained, and can be retrospectively reasoned about post receipt of the information. By virtue of this one can also introspect on the VCs originators to gain insights into the originators, for example the trustworthiness of those originators, or the kinds of information they provide, and can model their behaviour to spot unusual activity.

- users consuming data from a system which embodies it's data as VCs can choose which VC originators and routes to trust, and the time period / conditions in which they trust them. Each user may therefore have a different view of the same data by trusting different VCs, the data host does therefore not impose their own world view of concept of trust onto system users, they gain the autonomy to decide for themselves what information they believe.

- Use of VCs facilitates multiple decentralised signing authorities, rather than relying on one central authority to secure the route via which data enters your system. This mitigates the risks of a central authority being compromised and decouples you from relying on a single providers services, freeing data providers being reliant on a single central source. This also facilitates self-signing of information, supporting the self-sovereign identity model, which gives individuals full ownership and control of their digital data and identity.

- Because the information itself is signed distributed storing of data becomes much easier, as it can be re-communicated and distributed between data lakes later, while maintaining the security and provenance of the information. 

# Continuous Assurance 
Another piece of our solution is continuous assurance, that is, *continuously* examining the claims made to the system to see if we still believe those piece of information and their sources, and *assuring* that the data and its sources are still trustworthy. Rather than relying on a one-off assurance event the system will continuously apply multiple multiple analytical techniques to infer the trustworthiness and validity of the information claimed to the system.

This can be configured to work differently for each data-consuming user in the system, rather than being a top down authoritative approach of prescribing to users what facts, originators of routes they should trust, we give the freedom to users to configure their own thresholds and metrics for what information, routes of data provenance and originators they should trust.

