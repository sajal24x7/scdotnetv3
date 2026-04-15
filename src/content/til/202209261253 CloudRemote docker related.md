---
title: CloudRemote docker related
slug: cloudremote-docker-related
pubDate: '2022-09-26T12:53:00+03:00'
updatedDate: '2022-09-26T12:53:00+03:00'
category: til
tags: []
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