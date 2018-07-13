#!/bin/bash
docker-compose --file docker-compose.debug.yml build --no-cache
docker-compose --file docker-compose.debug.yml up --build
