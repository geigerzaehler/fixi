export PATH := ./node_modules/.bin/:${PATH}

BABELIFY = browserify --transform [ babelify ]

.PHONY: examples lib dist test

first: lib

dist:
	rm -rf dist
	mkdir dist
	$(BABELIFY) \
		--require ./src/index.js:fixi \
		--debug \
		| exorcist dist/fixi.js.map \
		> dist/fixi.js

lib:
	rm -rf lib
	babel \
		--source-maps \
		--out-dir lib \
		src

.PHONY: package
package: lib dist
	rm -rf package
	mkdir package
	cp -a README.md package.json lib/* dist package

test: test-js lint

test-js:
	kanu --require test/support/boot.js test

lint:
	eslint \
		--format unix \
		src test
