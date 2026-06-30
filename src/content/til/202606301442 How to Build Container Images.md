---
title: "How to Build Container Images"
slug: "how-to-build-container-images"
created: 2026-06-30T14:52:59+03:00
updated: 2026-06-30T14:52:59+03:00
category: til
tags:
  - docker
  - container
  - images

---
Container images are built in layers. This allows for shared layers between images and lower actual storage on device.

Images are typically created using `dockerfile`

In a docker file, each line starts with a command, followed by params.

Some of the most common commands are -
1. `FROM` - specify the base image 
2. `RUN` - run a command inside the container
3. `COPY` - copy files into a container
4. `ENV` - specify environment variable 
5. `ENTRYPOINT` - initial process for the container
6. `CMD` - default params for the initial process

`docker build` can then be used to build the image.