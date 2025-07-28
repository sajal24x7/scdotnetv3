---
title: Docker logs for all containers
slug: docker-logs-for-all-containers
pubDate: '2022-08-10T12:48:00+03:00'
updatedDate: '2022-08-10T12:48:00+03:00'
category: til
tags:
- docker
---


# For getting all IPs given on cloud remote
```bash
docker ps -aq -f status=exited | xargs -L 1 docker logs | grep -i nicIP_0
```

---
references: