# Shawn's Home Lab
*My personal setup for on-premise, local services and experimentation*

## Overview

My homelab runs essential home services while serving as a platform for exploring enterprise technologies. Built on an Intel Xeon E5-2640 v3 system with ZFS storage and Proxmox virtualization, it provides file hosting, media streaming, AI services, and secure remote access through containerized applications.

## Hardware Foundation

### **Proxmox Host (pve)**
- **CPU**: Intel Xeon E5-2640 v3 (8-core, 2.6GHz)
- **RAM**: 16GB DDR4-3000 CL15
- **Motherboard**: ASUS X99 WS/IPMI
- **GPU**: NVIDIA GTX 1070 (passed through to LXC)
- **Boot Drive**: 256GB SSD
- **Network**: Dual NIC bridge (enp5s0, enp6s0 → vmbr0)
- **IP**: 10.0.0.20/24 (static)

The hardware choice balances performance with power efficiency - the Xeon provides ECC memory support and sufficient compute for multiple concurrent workloads while the GTX 1070 handles both AI inference and media transcoding duties.

## ZFS Storage Architecture

### **Tank Pool (Mirror - 7.3TB usable)**
Primary storage using two mirrored 8TB drives for critical data that requires redundancy:
- User files and documents
- Docker engine data
- Service configurations and databases

### **Mouse Pool (931GB)**
Single 1TB drive for experimental workloads and media content:
- Media files optimized with 1M recordsize for large video files
- Temporary storage and testing datasets
- Non-critical data where single-drive risk is acceptable

### **Dataset Organization**
- `tank/userdata` (926GB) - NextCloud user storage
- `tank/docker` (141GB) - Docker engine data and volumes
- `mouse/media` - Plex media library (movies, tv, music)
  - **Recordsize**: 1M (optimized for video files vs 128K default)
  - **Compression**: LZ4
  - **Atime**: Disabled for performance

This setup provides data integrity through ZFS checksums, automatic compression, snapshot capabilities, and performance optimization tailored to each workload type.

## Virtualization Layer

### **Ubuntu Docker LXC (VMID: 101)**
- **Hostname**: docker
- **IP**: 10.0.0.30/24 (static)
- **SSH Port**: 2053
- **OS**: Ubuntu 24.04.2 LTS
- **Resources**: 16GB RAM, 16 CPU cores
- **Configuration**: Privileged container with GPU passthrough

### **LXC Storage Integration**
Three-tier storage architecture: ZFS pools → LXC bind mounts → Docker volumes
- **mp0**: `tank/docker` → `/var/lib/docker` (Docker engine data)
- **mp1**: `tank/userdata` → `/mnt/data/share/myfiles` (NextCloud data)
- **mp2**: `mouse/media` → `/mnt/data/share/media` (Plex media)

### **GPU Passthrough Configuration**
Direct NVIDIA device access through LXC mount entries:
/dev/nvidia0, /dev/nvidiactl, /dev/nvidia-modeset
/dev/nvidia-uvm, /dev/nvidia-uvm-tools
/dev/nvidia-caps/nvidia-cap1, /dev/nvidia-caps/nvidia-cap2

text

Device permissions configured for proper GPU access (195:*, 235:*, 238:*) enabling both compute and encoding hardware utilization.

## Service Implementation

### **File Hosting - NextCloud AIO**
- **Access**: Via Tailscale (cloud.tailnet)
- **Storage**: Unified mount to `/mnt/data/share` accessing both user files and media
- **Integration**: Tailscale + Caddy for automatic HTTPS certificates
- **Data**: ZFS `tank/userdata` provides core file storage with snapshot protection

### **Media Streaming - Plex**
- **Port**: 32400
- **Access**: Via Tailscale (docker.tailnet:32400/web)
- **Transcoding**: NVIDIA GTX 1070 hardware acceleration (NVENC/NVDEC)
- **Media Libraries**: 
  - Movies: `/data/movies`
  - TV Shows: `/data/tv` 
  - Music: `/data/music`
- **Storage**: ZFS `mouse/media` with 1M recordsize optimization
- **Performance**: Handles 5-6 concurrent 1080p transcodes alongside AI workloads

### **Local AI Infrastructure**
- **Ollama**: Port 11434 (LLM inference engine)
- **Open WebUI**: Port 7000 (web interface)
- **GPU Acceleration**: NVIDIA GTX 1070 compute cores
- **Supporting Services**: SearXNG (port 7777), Redis, Apache Tika
- **Network**: Isolated Docker network (ai-net) for service communication

### **Network Services**
- **Pi-hole**: DNS/ad-blocking on 10.0.0.30 (ports 53, 80, 443)
  - Selective deployment - configured devices only
  - Preserves default DHCP for testing and work devices
- **Tailscale**: Mesh VPN with OAuth authentication
  - Machine name: "cloud"
  - Automatic certificate management
  - Replaced Cloudflare Tunnel due to NextCloud AIO compatibility

## Technical Architecture

### **Storage Flow**
ZFS Pools → LXC Bind Mounts → Docker Volumes/Bind Mounts

text

**Docker Engine**: `tank/docker` → `/var/lib/docker`
- overlay2 filesystem layers
- persistent volumes
- container metadata
- build cache

**NextCloud Data**: `tank/userdata` → `/mnt/data/share/myfiles`
- User files accessible via web interface
- ZFS snapshots provide point-in-time recovery

**Plex Media**: `mouse/media` → `/mnt/data/share/media`
- Read-only access to media files
- 1M recordsize reduces I/O operations for large files

### **GPU Resource Management**
The GTX 1070 efficiently serves dual purposes through hardware resource separation:
- **NVENC/NVDEC encoders**: Handle Plex transcoding workloads
- **CUDA compute cores**: Process AI inference for Ollama
- **Concurrent operation**: Light transcoding alongside AI workloads without conflicts

### **Container Orchestration**
- **Management**: Dockge web interface (port 5001)
- **Stacks**: Version-controlled Docker Compose files
- **Services**: dockge, nextcloud-aio, plex, llm (Ollama stack), pi-hole
- **Repository**: All configurations stored in Git for reproducibility

## Network Design

- **Range**: 10.0.0.0/24
- **Gateway**: 10.0.0.1
- **Proxmox Host**: 10.0.0.20
- **Docker LXC**: 10.0.0.30
- **DNS**: Pi-hole (10.0.0.30) for configured devices
- **External Access**: Tailscale mesh VPN (100 devices free)

Security through network segmentation, container isolation, and Tailscale's zero-trust model rather than traditional port forwarding.

## Infrastructure Benefits

**ZFS Advantages**: Data integrity through checksums, automatic compression, snapshot recovery, and workload-optimized performance tuning.

**LXC Efficiency**: Minimal overhead compared to full VMs while maintaining isolation and enabling direct hardware access for GPU workloads.

**GPU Resource Sharing**: Single hardware investment serves multiple high-performance workloads through careful resource allocation.

**Scalability**: ZFS pools support expansion, container architecture enables easy service addition, and Tailscale mesh scales to 100 devices.

## Related Automation Projects

### **Canvas Integration**
Python automation synchronizing Canvas LMS with Notion databases - handles course data, assignment tracking, and API abstraction for reuse in other projects.

### **Task Management Automation**
Scheduled system managing recurring Notion tasks via JSON configuration with automated deployment and SMS error notifications.

---

*Feel free to reach out if you have any questions about my setup!!! (<a href="mailto:shawn.jacobsen0@gmail.com">shawn.jacobsen0@gmail.com</a>)*
