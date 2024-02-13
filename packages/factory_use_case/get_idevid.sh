openssl genrsa -out client.key 2048
openssl req -new -key client.key -subj '/CN=client' | curl --cacert mcr.crt https://127.0.0.1:7000 --data-binary @- > idevid.crt