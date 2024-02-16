openssl genrsa -out app.key 2048
openssl req -x509 -new -nodes -key app.key -sha256 -days 365 -out app.crt -subj "/CN=Application" -addext "subjectAltName=IP:89.21.226.142"