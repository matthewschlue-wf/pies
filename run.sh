#!/bin/bash

function log {
while [ 1 ]   # Endless loop.
do
  echo "Log stuff"
  sleep 30
done
}

log &

/usr/sbin/nginx
