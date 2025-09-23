# Shawn's Home Lab
*My personal setup for on-premise, local services and experimentation*

## Overview

My homelab runs essential home services while serving as a platform for exploring enterprise technologies. Built on an Intel Xeon E5-2640 v3 system with ZFS storage and Proxmox virtualization, it provides file hosting, media streaming, AI services, and secure remote access through containerized applications.

## Hardware

### **Proxmox Host (pve)**
- **CPU**: Intel Xeon E5-2640 v3 (8-core, 2.6GHz)
- **RAM**: 16GB DDR4-3000 CL15
- **Motherboard**: ASUS X99 WS/IPMI
- **GPU**: NVIDIA GTX 1070 (passed through to LXC)
- **Boot Drive**: 256GB SSD
- **Network**: Dual NIC bridge


## ZFS Storage

### **Tank Pool (Mirror - 7.3TB usable)**
Primary storage using two mirrored 8TB drives for data requiring redundancy:
- User files and documents
- Docker engine data
- Service configurations and databases

### **Mouse Pool (931GB)**
Single 1TB drive for experimental workloads and media content:
- Media files optimized with 1M recordsize for large video files
- Temporary storage and testing datasets

### **Dataset Organization**
- `tank/userdata` (926GB) - NextCloud user storage
- `tank/docker` (141GB) - Docker engine data and volumes
- `mouse/media` - Plex media library (movies, tv, music)
  - **Compression**: LZ4

## Virtualization Layer

### **Ubuntu Docker LXC (VMID: 101)**
- **Hostname**: docker
- **OS**: Ubuntu 24.04.2 LTS
- **Resources**: 16GB RAM, 16 CPU cores

### **GPU Passthrough Configuration**
Direct NVIDIA device access through LXC mount entries:
/dev/nvidia0, /dev/nvidiactl, /dev/nvidia-modeset
/dev/nvidia-uvm, /dev/nvidia-uvm-tools
/dev/nvidia-caps/nvidia-cap1, /dev/nvidia-caps/nvidia-cap2

## Service Implementation

### **File Hosting - NextCloud AIO**
- **Access**: Via Tailscale (cloud.tailnet)
- **Integration**: Tailscale + Caddy for automatic HTTPS certificates
- **Data**: ZFS `tank/userdata` provides core file storage with snapshot protection

### **Media Streaming - Plex**
- **Access**: Via Tailscale (docker.tailnet:32400/web)
- **Transcoding**: NVIDIA GTX 1070 hardware acceleration (NVENC/NVDEC)
- **Media Libraries**: 
  - Movies: `/data/movies`
  - TV Shows: `/data/tv` 
  - Music: `/data/music`
- **Storage**: ZFS `mouse/media` with 1M recordsize optimization

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

### **Container Orchestration**
- **Management**: Dockge web interface (port 5001)
- **Stacks**: Version-controlled Docker Compose files
- **Services**: dockge, nextcloud-aio, plex, llm (Ollama stack), pi-hole
- **Repository**: All configurations stored in Git for reproducibility

## Related Automation Projects

### **Canvas Integration**
Python automation synchronizing Canvas LMS with Notion databases - handles course data, assignment tracking, and API abstraction for reuse in other projects.

### **Task Management Automation**
Scheduled system managing recurring Notion tasks via JSON configuration with automated deployment and SMS error notifications.

---

*Feel free to reach out if you have any questions about my setup!!! (<a href="mailto:shawn.jacobsen0@gmail.com">shawn.jacobsen0@gmail.com</a>)*
