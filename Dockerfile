FROM debian:stable
MAINTAINER Émile Morel

# U-boot part
ENV DEBIAN_FRONTEND noninteractive
ENV DEBCONF_NONINTERACTIVE_SEEN true
ENV LC_ALL C
ENV LANGUAGE C
ENV LANG C
RUN apt-get update && apt-get install bundler nodejs-legacy -y --force-yes
ADD Gemfile /tmp/
ADD Gemfile.lock /tmp/
RUN cd /tmp && bundle install
WORKDIR /srv/middleman
