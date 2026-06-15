---
title: Docker Logs for All Containers
slug: docker-logs-for-all-containers
created: '2022-08-10T12:48:00+03:00'
updated: '2022-08-10T12:48:00+03:00'
category: til
tags:
  - docker
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modjzzuavr24'
---


# For getting all IPs given on cloud remote
```bash
docker ps -aq -f status=exited | xargs -L 1 docker logs | grep -i nicIP_0
```

---
references:
