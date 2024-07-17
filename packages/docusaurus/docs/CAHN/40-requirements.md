---
title: Requirements
---

The NIST Cybersecurity Framework (CSF) defines a taxonomy of high-level cybersecurity requirements to meet Cybersecurity outcomes upon any organization. The table below outlines the Functions, Categories, and Subcategories of the CSF Core. Each category contains multiple requirements within them.
 
| Function     | Category                                              | Category Identifier |
|--------------|-------------------------------------------------------|---------------------|
| Govern (GV)  | Organizational Context                                | GV.OC               |
|              | Risk Management Strategy                              | GV.RM               |
|              | Roles, Responsibilities, and Authorities              | GV.RR               |
|              | Policy                                                | GV.PO               |
|              | Oversight                                             | GV.OV               |
|              | Cybersecurity Supply Chain Risk Management            | GV.SC               |
| Identify (ID)| Asset Management                                      | ID.AM               |
|              | Risk Assessment                                       | ID.RA               |
|              | Improvement                                           | ID.IM               |
| Protect (PR) | Identity Management, Authentication, and Access Control | PR.AA             |
|              | Awareness and Training                                | PR.AT               |
|              | Data Security                                         | PR.DS               |
|              | Platform Security                                     | PR.PS               |
|              | Technology Infrastructure Resilience                  | PR.IR               |
| Detect (DE)  | Continuous Monitoring                                 | DE.CM               |
|              | Adverse Event Analysis                                | DE.AE               |
| Respond (RS) | Incident Management                                   | RS.MA               |
|              | Incident Analysis                                     | RS.AN               |
|              | Incident Response Reporting and Communication         | RS.CO               |
|              | Incident Mitigation                                   | RS.MI               |
| Recover (RC) | Incident Recovery Plan Execution                      | RC.RP               |
|              | Incident Recovery Communication                       | RC.CO               |

The specific CSF requirements the CAHN system should help an organisation meet are as follows:

## IDENTIFY (ID): The organization’s current cybersecurity risks are understood

#### Asset Management (ID.AM): Assets (e.g., data, hardware, software, systems, facilities, services, people) that enable the organization to achieve business purposes are identified and managed consistent with their relative importance to organizational objectives and the organization’s risk strategy
- **ID.AM-01:** Inventories of hardware managed by the organization are maintained

#### Risk Assessment (ID.RA): The cybersecurity risk to the organization, assets, and individuals is understood by the organization
- **ID.RA-01:** Vulnerabilities in assets are identified, validated, and recorded

## PROTECT (PR): Safeguards to manage the organization’s cybersecurity risks are used

#### Identity Management, Authentication, and Access Control (PR.AA): Access to physical and logical assets is limited to authorized users, services, and hardware and managed commensurate with the assessed risk of unauthorized access
- **PR.AA-01:** Identities and credentials for authorized users, services, and hardware are managed by the organization
- **PR.AA-02:** Identities are proofed and bound to credentials based on the context of interactions
- **PR.AA-03:** Users, services, and hardware are authenticated
- **PR.AA-04:** Identity assertions are protected, conveyed, and verified
- **PR.AA-05:** Access permissions, entitlements, and authorizations are defined in a policy, managed, enforced, and reviewed, and incorporate the principles of least privilege and separation of duties

#### Technology Infrastructure Resilience (PR.IR): Security architectures are managed with the organization’s risk strategy to protect asset confidentiality, integrity, and availability, and organizational resilience
- **PR.IR-01:** Networks and environments are protected from unauthorized logical access and usage

#### Data Security (PR.DS): Data are managed consistent with the organization’s risk strategy to protect the confidentiality, integrity, and availability of information
- **PR.DS-01:** The confidentiality, integrity, and availability of data-at-rest are protected
- **PR.DS-02:** The confidentiality, integrity, and availability of data-in-transit are protected

## DETECT (DE): Possible cybersecurity attacks and compromises are found and analyzed

#### Continuous Monitoring (DE.CM): Assets are monitored to find anomalies, indicators of compromise, and other potentially adverse events
- **DE.CM-01:** Networks and network services are monitored to find potentially adverse events

