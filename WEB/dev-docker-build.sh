#!/bin/bash
docker-compose --file docker-compose.dev.yml build --no-cache
docker-compose --file docker-compose.dev.yml up