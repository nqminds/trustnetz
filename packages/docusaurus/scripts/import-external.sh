echo "importing docs.."

cd "docs/build5-docs"

wget "https://raw.githubusercontent.com/nqminds/nist-brski/main/brski-server/README.md" -O "25-BRSKI demonstrator/20-demo-setup.md"


cp "../../../schemas/README.md" "60-CA Demo/10-schemas-setup.md"
cp ../../../schemas/*.png "60-CA Demo/"

cp "../../../nist_policy/README.md" "60-CA Demo/20-nist_policy.md"

cp "../../../nist_vc_rest_server/README.md" "60-CA Demo/30-nist_vc_rest_server.md"
cp ../../../nist_vc_rest_server/*.png "60-CA Demo/"

cp "../../../nist_registrar_server/README.md" "60-CA Demo//40-nist_registrar_server.md"
cp ../../../nist_registrar_server/*.png "60-CA Demo/"