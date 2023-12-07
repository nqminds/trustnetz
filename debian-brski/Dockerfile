FROM ubuntu:latest

# Install cross-compilation and other necessary tools
RUN apt-get update && apt-get install -y \
    gcc-aarch64-linux-gnu \
    g++-aarch64-linux-gnu \
    make \
    libmicrohttpd-dev \
    curl
    
# Installing Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs

# Create directories and copy the local pre-compiled libraries
RUN mkdir /libmicrohttpd /zlib
COPY libs/libmicrohttpd-0.9.77 /libmicrohttpd
COPY libs/zlib-1.3 /zlib

# Set the environment variables
ENV LDFLAGS="-L/libmicrohttpd/src/microhttpd/.libs -L/zlib"
ENV CPPFLAGS="-I/zlib-1.3"

# Set the working directory in the container
WORKDIR /usr/src/brski-demo-app