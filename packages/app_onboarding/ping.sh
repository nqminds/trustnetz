#while curl --cert idevid.crt --key client.key --cacert ca.crt https://127.0.0.1:6789 -d <<< echo "Date: $(date), Temp: $(cat /sys/class/thermal/thermal_zone0/temp)";
#  do sleep 60;
#done

sudo openssl s_client -provider default -CAfile app.crt -cert idevid.crt -provider tpm2 -key handle:0x81000001 89.21.226.142:7001