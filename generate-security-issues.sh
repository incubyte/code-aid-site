#!/bin/sh

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 OUTPUT_DIR_NAME"
  exit 1
fi

OUTPUT_DIR_NAME="$1"

mkdir -p /code-aid-site/content/en/docs/Code/${OUTPUT_DIR_NAME}/security-issues &&
cp /code-aid-site/static/security-issues/dist/* /code-aid-site/content/en/docs/Code/${OUTPUT_DIR_NAME}/security-issues &&
cp /security-issues/* /code-aid-site/content/en/docs/Code/${OUTPUT_DIR_NAME}/security-issues &&
rm -rf /code-aid-site/content/en/docs/Code/${OUTPUT_DIR_NAME}/security-issues/_index.md