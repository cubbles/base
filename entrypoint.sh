#!/bin/bash
set -e
#echo "got command: $0 $@"

if [ ! -e /var/run/docker.sock ]; then
    {
        echo >&2 "Error: Need the docker socket to be mounted: '-v /var/run/docker.sock:/var/run/docker.sock'"; exit 1;
    }
fi

# if command is ...
if [ "$1" == "/bin/bash" ]; then
    exec "$@"
    exit 0
fi
if [ "$1" == "base-cli-test" ]; then
    cd "/opt/base/opt/base-cli"
    exec node base-cli-test.js "$@"
    exit 0
fi

# otherwise pass the options to the base-cli
cd "/opt/base/opt/base-cli"
exec node base-cli.js "$@"