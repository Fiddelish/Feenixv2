#!/bin/bash

set -e

echo "********* RWO Build Script *********"
echo ""
echo ""

echo "----- Building NGINX image -----"
cd nginx
docker build . -t rwo_nginx:dev
cd ..
echo ""
echo ""
echo "----- Building NGINX DONE -----"
echo ""
echo ""

echo "----- Building Python base image -----"
cd python_base
docker build . -t rwo_python:dev
cd ..
echo ""
echo ""
echo "----- Building Python base image DONE -----"
echo ""
echo ""

echo "----- Building contracts -----"
cd web3/blockchain
docker build . -t rwo_hardhat:dev
docker run --rm -v `pwd`/contracts:/work/contracts \
    -v `pwd`/out:/work/out rwo_hardhat:dev \
    npx hardhat compile
cd ../..
echo "----- Building contracts DONE -----"
echo ""
echo ""

echo "----- Building RWO Server and SDKs -----"
cd server
cp -R ../web3/blockchain/out/abi ./
docker build -f Dockerfile.build . -t rwo_server_build:dev
docker build . -t rwo_server:dev
docker run --rm -v `pwd`/sdk:/opt/rwo/code/sdk rwo_server_build:dev ./generate_sdks_docker.sh
cd ..
echo "----- Building RWO Server and SDKs DONE -----"
echo ""
echo ""

echo "----- Building RWO Portal -----"
cd web3
docker build - -t rwo_web3_build:dev < Dockerfile.build
cd dapp/fnxstore
cp -R ../../blockchain/out/abi ./
rm -rf rwo_ts_sdk
cp -R ../../../server/sdk/ts/ ./rwo_ts_sdk
docker build . -t rwo_portal:dev
cd ../../..
echo "----- Building RWO Portal DONE -----"
echo ""
echo ""
echo "********* Quantotto Hugs Build DONE *********"
