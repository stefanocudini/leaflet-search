#!/bin/bash

grep TODO leaflet-search.js  | sed -e 's/[[:space:]]*\/\/TODO \(.*\)$/\. \1\n/g' > TODO
