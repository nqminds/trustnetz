#!/bin/bash

apt install hostapd dnsmasq iptables

service hostapd stop
service dnsmasq stop

systemctl stop wpa_supplicant
systemctl disable wpa_supplicant

systemctl disable hostapd@wlan0.service 
systemctl disable hostapd@wlan1.service 

cp wlan0.conf /etc/hostapd/wlan0.conf
cp wlan1.conf /etc/hostapd/wlan1.conf

cp dnsmasq.wlan0 /etc/default
cp dnsmasq.wlan1 /etc/default

sudo systemctl disable dnsmasq@wlan0.service
sudo systemctl disable dnsmasq@wlan1.service


