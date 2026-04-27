---
title: Ansible Parallelism
slug: ansible-parallelism
pubDate: '2022-06-07T14:55:00+03:00'
updatedDate: '2022-06-07T14:55:00+03:00'
category: til
tags:
- ansible
---


By default, Ansible runs each task on all hosts affected by a play before starting the next task on any host, using 5 forks.

# Batch size( forks )
Batch size can be configured using serial.
```
serial: 3
```

---
references:
[Controlling playbook execution: strategies and more — Ansible Documentation](https://docs.ansible.com/ansible/latest/user_guide/playbooks_strategies.html#:~:text=By%20default%2C%20Ansible%20runs%20in%20parallel%20against%20all,at%20a%20single%20time%20using%20the%20serial%20keyword%3A)