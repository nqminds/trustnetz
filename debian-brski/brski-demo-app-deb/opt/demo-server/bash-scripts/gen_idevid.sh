MPR="/etc/brski/mpr.crt"

MPR_CERT="-----BEGIN CERTIFICATE-----
MIIBgTCCASigAwIBAgIUIqTC/5LC5gBQ5kRte07WOQXkYLAwCgYIKoZIzj0EAwIw
DjEMMAoGA1UEAwwDTVBSMB4XDTI0MDIyOTE1NTAzM1oXDTI1MDIyODE1NTAzM1ow
DjEMMAoGA1UEAwwDTVBSMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEdbr42C10
SZtpt/XyWEx+u3r5iFGOxOAJDkXjfowIEQPb8ZyD6wpm2JPcZInkfLF2vZfQKEbi
WdrOSgyRMdO/waNkMGIwHQYDVR0OBBYEFGJgZUnwP0/H4vrunyAjXkekFNTgMB8G
A1UdIwQYMBaAFGJgZUnwP0/H4vrunyAjXkekFNTgMA8GA1UdEwEB/wQFMAMBAf8w
DwYDVR0RBAgwBocEWRXijjAKBggqhkjOPQQDAgNHADBEAiBqmn0HpyzAxHLW/1we
wtuVAc+0vYeNQJ6qUakihkccVgIgUw81fVl95xs5KQsbQKMAWUmRIGsnmcwJe7+Q
nTqDJdQ=
-----END CERTIFICATE-----"

echo "$MPR_CERT" > "$MPR"
file /etc/brski/mpr.crt

openssl req -new -provider tpm2 -key handle:0x81000001 \
  -subj "/C=IE/CN=Cient/serialNumber=idev-serial12345" \
  | curl --cacert /etc/brski/mpr.crt https://89.21.226.142:4000 \
  --data-binary @- > /etc/brski/idevid.crt

