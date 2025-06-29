---
title: "The three types of code I write"
slug: "the-three-types-of-code-i-write"
description: "slapdash, scrappy and production-grade"
pubDate: 2025-02-08T21:04:26+02:00
updatedDate: 2025-02-08T21:04:26+02:00
category: blog
tags: ["blog", "Tech Notes"]
image: "https://images.unsplash.com/photo-1564865878688-9a244444042a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTc3M3wwfDF8c2VhcmNofDF8fGNvZGV8ZW58MHx8fHwxNzM5MDAyODUzfDA&ixlib=rb-4.0.3&q=80&w=2000"
---
All code is not created equal.

# Slapdash

Some times all I want to do is get some information. I am told we need this information, now.

I don't worry then about error handling, or creating objects to store the output, or exporting it properly.

I write a line or two, put it inside a for loop, and output to standard out. I copy paste things into excel and format/edit it manually.

# Scrappy

A step-up from slapdash. This code will be used by me primarily. These are things that make changes or gather information.

There would be proper exporting and logs. But I don't think too much about error-handling or edge cases.

# Production-grade

The highest degree of work that I do. I spend a lot of time on error-handling and user input and how to idiot-proof these things.

These things are out in the wild, used by my colleagues. These things delete stuff. So, the code needs to do precisely what it says it would do.

You can not trust the person who runs the code to read the comments. They don't. Things can break.

Logging is very important. It allows you to revert changes in case something breaks.