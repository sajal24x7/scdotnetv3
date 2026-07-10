---
tag:
aliases:
---
Tcpdump command to capture outgoing packets
```bash
tcpdump-uw -v -i vmk# -n -T snmp udp and port 161
# typically port 162; if custom ports are configured use those
```

---
references:
[VMware KB](https://kb.vmware.com/s/article/2033528)