# Nist Policy (Rust Library for Policy Evaluation)

This Rust library contains the functions to check the Nist policy before proceeding with various parts of the BRSKI onboarding flow.

## check_manufacturer_trusted

`check_manufacturer_trusted` takes 2 arguments, an X509 certificate object (the idevid) and a path to an sqlite database on the disk, the sqlite database should be created and managed by the registrar's Rest API server, which takes in claims of information in the form of VCs. It checks if a manufacturer has been trusted by a user who has `can_issue_trust` rights. If the manufacturer doesn't exist in the manufacturer table, it will add an entry for that manufacturer with the name being the issuer contained in the idevid, and id being a randomly generated uuid, and the current datetime as the `created_on` field. It returns a boolean which states if the manufacturer (issuer in the idevid) is trusted. 