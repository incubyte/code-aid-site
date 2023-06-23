FROM code-aid:latest AS codeaid
FROM code-aid-db:latest AS codeaiddb

FROM node:18

#code aid
ENV INPUT_DIR /input
ENV OUTPUT_DIR /code-aid-parser-output

COPY --from=codeaid /code-aid-parser ./code-aid-parser
COPY --from=codeaid /code-aid ./code-aid
WORKDIR /code-aid-parser

WORKDIR /code-aid
RUN apt-get update && \
    apt-get install -y openjdk-17-jdk

#code aid db
WORKDIR /
COPY --from=codeaiddb /code-aid-db ./code-aid-db

#code aid site

# Install Go
RUN apt-get install -y golang

# Set the Go environment variables
ENV GOPATH /go
ENV PATH $GOPATH/bin:/usr/local/go/bin:$PATH

# Install Hugo binary
RUN curl -L -o /tmp/hugo.tar.gz https://github.com/gohugoio/hugo/releases/download/v0.114.0/hugo_0.114.0_Linux-64bit.tar.gz && \
  tar -xf /tmp/hugo.tar.gz -C /tmp && \
  mv /tmp/hugo /usr/local/bin/hugo && \
  rm -rf /tmp/hugo.tar.gz

# Set the working directory inside the container
WORKDIR /code-aid-site

# Copy the contents of your local Hugo project into the container
COPY . .
