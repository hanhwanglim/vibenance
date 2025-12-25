#!/bin/sh
set -e

echo "Running database migrations..."

cd /app/packages/db

bun x -y drizzle-kit push || {
  echo "Warning: Failed to push schema. This might be normal if the database is already up to date."
}

echo "Starting server..."
cd /app
exec "$@"
