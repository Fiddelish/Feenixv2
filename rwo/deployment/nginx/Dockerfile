FROM nginx

RUN apt-get -yy update && \
    apt-get -yy install \
               iputils-ping \
               wget \
               curl \
               tcpdump \
               nano \
               software-properties-common \
               gnupg2

RUN apt-get -yy update

COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /etc/nginx/certs
RUN mkdir /tmp/data

EXPOSE 443
EXPOSE 80
