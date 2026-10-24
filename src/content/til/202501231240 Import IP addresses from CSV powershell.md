---
title: "Import IP Addresses From CSV Powershell"
slug: "import-ip-addresses-from-csv-powershell"
created: 2025-01-23T12:40:00+02:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["powershell"]
---
Directly importing the array and using it where IpAddress object is expected might not work.

Adding `[ipAddress]` to the variable will not work either.

We can split the array `.split(',')`. This will allow it to be read as ipAddress.

---
# references: