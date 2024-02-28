#!/bin/bash
IP="$1"
PORT="$2"
CERTS_PATH="$3"
BRSKI="brski"
CONFIG="/etc/brski/config.ini"
REGISTRAR_TLS_PATH="/tmp/registrar_tls.crt"
REGISTRAR_REST_URL="/.well-known/brski/requestvoucher"
IDEVIDCRT="$CERTS_PATH/idevid.crt"
IDEVIDKEY="$CERTS_PATH/idevid.key"

VOUCHER_REQUEST=`${BRSKI} -c ${CONFIG} epvr`

HTTP_REQUEST="POST ${REGISTRAR_REST_URL} HTTP/1.1\r\nHost: ${IP}\r\nContent-Type: application/voucher-cms+json\r\nContent-Length: ${#VOUCHER_REQUEST}\r\n\r\n${VOUCHER_REQUEST}"

openssl s_client -connect ${IP}:${PORT} -tls1_3 -showcerts 2>/dev/null | sed -n '/-----BEGIN CERTIFICATE-----/,/-----END CERTIFICATE-----/p' > ${REGISTRAR_TLS_PATH}

MASA_PVOUCHER_CMS=`echo -e "$HTTP_REQUEST" | openssl s_client -quiet -connect ${IP}:${PORT} -cert $IDEVIDCRT -key $IDEVIDKEY -tls1_3 2>/dev/null | sed -n '/^$/{g;D;}; N; $p;' | sed -r '/^\s*$/d'`

PINNED_CERTIFICATE=$(echo "$MASA_PVOUCHER_CMS" | brski -c "${CONFIG}" -i "${REGISTRAR_TLS_PATH}" vmasa)

{
    echo "-----BEGIN CERTIFICATE-----"
    echo "$PINNED_CERTIFICATE" | fold -w 64
    echo "-----END CERTIFICATE-----"
} > "${CERTS_PATH}/pinned-domain-ca.crt"
