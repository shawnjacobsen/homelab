<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# Cron Job Management System for Docker Applications

This document describes how to manage scheduled tasks (cron jobs) for all your Docker-based applications in a centralized, version-controlled way.

## Path Reference

Throughout this document, the following path references are used:

- `<HOMELAB_PATH>` - The absolute path to your homelab directory (e.g., `/home/shawn/homelab`)
- `<DOCKER_DIR>` - The Docker applications directory: `<HOMELAB_PATH>/docker`

Example: If your homelab is at `/home/shawn/homelab`, then `<DOCKER_DIR>` would be `/home/shawn/homelab/docker`.

---

## Tutorial: Setup Guide

### Prerequisites

- Ubuntu host with Docker and cron installed
- Directory at `<DOCKER_DIR>` that contains your Docker application configurations
- Sudo access to copy files into `/etc/cron.d`


### 1. Directory Layout

```plaintext
<DOCKER_DIR>/
├── nextcloud/
│   ├── backup.sh
│   ├── health.sh
│   └── logs/
├── application-2/
│   ├── task.sh
│   └── logs/
├── docker-apps-cron
└── update-cron.sh
```


### 2. Create Application Scripts

#### Example: Nextcloud

1. **Create script directories and logs folder**

```bash
mkdir -p <DOCKER_DIR>/nextcloud/logs
```

2. **Backup script**
File: `<DOCKER_DIR>/nextcloud/backup.sh`

```bash
#!/bin/bash
# Script to backup Nextcloud data

echo "[ $(date '+%Y-%m-%d %H:%M:%S') ] Starting Nextcloud backup..."

# Example: Execute docker command to backup Nextcloud
docker exec -u www-data nextcloud-aio-nextcloud php occ maintenance:mode --on
# More backup commands would go here
docker exec -u www-data nextcloud-aio-nextcloud php occ maintenance:mode --off

echo "[ $(date '+%Y-%m-%d %H:%M:%S') ] Nextcloud backup completed"
```

3. **Health check script**
File: `<DOCKER_DIR>/nextcloud/health.sh`

```bash
#!/bin/bash
# Script to check Nextcloud health

echo "[ $(date '+%Y-%m-%d %H:%M:%S') ] Running Nextcloud health check..."

# Example: Check if container is running and database is accessible
if docker exec nextcloud-aio-nextcloud php occ status | grep -q "installed: true"; then
  echo "[ $(date '+%Y-%m-%d %H:%M:%S') ] Nextcloud is healthy"
else
  echo "[ $(date '+%Y-%m-%d %H:%M:%S') ] WARNING: Nextcloud may have issues"
fi
```

4. Make them executable:

```bash
chmod +x <DOCKER_DIR>/nextcloud/{backup.sh,health.sh}
```


#### Example: Application-2

1. **Create script directory and logs folder**

```bash
mkdir -p <DOCKER_DIR>/application-2/logs
```

2. **Task script**
File: `<DOCKER_DIR>/application-2/task.sh`

```bash
#!/bin/bash
# Script to perform routine tasks for Application-2

echo "[ $(date '+%Y-%m-%d %H:%M:%S') ] Running Application-2 maintenance task..."

# Example: Execute docker command for Application-2
docker exec application-2-container ./maintenance-task.sh

echo "[ $(date '+%Y-%m-%d %H:%M:%S') ] Application-2 task completed"
```

3. Make it executable:

```bash
chmod +x <DOCKER_DIR>/application-2/task.sh
```


### 3. Configure Log Rotation

Create a log rotation configuration to prevent log files from consuming too much disk space:

File: `<DOCKER_DIR>/docker-apps-logrotate`

```
<DOCKER_DIR>/*/logs/*.log {
    weekly
    rotate 4
    compress
    missingok
    notifempty
    create 0644 root root
}
```

Deploy this configuration:

```bash
sudo cp <DOCKER_DIR>/docker-apps-logrotate /etc/logrotate.d/docker-apps
sudo chmod 644 /etc/logrotate.d/docker-apps
```


### 4. Create Combined Cron File

File: `<DOCKER_DIR>/docker-apps-cron`

```
# Environment for all jobs
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# Nextcloud backup (daily at 1 AM)
0 1 * * * root /bin/bash <DOCKER_DIR>/nextcloud/backup.sh \
    >> <DOCKER_DIR>/nextcloud/logs/backup.log 2>&1

# Nextcloud health check (daily at 3 AM)
0 3 * * * root /bin/bash <DOCKER_DIR>/nextcloud/health.sh \
    >> <DOCKER_DIR>/nextcloud/logs/health.log 2>&1

# Application-2 task (every 6 hours)
0 */6 * * * root /bin/bash <DOCKER_DIR>/application-2/task.sh \
    >> <DOCKER_DIR>/application-2/logs/task.log 2>&1
```


### 5. Create Deployment Script

File: `<DOCKER_DIR>/update-cron.sh`

```bash
#!/bin/bash
# Script to deploy the cron configuration to system

CRON_SRC="<DOCKER_DIR>/docker-apps-cron"
CRON_DST="/etc/cron.d/docker-apps"

# Copy and set permissions
sudo cp "$CRON_SRC" "$CRON_DST"
sudo chmod 644 "$CRON_DST"
sudo chown root:root "$CRON_DST"

echo "✅ Deployed cron file to $CRON_DST"
```

Make it executable:

```bash
chmod +x <DOCKER_DIR>/update-cron.sh
```


