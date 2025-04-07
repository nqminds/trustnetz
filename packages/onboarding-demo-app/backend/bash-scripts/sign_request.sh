#!/bin/bash
IP="$1"
PORT="$2"
CERTS_PATH="$3"
REGISTRAR_REST_URL_SIMPLE="/.well-known/est/simpleenroll"
IDEVIDCRT="/etc/brski/idevid.crt"
TPMKEY="handle:0x81000001"
PROVIDER_TPM="tpm2"
PROVIDER_DEF="default"
EAP_TLS_CLIENT_CERT="$CERTS_PATH/eap-tls-client.crt"
EAP_TLS_CLIENT_KEY="$CERTS_PATH/eap-tls-client.key"


generate_serial_number() {
    local length=$1
    echo $(openssl rand -hex $((length/2)))
}

function gen_long(){
  low32=$(od -An -tu4 -N4 < /dev/urandom)
  high32=$(od -An -tu4 -N4 < /dev/urandom)
  long=$(($low32 + ($high32 << 32) ))
  echo $low32
}

SERIAL_NUMBER=$(generate_serial_number 16)

openssl ecparam -genkey -name prime256v1 -out $EAP_TLS_CLIENT_KEY

openssl req -x509 -sha256 -nodes -days 365 \
    -subj "/C=IE/CN=ldevid-cert/serialNumber=${SERIAL_NUMBER}" \
    -key $CERTS_PATH/eap-tls-client.key \
    -out $CERTS_PATH/eap-tls-req-client.crt -addext basicConstraints=CA:false -set_serial $(gen_long)

CSR="$CERTS_PATH/eap-tls-req-client.crt"
BASE64_DER=$(sudo openssl x509 -in "${CSR}" -outform DER | base64 | tr -d '\n')

HTTP_REQUEST="POST ${REGISTRAR_REST_URL_SIMPLE} HTTP/1.1\r\nHost: ${IP}\r\nContent-Type: application/voucher-cms+json\r\nContent-Length: ${#BASE64_DER}\r\n\r\n${BASE64_DER}"

# returns signed certificate
CERTIFICATE=`echo -e "$HTTP_REQUEST" | openssl s_client -provider $PROVIDER_TPM -provider $PROVIDER_DEF -key $TPMKEY -cert $IDEVIDCRT -quiet -connect 192.168.17.1:12345 -tls1_3 2>/dev/null | sed -n '/^$/{g;D;}; N; $p;' | sed -r '/^\s*$/d'`

{
    echo "-----BEGIN CERTIFICATE-----"
    echo "$CERTIFICATE" | fold -w 64
    echo "-----END CERTIFICATE-----"
} > "${CERTS_PATH}/eap-tls-client.crt"

rm -f $EAP_TLS_CLIENT_CERT