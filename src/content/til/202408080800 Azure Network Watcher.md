---
title: Azure Network Watcher
slug: azure-network-watcher
created: '2024-08-08T08:00:00+03:00'
updated: '2024-08-08T08:00:00+03:00'
category: til
tags:
  - azure
  - monitoring
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754978231859964'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modo34ewaw2o'
---

- regional service (1 per region per subscription)
- provides tools to do network related troubleshooting
# Network Watcher provides three types of tools

## Monitoring
### Topology 
- for looking at entire NW config

### Connection Monitor 
- provides end-to-end monitoring between Azure and hybrid endpoints

To start using Connection monitor for monitoring, follow these steps:
1. [Install monitoring agents](https://learn.microsoft.com/en-us/azure/network-watcher/connection-monitor-overview#install-monitoring-agents).
2. [Enable Network Watcher on your subscription](https://learn.microsoft.com/en-us/azure/network-watcher/connection-monitor-overview#enable-network-watcher-on-your-subscription).
3. [Create a connection monitor](https://learn.microsoft.com/en-us/azure/network-watcher/connection-monitor-overview#create-a-connection-monitor).
4. [Analyze monitoring data and set alerts](https://learn.microsoft.com/en-us/azure/network-watcher/connection-monitor-overview#analyze-monitoring-data-and-set-alerts).
5. [Diagnose issues in your network](https://learn.microsoft.com/en-us/azure/network-watcher/connection-monitor-overview#diagnose-issues-in-your-network).

## Network Diagnostic Tools

### IP flow verify
- detect traffic filtering issues at a virtual machine level.
- tells which [[202404141419 Network Security Groups|NSG]] or rule allowed or denied traffic

### NSG diagnostics
- detect traffic filtering issues at a [[202404161835 Azure VM Basics|Azure VM]], [[202404181846 Azure VM scale sets|VMSS]], or [[202407271353 Azure Application Gateway|Azure Application Gateway]] level

### Next hop
- detect routing issues
- what is the next hop (type, ip, route-table ID)

### Effective security rules
- shows [[202404141419 Network Security Groups|NSG]] rules applied at the [[202404121727 Azure VM NIC|VM NIC]]
- shows rules applied at the subnet level
- and aggregate of the two

### Connection troubleshoot
- test a connection between a virtual machine, a virtual machine scale set, an application gateway, or a Bastion host and a virtual machine, an FQDN, a URI, or an IPv4 address
- similar to connection monitor but this is point in time whereas monitor is over a duration

### Packet capture
- remotely create packet capture sessions to track traffic to and from a virtual machine (VM) or a virtual machine scale set
### VPN troubleshoot
- troubleshoot virtual network gateways and their connections

## Traffic
### Flow Logs
- NSG flow logs
	- sent to [[202404091847 Azure Storage Overview|Azure storage]] from where it can be exported
- VNET flow logs
	- log traffic flowing through [[202404121703 Azure VNet|VNet]]
	- sent to [[202404091847 Azure Storage Overview|Azure storage]] from where it can be exported

### Traffic Analytics
- provides rich visualizations of flow logs data


---
# references:
[MS Learn](https://learn.microsoft.com/en-us/training/modules/configure-network-watcher/2-describe-features)
[MS Docs - Overview](https://learn.microsoft.com/en-us/azure/network-watcher/network-watcher-overview)