### 6. Deploy Cron File

Whenever you update `docker-apps-cron`:

```bash
<DOCKER_DIR>/update-cron.sh
```

Cron will automatically pick up `/etc/cron.d/docker-apps`-no need to reload cron manually.

### 7. Verify Cron Jobs \& Logs

- Check job list:

```bash
sudo grep CRON /var/log/syslog
grep docker-apps /etc/cron.d/docker-apps
```

- Inspect logs under each app's `logs/` directory:

```bash
tail -f <DOCKER_DIR>/nextcloud/logs/backup.log
```


---

## SOP: Standard Operating Procedure

### 1. Purpose

Ensure reliable management of cron jobs for all Docker applications using a single `/etc/cron.d` file.

### 2. Scope

Applies to all scheduled tasks executed for containers managed under `<DOCKER_DIR>/`.

### 3. Responsibilities

- **Engineering Team**: Create and review cron definitions
- **DevOps Lead**: Approve changes and deploy updates via `update-cron.sh`


### 4. References

- Docker documentation
- Ubuntu cron manual (`man 5 crontab`)
- Logrotate documentation (`man logrotate`)


### 5. Directory Layout

```
<DOCKER_DIR>/
├── <app-name>/
│   ├── *.sh                  # individual task scripts
│   └── logs/                 # per-script log output
├── docker-apps-cron          # centralized cron definitions
├── docker-apps-logrotate     # log rotation configuration
└── update-cron.sh            # deployment script
```


### 6. Definitions

- **Cron file**: `/etc/cron.d/docker-apps` loaded by system cron
- **CRON_SRC**: Source file at `<DOCKER_DIR>/docker-apps-cron`
- **CRON_DST**: Deployed file `/etc/cron.d/docker-apps`
- **Log rotation**: Configured via `/etc/logrotate.d/docker-apps`


### 7. Procedure

#### 7.1 Adding a New Cron Job

1. **Create the script directory and logs folder**:

```bash
mkdir -p <DOCKER_DIR>/<app-name>/logs
```

2. **Create the task script**:

```bash
nano <DOCKER_DIR>/<app-name>/task-name.sh
```

Basic script template:

```bash
#!/bin/bash
# Description: What this script does

echo "[ $(date '+%Y-%m-%d %H:%M:%S') ] Starting task..."

# Your commands here
# docker exec <container-name> <command>

echo "[ $(date '+%Y-%m-%d %H:%M:%S') ] Task completed"
```

3. **Make the script executable**:

```bash
chmod +x <DOCKER_DIR>/<app-name>/task-name.sh
```

4. **Add to `docker-apps-cron`**:

```bash
nano <DOCKER_DIR>/docker-apps-cron
```

Add your new cron entry:

```
# <app-name> task description (timing)
0 3 * * * root /bin/bash <DOCKER_DIR>/<app-name>/task-name.sh \
    >> <DOCKER_DIR>/<app-name>/logs/task-name.log 2>&1
```

5. **Deploy**:

```bash
<DOCKER_DIR>/update-cron.sh
```

6. **Verify** with:

```bash
grep <app-name> /etc/cron.d/docker-apps
```


#### 7.2 Updating an Existing Cron Job

1. **Edit the relevant line** in `docker-apps-cron`:

```bash
nano <DOCKER_DIR>/docker-apps-cron
```

2. **Deploy**:

```bash
<DOCKER_DIR>/update-cron.sh
```

3. **Confirm** timing/execution via logs:

```bash
tail -f <DOCKER_DIR>/<app-name>/logs/task-name.log
```


#### 7.3 Removing a Cron Job

1. **Delete the line(s)** from `docker-apps-cron`:

```bash
nano <DOCKER_DIR>/docker-apps-cron
```

2. **Deploy**:

```bash
<DOCKER_DIR>/update-cron.sh
```

3. **Archive old logs** (optional):

```bash
cd <DOCKER_DIR>/<app-name>/logs/
tar -czvf task-name-logs-archive-$(date '+%Y%m%d').tar.gz task-name.log*
rm task-name.log*
```


#### 7.4 Log Management

Logs for all application tasks are stored in dedicated directories:

```
<DOCKER_DIR>/<app-name>/logs/
```

**Manual log inspection**:

```bash
tail -f <DOCKER_DIR>/<app-name>/logs/task-name.log
```

**Log analysis** with grep:

```bash
grep "ERROR" <DOCKER_DIR>/<app-name>/logs/task-name.log
```

**Log rotation** is handled automatically by the system's logrotate service using the configuration at `/etc/logrotate.d/docker-apps`.

#### 7.5 Troubleshooting

1. **Verify cron is running**:

```bash
systemctl status cron
```

2. **Check cron logs**:

```bash
sudo grep CRON /var/log/syslog
```

3. **Test script manually**:

```bash
<DOCKER_DIR>/<app-name>/task-name.sh
```

4. **Check permissions**:

```bash
ls -la /etc/cron.d/docker-apps
ls -la <DOCKER_DIR>/<app-name>/task-name.sh
```


#### 7.6 Rollback

If a cron job causes issues:

1. **Edit the cron file** to comment out or fix the problematic job:

```bash
nano <DOCKER_DIR>/docker-apps-cron
```

2. **Deploy** the updated file:

```bash
<DOCKER_DIR>/update-cron.sh
```

By following this guide and SOP, you'll maintain a clear, auditable, and scalable cron management system for all your Dockerized applications.

