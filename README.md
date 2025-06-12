# Shawn's Home Lab
*A hands-on learning environment for modern infrastructure technologies while solving real home service needs*

## Why This Homelab Exists

This homelab serves as my **learning laboratory** for enterprise technologies while providing practical home services. Every architectural choice balances learning opportunities with solving real problems I actually have - from media streaming to AI experimentation to secure remote access.

## Core Infrastructure Decisions

### **Virtualization: Proxmox + LXC**
- **What I'm Learning**: Enterprise virtualization management and container orchestration
- **Practical Need**: Run multiple isolated services on limited hardware
- **Why LXC over VMs**: Wanted to understand lightweight containerization without VM overhead
- **Privileged LXC Choice**: Simplified my learning curve for GPU passthrough and storage access

### **Storage: ZFS Multi-Pool Strategy**

**Learning Goals**: Modern filesystem management, data integrity, and performance optimization

**Real Problems Solved**:
- **Primary Pool (tank)**: Mirrored drives protect my irreplaceable family photos and documents
- **Testing Pool (mouse)**: Separate space for breaking things without risking important data
- **Media Optimization**: 1M recordsize because I got tired of slow Plex streaming on large files

**ZFS Features I'm Exploring**:
- Snapshots for "oops, I broke it" moments
- Compression to maximize my limited storage budget
- Future expansion as I outgrow current capacity

### **GPU Sharing Experiment**

**The Challenge**: I wanted both Plex transcoding and local AI, but only have one GPU
**What I Learned**: NVENC/NVDEC and compute cores are separate - they can actually run concurrently
**Practical Result**: Can transcode movies while running AI models without conflicts

## Services I Actually Use

### **Self-Hosted Cloud (NextCloud)**
- **Learning**: Alternative to Google Drive/Dropbox, understanding cloud storage architecture
- **Real Use**: Access my files from anywhere, share photos with family
- **Integration Challenge**: Getting it to work with both user files and media through unified storage

### **Media Server (Plex)**
- **Learning**: Media server architecture, hardware transcoding optimization
- **Real Use**: Stream my movie collection to family devices
- **Storage Integration**: Learned to optimize ZFS for large media files

### **Local AI (Ollama + Open WebUI)**
- **Learning**: Running large language models locally, understanding AI inference
- **Real Use**: Private AI assistant for coding help and general questions
- **GPU Learning**: Figuring out memory management and performance optimization

### **Network Services**
- **Pi-hole**: Learning DNS management while blocking ads on most devices
- **Tailscale**: Wanted secure remote access that "just works" - replaced my Cloudflare Tunnel experiment

## What I've Learned Along the Way

### **Storage Engineering**
- ZFS pool management and optimization strategies
- How different workloads need different storage configurations
- The value of data integrity features when you can't afford to lose family photos

### **Containerization Strategy**
- When to use LXC vs Docker vs full VMs
- Container orchestration with practical Docker Compose
- Resource allocation and isolation techniques

### **Hardware Optimization**
- GPU resource sharing between competing workloads
- Performance tuning for specific use cases
- Capacity planning with limited resources

### **Network Architecture**
- Modern VPN mesh networking vs traditional approaches
- Selective DNS filtering strategies
- Balancing security with usability

## Infrastructure as Learning Tool

**Version Control**: All configurations in Git - helps me track what worked and what didn't
**Reproducible Builds**: Docker Compose stacks let me rebuild services when I break them
**Monitoring**: Learning to observe system behavior and performance patterns

## Current Challenges & Future Learning

**Active Problems I'm Solving**:
- Backup strategy (currently learning proper backup vs sync approaches)
- Capacity planning as my data grows
- Service monitoring and alerting

**Next Learning Goals**:
- Proper backup automation
- Infrastructure monitoring with Prometheus/Grafana
- Maybe Kubernetes for container orchestration learning

---

*This homelab grows with my learning - each new technology I want to understand gets integrated into solving real problems I have.*

## Canvas Automation
Pulls course and assignment information and adds this data as pages to a specified Notion database

**TO DO**
- [x] Pull new assignments and add them to notion for the curent semester
- [x] Abstract all canvas and notion queries for use with other automations
- [x] Update existing assignments in Notion if any properties have changed

## Recurring Notion Tasks
Programmatically uploads specified recurring tasks based on the day of the week to a Notion Database

- [x] Use the Notion API to add pages to a database
- [x] Use a JSON file to specify tasks and which days of the week they should be added to the Notion DB
- [x] Automatic error notifications served to SMS via a local smtp server
- [x] Deploy to production and create a recurring cronjob to automate script
