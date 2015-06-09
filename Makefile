BABELIFY = browserify -t babelify

.PHONY: lib examples

compile: lib examples

lib: dist
	$(BABELIFY) -r ./src/index.js:fixi > dist/fixi.js

examples: dist
	$(BABELIFY) -x fixi -r ./examples:examples > dist/examples.js

dist:
	mkdir dist

watch: compile
	while inotifywait -r -e create -e modify -q src examples --exclude 'swp$$'; do make compile; done

