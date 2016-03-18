export PATH := ./node_modules/.bin/:${PATH}
export NODE_PATH := ./output

SHELL=/bin/bash -O globstar -c

BROWSERIFY = browserify
BABELIFY = browserify -t [ babelify ]
WAIT = inotifywait -r -e create -e modify -q --exclude 'swp$$'

.PHONY: first lib examples purs purs-browserify

first: idris

.PHONY: serve
serve:
	babel-node examples/serve.js

compile: lib examples

.PHONY: dist
dist:
	mkdir -p dist
	$(BABELIFY) -r ./src/index.js:fixi > dist/fixi.js

.PHONY: lib
lib:
	babel \
		--source-maps \
		--out-dir lib \
		src

examples: dist
	$(BABELIFY) -x fixi -r ./examples:examples > dist/examples.js


#
# Purescript
#

PSC = ./.cabal-sandbox/bin/psc
PSCI = ./.cabal-sandbox/bin/psci
PSC_BUNDLE = ./.cabal-sandbox/bin/psc-bundle

purs-transpile:
	${PSC} \
		'purs/**/*.purs' \
		-f 'purs/**/*.js' \
		'bower_components/purescript-*/src/**/*.purs' \
		-f 'bower_components/purescript-*/src/**/*.js'

purs-bundle: purs-transpile
	$(PSC_BUNDLE) \
		--main Main \
		'output/**/*.js' \
		--output dist/purs-main.js

psci:
	$(PSCI) \
		'purs/**/*.purs' \
		-f 'purs/**/*.js' \
		'bower_components/purescript-*/src/**/*.purs' \
		-f 'bower_components/purescript-*/src/**/*.js'

purs-bundle-test: purs-transpile
	rm -f output/test.js
	$(PSC_BUNDLE) \
		--main Test.Main \
		'output/**/*.js' \
		--output output/test.js

purs-test: purs-bundle-test
	node output/test.js

purs: purs-transpile
	$(BROWSERIFY) -t babelify -r Main -o dist/purs.js

watch: compile
	while inotifywait -r -e create -e modify -q src examples --exclude 'swp$$'; do make compile; done

watch-purs: purs
	while $(WAIT) purs; do sleep 0.3 && make $<; done


#
# Idris
#
.PHONY: idris
idris: dist/idris-ffi.js
	idris \
		--idrispath=./idris \
		--idrispath=./bower_components/IdrisScript \
		--codegen=javascript \
		--dumpcases=cases.txt \
		--dumpdefuns=defun.txt \
		--output=dist/idris.js \
		idris/Main.idr
	sed -i 's/delete i\$$ret/i\$$ret = void 0/' dist/idris.js

idris-clean:
	rm ./bower_components/IdrisScript/**/*.ibc
	rm ./idris/**/*.ibc

dist/idris-ffi.js: idris/ffi.js
	$(BABELIFY) $< > $@

watch-idris: idris
	while $(WAIT) idris; do sleep 0.3 && make $<; done


#
# Test
#
.PHONY: test
test: test-js

test-js:
	eslint src test
	mocha
