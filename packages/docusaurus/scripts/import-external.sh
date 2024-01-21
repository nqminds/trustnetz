echo "importing docs.."

cd "docs/build5-docs"

wget "https://raw.githubusercontent.com/nqminds/nist-brski/main/brski-server/README.md" -O "130-demo-setup2.md"


cp "../../../schemas/README.md" "180-continuous assurance/10-schemas-setup.md"
cp ../../../schemas/*.png "180-continuous assurance/"


cp "../../../nist_policy/README.md" "180-continuous assurance/20-nist_policy.md"

cp "../../../nist_vc_rest_server/README.md" "180-continuous assurance/30-nist_vc_rest_server.md"
cp ../../../nist_vc_rest_server/*.png "180-continuous assurance/"

cp "../../../nist_registrar_server/README.md" "180-continuous assurance/40-nist_registrar_server.md"
cp ../../../nist_registrar_server/*.png "180-continuous assurance/"