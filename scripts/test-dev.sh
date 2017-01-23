#!/bin/bash

./node_modules/.bin/kanu \
  --require test/support/boot.js \
  --watch src,test,vendor \
  "$@" \
  -- test
