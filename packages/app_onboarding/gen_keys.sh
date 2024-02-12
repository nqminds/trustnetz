openssl genrsa -out ca.key 2048
openssl req -x509 -new -nodes -key ca.key -sha256 -days 365 -out ca.crt -subj "/CN=CA"

openssl genrsa -out manufacturer.key 2048
openssl req -x509 -new -nodes -key manufacturer.key -sha256 -days 365 -out manufacturer.crt -subj "/CN=Manufacturer"

openssl genrsa -out app.key 2048
openssl req -new -key app.key -out app.csr -subj "/CN=Application"
openssl x509 -req -in app.csr -CA ca.crt -CAkey ca.key -out app.crt -days 365 -sha256 -extfile <(echo "subjectAltName=IP:127.0.0.1")

openssl genrsa -out client.key 2048
openssl req -new -key client.key -out client.csr -subj "/CN=Client"
openssl x509 -req -in client.csr -CA manufacturer.crt -CAkey manufacturer.key -out idevid.crt -days 365 -sha256 -extfile <(echo "subjectAltName=IP:127.0.0.1")