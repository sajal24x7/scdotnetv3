---
aliases:
tags:
  - k8s
  - container
  - troubleshoot
category: til
updated: 2026-07-10T13:08:38+03:00
---
Problems can occur in different stages of deployment. In almost cases, the `describe` command gives an idea about the issue.

I have seen and worked on most issues related to image pulling issues, `ImagePullBackOff`. The back off algorithm ensures we don’t overwhelm our cluster. So if we fix an issue by adding the image to registry, it will not work immediately, because retry time wait increases with each try. Maximum wait time is 5 minutes between tries.

The other is of course `CrashLoopBackOff`.
## Scheduling
1. No node matches the configuration specified in the config file
2. Resource problems, no node has enough capacity to host the pods

## Pulling Images
1. Failure to reach container registry 
2. Authorisation issue with the requested image
3. Image is missing from the registry 

## Running Containers
This means the image is pulled but some issue happens after that. It could be because of quite a few issue. To troubleshoot,
1. Read the logs - `kubectl logs`
2. In case logs are unhelpful, do exec
	1. First need to override the default program