---
title: "Generators in python"
slug: "generators-in-python"
pubDate: 2026-03-30T16:27:36+03:00
updatedDate: 2026-03-30T16:27:36+03:00
category: til
tags:
  - python

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