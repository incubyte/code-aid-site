FROM node:18

RUN apt update -y
RUN apt upgrade -y
RUN rm -rf /usr/local/go && wget https://go.dev/dl/go1.21.0.linux-amd64.tar.gz && tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz
RUN export PATH=$PATH:/usr/local/go/bin
RUN apt install git -y
RUN wget https://github.com/gohugoio/hugo/releases/download/v0.118.2/hugo_extended_0.118.2_Linux-64bit.tar.gz && tar -xzf hugo_extended_0.118.2_Linux-64bit.tar.gz && mv hugo /usr/local/bin/hugo

ENV GOPATH /go
ENV PATH $GOPATH/bin:/usr/local/go/bin:$PATH

WORKDIR /code-aid-site

COPY . .