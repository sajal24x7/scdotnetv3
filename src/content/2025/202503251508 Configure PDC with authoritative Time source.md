---
title: "Configure PDC with authoritative Time source"
slug: "configure-pdc-with-authoritative-time-source"
pubDate: 2025-07-29T21:40:26+03:00
updatedDate: 2025-07-29T21:40:26+03:00
category: til
tags:
  - ad
  - windows

---
### To configure time synchronization through registry edit on the PDC emulator:

1. Open **Registry Editor** (**regedit.exe**).
    
2. Navigate to the following registry key: `HKLM\System\CurrentControlSet\Services\W32Time\Parameters`.
    
3. To use a specific NTP source, modify the **Type** value to **NTP**.
    
4. Modify the **NtpServer** value to contain the NTP server to synchronize time with followed by 0x8, for example **131.107.13.100,0x8**. Multiple NTP servers must be space-delimited, for example **131.107.13.100,0x8 24.56.178.140,0x8**
    
5. Open an administrative Command prompt and execute the following command: `w32tm /config /update`.

---
# references:
[Recommendation - Configure the Root PDC with an Authoritative Time Source and Avoid a Widespread Time Skew | Microsoft Learn](https://learn.microsoft.com/en-us/services-hub/unified/health/remediation-steps-ad/configure-the-root-pdc-with-an-authoritative-time-source-and-avoid-widespread-time-skew)