#!/bin/bash

apt install hostapd dnsmasq iptables

service hostapd stop
service dnsmasq stop

systemctl stop wpa_supplicant
systemctl disable wpa_supplicant

cp wlan0.conf /etc/hostapd/wlan0.conf
systemctl enable hostapd@wlan0.service 
systemctl start hostapd@wlan0.service

cp wlan1.conf /etc/hostapd/wlan1.conf
systemctl enable hostapd@wlan1.service 
systemctl start hostapd@wlan1.service

