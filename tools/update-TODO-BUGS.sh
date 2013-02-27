#!/bin/bash

grep TODO leaflet-search.js  | sed -e 's/[[:space:]]*\/\/TODO\(.*\)$/\.\1\n/g' > TODO

grep FIXME leaflet-search.js  | sed -e 's/[[:space:]]*\/\/FIXME\(.*\)$/\.\1\n/g' > BUGS

