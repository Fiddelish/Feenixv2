call pip uninstall -y rwo
rd /q /s dist build
call python setup.py bdist_wheel
call pip install dist\rwo-2023.3.0-py3-none-any.whl
