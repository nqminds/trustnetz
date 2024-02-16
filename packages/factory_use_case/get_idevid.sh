openssl genrsa -out client.key 2048
openssl req -new -key client.key -subj '/CN=client' | curl --cacert mcr.crt https://89.21.226.142:7000 --data-binary @- > idevid.crt