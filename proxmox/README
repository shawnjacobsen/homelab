# Homelab Infrastructure Documentation v3.0

## **Hardware Specifications**

### **Proxmox Host (pve)**

- **Hostname:** pve
- **IP Address:** 10.0.0.20/24 (static)
- **SSH Port:** 22
- **Hardware:**
    - **CPU:** Intel Xeon E5-2640 v3 (8-core, 2.6GHz)
    - **RAM:** 16GB DDR4-3000 CL15
    - **Motherboard:** ASUS X99 WS/IPMI
    - **GPU:** NVIDIA GTX 1070 (passed through to LXC for AI inference and media transcoding)
    - **Boot Drive:** 256GB SSD (Serial: 1630135708F8)
    - **Network:** Dual NIC bridge (enp5s0, enp6s0 → vmbr0)

### **Storage Configuration**

```

Tank Pool (Mirror): 7.3TB usable
├── WRQ0228J (8TB drive)
└── WRQ021ZB (8TB drive)

Mouse Pool: 931GB
└── ZN1QRGX5 (1TB drive)

```

### **ZFS Dataset Layout**

- **tank/userdata** (926GB) - Main user storage
- **tank/docker** (141GB) - Docker data for LXC container
- **tank/nextcloud_backup** (1.26TB) - Deprecated backup storage
- **tank/photography** (1.44TB) - Deprecated photo storage
- **mouse/temp-backups** (905MB) - Temporary backup storage
- **mouse/media** - Media files optimized for large content
  - **Recordsize:** 1M (optimized for video files)
  - **Compression:** LZ4
  - **Atime:** off, relatime=off
  - **Structure:** `/movies/`, `/tv/`, `/music/`

## **Storage Integration Architecture**

### **ZFS to LXC Mountpoints**

The storage architecture follows a three-tier approach: ZFS pools → LXC bind mounts → Docker volumes/bind mounts.

**LXC Container Mountpoints (VMID=101):**

```

mp0: /tank/docker → /var/lib/docker
mp1: /tank/userdata → /mnt/datashare/myfiles
mp2: /mouse/media → /mnt/datashare/media

```

### **Storage Flow Diagram**

```

Proxmox Host               LXC Container (docker)        Docker Services
─────────────              ──────────────────────        ───────────────
ZFS: /tank/docker    →     /var/lib/docker          →    Docker engine data
├── overlay2/                  (container layers)
├── volumes/                   (persistent data)
└── containers/                (metadata)

ZFS: /tank/userdata  →     /mnt/datashare/myfiles   →    NextCloud data
└── user files                 (accessible via web)

ZFS: /mouse/media    →     /mnt/datashare/media     →    Plex media data
├── movies/                    (video content)
├── tv/                        (tv series)
└── music/                     (audio content)

```

### **Docker Service Integration**

**NextCloud Data Access:**

- **ZFS Source:** `/tank/userdata` (926GB dataset)
- **LXC Mount:** `/mnt/datashare/myfiles`
- **NextCloud Mount:** `/mnt/datashare` (parent directory)
- **Configuration:** `NEXTCLOUD_MOUNT: /mnt/datashare` in docker-compose

**Plex Media Access:**

- **ZFS Source:** `/mouse/media` (optimized for large files)
- **LXC Mount:** `/mnt/datashare/media`
- **Plex Mount:** `/data` (read-only access to media files)
- **Configuration:** Media libraries point to `/data/movies`, `/data/tv`, `/data/music`

This architecture allows NextCloud to access both user data and media content stored on ZFS pools while maintaining separation between Docker engine data and user content. The unified `/mnt/datashare` structure enables NextCloud's single external storage mount to access both user files and media.

**Docker Engine Storage:**

- **ZFS Source:** `/tank/docker` (141GB dataset)
- **LXC Mount:** `/var/lib/docker`
- **Contains:** All Docker runtime data, images, containers, and volumes
- **Benefits:** High-performance ZFS features (snapshots, compression, deduplication)

## **Network Architecture**

### **Network Topology**

- **Network Range:** 10.0.0.0/24
- **Gateway:** 10.0.0.1
- **DNS:** 10.0.0.30 (Pi-hole) for configured devices
- **Tailnet:** heron-fiordland.ts.net

### **Static IP Assignments**

- **Proxmox Host:** 10.0.0.20
- **Docker LXC:** 10.0.0.30

## **Virtual Infrastructure**

### **Ubuntu Docker LXC (VMID=101)**

- **Hostname:** docker
- **IP Address:** 10.0.0.30/24
- **SSH Port:** 2053
- **Operating System:** Ubuntu 24.04.2 LTS
- **Resources:** 16GB RAM, 16 CPU cores (all available)
- **Configuration:** Privileged container with GPU passthrough
- **Storage:** `/tank/docker` bind mount for Docker data

### **LXC Configuration Details**

**Container Specifications (101.conf):**

