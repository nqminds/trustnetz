openssl genrsa -out ca.key 2048
openssl req -x509 -new -nodes -key ca.key -sha256 -days 365 -out ca.crt -subj "/C=UK/ST=Hampshire/L=Southampton/O=ca/OU=ca/CN=ca"

openssl genrsa -out registrar.key 2048
openssl req -new -key registrar.key -out registrar.csr -subj "/C=UK/ST=Hampshire/L=Southampton/O=registrar/OU=registrar/CN=registrar"
echo "subjectAltName=DNS:registrar" > registrar.ext
openssl x509 -req -in registrar.csr -CA ca.crt -CAkey ca.key -out registrar.crt -days 365 -sha256 -extfile registrar.ext
rm registrar.ext

openssl genrsa -out router.key 2048
openssl req -new -key router.key -out router.csr -subj "/C=UK/ST=Hampshire/L=Southampton/O=router/OU=router/CN=router"
echo "subjectAltName=DNS:router" > router.ext
openssl x509 -req -in router.csr -CA ca.crt -CAkey ca.key -out router.crt -days 365 -sha256 -extfile router.ext
rm router.ext
