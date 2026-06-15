---
title: Ansible Automation Platform Upgrade
slug: ansible-automation-platform-upgrade
created: '2023-08-29T14:32:00+03:00'
updated: '2023-08-29T14:32:00+03:00'
category: til
tags:
- ansible
- aap
---


Upgrade assistant here: 

[Ansible Automation Platform Upgrade Assistant | Red Hat Customer Portal Labs](https://access.redhat.com/labs/aapua/)


Steps:

The step to step guide is provided here please Follow this for upgrade from 2.3 to 2.4. [https://access.redhat.com/labs/aapua/](https://access.redhat.com/labs/aapua/)

1. is it fine will use same inventory file which was used at the time of installation
2. should we add the automation hub parameter in same inventory file as we installed separately
--> You can add the data to the new Inventory file referring to the old and you can add the automation hub details as well if the database of Controller and the automation hub is same. 

3. any validation script/playbook is there to validate AAP platform before/after of upgrade
4. incase upgrade failed in that case how we can recover it back using AAP script/playbook.
--> There is no validation scripts everything is taken care by the setup.sh script itself. if in case the upgrade fails you can always uninstall the AAP

Step 1) How to uninstall Red Hat Ansible Controller(Ansible Automation Platform 2.x)? 
[https://access.redhat.com/solutions/6733721](https://access.redhat.com/solutions/6733721)

Step 2 ) Re install the older version of AAP 

Step 3) Restore the database taken  before starting the upgrade mentioned: [https://access.redhat.com/labs/aapua/](https://access.redhat.com/labs/aapua/)

5. while upgrading AAP platform will be available/what will impact for end user.
--> While doing the upgrade the services get's stopped so take a proper downtime before proceeding with the upgrade and also do the upgrade in the test environment first.

---
# references: