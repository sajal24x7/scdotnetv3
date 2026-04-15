---
title: Upgrade cloud remote
slug: upgrade-cloud-remote
pubDate: '2022-09-26T12:50:00+03:00'
updatedDate: '2022-09-26T12:50:00+03:00'
category: til
tags: []
---


To upgrade Cloud Remote (script available in the Cloud Remote artifact file mentioned in the section above) in your Workload Manager or Cost Optimizer
system, follow this procedure for each instance of Cloud Remote.
Locate the Cloud Remote upgrade script at software.cisco.com and copy it to a directory in your Cloud Remote instance.
Establish a terminal session to the Cloud Remote instance and navigate to the directory containing the upgrade script.
Run the following commands from the Cloud Remote command prompt.
```bash
chmod +x UPGRADE_FILE
sudo ./ UPGRADE_FILE
```

Confirm the successful execution of the script.

---
references: