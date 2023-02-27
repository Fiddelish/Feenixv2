#!/bin/bash
set -ex

sudo rm -rf .data
rm -rf certs/*
mkdir -p $SSL_CERTS_FOLDER $CERTBOT_FOLDER $ACME_HTTP01_FOLDER
source .env
pushd nginx
docker build . -t rwonginx:dev
popd
python3 gencerts.py --common-name ${COMMON_NAME} --server-ip ${SERVER_IP}
docker network create --subnet ${RWO_NETWORK_SUBNET} rwo_network
echo "Starting hugs services..."
docker-compose --env-file .env -f docker-compose.yml up -d
docker-compose --env-file .env -f docker-compose.yml ps
./certbot-create.sh
echo "Done!"
