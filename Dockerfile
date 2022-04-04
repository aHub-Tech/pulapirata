#!/bin/bash
FROM node:alpine AS pulapirata
LABEL name="pulapirata"
LABEL maintainer="Adelson Guimarães"

RUN apk update && apk upgrade \
    # clean up
    && rm -f /var/cache/apk/* \
    && rm -rf /tmp/pear/

WORKDIR /usr/app

COPY package.json ./
RUN npm install

COPY . .

# RUN npm cache clean --force && npm cache verify

ENTRYPOINT [ "node", "src/index.js" ]