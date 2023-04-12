FROM python:3.10-slim

# number of concurrent threads during build
# usage: docker build --build-arg PARALLELISM=8 -t name/name .
ARG PARALLELISM=1

ENV LC_CTYPE en_US.UTF-8
ENV LANG en_US.UTF-8

ENV DEBIAN_FRONTEND noninteractive
ENV RWO_HOME /opt/rwo

COPY ./keyboard /etc/default/keyboard

RUN apt-get -y update && \
    apt-get install -yy \
            libpq-dev \
            uuid-dev \
            build-essential \
            libffi-dev \
            python-dev \
            libssl-dev \
            libxml2-dev \
            libxslt1-dev \
            zlib1g-dev \
            libglib2.0-dev \
            libsm6 \
            libxrender1 \
            libxext6 \
            libcap2-bin \
            tcpdump \
            iputils-ping \
            net-tools \
            nano \
            git \
            cmake \
            autoconf \
            automake \
            libtool \
            checkinstall \
            libopencore-amrnb-dev \
            libopencore-amrwb-dev \
            texi2html \
            pkg-config \
            wget \
            yasm

WORKDIR /opt/rwo

# Set the locale
RUN apt-get install -y locales
RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    locale-gen
ENV LANG en_US.UTF-8  
ENV LANGUAGE en_US:en  
ENV LC_ALL en_US.UTF-8  

