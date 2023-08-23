FROM alpine:latest

RUN apk update && \
    apk add go hugo git

ENV GOPATH /go
ENV PATH $GOPATH/bin:/usr/local/go/bin:$PATH

WORKDIR /code-aid-site

COPY . .

CMD ["hugo", "server", "--bind", "0.0.0.0"]