#!/bin/bash
# Script to backup Nextcloud data

echo "[ $(date '+%Y-%m-%d %H:%M:%S') ] Starting Nextcloud scan..."

# Example: Execute docker command to backup Nextcloud
docker exec -u www-data nextcloud-aio-nextcloud php /var/www/html/occ files:scan --all

echo "[ $(date '+%Y-%m-%d %H:%M:%S') ] Nextcloud backup completed"