# EAP config
## EAP-TLS Network Configuration on RaspberryPi 4B using the RT5370 Wireless Adapter


### Install tools
    ```sh 
    sudo apt install dnsmasq
    ```
    ```sh 
    sudo apt install hostapd
    ```

### Edit or add /etc/dnsmasq.conf
   ```sh
    sudo nano /etc/dnsmasq.conf
   ```
   ```bash
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

### Save the new configuration
    ```sh
    sudo dnsmasq -C /etc/dnsmasq.conf
    ```
    
### Configure the wlan interface which will be used to interact with the wifi clients
    ```sh
    sudo nano /usr/local/bin/wlan0staticip.sh
    ```
    add
    ```bash
    ifconfig wlan1 10.0.0.1 netmask 255.255.255.0
    ```
    Make the file executable:
    ```sh
    sudo chmod +x wlan1staticip.sh
    ```

### Create the task to run this script at every reboot
    ```sh
    sudo crontab -e
    ```
    add
    ```bash
    @reboot /usr/local/bin/wlan1staticip.sh
    ```
### Set up the hostapd configuration
    ```sh
    






Implementation based in part on methods as discussed in [Transforming Your Raspberry Pi into a Secure Enterprise Wi-Fi Controller with 802.1x Authentication](https://myitrambles.com/transforming-your-raspberry-pi-into-a-secure-enterprise-wi-fi-controller-with-802-1x-authentication/)