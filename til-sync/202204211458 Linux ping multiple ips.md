---
aliases:
  - Linux ping multiple ips
tags:
  - "#linux"
  - "#bash"
category: til
updated: 2026-08-25T14:30:56
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