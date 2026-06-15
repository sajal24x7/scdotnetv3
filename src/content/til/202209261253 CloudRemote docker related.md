---
title: CloudRemote Docker Related
slug: cloudremote-docker-related
created: '2022-09-26T12:53:00+03:00'
updated: '2022-09-26T12:53:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkbdbijr24'
  - 'https://www.threads.com/@sajal24x7/post/DZnFiiFFkgT'
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
