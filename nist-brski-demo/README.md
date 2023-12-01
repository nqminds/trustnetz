# Server Prerequisites


## Install libmicrohttpd
```sh
sudo apt-get install libmicrohttpd-dev
```


## Compile server for x86 dynamically linked

```sh
gcc -o server server.c -lmicrohttpd
```

## Compile server for x86 statically linked
```sh
gcc -o server_x64 server.c -lmicrohttpd -lgnutls -lgcrypt -lgpg-error -static
```
## Compile server for ARM64 statically linked (x86-64 Ubuntu):
```sh
# For x64
sudo apt-get install build-essential

# For ARM64
sudo apt-get install gcc-aarch64-linux-gnu g++-aarch64-linux-gnu

```
### Download and extract latest  libmicrohttpd
```sh
wget https://ftp.gnu.org/gnu/libmicrohttpd/libmicrohttpd-latest.tar.gz
tar -xzf libmicrohttpd-latest.tar.gz
```
### Download and extract latest zlib
```sh
wget https://zlib.net/zlib-1.3.tar.gz  
tar -xzf zlib-1.3.tar.gz 
```
### Configure zlib for ARM64
```sh
cd zlib-*
make clean  # Clean the previous build attempts

CC=aarch64-linux-gnu-gcc ./configure --static
make
```

### Configure libmicrohttpd for ARM64

```sh
cd libmicrohttpd-*
make clean  # Clean the previous build attempts

# set the flags to use the ARM64 compiled zlib
LDFLAGS="-L/home/<user>/zlib-1.3" CPPFLAGS="-I/home/<user>/zlib-1.3" ./configure --host=aarch64-linux-gnu --disable-shared --enable-static
make
```
### Compile server for ARM64 -static

```sh
aarch64-linux-gnu-gcc -o server_arm64 server.c -L/home/<user>/libmicrohttpd-0.9.77/src/microhttpd/.libs -L/home/<user>/zlib-1.3 -lmicrohttpd -lz -static

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
