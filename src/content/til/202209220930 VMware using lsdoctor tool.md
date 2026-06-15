---
title: VMware Using Lsdoctor Tool
slug: vmware-using-lsdoctor-tool
created: '2022-09-22T09:30:00+03:00'
updated: '2022-09-22T09:30:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modk4xnxng2m'
  - 'https://www.threads.com/@sajal24x7/post/DZnFQ9FlnfT'
---


# Options
## Trustfix
This option corrects SSL trust mismatch issues in the lookup service.  The lookup service registrations may have an SSL trust value that doesn’t match the MACHINE_SSL_CERT on port 443 of the node.  This can be caused by a failure during certificate replacement, among other failures.

# Steps
1. Before running this tool, need to take offline snapshots.
2. Unzip.
```bash
unzip lsdoctor.zip
```
3. Launching the tool.
```bash
# Trustfix option
python lsdoctor.py -t
```
4. Restart all services
```
service-control --status

## Stop all
service-control --stop --all

## Start
service-control --start --all
```

---
references:
[Using the 'lsdoctor' Tool (80469) (vmware.com)](https://kb.vmware.com/s/article/80469)
