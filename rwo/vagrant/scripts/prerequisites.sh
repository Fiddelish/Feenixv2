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

if [ -z "`grep VIRTUAL_ENV /home/vagrant/.profile`" ]; then
    echo "****** CONFIGURING VIRTUAL ENVIRONMENT ******"
    echo $PATH
    sudo python3 -m pip install virtualenv
    python3 -m virtualenv /home/vagrant/venv
    . /home/vagrant/venv/bin/activate
    python -m pip install -U pip
    deactivate
    echo "VIRTUAL_ENV=/home/vagrant/venv" | tee -a /home/vagrant/.profile
    echo "PATH=/home/vagrant/venv/bin:$PATH" | tee -a /home/vagrant/.profile
fi
echo "DONE!"
