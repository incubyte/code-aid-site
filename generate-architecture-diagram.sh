#!/bin/sh

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 OUTPUT_DIR_NAME"
  exit 1
fi

OUTPUT_DIR_NAME="$1"

cp -r /code-aid-site/static/architecture-diagram "/code-aid-site/content/en/docs/Code/$OUTPUT_DIR_NAME" &&
mv "/code-aid-site/content/en/docs/Code/$OUTPUT_DIR_NAME/d3-diagram.json" "/code-aid-site/content/en/docs/Code/$OUTPUT_DIR_NAME/architecture-diagram" &&
rm -rf "/code-aid-site/content/en/docs/Code/$OUTPUT_DIR_NAME/architecture-diagram/_index.md"