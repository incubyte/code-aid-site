#!/bin/sh

set -e

file_path="$1"

sleep 5

# until file path not exist
until [ -f "$file_path" ]; do
  counter=$((counter+1))
  >&2 echo "Code Aid output is unavailable - sleeping"
  sleep 5
done

>&2 echo "Code Aid output is generated - executing command"

