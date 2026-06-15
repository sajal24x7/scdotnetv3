---
title: Ansible Automation Platform
slug: ansible-automation-platform
created: '2022-11-23T14:12:00+03:00'
updated: '2022-11-23T14:12:00+03:00'
category: til
tags:
  - ansible
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754725640891367'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkiamlq62o'
---


# Automation controller
types: control, hybrid, execution, and hop


# Automation mesh

## Control plane
Instances in the control plane run persistent automation controller services such as the the web server and task dispatcher, in addition to project updates, and management jobs.
### Hybrid nodes
default. responsible for automation controller runtime functions and ansible-runner task operations.

### Control nodes
execution capabilities disabled.

## Execution plane
The **execution plane** consists of execution nodes that execute automation on behalf of the control plane and have no control functions
### Execution nodes
default. Execution nodes run jobs under `ansible-runner` with `podman` isolation.

### Hop nodes
redirect traffic to execution nodes/

---
references:
[Chapter 1. Planning your Red Hat Ansible Automation Platform installation Red Hat Ansible Automation Platform 2.2 | Red Hat Customer Portal](https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.2/html/red_hat_ansible_automation_platform_installation_guide/planning-installation#red_hat_ansible_automation_platform_system_requirements)
[Chapter 1. Planning for automation mesh in your Red Hat Ansible Automation Platform environment Red Hat Ansible Automation Platform 2.2 | Red Hat Customer Portal](https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.2/html/red_hat_ansible_automation_platform_automation_mesh_guide/assembly-planning-mesh)
[Deploying Ansible Automation Platform 2.1 Reference Architectures 2021 | Red Hat Customer Portal](https://access.redhat.com/documentation/en-us/reference_architectures/2021/html-single/deploying_ansible_automation_platform_2.1/index#overview)
[7. Clustering — Automation Controller Administration Guide v4.3.0 (ansible.com)](https://docs.ansible.com/automation-controller/latest/html/administration/clustering.html)
[7. Installing Ansible Automation Platform — Ansible Tower Installation and Reference Guide v3.8.6](https://docs.ansible.com/ansible-tower/latest/html/installandreference/tower_install_wizard.html#setting-up-the-inventory-file)
