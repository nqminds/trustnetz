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
./server
```

# Web Interface Usage

can change the port if needed
```
http://localhost:8081
```

### Onboard / Offboard

 - When you click "onboard" button a POST request is sent to `http://localhost:8081/onboard`. If succesful the server will run the onboard script, and status will update to Onboarded on the web page.

 - When you click "offboard" button a POST request is sent to `http://localhost:8081/offboard`. If succesful the server will run the offboard script, and status will update to Offboarded on the web page.

 - After onboarding/offboarding click buttun will hide/show logs. 