Leaflet Control Search
============

[![npm version](https://badge.fury.io/js/leaflet-search.svg)](http://badge.fury.io/js/leaflet-search)

A Leaflet control that search markers/features location by custom property.<br />
Support ajax/jsonp autocompletion and JSON data filter/remapping.

*Licensed under the MIT license.*

*Copyright [Stefano Cudini](http://labs.easyblog.it/stefano-cudini/)*

Tested in Leaflet 0.7.7 and 1.1.1

![Image](https://raw.githubusercontent.com/stefanocudini/leaflet-search/master/images/leaflet-search.jpg)

# Where

**Demo:**  
[labs.easyblog.it/maps/leaflet-search](http://labs.easyblog.it/maps/leaflet-search/)

**Source code:**  
[Github](https://github.com/stefanocudini/leaflet-search)
[NPM](https://npmjs.org/package/leaflet-search)

**Bug tracking:**

[Waffle.io](https://waffle.io/stefanocudini/leaflet-search)

[Websites that use Leaflet.Control.Search](https://github.com/stefanocudini/leaflet-search/wiki/Websites-that-use-Leaflet-Control-Search)

# Install
```
npm install --save leaflet-search
```
# Events
| Event			 | Data			  | Description                               |
| ---------------------- | ---------------------- | ----------------------------------------- |
| 'search:locationfound' | {latlng, title, layer} | fired after moved and show markerLocation |
| 'search:expanded'	 | {}	                  | fired after control was expanded          |
| 'search:collapsed'	 | {}		          | fired after control was collapsed         |

# Methods
| Method		| Arguments		 | Description                  |
| --------------------- | ---------------------- | ---------------------------- |
| setLayer()		| L.LayerGroup()	 | set layer search at runtime  |
| showAlert()           | 'Text message' 	 | show alert message           |
| searchText()		| 'Text searched'	 | search text by external code |


# Examples
(require src/leaflet-search.css)

Adding the search control to the map:
```javascript
var searchLayer = L.layerGroup().addTo(map);
//... adding data in searchLayer ...
map.addControl( new L.Control.Search({layer: searchLayer}) );
//searchLayer is a L.LayerGroup contains searched markers
```

Short way:
```javascript
var searchLayer = L.geoJson().addTo(map);
//... adding data in searchLayer ...
L.map('map', { searchControl: {layer: searchLayer} });
```

AMD module:
```javascript
require(["leaflet", "leafletSearch"],function(L, LeafletSearch) {

	//... initialize leaflet map and dataLayer ...

	map.addControl( new LeafletSearch({
		layer: dataLayer
	}) );
});
```

# Build

Therefore the deployment require **npm** installed in your system.
```bash
npm install
grunt
```
