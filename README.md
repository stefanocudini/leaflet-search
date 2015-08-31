Leaflet Control Search
============

[![npm version](https://badge.fury.io/js/leaflet-search.svg)](http://badge.fury.io/js/leaflet-search)

A Leaflet control that search markers/features location by custom property.<br />
Support ajax/jsonp autocompletion and JSON data filter/remapping.

Copyright 2014 [Stefano Cudini](http://labs.easyblog.it/stefano-cudini/)

Tested in Leaflet 0.7.2

![Image](https://raw.githubusercontent.com/stefanocudini/leaflet-search/master/images/leaflet-search.jpg)

#Where

**Demo online:**  
[labs.easyblog.it/maps/leaflet-search](http://labs.easyblog.it/maps/leaflet-search/)

**Source code:**  
[Github](https://github.com/stefanocudini/leaflet-search)  
[Bitbucket](https://bitbucket.org/zakis_/leaflet-search)  
[NPM](https://npmjs.org/package/leaflet-search)  
[Atmosphere](https://atmosphere.meteor.com/package/leaflet-search)

**Bug tracking:**
[Waffle.io](https://waffle.io/stefanocudini/leaflet-search)

[Websites that use Leaflet.Control.Search](https://github.com/stefanocudini/leaflet-search/wiki/Websites-that-use-Leaflet-Control-Search)

#Examples
(require src/leaflet-search.css)

Adding the search control to the map:
```javascript
map.addControl( new L.Control.Search({layer: searchLayer}) );
//searchLayer is a L.LayerGroup contains searched markers
```

Short way:
```javascript
L.map('map', { searchControl: {layer: searchLayer} });
```

#Build

Therefore the deployment require **npm** installed in your system.
```bash
npm install
grunt
```
