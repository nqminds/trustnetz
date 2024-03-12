#!/bin/bash

IF0="wlan0"
IF1="wlan1"
IF1_10="wlan1.10"
IF1_20="wlan1.20"
IF1_30="wlan1.30"
IF1_40="wlan1.40"

IP0="192.168.17.1/24"
IP1="192.168.16.1/24"
IP1_10="192.168.30.1/24"
IP1_20="192.168.31.1/24"
IP1_30="192.168.32.1/24"
IP1_40="192.168.33.1/24"

ip addr add $IP0 dev $IF0
ip addr add $IP1 dev $IF1

ip addr add $IP1_10 dev $IF1_10
ip addr add $IP1_20 dev $IF1_20
ip addr add $IP1_30 dev $IF1_30
ip addr add $IP1_40 dev $IF1_40

systemctl start hostapd@$IF0.service
systemctl start hostapd@$IF1.service

systemctl restart dnsmasq@$IF0.service
systemctl restart dnsmasq@$IF1.service

sudo systemctl restart freeradius.service

brski -c /etc/brski/config.ini masa -d &
brski -c /etc/brski/config.ini registrar -d

