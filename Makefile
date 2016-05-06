export PATH := ./node_modules/.bin/:${PATH}

BABELIFY = browserify --transform [ babelify ]

.PHONY: examples lib dist test

first: compile

serve:
	babel-node examples/serve.js

compile: lib examples

dist:
	$(BABELIFY) \
		--require ./src/index.js:fixi \
		--outfile dist/fixi.js

lib:
	babel \
		--source-maps \
		--out-dir lib \
		src

examples: dist
	$(BABELIFY) \
		--external fixi \
		--require ./examples:examples \
		--outfile dist/examples.js

test: lint test-js

test-js:
	mocha --reporter dot

lint:
	eslint \
		--format unix \
		examples src test
