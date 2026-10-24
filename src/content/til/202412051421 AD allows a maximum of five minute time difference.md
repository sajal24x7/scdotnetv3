---
title: "AD Allows a Maximum of Five Minute Time Difference"
slug: "ad-allows-a-maximum-of-five-minute-time-difference"
created: 2024-12-05T14:21:00+02:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["ad", "windows", "time"]
---
- For successful authentication, max 5 min time difference between server and client
- PDC emulator manages time sync

# Order for time sync

Member server > DC > Domain PDC > Root Domain PDC > External time source 

---
# references: