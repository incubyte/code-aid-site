#!/bin/sh

set -e

host="$1"
shift
port="$1"
shift
username="$1"
shift
password="$1"
shift
cmd="$@"

counter=0
until [ $(curl -u "${username}:${password}" -o /dev/null --silent --head --write-out '%{http_code}\n' "http://${host}:${port}/_api/version") -eq 200 ]; do
  counter=$((counter+1))
  >&2 echo "ArangoDB is unavailable - sleeping"
  sleep 3

  if [ $counter -gt 10 ]; then
    >&2 echo "Timeout waiting for ArangoDB to become available"
    exit 1
  fi
done

>&2 echo "ArangoDB is up - executing command"
exec $cmd
