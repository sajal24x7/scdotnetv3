---
aliases:
  - Docker logs for all containers
tags:
  - "#docker"
category: til
updated: 2026-08-25T14:30:56
---
# For getting all IPs given on cloud remote
```bash
docker ps -aq -f status=exited | xargs -L 1 docker logs | grep -i nicIP_0
```

---
references: