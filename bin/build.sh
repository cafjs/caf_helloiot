#!/bin/bash
#build app
pushd public
echo "browserify  -d js/main.js -o js/build.js"
browserify  -d js/main.js -o js/build.js
echo "browserify js/main.js | uglifyjs > js/build.min.js"
export NODE_ENV=production
browserify js/main.js | uglifyjs > js/build.min.js
unset NODE_ENV
popd

#build iot
pushd iot
cafjs pack true . ./app.tgz &&  mv ./app.tgz ../public/iot.tgz
popd
