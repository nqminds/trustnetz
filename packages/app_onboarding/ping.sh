while echo -e "POST / HTTP/1.1\r\nContent-Length: 47\r\n\r\nDate: $(date), Temp: $(cat /sys/class/thermal/thermal_zone0/temp)" | sudo openssl s_client -provider tpm2 -provider default -CAfile app.crt -cert idevid.crt -key handle:0x81000001 89.21.226.142:7001;
  do sleep 60;
done