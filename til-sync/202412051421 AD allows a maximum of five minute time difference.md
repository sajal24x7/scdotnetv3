---
aliases:
  - AD allows a maximum of five minute time difference
tags:
  - "#ad"
  - "#windows"
  - "#time"
category: til
updated: 2026-08-25T14:30:56
---
- For successful authentication, max 5 min time difference between server and client
- PDC emulator manages time sync

# Order for time sync

Member server > DC > Domain PDC > Root Domain PDC > External time source 

---
# references: