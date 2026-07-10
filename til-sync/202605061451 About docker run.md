---
tags:
  - docker
aliases:
  - docker run
category: til
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