openssl req -x509 -sha256 -nodes -days 365 -subj "/CN=MPR" -newkey ec:<(openssl ecparam -name prime256v1) -keyout mpr.key -out mpr.crt -addext "subjectAltName=IP:192.168.50.112"