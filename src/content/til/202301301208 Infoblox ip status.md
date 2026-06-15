---
title: Infoblox Ip Status
slug: infoblox-ip-status
created: '2023-01-30T12:08:00+03:00'
updated: '2023-01-30T12:08:00+03:00'
category: til
tags: []
---



-   Unused: An IP address that has not been detected and is not associated with any network device or active host on the network.
    
-   Conflict: An IP address that has either a MAC address conflict or a DHCP lease conflict detected through a network discovery.
    
-   Used: An IP address that is associated with an active host on the network. It can be a resource record, fixed address, reservation, DHCP lease, or host record.
    
-   Pending: An IP address that is associated with a scheduled task or approval workflow, and the associated operation has not been executed yet. This IP address is not considered when using the next available IP address function.
    
-   Selected IP Address: The IP address that you selected.
    
-   DHCP Range: The IP addresses within a DHCP range in the network. The appliance highlights the cells using a green background.
    
-   Reserved Range: A range of IP addresses that are reserved for statically configured hosts. They are not served as dynamic addresses. You can allocate the next available IP from the reserved range when you create a static host.

---
# references: