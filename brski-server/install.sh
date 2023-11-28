#!/bin/bash

apt install hostapd dnsmasq iptables

service hostapd stop
service dnsmasq stop

systemctl stop wpa_supplicant
systemctl disable wpa_supplicant

