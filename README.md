Leaflet.Control.Search
============

What ?
------

Simple plugin for Leaflet that search marker by attribute

Tested for Leaflet 0.4.2

How ?
------

Add the search control to the map:

```
var map = new L.Map('map');
map.addControl(new L.Control.Search());

```

If your map have a zoomControl the fullscreen button will be added at the bottom of this one.

If your map doesn't have a zoomContron the fullscreen button will be added to topleft corner of the map (same as the zoomcontrol).

```

Add this styles to your css :

```
.leaflet-control-search { 

}

```

Where ?
------

Source code : https://github.com/stefanocudini/leaflet.search

Demo : http://stefanocudini.github.com/leaflet.search/
