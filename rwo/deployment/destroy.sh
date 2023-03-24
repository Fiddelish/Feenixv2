#!/bin/bash
set -ex

docker-compose --env-file .env -f docker-compose.yml down -v
docker network rm rwo_network

# source ./venv/bin/activate
source .env
# ./certbot.sh unregister

sudo rm -rf .data
