#!/bin/bash

sudo apt -yy update && sudo apt -yy upgrade
sudo apt install -yy \
    python3 python3-pip \
    docker.io docker-compose \
    libpq-dev \
    npm default-jdk \
    gcc g++ make apt-utils \
    python3-testresources
sudo timedatectl set-timezone Etc/UTC
sudo usermod -aG docker $USER

sudo python3 -m pip install -U pip

if [ -z "`grep VIRTUAL_ENV $HOME/.profile`" ]; then
    echo "****** CONFIGURING VIRTUAL ENVIRONMENT ******"
    echo $PATH
    sudo python3 -m pip install virtualenv
    python3 -m virtualenv $HOME/venv
    . $HOME/venv/bin/activate
    python -m pip install -U pip
    deactivate
    echo "VIRTUAL_ENV=$HOME/venv" | tee -a $HOME/.profile
    echo "PATH=$HOME/venv/bin:$PATH" | tee -a $HOME/.profile
fi

git clone https://github.com/fiddelish/feenixv2
. $HOME/venv/bin/activate
cd feenixv2/rwo/server
pip install -r requirements.txt

cd ..
./build_all.sh

cd deployment
cp .env.example .env

./create.sh
