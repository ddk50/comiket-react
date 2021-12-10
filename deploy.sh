#!/bin/sh
yarn build
aws s3 sync --delete --region ap-northeast-1 ./build/ s3://upfg.net/