```

arch: amd64
cores: 16
memory: 16384
hostname: docker
features: nesting=1
onboot: 1
ostype: ubuntu
swap: 16384

```

**Network Configuration:**

```

net0: name=eth0,bridge=vmbr0,firewall=1,gw=10.0.0.1,
hwaddr=BC:24:11:37:6F:1A,ip=10.0.0.30/24,type=veth

```

**Security \& Permissions:**

```

lxc.apparmor.profile: unconfined
lxc.cgroup2.devices.allow: a
lxc.cap.drop:

```

### **GPU Passthrough Configuration**

**NVIDIA Device Mounts:**

```

lxc.mount.entry: /dev/nvidia0 dev/nvidia0 none bind,optional,create=file
lxc.mount.entry: /dev/nvidiactl dev/nvidiactl none bind,optional,create=file
lxc.mount.entry: /dev/nvidia-modeset dev/nvidia-modeset none bind,optional,create=file
lxc.mount.entry: /dev/nvidia-uvm dev/nvidia-uvm none bind,optional,create=file
lxc.mount.entry: /dev/nvidia-uvm-tools dev/nvidia-uvm-tools none bind,optional,create=file
lxc.mount.entry: /dev/nvidia-caps/nvidia-cap1 dev/nvidia-caps/nvidia-cap1 none bind,optional,create=file
lxc.mount.entry: /dev/nvidia-caps/nvidia-cap2 dev/nvidia-caps/nvidia-cap2 none bind,optional,create=file

```

**Device Permissions:**

```

lxc.cgroup2.devices.allow: c 195:* rwm  \# NVIDIA devices
lxc.cgroup2.devices.allow: c 235:* rwm  \# NVIDIA control
lxc.cgroup2.devices.allow: c 238:* rwm  \# NVIDIA UVM

```

**GPU Resource Sharing:**

The NVIDIA GTX 1070 is shared between multiple workloads:
- **AI Inference (Ollama):** GPU compute and VRAM for large language models
- **Media Transcoding (Plex):** NVENC/NVDEC hardware encoders for video transcoding
- **Performance:** Can handle 5-6 concurrent 1080p transcodes alongside light AI inference workloads

### **Docker Data Structure**

Located at `/tank/docker/` (141GB total):

