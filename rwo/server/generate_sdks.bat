call python retrieve_api_spec.py
rd /q /s sdk\py sdk\ts
call node_modules\.bin\openapi-generator-cli generate -i sdk/openapi.json -g python -c sdk/py_conf.json -o sdk/py
call node_modules\.bin\openapi-generator-cli generate -i sdk/openapi.json -g typescript-axios -c sdk/ts_conf.json -o sdk/ts
cd sdk/ts
call npm install
cd ../..
rd /q /s ..\web3\dapp\fnxstore\rwo_ts_sdk
xcopy /s /i /q /y sdk\ts ..\web3\dapp\fnxstore\rwo_ts_sdk
