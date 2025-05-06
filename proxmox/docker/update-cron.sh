#!/bin/bash
# Script to deploy the cron configuration to system

CRON_SRC="/home/shawn/homelab/proxmox/docker/docker-apps-cron"
CRON_DST="/etc/cron.d/docker-apps"

# Copy and set permissions
sudo cp "$CRON_SRC" "$CRON_DST"
sudo chmod 644 "$CRON_DST"
sudo chown root:root "$CRON_DST"

echo "✅ Deployed cron file to $CRON_DST"