Leaflet Control Search
============

[![npm version](https://badge.fury.io/js/leaflet-search.svg)](http://badge.fury.io/js/leaflet-search)

A Leaflet control that search markers/features location by custom property.<br />
Support ajax/jsonp autocompletion and JSON data filter/remapping.

*Licensed under the MIT license.*

*Copyright [Stefano Cudini](https://opengeo.tech/stefano-cudini/)*

If this project helped your work help me to keep this alive by [Paypal **DONATION &#10084;**](https://www.paypal.me/stefanocudini)

Tested in Leaflet 0.7.x and 1.3.x

![Image](https://raw.githubusercontent.com/stefanocudini/leaflet-search/master/images/leaflet-search.jpg)

# Where

**Demo:**
[opengeo.tech/maps/leaflet-search](https://opengeo.tech/maps/leaflet-search/)

**Source code:**
[Github](https://github.com/stefanocudini/leaflet-search)
[NPM](https://npmjs.org/package/leaflet-search)

# Install
```
npm install --save leaflet-search
```
# Options
| Option	  | Default  | Description                       |
| --------------- | -------- | ----------------------------------------- |
| url             | ''       | url for search by ajax request, ex: "search.php?q={s}". Can be function to returns string for dynamic parameter setting | |
| layer		      | null	 | layer where search markers(is a L.LayerGroup)				 |
| sourceData	  | null     | function to fill _recordsCache, passed searching text by first param and callback in second				 |
| jsonpParam	  | null	 | jsonp param name for search by jsonp service, ex: "callback" |
| propertyLoc	  | 'loc'	 | field for remapping location, using array: ['latname','lonname'] for select double fields(ex. ['lat','lon'] ) support dotted format: 'prop.subprop.title' |
| propertyName	  | 'title'	 | property in marker.options(or feature.properties for vector layer) trough filter elements in layer, |
| formatData	  | null	 | callback for reformat all data from source to indexed data object |
| filterData	  | null	 | callback for filtering data from text searched, params: textSearch, allRecords |
| moveToLocation  | null	 | callback run on location found, params: latlng, title, map |
| buildTip		  | null	 | function to return row tip html node(or html string), receive text tooltip in first param |
| container		  | ''	     | container id to insert Search Control		 |
| zoom		      | null	 | default zoom level for move to location |
| minLength		  | 1	     | minimal text length for autocomplete |
| initial		  | true	 | search elements only by initial text |
| casesensitive   | false	 | search elements in case sensitive text |
| autoType		  | true	 | complete input with first suggested result and select this filled-in text. |
| delayType		  | 400	     | delay while typing for show tooltip |
| tooltipLimit	  | -1	     | limit max results to show in tooltip. -1 for no limit, 0 for no results |
| tipAutoSubmit	  | true	 | auto map panTo when click on tooltip |
| firstTipSubmit  | false	 | auto select first result con enter click |
| autoResize	  | true	 | autoresize on input change |
| collapsed		  | true	 | collapse search control at startup |
| autoCollapse	  | false	 | collapse search control after submit(on button or on tips if enabled tipAutoSubmit) |
| autoCollapseTime| 1200	 | delay for autoclosing alert and collapse after blur |
| textErr		  | 'Location not found' |	error message |
| textCancel	  | 'Cancel	 | title in cancel button		 |
| textPlaceholder | 'Search' | placeholder value			 |
| hideMarkerOnCollapse		 | false	 | remove circle and marker on search control collapsed		 |
| position		  | 'topleft'| position in the map		 |
| marker		  | {}	     | custom L.Marker or false for hide |
| marker.icon	  | false	 | custom L.Icon for maker location or false for hide |
| marker.animate  | true	 | animate a circle over location found |
| marker.circle	  | L.CircleMarker options |	draw a circle in location found |

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
npx grunt
```


# Use Cases
This list is intended to be of utility for all developers who are looking web mapping sample code to solve complex problems of integration with other systems using Leaflet Control Search.

**Anyone can add the link of your website**

*(spamming urls will be automatically deleted)*

* [demography colorado.gov](https://demography.dola.colorado.gov/CensusAPI_Map/?lat=39&lng=-104.8&z=9&s=50&v=mhi&sn=jenks&cs=mh1&cl=7)
* [NMEA Generator](https://nmeagen.org/)
* [Guihuayun maps](http://guihuayun.com/maps/map_frame.php)
* [Pouemes](http://pouemes.free.fr)
* [Folium](https://github.com/python-visualization/folium)
* [OpenTopoMap](https://opentopomap.org/)
* [Falesia.it](https://www.falesia.it/it/map/169729/260158/2/FAL/title=Mondo.html)
* [Leaflet Control Search (Official demos)](https://opengeo.tech/maps/leaflet-search/)
* [Parkowanie Gliwice](http://parkowaniegliwice.pl/lista-parkomatow/)
* [Agenziauscite.Openstreetmap.it](http://agenziauscite.openstreetmap.it/compare.html)
* [Modern Leaflet Toolbar](https://getbounds.com/blog/a-modern-leaflet-toolbar/)
* [UnGiro.it](http://ungiro.it/percorsi/ciclomuro-street-art-bike-tour.htm)
* [OpenBeerMap](http://openbeermap.github.io/)
* [Spatial statistics for the city of Tampere, Finland](https://github.com/ernoma/GeoStatTampere)
* [BALIMIO Bali photo guide](http://balimio.com/map)
* [Flask Admin](https://github.com/flask-admin/flask-admin)
* [LIVE-Map LiF:YO](http://lif-tools.com/)
* [OpenTrailMap](http://michaelskaug.com/projects/OpenTrailMap/)
* [Rutas Morelia](https://www.rutasmorelia.com/)
* [EDSM - Galactic Map](https://www.edsm.net/en/galactic-mapping)
* [The area of effect of the "MOAB" bomb in Afghanistan](https://www.dhkconsulting.com/moab/moab.html)
* [Ipyleaflet](https://github.com/jupyter-widgets/ipyleaflet)
* [Craft Ottawa](https://craftottawa.ca)
* [Sea Florida Change](https://www.seaflchange.org/)
