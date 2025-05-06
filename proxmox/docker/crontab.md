# Docker Applications Cron Management

This document describes a scalable, maintainable system for managing scheduled tasks (cron jobs) across all your Docker-based applications. It uses a single `/etc/cron.d` file, version-controlled under `./homelab/docker`, and a deployment script to push updates.

---

## Table of Contents

1. [Overview](#overview)
2. [Directory Layout](#directory-layout)
3. [Tutorial: Initial Setup](#tutorial-initial-setup)

4. [Prerequisites](#prerequisites)
5. [Create per-app `cron.sh`](#create-per-app-cronsh)
6. [Create the master cron file](#create-the-master-cron-file)
7. [Create the deployment script](#create-the-deployment-script)
8. [Version Control \& Deployment](#version-control--deployment)
9. [Verification](#verification)
1. [SOP: Ongoing Maintenance](#sop-ongoing-maintenance)

2. [Updating Existing Jobs](#updating-existing-jobs)
3. [Adding New Jobs](#adding-new-jobs)
4. [Removing Jobs](#removing-jobs)
5. [Logging \& Log Rotation](#logging--log-rotation)
1. [Best Practices](#best-practices)

---

## Overview

We maintain a single cron file in `/etc/cron.d/docker-apps`, sourced from `./homelab/docker/docker-apps-cron`. Each application has its own `cron.sh` that encapsulates the actual `docker exec` commands. A deployment script (`update-cron.sh`) copies the version-controlled cron file into place and sets proper permissions.

This approach ensures:

- **Isolation** of per-app scripts
- **Version control** of the master cron configuration
- **Non-invasive** scheduling (no editing `/etc/crontab` or user crontabs)

---

## Directory Layout

```
homelab/
└── docker/
    ├── nextcloud/
    │   ├── docker-compose.yml
    │   ├── cron.sh
    │   └── cron.log
    ├── application-2/
    │   ├── docker-compose.yml
    │   ├── cron.sh
    │   └── cron.log
    ├── docker-apps-cron        # Master cron file (version-controlled)
    └── update-cron.sh          # Deployment script
```

- **`cron.sh`**: Script per application that runs `docker exec…`.
- **`cron.log`**: Log file capturing stdout/stderr of the cron job.
- **`docker-apps-cron`**: Consolidated cron definitions for all apps.
- **`update-cron.sh`**: Copies `docker-apps-cron` to `/etc/cron.d/docker-apps`.

---

## Tutorial: Initial Setup

### Prerequisites

- Ubuntu host with Docker installed
- `homelab/docker` directory under version control (Git)
- Sudo access to write `/etc/cron.d`


### Create per-app `cron.sh`

1. In each application folder, create `cron.sh`:

```bash
#!/bin/bash
# ./homelab/docker/nextcloud/cron.sh
docker exec -u www-data nextcloud-aio-nextcloud \
  /usr/src/nextcloud/occ preview:generate-all
```

2. Make it executable:

```bash
chmod +x ./homelab/docker/nextcloud/cron.sh
```


### Create the master cron file

1. Create `./homelab/docker/docker-apps-cron`:

```bash
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# Nextcloud: daily at 2AM
0 2 * * * root /bin/bash /full/path/to/homelab/docker/nextcloud/cron.sh \
  >> /full/path/to/homelab/docker/nextcloud/cron.log 2>&1

# Application-2: daily at 3AM
0 3 * * * root /bin/bash /full/path/to/homelab/docker/application-2/cron.sh \
  >> /full/path/to/homelab/docker/application-2/cron.log 2>&1
```

2. Commit to Git:

```bash
git add docker-apps-cron
git commit -m "Add master cron for Docker apps"
```


### Create the deployment script

1. Create `update-cron.sh` in `./homelab/docker`:

```bash
#!/bin/bash
CRON_SRC="$(pwd)/docker-apps-cron"
CRON_DST="/etc/cron.d/docker-apps"

sudo cp "$CRON_SRC" "$CRON_DST"
sudo chmod 644 "$CRON_DST"
sudo chown root:root "$CRON_DST"

echo "Deployed cron file to $CRON_DST"
```

2. Make it executable:

```bash
chmod +x update-cron.sh
```


### Version Control \& Deployment

Whenever you change `docker-apps-cron`:

```bash
git add docker-apps-cron
git commit -m "Update cron schedule for Nextcloud"
./update-cron.sh
```


### Verification

- Ensure `/etc/cron.d/docker-apps` exists, is owned by root, and has 644 perms:

```bash
ls -l /etc/cron.d/docker-apps
```

- Check syslog or cron log for job execution:

```bash
grep CRON /var/log/syslog | tail -n 20
```

- Inspect per-app `cron.log` for output and errors.

---

## SOP: Ongoing Maintenance

### Updating Existing Jobs

1. **Edit** the relevant line in `docker-apps-cron` or `cron.sh`.
2. **Commit** changes:

```bash
git add docker-apps-cron
git commit -m "Reschedule Nextcloud preview generation to 1AM"
```

3. **Deploy**:

```bash
./update-cron.sh
```

4. **Verify**: check `/etc/cron.d/docker-apps` and logs.

### Adding New Jobs

1. **Create** `cron.sh` in `./homelab/docker/<new-app>/`:

```bash
#!/bin/bash
docker exec -u ... your-command
```

2. **Make executable**:

```bash
chmod +x ./homelab/docker/<new-app>/cron.sh
```

3. **Append** a new line in `docker-apps-cron`:

```plaintext
0 4 * * * root /bin/bash /full/path/to/homelab/docker/<new-app>/cron.sh \
  >> /full/path/to/homelab/docker/<new-app>/cron.log 2>&1
```

4. **Commit \& deploy** as above.

### Removing Jobs

1. **Remove** the corresponding line from `docker-apps-cron`.
2. (Optional) **Delete** the app’s `cron.sh` and `cron.log`.
3. **Commit \& deploy**.

### Logging \& Log Rotation

- Each job appends to its own `cron.log`.
- Implement `logrotate` in `/etc/logrotate.d/docker-apps`:

```plaintext
/full/path/to/homelab/docker/*/cron.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
}
```


---

## Best Practices

- **Absolute Paths**: Always use full paths in cron entries.
- **Permissions**: `/etc/cron.d` files must be `root:root` and `644`.
- **Test Scripts**: Run `cron.sh` manually to catch errors early.
- **Version Control**: Keep `docker-apps-cron` and `cron.sh` under Git.
- **Documentation**: Comment your cron lines for clarity.
- **Monitoring**: Regularly scan cron logs and `cron.log` files for failures.

---

By following this SOP, you maintain clear separation of concerns, version-controlled scheduling, and reliable execution of all Docker-based application cron tasks.

