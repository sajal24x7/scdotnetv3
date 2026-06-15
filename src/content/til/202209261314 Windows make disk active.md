---
title: Windows Make Disk Active
slug: windows-make-disk-active
created: '2022-09-26T13:14:00+03:00'
updated: '2022-09-26T13:14:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkd64akz2c'
  - 'https://www.threads.com/@sajal24x7/post/DZnFqDrlkG9'
---


After migration if VM does not boot:

```cmd
diskpart
list disk
select disk #
list partition
select partition #
active
```


---
references:
