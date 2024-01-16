#!/bin/bash

IF0="wlan0"
IF1="wlan1"

IP0="192.168.17.1/24"
IP1="192.168.16.1/24"

ip addr add $IP0 dev $IF0
ip addr add $IP1 dev $IF1

systemctl start hostapd@$IF0.service
systemctl start hostapd@$IF1.service

systemctl restart dnsmasq@$IF0.service
systemctl restart dnsmasq@$IF1.service

brski -c /etc/brski/config.ini masa -d &
brski -c /etc/brski/config.ini registrar -d

