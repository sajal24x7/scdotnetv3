---
title: Ansible Error handling
slug: ansible-error-handling
pubDate: '2022-06-06T17:08:00+03:00'
updatedDate: '2022-06-06T17:08:00+03:00'
category: til
tags:
- ansible
---


# Ignore failed commands
**ignore_errors** can be used to continue even in case of failures.

# Defining failure
**failed_when** can be used to specify what causes failure.
```ansible
- name: Fail task when the command error output prints FAILED
  ansible.builtin.command: /usr/bin/example-command -x -y -z
  register: command_result
  failed_when: "'FAILED' in command_result.stderr"
```

# Aborting a play on all hosts
On first error, **any_errors_fatal: true** will stop play execution.
**max_fail_percentage** can be used to abort after a percentage has failed 
```ansible
any_errors_fatal: true
```

# Recovering from errors
rescue section can be used for error handling.



---
references:
[Error handling in playbooks — Ansible Documentation](https://docs.ansible.com/ansible/latest/user_guide/playbooks_error_handling.html)