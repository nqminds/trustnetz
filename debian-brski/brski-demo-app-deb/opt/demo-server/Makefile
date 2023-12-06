CC=gcc
ARM_CC=aarch64-linux-gnu-gcc
ARM_FLAGS=-L/home/ionut/libmicrohttpd-0.9.77/src/microhttpd/.libs -L/home/ionut/zlib-1.3 -lmicrohttpd -lz -static
X86_64_FLAGS=-lmicrohttpd

all: server_x86_64 server_arm64

server_x86_64:
	$(CC) -o server_x86_64 server.c $(X86_64_FLAGS)

server_arm64:
	$(ARM_CC) -o server_arm64 server.c $(ARM_FLAGS)

clean:
	rm -f $(OBJ) server_x86_64 server_arm64
