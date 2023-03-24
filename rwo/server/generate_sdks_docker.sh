#!/bin/sh

python retrieve_api_spec.py
rm -rf sdk/py sdk/ts
openapi-generator-cli generate -i sdk/openapi.json -g python -c sdk/py_conf.json -o sdk/py
openapi-generator-cli generate -i sdk/openapi.json -g typescript-axios -c sdk/ts_conf.json -o sdk/ts
cd sdk/ts
npm install
cd ../..

