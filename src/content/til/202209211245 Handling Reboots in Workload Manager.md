---
title: Handling Reboots in Workload Manager
slug: handling-reboots-in-workload-manager
created: '2022-09-21T12:45:00+03:00'
updated: '2022-09-21T12:45:00+03:00'
category: til
tags: []
---


Reboots in CCS Workload manager are of two types:
1. Internal reboot, which happens during initialization
2. External reboot, which can be triggered by user.

There are separate workflows for both.

For reboots, during node initialization, the agent performs reboot after coming across the .cliqrRebootResumeInit file in OSMOSIX_HOME directory. We do not directly write to this file present in OSMOSIX_HOME directory, instead we write to the files present in tmp directory, present at root.

In the approach we are using, we create two files in the tmp directory, .cliqrRebootResumeInit (which the agent copies over to the OSMOSIX_HOME directory) and the .step file which keeps track of the number of reboots.

The .cliqrRebootResumeInit file contails the #!CliQrReboot: header flag which basically tells the agent which lifecycle flow to go to next.

```

Some options:

#!CliQrReboot:Current --> to resume the current lifecycle action

#!CliQrReboot:Next to resume to next step in the lifecycle actions

#!CliQrReboot:Deploy to resume from deploy service lifecycle actions

```

  
> To use the .#!CliQrReboot: header, you must use ASCII encoding

---
references: