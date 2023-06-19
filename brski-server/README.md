# Server node for the NIST BRSKI demo

The server device for the NIST BRSKI demo has the following requirements:
  - Capability for two independent WiFi APs

For the BRSKI demo, we're setting up a Raspberry Pi 4B running Ubuntu 22.04
server edition called `nqm-britannic-brski`. For the two WiFi APs, we're using
two Ralink RT5370 USB adapters.

## Setup

### Configuring APs

On Ubuntu 22.04:

- Install hostapd and dnsmasq with `sudo apt install hostapd dnsmasq`
  - Disable the automatically enabled `dnsmasq.service` with:
    `sudo systemctl disable dnsmasq.service`
- If using the `Ralink Technology, Corp. RT5370 Wireless Adapter`, on Ubuntu,
  you must install the following package to get the binary blobs for the module:
  - `linux-modules-extra-raspi`

#### Configuring static IPs

Ubuntu 22.04 Server uses [netplan](https://netplan.readthedocs.io/en/stable/)
to setup network options.

Since [`netplan` v0.105's `wifis`](https://netplan.readthedocs.io/en/0.105/netplan-yaml.html#properties-for-device-type-wifis)
`access-points.mode` property only supports `ap` if using NetworkManager,
**we cannot use `netplan` to control our HostAP access points.**

However, it's still the easiest way to setup a static IP address for our
AP interfaces.

To do this, make a new file called `/etc/netplan/51-wifi-ap-static-ips.yaml`,
with the contents like:

```yaml
network:
    # only set static IP addresses here
    # The access point we create manually using hostapd
    # The DHCP server we create manually using dnsmasq
    ethernets: # treat these as ethernet devices
      wlx1cbfce699b7f:
        addresses:
          - "192.168.16.1/24"
      wlx1cbfce651dc4:
        addresses:
          - "192.168.17.1/24"
    version: 2
```

Afterwards,

#### Configuring hostapd

For each interface (`%i`), make a file called `/etc/hostapd/%i.conf`:

For the secure AP, `/etc/hostapd/wlx1cbfce651dc4.conf` use:

```
# AP netdevice name (without 'ap' postfix, i.e., wlan0 uses wlan0ap for
# management frames); ath0 for madwifi
interface=%i # replace the interface with the proper interface name

##### IEEE 802.11 related configuration #######################################
# SSID to be used in IEEE 802.11 management frames
ssid2="nqm-britannic-brski"

# Enable IEEE 802.11n 2.4 GHz
hw_mode=g
ieee80211n=1
# Ralink RT5370 supports 40 MHz bandwidth, see datasheet
ht_capab=[SHORT-GI-40][HT40+][HT40-]

# Ralink RT5370 doesn't seem to support ACS, so we need to manually pick channel
channel=11

auth_algs=3
wmm_enabled=1

##### WPA/IEEE 802.11i configuration ##########################################
wpa=2
# wpa_psk=000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f
wpa_passphase=raspiwlan
# WPA-PSK = WPA-Personal / WPA2-Personal
wpa_key_mgmt=WPA-PSK
rsn_pairwise=CCMP
```

For the unsecure/open AP, you can use a config like `/etc/hostapd/wlx1cbfce699b7f.conf`:

```
# AP netdevice name (without 'ap' postfix, i.e., wlan0 uses wlan0ap for
# management frames); ath0 for madwifi
interface=wlx1cbfce699b7f

##### IEEE 802.11 related configuration #######################################
# SSID to be used in IEEE 802.11 management frames
ssid2="nqm-britannic-brski-open"

# Enable IEEE 802.11n 2.4 GHz
hw_mode=g
ieee80211n=1
# Ralink RT5370 supports 40 MHz bandwidth, see datasheet
ht_capab=[SHORT-GI-40][HT40+][HT40-]

channel=6
```

Then, you can start/restart hostapd with:

```bash
systemctl restart hostapd@wlx1cbfce651dc4.service hostapd@wlx1cbfce699b7f.service
```

You can enable hostapd, so that it starts automatically on boot, by using:

```bash
systemctl enable hostapd@wlx1cbfce651dc4.service hostapd@wlx1cbfce699b7f.service
```

#### Configuring dnsmasq

Make two new SYSV init files called `/etc/default/dnsmasq.%i` (replacing `%i` with your instance name).

E.g. `/etc/default/dnsmasq.wlx1cbfce699b7f`:

```
DNSMASQ_EXCEPT="lo"
DNSMASQ_INTERFACE='wlx1cbfce699b7f'
DNSMASQ_OPTS='--bind-interfaces --dhcp-range=192.168.16.100,192.168.16.199,4h'
```

E.g. `/etc/default/dnsmasq.wlx1cbfce651dc4`:

```
DNSMASQ_EXCEPT="lo"
DNSMASQ_INTERFACE='wlx1cbfce651dc4'
DNSMASQ_OPTS='--bind-interfaces --dhcp-range=192.168.17.100,192.168.17.199,4h'
```

Then, you can start/restart the dnsmasq services by doing:

```bash
systemctl restart dnsmasq@wlx1cbfce651dc4.service dnsmasq@wlx1cbfce699b7f.service
```

##### Configuring dnsmasq to only start **after** hostapd

Unfortunately, since hostapd temporarily disables the wifi interface on startup,
we cannot start dnsmasq at the same time as hostpad, we need to start it a few
seconds afterwards.

To do this automatically, we can create a systemd unit override to make
dnsmasq only start after hostapd starts up.

This can easily be done by using the `sudo systemctl edit dnsmasq@.service`
command, and entering in the following:

```
[Unit]
# We can only start dnsmasq after hostapd starts, because starting them both
# at the same time fails
BindsTo=hostapd%i.service
After=hostapd%i.service

[Service]
ExecStartPre=/bin/sleep 5
```

(or manually creating a `/etc/systemd/system/dnsmasq@.service.d/override.conf`)

After we make this override, we can do a `systemctl daemon-reload`, then
enable dnsmasq to start on boot (make sure you enable `hostapd@` too!):

```bash
systemctl enable dnsmasq@wlx1cbfce651dc4.service dnsmasq@wlx1cbfce699b7f.service
```
