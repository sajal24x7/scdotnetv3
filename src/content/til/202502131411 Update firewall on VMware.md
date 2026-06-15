---
title: Update Firewall on VMware
slug: update-firewall-on-vmware
created: 2025-02-13T11:42:15.000Z
updated: 2025-02-13T11:42:15.000Z
category: til
tags:
  - '#vmware'
  - '#powershell'
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modocfjrdq2m'
  - 'https://mastodon.social/@sajal24x7/116756403769125761'
---
ipaddress is a string so can not have multiple items in one go. So need to loop for allowed IP addresses as a [PowerShell Arrays](#), if many.

In case Ip already exists in rule, it gives error: `InnerText: Ip address already exist.EsxCLI.CLIFault.summary`

```
$arguments = $EsxCli.network.firewall.ruleset.allowedip.add.CreateArgs()
$arguments.rulesetid = $Service
$arguments.ipaddress = $IP
$EsxCli.network.firewall.ruleset.allowedip.add.Invoke($arguments)
```



---
# references:
[The ESXi host must configure the firewall to restrict access to services running on the host.](https://www.stigviewer.com/stig/vmware_vsphere_8.0_esxi/2023-10-11/finding/V-258794)
