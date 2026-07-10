---
tags:
  - docker
aliases:
---

# For getting all IPs given on cloud remote
```bash
docker ps -aq -f status=exited | xargs -L 1 docker logs | grep -i nicIP_0
```

---
references: