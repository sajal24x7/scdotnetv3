---
tags:
  - "#windows"
  - "#dns"
aliases:
---
# Error
Resolution has multiple canonical names. Resolves couple of hops, but fails on 3rd/4th step.
```cmd
** server can't find example.example.example.com : NXDOMAIN

Example:
Non-authoritative answer:
insights.viva.office.com        canonical name = vi-prod-afd-gca7e3d5gcbzf0c7.z01.azurefd.net.
vi-prod-afd-gca7e3d5gcbzf0c7.z01.azurefd.net    canonical name = region-azurefd-prod-ts1.trafficmanager.net.
region-azurefd-prod-ts1.trafficmanager.net      canonical name = dual.part-0017.t-0009.t-s1-msedge.net.
dual.part-0017.t-0009.t-s1-msedge.net   canonical name = part-0017.t-0009.t-s1-msedge.net.
Name:   part-0017.t-0009.t-s1-msedge.net
Address: 13.107.229.28
Name:   part-0017.t-0009.t-s1-msedge.net
Address: 13.107.228.28
Name:   part-0017.t-0009.t-s1-msedge.net
Address: 2620:1ec:4b::28
Name:   part-0017.t-0009.t-s1-msedge.net
Address: 2620:1ec:4a::28
```

# Resolution
Forwarder does not exist for this 3rd/4th domain. So create conditional forwarder for this domain to the external/dmz dns server.

---
references: