echo "importing docs.."

cd "docs/build5-docs"

wget "https://raw.githubusercontent.com/nqminds/nist-brski/main/brski-server/README.md" -O "25-BRSKI demonstrator/20-demo-setup.md"


cp "../../../schemas/README.md" "60-CA Demo/30-schemas-setup.md"
cp ../../../schemas/*.png "60-CA Demo/"

cp "../../../nist_policy/README.md" "60-CA Demo/40-nist_policy.md"

cp "../../../nist_vc_rest_server/README.md" "60-CA Demo/50-nist_vc_rest_server.md"
cp ../../../nist_vc_rest_server/*.png "60-CA Demo/"

cp "../../../nist_registrar_server/README.md" "60-CA Demo/60-nist_registrar_server.md"
cp ../../../nist_registrar_server/*.png "60-CA Demo/"



wget "https://raw.githubusercontent.com/nqminds/brski/main/README.md" -O "40-BRSKI developer/10-BRSKI build instructions.md"


wget "https://raw.githubusercontent.com/nqminds/brski/main/docs/voucher.md" -O "40-BRSKI developer/docs/voucher.md"
wget "https://raw.githubusercontent.com/nqminds/brski/main/docs/brski.md" -O "40-BRSKI developer/docs/brski.md"
wget "https://raw.githubusercontent.com/nqminds/brski/main/docs/usage.md" -O "40-BRSKI developer/docs/usage.md"
wget "https://raw.githubusercontent.com/nqminds/brski/main/docs/array.md" -O "40-BRSKI developer/docs/array.md"
