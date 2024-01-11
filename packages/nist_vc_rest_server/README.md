# NIST VC (Verifiable Credential) REST Server

Provides a REST API server with route to sign data matching schemas in @nqminds/nist-brski-schemas and return a VC and a route to verify a VC and return the data contained within it. No authentication has been added to the Rest API as it is intended to be used only locally and not exposed to external traffic.

After the @nqminds/nist-brski-schemas schemas have been instantiated on a volt running on the registrar a Rest API Instance can be started on the registrar which may be used to verify VCs received by the registrar.

A user / process that wishes to communicate information to the registrar must sign into the volt running on the registrar and export their config for the volt. They can then run an instance on the Rest API on their local machine and sign the data they wish to communicate as a VC which can then be communicated to the registrar. At present, only the config of the user who is the owner of the schemas may be used with the Rest API to sign and verify VCs.
