---
aliases:
  - Install stuff on alpine linux using apk
tags:
  - "#linux"
category: til
updated: 2026-08-25T14:30:56
---
# Command to install using local .apk file

apk add --no-cache --no-network --repositories-file=/dev/null --allow-untrusted /tmp/ca-certificates-20190108-r0.apk

---
references: