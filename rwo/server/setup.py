# coding: utf-8


from setuptools import setup, find_packages  # noqa: H301
import os

NAME = "rwo"


def get_version():
    version = "0.0.0"
    print(f"Current directory: [{os.getcwd()}]")
    with open(f"VERSION.py", "r") as f:
        version = f.readline().rstrip().split("=")[1].replace('"', "")
    return version


# To install the library, run the following
#
# python setup.py install
#
# prerequisite: setuptools
# http://pypi.python.org/pypi/setuptools

REQUIRES = []

setup(
    name=NAME,
    version=get_version(),
    description="RWO Server",
    keywords=["Swagger", "rwo"],
    classifiers=[
        "Private :: Do Not Upload to pypi server",
    ],
    package_dir={"": "src"},
    packages=find_packages("./src"),
    install_requires=REQUIRES,
    long_description="""\
    Python modules implementing RWO server
    functionality and APIs
    """,
    entry_points="""
        [console_scripts]
        rwoapi=rwo.main:run
        rwonotifier=rwo.manager.notifier:run
    """,
)
