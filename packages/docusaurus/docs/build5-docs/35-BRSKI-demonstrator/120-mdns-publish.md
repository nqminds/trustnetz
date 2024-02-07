# MDNS publishing services



In order for the pledge to find the registrar, we make use of MDNS capabilities.

(We also reuse this method to establish the router-registrar connection needed for the continuous assurance piece).

This process can of course be built in 

To practically achieve this we can build it into the core implementation. For convenience we simply make use of the freely available 

## Define new service type

We need to create a new service type on the service (registrar in this instance )

```xml
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
 <name replace-wildcards="yes">BRSKI on %h</name>
  <service>
   <type>_brski._tcp</type>
   <port>8050</port>
  </service>
</service-group>
```

This needs to be installed in the avahi service directory `/etc/avahi/services`

## Restart avahi

Daemon needs to be restarted

```bash
sudo service avahi-daemon restart


```

Remember this needs to be called as a background process, ideally at the point the service is created 

## Advertise

```bash
avahi-publish -s brski-registrar _brski._tcp 8050 
```

On the avahi server we need to advertise our new service

## Discover (remote)

On the remote device we need to resolve the service name

```bash
avahi-browse -r _brski._tcp
```

This will produce a list of advertised services that we can then parse 