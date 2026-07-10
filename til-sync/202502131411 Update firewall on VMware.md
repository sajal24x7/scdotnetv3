---
tags:
  - "#vmware"
  - "#powershell"
aliases:
  - Update firewall on VMware
category: til
---
ipaddress is a string so can not have multiple items in one go. So need to loop for allowed IP addresses as a [[202204121531 PowerShell Arrays|PowerShell Arrays]], if many.

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