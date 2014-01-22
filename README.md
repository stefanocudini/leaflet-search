Leaflet.Control.Search
============

#What
A leaflet control that search markers/features location by cutstom property.
With ajax/jsonp autocompletion and json fields re-mapping

Tested in Leaflet 0.7


#Where

**Demos:**  
[labs.easyblog.it/maps/leaflet-search](http://labs.easyblog.it/maps/leaflet-search/)

**Source code:**  
[Github](https://github.com/stefanocudini/leaflet-search)  
[Bitbucket](https://bitbucket.org/zakis_/leaflet-search)  
[NPM](https://npmjs.org/package/leaflet-search)  
[Atmosphere](https://atmosphere.meteor.com/package/leaflet-search)

#Build

Since Version 1.4.7 this plugin support [Grunt](http://gruntjs.com/) for building process.
Therefore the deployment require [NPM](https://npmjs.org/) installed in your system.
After you've made sure to have npm working, run this in command line:
```
npm install
grunt
```

#How
Insert leaflet-search.css styles to your css page

Adding the search control to the map:

```
map.addControl( new L.Control.Search({layer: searchLayer}) );
//searchLayer if a L.LayerGroup contains searched markers
```
short way:
```
var map = new L.Map('map', { searchControl: {layer: searchLayer} });
```

other examples:
```
//ajax request to search.php for retrieve elements locations
map.addControl( new L.Control.Search({url: 'search.php?q={s}'}) );


//jsonp request to 3rd party service, implements Geocode Searching using OSM API
map.addControl( new L.Control.Search({
	url: 'http://nominatim.openstreetmap.org/search?format=json&q={s}',
	jsonpParam: 'json_callback',
	propertyName: 'display_name',
	propertyLoc: ['lat','lon']
}) );


//geojson layer, search and color feature vector
var searchControl = new L.Control.Search({layer: geojsonLayer, circleLocation:false});
searchControl.on('search_locationfound', function(e) {
	
	e.layer.setStyle({fillColor: '#3f0'});

}).on('search_collapsed', function(e) {

	featuresLayer.eachLayer(function(layer) {
		featuresLayer.resetStyle(layer);
	});	
});
map.addControl(searchControl);
```

