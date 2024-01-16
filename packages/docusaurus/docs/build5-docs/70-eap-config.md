# EAP config
EAP-TLS Network Configuration on RaspberryPi 4B using the RT5370 Wireless Adapter


1. Install tools:
    ```sudo apt install dnsmasq```
    ```sudo apt install hostapd```

2. Edit or add /etc/dnsmasq.conf:
   ``` 
    # Set the Wireless interface
	interface=wlan1
	
	# Set DHCP IP pool range
	dhcp-range=10.0.0.10,10.0.0.20,255.255.255.0,24h

	# Set the gateway IP address
	# dhcp-option=3,192.168.1.1
	dhcp-option=3,10.0.0.1
	
	# Set DNS server address
	dhcp-option=6,172.31.191.225
	
	# Disable DNS server capability
	port=0
    ```
3. Save the new configuration:
    ```sudo dnsmasq -C /etc/dnsmasq.conf```
    
4. Configure the wlan interface which will be used to interact with the wifi clients:
    sudo nano /usr/local/bin/wlan0staticip.sh

Implementation based in part on methods as discussed in [Transforming Your Raspberry Pi into a Secure Enterprise Wi-Fi Controller with 802.1x Authentication](https://myitrambles.com/transforming-your-raspberry-pi-into-a-secure-enterprise-wi-fi-controller-with-802-1x-authentication/)