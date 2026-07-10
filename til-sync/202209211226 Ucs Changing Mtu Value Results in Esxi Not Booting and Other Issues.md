---
tags:
  - esxi
  - cisco
  - ucs
aliases:
---

Related to the following bug:
[Cisco Link](https://bst.cloudapps.cisco.com/bugsearch/bug/CSCvs72258)

## Conditions

Issue is specific to UCS-FI-6332-16UP.

Only impacted on firmware >= 4.0.  Earlier versions (3.2(3) and below) are NOT impacted.

Other Fabric Interconnect models are not affected

  

- Issue occurs after change of System QOS from default values when FC ports were up/enabled from most recent boot.

- Issue does not occur if System QOS has been changed from default values and Fabric Interconnect has been rebooted previously

Note: Default System QOS has only FC and Best Effort Ethernet enabled, with 50% weight each, with Normal MTU for Best Effort Ethernet.

Any System QOS configuration which differs from this is not a default configuration.

Most common trigger is to change Best Effort MTU to 9216 to allow Jumbo frames, however any System QOS change can trigger issue.

Immediately reverting the change does not recover the environment.

  

## Workaround

  

If the domain has no FC workload (e.g. UCS domain is having initial setup done), then:

Disable all FC ports

Make System QOS changes

Enable all FC ports

  

If System QOS changes need to be made after FC ports are configured and being used, then to have minimal impact:

Reduce FC IOPS as much as possible

Make System QOS changes

Disable FC ports

Enable FC Ports

  

If immediate recovery is needed, disable/enable of all configured FC ports will recover the issue.

  

Avoid changing back to Default System QOS setting in the future until on a fixed release

  

>QoS system class requires FI reboots as per [this document](https://www.cisco.com/c/en/us/td/docs/unified_computing/ucs/ucs-manager/GUI-User-Guides/Network-Mgmt/4-0/b_UCSM_Network_Mgmt_Guide_4_0/b_UCSM_Network_Mgmt_Guide_4_0_chapter_01000.html): Cisco UCS Manager Network Management Guide, Release 4.0 - Quality of Service [Cisco UCS Manager] - Cisco

---
references: