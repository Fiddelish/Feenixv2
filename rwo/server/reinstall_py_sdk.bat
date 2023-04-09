call pip uninstall -y rwo_py_sdk
cd sdk\py
rd /q /s dist build
call python setup.py bdist_wheel
call pip install dist\rwo_py_sdk-2023.3.0-py3-none-any.whl
cd ..\..
