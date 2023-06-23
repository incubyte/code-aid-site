# Use Alpine Linux as the base image
FROM alpine:latest

# Install required dependencies
RUN apk add --no-cache \
  curl \
  git

# Install Go
RUN apk add --no-cache go

# Set the Go environment variables
ENV GOPATH /go
ENV PATH $GOPATH/bin:/usr/local/go/bin:$PATH

# Install Hugo binary
RUN curl -L -o /tmp/hugo.tar.gz https://github.com/gohugoio/hugo/releases/download/v0.114.0/hugo_0.114.0_Linux-64bit.tar.gz && \
  tar -xf /tmp/hugo.tar.gz -C /tmp && \
  mv /tmp/hugo /usr/local/bin/hugo && \
  rm -rf /tmp/hugo.tar.gz

# Set the working directory inside the container
WORKDIR /app

# Copy the contents of your local Hugo project into the container
COPY . .

# Start the Hugo server when the container is run
CMD ["hugo", "server", "--bind=0.0.0.0"]