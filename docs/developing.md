Developing
==========

## Running tests

Continuous tests can be run using `./scripts/test-dev.sh`. The command will
watch all files in `src` and `test` and rerun the tests when necessary.

## Publishing package

* Increment the version in `package.json`
* Run `make package`
* Go to the `./package` directory and run `npm publish`

At the moment we tag all releases with `preview`.
