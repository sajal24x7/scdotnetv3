---
title: "Different Types of Admission Controllers"
slug: "different-types-of-admission-controllers"
created: 2026-10-26T15:48:00+02:00
updated: 2026-10-26T15:50:17+02:00
category: 
tags: []
---
There are two types of [admission controllers](/til/admission-controllers-in-kubernetes):
1. Validating - can validate the request and allow or deny it 
2. Mutating - can change the request 

There are also those who can do both.

Mutating happens first, then validating.

