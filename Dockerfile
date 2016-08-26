FROM cubbles/base.abstract-node:0.2.0
MAINTAINER Hd Böhlau hans-dieter.boehlau@incowia.com

# This container is the root-container for cubbles/base
# It includes docker-compose - so no need to install docker-compose on the host.
#
# Usage:
# 1) Run base:
#    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock cubbles/base
#
# 2) Execute bash commands:
#    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock cubbles/base /bin/bash -c "echo 'cubbles'"
#
# 3) Develop demo-services:
#    docker run --rm -v /mnt/sda1/projects.webbles/git/base/base-builder/etc/build/base/resources/opt/base:/opt/base -v /var/run/docker.sock:/var/run/docker.sock cubbles/base

#################
# docker-compose
# from "https://github.com/dduportal-dockerfiles/docker-compose/blob/master/Dockerfile"
# note "https://github.com/dduportal-dockerfiles/docker-compose/blob/master/README.md"
#################
ENV DEBIAN_FRONTEND noninteractive
ENV COMPOSE_VERSION 1.7.1

RUN apt-get update -q \
	&& curl -o /usr/local/bin/docker-compose -L \
		"https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-Linux-x86_64" \
	&& chmod +x /usr/local/bin/docker-compose


COPY ./opt/base /opt/base
RUN cd /opt/base/opt/base-cli \
 && npm install


# provide entrypoint
COPY ./entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]