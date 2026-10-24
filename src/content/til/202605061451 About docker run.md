---
title: "About Docker Run"
slug: "about-docker-run"
created: 2026-05-06T14:51:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["docker"]
---
In docker run, everything before the image name is a docker option and everything after that is command/arguments passed to the container.

```bash
# Syntax

docker run [DOCKER OPTIONS] IMAGE [COMMAND] [ARG...]

## To run a container with a name
docker run --name blue-app kodekloud/simple-webapp

## To run a container with a name and portmapping in detached mode
docker run -d -p 127.0.0.1:38282:8080 --name blue-app  kodekloud/simple-webapp

# To To run a container with a name and detached mode passign env variables and port mapping
docker run -d -p 127.0.0.1:38282:8080 --name blue-app -e APP_COLOR=blue kodekloud/simple-webapp

```