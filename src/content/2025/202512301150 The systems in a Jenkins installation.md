---
title: The systems in a Jenkins installation
slug: the-systems-in-a-jenkins-installation
pubDate: 2025-12-30T09:55:42.000Z
updatedDate: 2025-12-30T09:55:42.000Z
category: til
tags:
  - jenkins
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/115808171952195171'
  - 'https://www.threads.com/@sajal24x7/post/DS4ppHhDp2E'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mbk7zrta6a2r'
---
1. Master - Has access to all config and options, and full list of jobs. By default jobs run on master if any other system is not specified. However, other systems should be configured to run jobs.
2. Agent - Any nonmaster system. Managed by master to run jobs. Associated with declarative pipeline.
3. Node -  a generic term for both masters and agents. Associated with scripted pipeline.
4. Executor - a slot for running a job. No of executors defines how many jobs can run on a node in parallel.