- **overlay2/** - Container filesystem layers
- **volumes/** - Persistent container data
- **containers/** - Container metadata
- **buildkit/** - Build cache data

## **Service Stack**

### **Container Management**

**Dockge** - Container orchestration interface

- **Port:** 5001
- **Purpose:** Web-based Docker Compose management
- **Stacks Directory:** `/home/shawn/homelab/proxmox/docker`

### **Cloud Storage**

**NextCloud AIO** - Self-hosted cloud platform

- **Access:** https://cloud.heron-fiordland.ts.net/
- **Features:** File sync, sharing, collaboration
- **Integration:** Tailscale + Caddy for secure access
- **Mount Point:** `/mnt/datashare`
- **Data Source:** ZFS tank/userdata and mouse/media via LXC bind mounts

### **Media Services**

**Plex Media Server** - Media streaming platform

- **Port:** 32400
- **Access:** http://docker.heron-fiordland.ts.net:32400/web
- **Hardware Transcoding:** NVIDIA GTX 1070 support via NVENC/NVDEC
- **Media Libraries:** Movies (`/data/movies`), TV Shows (`/data/tv`), Music (`/data/music`)
- **Configuration:** UID/GID 1000, host networking for optimal discovery
- **GPU Sharing:** Coexists with Ollama AI workloads using different GPU components

### **AI/LLM Services**

**Ollama + Open WebUI** - Local AI inference

- **Ollama Port:** 11434
- **Web UI Port:** 7000
- **GPU Acceleration:** NVIDIA GTX 1070
- **Features:** Local LLM hosting, RAG with web search
- **Search Integration:** SearXNG for enhanced RAG capabilities
- **Supporting Services:** Redis (Valkey), Apache Tika

**SearXNG** - Privacy-focused search engine

- **Port:** 7777
- **Purpose:** Meta-search engine for AI RAG integration
- **Network:** ai-net (isolated Docker network)

### **Network Services**

**Pi-hole** - Network-wide ad blocking

- **IP:** 10.0.0.30
- **DNS Ports:** 53/tcp, 53/udp
- **Web Interface:** 80/tcp, 443/tcp
- **Timezone:** America/New_York
- **Scope:** DNS filtering for devices configured to use it

**Tailscale** - VPN and secure access

- **Machine Name:** cloud
- **Tailscale IP:** 100.111.175.18
- **Purpose:** Secure remote access to services
- **Integration:** OAuth + tags for certificate management

## **Access Methods**

### **SSH Access**

- **Proxmox:** ssh root@10.0.0.20 (port 22)
- **Docker LXC:** ssh shawn@10.0.0.30 -p 2053

### **Service Access**

All services accessible via Tailscale hostnames:

- **NextCloud:** https://cloud.heron-fiordland.ts.net/
- **Plex:** http://docker.heron-fiordland.ts.net:32400/web
- **Dockge:** Internal access on port 5001
- **Open WebUI:** Internal access on port 7000
- **Pi-hole:** http://10.0.0.30/ or https://10.0.0.30/

### **External Access**

- **Primary:** Tailscale VPN (up to 100 machines free)
- **Deprecated:** Cloudflare Tunnel (removed due to NextCloud compatibility issues)

## **Code and Configuration Management**

### **Repository Structure**

**GitHub:** [shawnjacobsen/homelab](https://github.com/shawnjacobsen/homelab)

For detailed Docker Compose files and stack configurations, please refer to the [GitHub repository Docker stacks directory](https://github.com/shawnjacobsen/homelab/tree/main/proxmox/docker) on the main branch.

### **Docker Stack Organization**

- **dockge** - Container management interface
- **llm** - Ollama + Open WebUI + SearXNG + Redis + Tika
- **nextcloud-aio** - Cloud storage with Tailscale + Caddy integration
- **pi-hole** - DNS ad-blocking service
- **plex** - Media streaming server with GPU transcoding

All stacks are managed through Dockge and stored in version-controlled Docker Compose files.

## **Security \& Authentication**

### **User Accounts**

- **Proxmox:** root user
- **Ubuntu LXC:** shawn user with sudo privileges

### **Network Security**

- **Tailscale:** OAuth authentication with tags
- **SSL Certificates:** Automated via Tailscale integration
- **Firewall:** Default Proxmox firewall + network segmentation

## **Benefits of This Architecture**

### **ZFS Advantages**

- **Snapshots:** Point-in-time recovery for both Docker data and user files
- **Compression:** Automatic space savings on stored data
- **Checksums:** Data integrity verification
- **Deduplication:** Efficient storage of similar data blocks
- **Media Optimization:** 1M recordsize for optimal large file performance

### **LXC Benefits**

- **Resource Isolation:** Dedicated resources for Docker workloads
- **GPU Access:** Direct hardware passthrough for AI workloads and media transcoding
- **Networking:** Isolated network stack with firewall capabilities
- **Container Nesting:** Ability to run Docker containers within LXC

### **Docker Integration**

- **Persistent Storage:** User data survives container recreations
- **Performance:** Direct access to ZFS-backed storage
- **Scalability:** Easy to expand storage by adding disks to ZFS pool
- **Backup Ready:** ZFS snapshots can backup entire Docker infrastructure

### **GPU Resource Efficiency**

- **Shared Utilization:** Single GTX 1070 serves both AI inference and media transcoding
- **Hardware Separation:** NVENC/NVDEC for media, compute cores for AI
- **Concurrent Operation:** Light transcoding works alongside AI workloads

## **Backup Strategy**

### **Current Status**

- **Active Backups:** None configured
- **Deprecated Storage:**
    - tank/nextcloud_backup (1.26TB)
    - tank/photography (1.44TB)
- **Temporary Storage:** mouse/temp-backups (905MB)

## **Deprecated Services**

### **Cloudflare Tunnel**

- **Reason for Deprecation:** Incompatibility with NextCloud AIO
- **Replacement:** Tailscale for secure external access
- **Configuration:** Archived but may be useful for future services

This multi-layered approach provides enterprise-grade storage features while maintaining the flexibility and ease of use of containerized applications. The integration with NextCloud enables seamless file organization and management, supporting workflows that include rclone for advanced file operations. The addition of Plex with hardware transcoding transforms the homelab into a comprehensive media streaming solution while efficiently sharing GPU resources with AI workloads.

<div style="text-align: center">⁂</div>

[^1]: docker
```

This updated documentation preserves all the original information while adding the new Plex media server components, ZFS media dataset, GPU sharing details, and updated storage integration architecture.

<div style="text-align: center">⁂</div>

[^1]: Homelab-Infrastructure-Documentation-v3.0.md

[^2]: https://github.com/M0NsTeRRR/homelabv3-infra

[^3]: https://www.joekarlsson.com/2023/09/how-to-get-started-building-a-homelab-server-in-2024/

[^4]: https://mattadam.com/2024/01/12/vmware-cloud-foundation-vcf-in-your-home-lab/

[^5]: https://github.com/mkuthan/homelab-public

[^6]: https://www.reddit.com/r/homelab/comments/u3h2l2/homelab_documentation/

[^7]: https://www.thetechguy.it/post/33-home-lab-design/

[^8]: https://news.ycombinator.com/item?id=39640992

[^9]: https://techmyth.blog/en/posts/homelab-ad-doc-using-asbuiltreport/

[^10]: https://www.youtube.com/watch?v=QY-jHRv60D0

[^11]: https://techmyth.blog/en/posts/homelab-veeam-vbr-doc-with-asbuiltreport/

