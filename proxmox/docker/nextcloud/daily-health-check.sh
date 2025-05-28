#!/bin/bash
# Script to check Nextcloud health

echo "[ $(date '+%Y-%m-%d %H:%M:%S') ] Running Nextcloud health check..."

# Example: Check if container is running and database is accessible
if docker exec nextcloud-aio-nextcloud php /var/www/html/occ status | grep -q "installed: true"; then
  echo "[ $(date '+%Y-%m-%d %H:%M:%S') ] Nextcloud is healthy"
else
  echo "[ $(date '+%Y-%m-%d %H:%M:%S') ] WARNING: Nextcloud may have issues"
fi