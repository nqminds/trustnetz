BRSKI="/home/alexandru/projects/brski/build/linux/src/brski/brski"
CONFIG="/home/alexandru/projects/brski/build/linux/tests/brski/test-config.ini"
REGISTRAR_TLS_PATH="/tmp/registrar_tls.crt"
REGISTRAR_ADDRESS="127.0.0.1"
REGISTRAR_PORT="12345"

VOUCHER_REQUEST=`${BRSKI} -c ${CONFIG} epvr`

HTTP_REQUEST="POST /.well-known/brski/requestvoucher HTTP/1.1\r\nHost: ${REGISTRAR_ADDRESS}\r\nContent-Type: application/voucher-cms+json\r\nContent-Length: ${#VOUCHER_REQUEST}\r\n\r\n${VOUCHER_REQUEST}"

openssl s_client -connect ${REGISTRAR_ADDRESS}:${REGISTRAR_PORT} -tls1_3 -showcerts 2>/dev/null | sed -n '/-----BEGIN CERTIFICATE-----/,/-----END CERTIFICATE-----/p' > ${REGISTRAR_TLS_PATH}

MASA_PVOUCHER_CMS=`echo -e "$HTTP_REQUEST" | openssl s_client -quiet -connect 127.0.0.1:12345 -cert idevid.crt -key idevid.key -tls1_3 2>/dev/null | sed -n '/^$/{g;D;}; N; $p;' | sed -r '/^\s*$/d'`

echo $MASA_PVOUCHER_CMS | ${BRSKI} -c ${CONFIG} -i ${REGISTRAR_TLS_PATH} vmasa

