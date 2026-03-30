---
title: Generators in python
slug: generators-in-python
pubDate: 2026-03-30T13:27:36.000Z
updatedDate: 2026-03-30T13:27:36.000Z
category: til
tags:
  - python
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116318359507254382'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mibrdw3jll26'
  - 'https://www.threads.com/@sajal24x7/post/DWgqDlBGg3t'
---
Generators return iterator objects in Python. Instead of using a return statement, it uses a `yield` statement to provide a list of results. The iterator object can then be used in a loop.

Generators stop running and save state once a `yield` statement is reached.

When compared to traditional method, the benefit is that it uses less memory, because it does not load everything in memory. It is ideal for producing sequences lazily.

## How to define

```python
# Define function
def sum_upto(n):
    num = 0
    while num < n:
       yield num
       num += 1
       
       
# Generate object
gen = sum_upto(3)

## call
next(gen)
```
