---
aliases:
  - CloudRemote docker related
tags:
  - "#ccs"
  - "#docker"
category: til
updated: 2026-08-25T14:30:56
---
```bash
## Docker get exited containers count

docker ps -a -q -f status=exited | wc -l

## Docker remove exited containers

docker rm -v $(docker ps -a -q -f status=exited)

docker logs -v $(docker ps -a)
```

---
references: