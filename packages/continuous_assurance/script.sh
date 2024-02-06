openssl genrsa -out ca.key 2048
openssl req -x509 -new -nodes -key ca.key -sha256 -days 365 -out ca.crt -subj "/C=UK/ST=Hampshire/L=Southampton/O=ca/OU=ca/CN=ca"

openssl genrsa -out registrar.key 2048
openssl req -new -key registrar.key -out registrar.csr -subj "/C=UK/ST=Hampshire/L=Southampton/O=registrar/OU=registrar/CN=registrar"
openssl x509 -req -in registrar.csr -CA ca.crt -CAkey ca.key -out registrar.crt -days 365 -sha256 -extfile <(echo "subjectAltName=DNS:registrar")

openssl genrsa -out router1.key 2048
openssl req -new -key router1.key -out router1.csr -subj "/C=UK/ST=Hampshire/L=Southampton/O=router/OU=router/CN=router"
openssl x509 -req -in router1.csr -CA ca.crt -CAkey ca.key -out router1.crt -days 365 -sha256 -extfile <(echo "subjectAltName=DNS:router")

openssl genrsa -out router2.key 2048
openssl req -new -key router2.key -out router2.csr -subj "/C=UK/ST=Hampshire/L=Southampton/O=router/OU=router/CN=router"
openssl x509 -req -in router2.csr -CA ca.crt -CAkey ca.key -out router2.crt -days 365 -sha256 -extfile <(echo "subjectAltName=DNS:router")

openssl genrsa -out router3.key 2048
openssl req -new -key router3.key -out router3.csr -subj "/C=UK/ST=Hampshire/L=Southampton/O=router/OU=router/CN=router"
openssl x509 -req -in router3.csr -CA ca.crt -CAkey ca.key -out router3.crt -days 365 -sha256 -extfile <(echo "subjectAltName=DNS:router")