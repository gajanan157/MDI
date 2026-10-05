#!/bin/sh

echo "Generating runtime environment configuration..."

ENV_FILE="/usr/share/nginx/html/env.js"

echo "window.__ENV__ = {" > $ENV_FILE

# Automatically inject all VITE_* environment variables
printenv | grep '^VITE_' | while IFS='=' read -r key value
do
  echo "  $key: \"$value\"," >> $ENV_FILE
done

echo "};" >> $ENV_FILE

echo "Runtime configuration injected successfully."

exec "$@"
