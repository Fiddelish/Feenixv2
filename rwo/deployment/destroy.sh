#!/bin/bash
set -ex

docker-compose --env-file .env -f docker-compose.yml down -v
docker network rm rwo_network
sudo rm -rf .data
