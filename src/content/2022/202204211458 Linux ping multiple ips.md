---
title: Linux ping multiple ips
slug: linux-ping-multiple-ips
pubDate: '2022-04-21T14:58:00+03:00'
updatedDate: '2022-04-21T14:58:00+03:00'
category: til
tags:
- linux
- bash
---


```bash
for i in `cat ips.txt`; do if [ "`ping -c 1 $i`" ]; then echo $i,pinging; else echo $i,failed; fi; done >> output.txt
```

```bash
#!/bin/bash  
for ips in $(cat ip-list.txt); do  
if ping -c 1 $ips &> /dev/null  
then  
echo $ips",pinging"  
else  
echo $ips",notpinging"  
fi  
done
```
---
references: