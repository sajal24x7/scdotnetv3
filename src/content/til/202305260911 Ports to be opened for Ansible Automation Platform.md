---
title: Ports to be opened for Ansible Automation Platform
slug: ports-to-be-opened-for-ansible-automation-platform
pubDate: '2023-05-26T09:11:00+03:00'
updatedDate: '2023-05-26T09:11:00+03:00'
category: til
tags:
- ansible
---


-   Job executions for managed nodes from hybrid/execution nodes
    -   external cloud service to retrieve inventory information : 443/tcp (REST API in HTTPS)
        -   Amazon EC2
        -   Google Compute Engine
        -   Microsoft Azure Resource Manager
        -   VMware vCenter
        -   Red Hat Satellite
        -   Red Hat OpenStack
        -   Red Hat Insights
        -   etc.
    -   RHEL : 22/tcp (SSH)
    -   Windows Server : 5986/tcp (HTTPS), 5985/tcp (HTTP), 88/tcp,udp (Kerberos)
    -   Network : 22/tcp (SSH), 443/tcp (HTTPS), etc.



---
# references:
[What Ports Need To Be Opened In The Firewall For Ansible Automation Platform 2 Services? - Red Hat Customer Portal](https://access.redhat.com/solutions/6756251)