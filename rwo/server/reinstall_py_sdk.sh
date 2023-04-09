#!/usr/bin/env sh

pip uninstall -y rwo_py_sdk
cd sdk/py
rm -rf dist build
python setup.py bdist_wheel
pip install dist/rwo_py_sdk-2023.3.0-py3-none-any.whl
cd ../..
