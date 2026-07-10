---
tag: #ccs, #docker
aliases:
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