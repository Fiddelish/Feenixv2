#!/bin/bash
set -ex

sudo rm -rf .data
rm -rf certs/*
source .env
cd nginx
docker build . -t rwonginx:dev
cd ..
python gencerts.py --common-name ${COMMON_NAME} --server-ip ${SERVER_IP}
docker network create --subnet ${RWO_NETWORK_SUBNET} rwo_network
echo "Starting hugs services..."
docker-compose --env-file .env -f docker-compose.yml up -d
docker-compose --env-file .env -f docker-compose.yml ps
echo "Done!"
