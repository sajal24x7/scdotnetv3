---
tags:
  - "#powershell"
aliases:
  - Import IP addresses from CSV powershell
category: til
---
Directly importing the array and using it where IpAddress object is expected might not work.

Adding `[ipAddress]` to the variable will not work either.

We can split the array `.split(',')`. This will allow it to be read as ipAddress.

---
# references: