content="Date: $(date), Temp: $(cat /sys/class/thermal/thermal_zone0/temp)"
length=${#content}
echo -e "POST / HTTP/1.1\r\nContent-Length: ${length}\r\n\r\n${content}" |
sudo openssl s_client -provider tpm2 -provider default -CAfile app.crt -cert idevid.crt -key handle:0x81000001 192.168.50.112:4001