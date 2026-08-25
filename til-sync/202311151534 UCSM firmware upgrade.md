---
tags:
  - ucs
  - cisco
aliases:
  - Cisco UCS firmware upgrade
updated: 2026-08-25T14:30:56
---
# Firmware Image Management
Cisco delivers firmware updates to UCS in bundles.
1. Infrastructure bundle (A)
2. B-series bundle
3. C-series bundle

## Infrastructure bundle
This includes:
1. UCSM software
2. Kernel and system firmware for FI
3. I/O module firmware

## B-series bundle
This includes
1. CIMC firmware
2. BIOS firmware
3. Adapter firmware
4. Board controller firmware
5. Third-party firmware images required by the new server

4 things need to be checked:
1. Hardware and OS compatibility
2. Cross-version firmware support
3. Upgrade path
4. Any open caveats in the release

## Hardware and OS compatibility
You can search on [Cisco UCS Hardware Compatibility List](https://ucshcltool.cloudapps.cisco.com/public/) using either option: servers / os /products.
You can go to products and search by the vic card we have for example.
This is for OS and server/blade compatibility. Not infrastructure firmware.
Download link for infra: [Software Download - Cisco Systems](https://software.cisco.com/download/home/283612660/type/283655658/release/4.3(4e))
Download link for blade: [Software Download - Cisco Systems](https://software.cisco.com/download/home/283853163/type/283655681/release/4.3(3c))
Both are different. So there can be different suggested firmware for both.
## Cross-Version Firmware Support
This page has the tool - [Cisco UCS Manager Cross Version Firmware Matrix](https://www.cisco.com/c/dam/en/us/td/docs/unified_computing/ucs/ucs-manager/cross_version_firmware_matrix_6_0_onwards/index.html).
Table 11 on [Release Notes for Cisco UCS Manager, Release 4.2 - Cisco](https://www.cisco.com/c/en/us/td/docs/unified_computing/ucs/release/notes/cisco-ucs-manager-rn-4-2.html#Cisco_Reference.dita_c4bfdd61-9589-44a8-8610-9d66c95b34a0) page for the particular version has details. which infra bundle (A) supports which host version (B or C). Look for your F5 device in the cross-section. If it is listed there then support is there.
## Upgrade path
Table 5 on the release page has those details.
## Open caveats
Any issues identified in the target release version.

---
# references:
[Cisco UCS Manager Firmware Management Guide, Release 4.2 - Manage Firmware through Cisco UCS Manager - Cisco](https://www.cisco.com/c/en/us/td/docs/unified_computing/ucs/ucs-manager/GUI-User-Guides/Firmware-Mgmt/4-2/b_UCSM_GUI_Firmware_Management_Guide_4-2/b_UCSM_GUI_Firmware_Management_Guide_chapter_011.html#topic_F1A2EBE8F31243F3AFFD79FA5CB5E7C2)
[Software Download - Cisco Systems](https://software.cisco.com/download/home/283853163/type/283655681/release/4.2(3e))
https://software.cisco.com/download/home/283612660/type/283655658/release/4.2(3g)
**[https://ucshcltool.cloudapps.cisco.com/public/](https://ucshcltool.cloudapps.cisco.com/public/)**[https://software.cisco.com/download/home/283853163/type/283655681/release/4.2(3e)](https://software.cisco.com/download/home/283853163/type/283655681/release/4.2(3e))

[Cisco UCS Manager Upgrade/Downgrade Support Matrix](https://www.cisco.com/c/dam/en/us/td/docs/unified_computing/ucs/ucs-manager/UCSM-upgrade-downgrade-matrix/UCSM-Upgrade-path-Overview.htm)
[Cisco UCS Manager Upgrade and Downgrade Support Tool](https://www.cisco.com/c/dam/en/us/td/docs/unified_computing/ucs/ucs-manager/UCSM-upgrade-downgrade-matrix/index.html#cur=4.0(4n)&tar=4.2(3))