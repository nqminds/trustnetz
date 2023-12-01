# Server Prerequisites


## Install libmicrohttpd
```sh
sudo apt-get install libmicrohttpd-dev
```


## Compile server

```sh
gcc -o server server.c -lmicrohttpd
```

## Run server

```sh
# default port 8082
./server 
```
```sh
# select port
./server -p <port-number>
```

# Web Interface Usage

```
http://localhost:<port-number>
```

### Onboard / Offboard

 - When you click "onboard" button a POST request is sent to `http://localhost:<port-number>/onboard`. If successful the server will run the onboard script, display logs, and status will update to Onboarded on the web page.

 - When you click "offboard" button a POST request is sent to `http://localhost:<port-number>/offboard`. If successful the server will run the offboard script, display logs, and status will update to Offboarded on the web page.
