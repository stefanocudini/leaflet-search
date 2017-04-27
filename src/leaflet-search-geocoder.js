
(function (factory) {
    if(typeof define === 'function' && define.amd) {
    //AMD
        define(['leaflet'], factory);
    } else if(typeof module !== 'undefined') {
    // Node/CommonJS
        module.exports = factory(require('leaflet'));
    } else {
    // Browser globals
        if(typeof window.L === 'undefined')
            throw 'Leaflet must be loaded first';
        factory(window.L);
    }
})(function (L) {

L.Control.Search.include({
	options: {
		geocoder: 'google',
		markerLocation: true,
		autoType: false,
		autoCollapse: true,
		minLength: 2
	},
/*	onAdd: function (map) {
		L.Control.Search.prototype.onAdd.call(this, map);
		console.log('Geocoder',this.options)
	},*/
	geocoders: {
/*		'google': {
			url: "//maps.googleapis.com/maps/api/geocode/json?key={key}&address={text}"
		},
		'nominatim': {
			    

	      format: 'json',
	      q: query,
	    });

    		"//nominatim.openstreetmap.org/search?"
		}*/
	}
});

});
