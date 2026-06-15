---
title: AWS Fundamentals
slug: aws-fundamentals
created: '2022-07-26T23:54:00+03:00'
updated: '2022-07-26T23:54:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modjvynzx52p'
---


# AWS Public vs Private services
Refers to networking only
Three internet zones:
Public Internet Zone (Open internet)
AWS Public Zone (Things like S3 for AWS public services. Requires access.)
AWS Private zone (VPCs: isolated unless configured otherwise. Stuff can be placed inside VPCs like EC2. Access can be enabled by using things like VPN/Direct Connect for on prem, for public access things like internet gateway)

# AWS Global Infrastructure
## Regions
An area AWS says has full deployment of AWS services (Ohio,Mumbai, etc.)
## Edge locations
Edge computing, CDNs, type of things. Allows for fast, efficient data transfer.
Some services are global (IAM/DNS)
Some are regional (EC2, etc)

## Region benefits
Geographical separation (isolated fault domain)
Geopolitcal separation (Different governance)
Location control (Performance)

## Regions and AZs
Each region has between 2 and 6 AZs. Isolated infra inside a region. AZ is not one DC. It can have more than one DC.

## Service Resilience
Globally Resilient (If a region fails, no issues. Examples: IAM, Route 53)
Regionally Resilient (Regionally, data is same. Region fails, service will fail)
AZ Resilient (very prone to failure)

# AWS CLI
## Create profile
```bash
aws configure --profile iamadmin-general
```
![[202208012318 AWS IAM Basics]]

![[202208012316 AWS VPC Basics]]

![[202208012314 EC2 Basics]]




---
references:
