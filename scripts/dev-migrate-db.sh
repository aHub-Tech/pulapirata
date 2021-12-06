#!/usr/bin/env bash
docker-compose run --rm mysql mysql -h mysql < ./prototipo/api/util/pula_pirata.sql
