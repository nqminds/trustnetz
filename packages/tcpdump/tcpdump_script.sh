#!/bin/bash
sudo tcpdump -nltt --interface wlan1 | while IFS= read -r line; do echo "$(date +'%Y-%m-%dT%H:%M:%S') $line"; done >> log.txt
