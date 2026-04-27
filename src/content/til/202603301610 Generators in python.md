---
title: Generators in Python
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

```python
def read_log_lines(filepath):
    """
    Creates a generator that reads a log file, yielding valid, non-comment lines.
 
    Args:
        filepath (str): The path to the log file.
 
    Yields:
        str: A stripped, non-empty, non-comment line from the file.
    """
    # TODO: Implement the generator logic.
    # 1. Open the file safely.
    # 2. Iterate through each line, removing whitespace and checking whether it's valid.
    # 3. If the line is valid, yield it.
   
    with open (filepath, "r") as logfile:
        for line in logfile:
            logline = line.strip()
            if logline:
                if not logline[0] == "#":
                    yield logline
```