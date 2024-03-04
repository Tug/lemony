#!/usr/bin/env bash

while ! nc -z $1 $2; do sleep 1; done
sleep 10
