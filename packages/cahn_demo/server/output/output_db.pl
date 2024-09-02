created(1725284091.5330298).
assert(device_type_trust("henry@nquiringminds.com",1725278576783,"EvilPhone-id")).
assert(device_trust("henry@nquiringminds.com",1725274510216,"AshEvilPhone-id")).
assert(manufacturer_trust(1725274376695,"EvilInc-id","henry@nquiringminds.com")).
assert(device_type(1723716151033,"TrustPhone-id","TrustPhone")).
assert(device_type(1723716151033,"VulnerableCamera-id","VulnerableCamera")).
assert(device_type(1723716151033,"EvilPhone-id","EvilPhone")).
assert(manufacturer_trust(1723716151033,"TrustCorp-id","Henry-id")).
assert(manufacturer_trust(1723716151033,"TrustCorp-id","Ash-id")).
assert(manufacturer_trust(1723716151033,"EvilInc-id","Ash-id")).
assert(device_type_trust("Henry-id",1723716151033,"TrustPhone-id")).
assert(device_type_trust("Ash-id",1723716151033,"EvilPhone-id")).
assert(device_type_trust("Henry-id",1723716151033,"VulnerableCamera-id")).
assert(user(false,false,false,1723716151033,"Ash-id","ash")).
assert(user(true,true,true,1723716151033,"Henry-id","henry")).
assert(has_vulnerability(1723716151033,"VulnerableCameraSBOM-id","VulnerableCameraVulnerability-id")).
assert(manufactured(1723716151033,"EvilPhone-id","EvilInc-id")).
assert(manufactured(1723716151033,"TrustPhone-id","TrustCorp-id")).
assert(manufactured(1723716151033,"VulnerableCamera-id","EvilInc-id")).
assert(sbom_vulnerability(1723716151033,"VulnerableCameraVulnerability-id",10)).
assert(has_sbom(1723716151033,"VulnerableCamera-id","VulnerableCameraSBOM-id")).
assert(is_of_device_type(1723716151033,"HenryVulnerableCamera-id","VulnerableCamera-id")).
assert(is_of_device_type(1723716151033,"AshEvilPhone-id","EvilPhone-id")).
assert(is_of_device_type(1723716151033,"HenryTrustPhone-id","TrustPhone-id")).
assert(device_trust("Henry-id",1723716151033,"HenryTrustPhone-id")).
assert(device_trust("Henry-id",1723716151033,"HenryVulnerableCamera-id")).
assert(device_trust("Ash-id",1723716151033,"AshEvilPhone-id")).
assert(device(1723716151033,"AshEvilPhone-id","AshEvilPhone-idevid","AshEvilPhone")).
assert(device(1723716151033,"HenryTrustPhone-id","HenryTrustPhone-idevid","HenryTrustPhone")).
assert(device(1723716151033,"HenryVulnerableCamera-id","HenryVulnerableCamera-idevid","HenryVulnerableCamera")).
assert(sbom(1723716151033,"VulnerableCameraSBOM-id","VulnerableCamera SBOM information")).
assert(manufacturer(1723716151033,"EvilInc-id","EvilInc")).
assert(manufacturer(1723716151033,"TrustCorp-id","TrustCorp")).
assert(user(true,true,true,1725274380884,"henry@nquiringminds.com","henry-user")).
