# Nist Registrar Server

This is the REST API server which should run on the registrar and accept VCs containing claims, it verifies the VC with the VC Rest API and if the VC successfully verifies then the information claimed in the VCs is acted upon to update the information in sqlite database to reflect the claim.

In order for this to work you must first following the instructions to set up the @nqminds/nist_vc_rest_server and get it running on the same machine as this server. In order for the server to work correctly the following fields in the config file must be pointed at the appropriate targets:

voltConfigPath: The path of a volt config file for the same user on your volt as the one that set up the @nqminds/nist_vc_rest_server
sqliteDBPath: The path to the sqlite database which contains the information your registrar knows, if database file doesn't exist server will create one a populate it with demo data containing nqminds' users. Example databases exist [here](https://github.com/nqminds/nist-brski/tree/nist_policy_rust_library/packages/nist_policy/tests).
nistVcRestServerAddress: The http address of the running @nqminds/nist_vc_rest_server server