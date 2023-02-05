#!/usr/bin/env sh

pip uninstall -y rwo
rm -rf dist build
python setup.py bdist_wheel
pip install dist/rwo-2023.3.0-py3-none-any.whl
