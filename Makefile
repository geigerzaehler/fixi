SHELL=/bin/bash -O extglob -c

PSC_MAKE = ./.cabal-sandbox/bin/psc-make
PSC = ./.cabal-sandbox/bin/psc
BROWSERIFY = NODE_PATH=./output browserify
BABELIFY = browserify -t babelify
WAIT = inotifywait -r -e create -e modify -q --exclude 'swp$$'

.PHONY: first lib examples purs purs-browserify

first: serve

.PHONY: serve
serve:
	./node_modules/.bin/babel-node serve.js


compile: lib examples

lib: dist
	$(BABELIFY) -r ./src/index.js:fixi > dist/fixi.js

examples: dist
	$(BABELIFY) -x fixi -r ./examples:examples > dist/examples.js

dist:
	mkdir dist

purs-transpile:
	${PSC_MAKE} purs/*.purs

purs: purs-transpile
	$(BROWSERIFY) -t babelify -r BaconDo -o dist/purs.js

watch: compile
	while inotifywait -r -e create -e modify -q src examples --exclude 'swp$$'; do make compile; done

watch-purs: purs
	while $(WAIT) purs; do sleep 0.3 && make $<; done


.PHONY: idris
idris:
	idris --idrispath=./idris --idrispath=./bower_components/IdrisScript --codegen=javascript --output=dist/idris.js idris/Main.idr
watch-idris: idris
	while $(WAIT) idris; do sleep 0.3 && make $<; done
