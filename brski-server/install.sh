#!/bin/bash

apt install hostapd dnsmasq iptables

/usr/share/doc/hostapd/README.Debian

service hostapd stop
service dnsmasq stop
