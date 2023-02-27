#!/bin/bash
set -ex

sudo rm -rf .data
source .env
cd nginx
docker build . -t rwonginx:dev
cd ..
docker network create --subnet ${RWO_NETWORK_SUBNET} rwo_network
echo "Starting hugs services..."
docker-compose --env-file .env -f docker-compose.yml up -d
docker-compose --env-file .env -f docker-compose.yml ps
echo "Done!"
