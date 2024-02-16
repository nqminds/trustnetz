openssl genrsa -out mcr.key 2048
openssl req -x509 -new -nodes -key mcr.key -sha256 -days 365 -out mcr.crt -subj "/CN=89.21.226.142"