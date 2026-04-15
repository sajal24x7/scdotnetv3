---
title: "ESXi firmware upgrade baseline fails to apply with incompatible message"
slug: "esxi-firmware-upgrade-baseline-fails-to-apply-with-incompatible-message"
pubDate: 2025-04-18T21:39:37+03:00
updatedDate: 2025-04-18T21:39:37+03:00
category: til
tags:
  - vmware
  - esxi

---
In the message, it will show the list of VIBs that are causing problems. 

For example, on cisco blade, some hpe related firmware is present. 

```bash
esxcli software vib list | grep -i hpe
amsd                           701.11.9.0.9-1OEM.701.0.0.16850804    HPE     VMwareAccepted    2023-09-02
amsdv                          701.11.3.0.17-1OEM.701.0.0.16850804   HPE     VMwareAccepted    2023-09-02
fc-enablement                  700.3.9.0.4-1OEM.700.1.0.15843807     HPE     PartnerSupported  2023-09-02
hpe-upgrade                    1.4.1-1OEM.700.1.0.15843807           HPE     PartnerSupported  2023-09-02
ilo                            700.10.8.0.6-1OEM.700.1.0.15843807    HPE     PartnerSupported  2023-09-02
ilorest                        700.4.0.0.0.32-15843807               HPE     PartnerSupported  2023-09-02
sut                            701.4.1.0.8-1OEM.701.0.0.16850804     HPE     VMwareAccepted    2023-09-02
vnic-enablement                700.2.10.10-1OEM.700.1.0.15843807     HPE     PartnerSupported  2023-09-02
```

Remove these vibs.

```
 esxcli software vib remove -n amsdv
```

After removing problematic vibs, reboot and check compliance again.

---
# references: